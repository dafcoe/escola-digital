import { Page } from 'puppeteer';
import {
  waitForElementEnabled,
  waitForElementVisible,
  waitForParentElementToHaveClass,
} from './page.helper';
import { wait } from './util.helper';

export async function typeOnInput(page: Page, selector: string, value: string): Promise<void> {
  await waitForElementVisible(page, selector);
  await page.type(selector, value);
}

export async function tickCheckbox(page: Page, selector: string): Promise<void> {
  await waitForElementVisible(page, selector);
  await page.click(selector);
  await waitForParentElementToHaveClass(page, selector, 'checked');
  await page.mouse.move(0, 0); // Move out from the checkbox to ensure the tooltip disappears
  await wait(250); // Wait for the tooltip to vanish due to animation delay
}

export async function clickOnButton(page: Page, selector: string): Promise<void> {
  await waitForElementVisible(page, selector);
  await wait(250); // Wait for the button to enable due to animation delay
  await waitForElementEnabled(page, selector);
  await page.click(selector);
}

export async function selectOption(page: Page, selector: string, option: string): Promise<void> {
  await waitForElementVisible(page, selector);
  await page.select(selector, option);
}

export async function getInputValue(page: Page, selector: string): Promise<string> {
  await waitForElementVisible(page, selector);
  const inputValue = await page.$eval(selector, (input) => (input as HTMLInputElement).value);

  return inputValue || '';
}

export async function getSelectedOption(page: Page, selector: string): Promise<string> {
  const selectedOption = await page.$eval(selector, (option) => (option as HTMLOptionElement).textContent);

  return selectedOption || '';
}
