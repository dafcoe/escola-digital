import { Page } from 'puppeteer';
import {
  waitForElementNotVisible,
  waitForElementVisible,
} from '../../helpers/page.helper';
import {
  clickOnButton,
  selectOption,
  tickCheckbox,
  typeOnInput,
} from '../../helpers/action-form.helper';
import {
  LOGIN_PASSWORD,
  LOGIN_SELECTOR_FORM,
  LOGIN_SELECTOR_PASSWORD,
  LOGIN_SELECTOR_PROFILE,
  LOGIN_SELECTOR_SUBMIT,
  LOGIN_SELECTOR_TERMS,
  LOGIN_SELECTOR_USERNAME,
  LOGIN_URL,
  LOGIN_USERNAME,
} from './login.constant';
import { PageActionOptionsInterface } from '../shared.interface';
import { decorateWithExecutionTimeLog } from '../../helpers/util.helper';

export async function login(page: Page, options: PageActionOptionsInterface = {}): Promise<void> {
  const login = async () => {
    await page.goto(LOGIN_URL);
    await waitForElementVisible(page, LOGIN_SELECTOR_FORM);
    await selectOption(page, LOGIN_SELECTOR_PROFILE, '3');
    await typeOnInput(page, LOGIN_SELECTOR_USERNAME, LOGIN_USERNAME);
    await typeOnInput(page, LOGIN_SELECTOR_PASSWORD, LOGIN_PASSWORD);
    await tickCheckbox(page, LOGIN_SELECTOR_TERMS);
    await clickOnButton(page, LOGIN_SELECTOR_SUBMIT);
    await page.waitForNavigation();
    await waitForElementNotVisible(page, LOGIN_SELECTOR_FORM);
  };
  const decoratedWithExecutionTimeLogLogin = decorateWithExecutionTimeLog(login, 'Logging in');

  return options.skipTimeLog ? await login() : await decoratedWithExecutionTimeLogLogin();
}
