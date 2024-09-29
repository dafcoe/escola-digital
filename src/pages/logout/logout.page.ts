import { Page } from 'puppeteer';
import { waitForElementNotVisible, waitForElementVisible } from '../../helpers/page.helper';
import { clickOnButton } from '../../helpers/action-form.helper';
import { LOGOUT_SELECTOR_NAV_LIST_ITEM_ANCHOR } from './logout.constant';
import { LOGIN_SELECTOR_FORM } from '../login/login.constant';
import { PageActionOptionsInterface } from '../shared.interface';
import { decorateWithExecutionTimeLog } from '../../helpers/util.helper';

export async function logout(page: Page, options: PageActionOptionsInterface = {}): Promise<void> {
  const logout = async () => {
    await clickOnButton(page, LOGOUT_SELECTOR_NAV_LIST_ITEM_ANCHOR);
    await waitForElementNotVisible(page, LOGOUT_SELECTOR_NAV_LIST_ITEM_ANCHOR);
    await waitForElementVisible(page, LOGIN_SELECTOR_FORM);
  };
  const decoratedWithExecutionTimeLogLogout = decorateWithExecutionTimeLog(logout, 'Logging out');

  return options.skipTimeLog ? await logout() : await decoratedWithExecutionTimeLogLogout();
}
