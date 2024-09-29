import {
  waitForElementEnabled,
  waitForElementVisible,
  waitForParentElementToHaveClass,
} from './page.helper';
import { wait } from './util.helper';

export async function typeOnInput(selector: string, value: string): Promise<void> {
  await waitForElementVisible(selector);
  await page.type(selector, value);
}

export async function tickCheckbox(selector: string): Promise<void> {
  await waitForElementVisible( selector);
  await page.click(selector);
  await waitForParentElementToHaveClass(selector, 'checked');
  await page.mouse.move(0, 0); // Move out from the checkbox to ensure the tooltip disappears
  await wait(250); // Wait for the tooltip to vanish due to animation delay
}

export async function clickOnButton(selector: string): Promise<void> {
  await waitForElementVisible(selector);
  await wait(250); // Wait for the button to enable due to animation delay
  await waitForElementEnabled(selector);
  await page.click(selector);
}

export async function selectOption(selector: string, option: string): Promise<void> {
  await waitForElementVisible(selector);
  await page.select(selector, option);
}

export async function getInputValue(selector: string): Promise<string> {
  await waitForElementVisible(selector);
  const inputValue = await page.$eval(selector, (input) => (input as HTMLInputElement).value);

  return inputValue || '';
}

export async function getSelectedOption(selector: string): Promise<string> {
  const selectedOption = await page.$eval(selector, (option) => (option as HTMLOptionElement).textContent);

  return selectedOption || '';
}
