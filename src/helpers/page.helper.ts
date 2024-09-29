export async function waitForElementVisible(selector: string): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
}

export async function waitForElementNotVisible(selector: string): Promise<void> {
  await page.waitForSelector(selector, { hidden: true, timeout: 10000 });
}

export async function waitForElementEnabled(selector: string): Promise<void> {
  await page.waitForFunction((selector) => {
    const element = document.querySelector(selector);

    return element && !(element as HTMLButtonElement).disabled;
  }, {}, selector);
}

export async function waitForParentElementToHaveClass(selector: string, parentClass: string): Promise<void> {
  await page.waitForFunction((selector, parentClass) => {
    const element = document.querySelector(selector);

    return !element?.parentElement ? false : element.parentElement.classList.contains(parentClass);
  }, {}, selector, parentClass);
}

export async function elementExists(selector: string): Promise<boolean> {
  return await page.evaluate((selector) => {
    const element = document.querySelector(selector) || false;

    return !!element;
  }, selector);
}

export async function elementHasText(selector: string, text: string): Promise<boolean> {
  return await page.evaluate((selector, text) => {
    const element = document.querySelector(selector);

    return (element?.textContent || '').trim().toLowerCase().includes(text.toLowerCase());
  }, selector, text);
}

export async function takeScreenshot(fileName: string = (Date.now()).toString()): Promise<void> {
  await page.screenshot({ path: `sshots/${fileName}.png` });
}
