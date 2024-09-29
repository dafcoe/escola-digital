import { Page } from 'puppeteer';

export async function waitForElementVisible(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
}

export async function waitForElementNotVisible(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector, { hidden: true, timeout: 10000 });
}

export async function waitForElementEnabled(page: Page, selector: string): Promise<void> {
  await page.waitForFunction((selector) => {
    const element = document.querySelector(selector);

    return element && !(element as HTMLButtonElement).disabled;
  }, {}, selector);
}

export async function waitForParentElementToHaveClass(
  page: Page,
  selector: string,
  parentClass: string,
): Promise<void> {
  await page.waitForFunction((selector, parentClass) => {
    const element = document.querySelector(selector);

    return !element?.parentElement ? false : element.parentElement.classList.contains(parentClass);
  }, {}, selector, parentClass);
}

export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((selector) => {
    const element = document.querySelector(selector);

    return !element;
  }, selector);
}

export async function elementHasText(page: Page, selector: string, text: string): Promise<boolean> {
  return await page.evaluate((selector, text) => {
    const element = document.querySelector(selector);

    return (element?.textContent || '').trim().toLowerCase().includes(text.toLowerCase());
  }, selector, text);
}
