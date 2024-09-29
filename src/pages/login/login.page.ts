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

export async function login(options: PageActionOptionsInterface = {}): Promise<void> {
  const login = async () => {
    await page.goto(LOGIN_URL);
    await waitForElementVisible(LOGIN_SELECTOR_FORM);
    await selectOption(LOGIN_SELECTOR_PROFILE, '3');
    await typeOnInput(LOGIN_SELECTOR_USERNAME, LOGIN_USERNAME);
    await typeOnInput(LOGIN_SELECTOR_PASSWORD, LOGIN_PASSWORD);
    await tickCheckbox(LOGIN_SELECTOR_TERMS);
    await clickOnButton(LOGIN_SELECTOR_SUBMIT);
    await page.waitForNavigation();
    await waitForElementNotVisible(LOGIN_SELECTOR_FORM);
  };
  const decoratedWithExecutionTimeLogLogin = decorateWithExecutionTimeLog(login, 'Logging in');

  return options.skipTimeLog ? await login() : await decoratedWithExecutionTimeLogLogin();
}
