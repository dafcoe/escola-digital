import { Page } from 'puppeteer';
import {
  clickOnButton,
  getInputValue,
  getSelectedOption,
  selectOption,
  typeOnInput
} from '../../../helpers/action-form.helper';
import {
  ASSIGNMENTS_SELECTOR_FASE,
  ASSIGNMENTS_SELECTOR_NAV_LIST_ITEM_ANCHOR,
} from '../assignments.constant';
import {
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_SCHOOL,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT, ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT_ALTERNATIVE,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_AND_REJECTED_SCHOOL,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_AND_REJECTED_STUDENT,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_SCHOOL,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_STUDENT,
  ASSIGNMENTS_SELECTOR_SEARCH_NIF,
  ASSIGNMENTS_SELECTOR_SEARCH_SUBMIT,
  ASSIGNMENTS_SELECTOR_SEARCH_TAB,
  ASSIGNMENTS_SELECTOR_SEARCH_TAB_SELECTED,
} from './search.constant';
import {
  elementExists,
  elementHasText,
  waitForElementNotVisible,
  waitForElementVisible,
} from '../../../helpers/page.helper';
import {
  SHARED_SELECTOR_ALERT_INFO,
  SHARED_SELECTOR_LOADING,
} from '../../shared.constant';
import { PageActionOptionsInterface } from '../../shared.interface';
import { decorateWithExecutionTimeLog, wait } from '../../../helpers/util.helper';
import { SearchResultType } from '../assignments.type';
import { AssignmentInterface } from '../assignments.interface';

export async function searchAssignmentByNif(
  page: Page,
  nif: string,
  options: PageActionOptionsInterface = {},
): Promise<AssignmentInterface> {
  const searchAssignmentByNif = async (): Promise<AssignmentInterface> => {
    await clickOnButton(page, ASSIGNMENTS_SELECTOR_NAV_LIST_ITEM_ANCHOR);
    await waitForElementNotVisible(page, SHARED_SELECTOR_LOADING);
    await selectOption(page, ASSIGNMENTS_SELECTOR_FASE, '1');
    await waitForElementNotVisible(page, SHARED_SELECTOR_LOADING);
    await clickOnButton(page, ASSIGNMENTS_SELECTOR_SEARCH_TAB);
    await waitForElementVisible(page, ASSIGNMENTS_SELECTOR_SEARCH_TAB_SELECTED);
    await typeOnInput(page, ASSIGNMENTS_SELECTOR_SEARCH_NIF, nif);
    await clickOnButton(page, ASSIGNMENTS_SELECTOR_SEARCH_SUBMIT);
    await page.waitForNavigation();
    return await collectAssignment(page, nif);
  };
  const decoratedWithExecutionTimeLogSearchAssignmentByNif = decorateWithExecutionTimeLog(
    searchAssignmentByNif,
    `Searching assignment for nif ${nif}`,
  );

  return options.skipTimeLog
    ? await searchAssignmentByNif()
    : await decoratedWithExecutionTimeLogSearchAssignmentByNif();
}

async function collectAssignment(page: Page, nif: string): Promise<AssignmentInterface> {
  const searchResultTypeActionMap: Record<SearchResultType, CallableFunction> = {
    invalid: collectAssignmentFromSearchResultInvalid,
    assigned: collectAssignmentFromSearchResultAssigned,
    unassigned: collectAssignmentFromSearchResultUnassigned,
    'unassigned-and-rejected': collectAssignmentFromSearchResultUnassignedAndRejected,
  };
  const searchResultType = await getSearchResultType(page);

  if (!searchResultType) throw new Error('An unexpected error has occurred while collecting an assignment');

  return await searchResultTypeActionMap[searchResultType](page, nif);
}

async function getSearchResultType(page: Page): Promise<SearchResultType | undefined> {
  const isInvalid = await isSearchResultInvalid(page);
  if (isInvalid) return 'invalid';

  const isAssigned = await isSearchResultAssigned(page);
  if (isAssigned) return 'assigned';

  const isUnassigned = await isSearchResultUnassigned(page);
  if (isUnassigned) return 'unassigned';

  const isUnassignedAndRejected = await isSearchResultUnassignedAndRejected(page);
  if (isUnassignedAndRejected) return 'unassigned-and-rejected';

  return undefined;
}

async function isSearchResultInvalid(page: Page): Promise<boolean> {
  return await elementHasText(
    page,
    SHARED_SELECTOR_ALERT_INFO,
    'O aluno não pertence a este AE/EnA ou deixou de beneficiar de ASE A, B ou C',
  );
}

async function isSearchResultAssigned(page: Page): Promise<boolean> {
  const hasFase = await elementHasText(page, 'table tbody tr:first-of-type td:first-of-type', 'fase');
  const hasAssignedKit = await elementHasText(page, 'table tbody tr:nth-of-type(2) td:nth-of-type(5)', 'sim');

  return hasFase && hasAssignedKit;
}

async function isSearchResultUnassigned(page: Page): Promise<boolean> {
  const hasFase = await elementHasText(page, 'table tbody tr:first-of-type td:first-of-type', 'fase');
  const hasAssignedKit = await elementHasText(page, 'table tbody tr:nth-of-type(2) td:nth-of-type(4)', 'sim');
  const hasRejectedKit = await elementHasText(page, 'table tbody tr:nth-of-type(2) td:nth-of-type(5)', 'sim');

  return !hasFase && !hasAssignedKit && !hasRejectedKit;
}

async function isSearchResultUnassignedAndRejected(page: Page): Promise<boolean> {
  const hasFase = await elementHasText(page, 'table tbody tr:first-of-type td:first-of-type', 'fase');
  const hasAssignedKit = await elementHasText(page, 'table tbody tr:nth-of-type(2) td:nth-of-type(4)', 'sim');
  const hasRejectedKit = await elementHasText(page, 'table tbody tr:nth-of-type(2) td:nth-of-type(5)', 'sim');

  return !hasFase && !hasAssignedKit && hasRejectedKit;
}

async function collectAssignmentFromSearchResultInvalid(page: Page, nif: string): Promise<AssignmentInterface> {
  return {
    nif,
    name: '',
    school: '',
    hasKit: false,
    hasRejectedKit: false,
    pcType: '',
    pcState: '',
  };
}

async function collectAssignmentFromSearchResultAssigned(page: Page, nif: string): Promise<AssignmentInterface> {
  await clickOnButton(page, 'table tbody tr:nth-of-type(2) td:nth-of-type(6) a');
  await waitForElementNotVisible(page, SHARED_SELECTOR_LOADING);
  await wait(500);

  const student = await elementExists(page, ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT)
    ? await getInputValue(page, ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT)
    : await getInputValue(page, ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT_ALTERNATIVE);
  const name = student.split('-').map((studentPart) => studentPart.trim())[1];

  const school = await getInputValue(page, ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_SCHOOL);

  const [pcType, pcState] = await page.evaluate((searchText) => {
    const rows = Array.from(document.querySelectorAll('table tr'));
    const matchingRow = rows.find(row => (row as HTMLElement).innerText.toLowerCase().includes(searchText.toLowerCase()));

    if (!matchingRow) return ['', ''];

    const rowCells = matchingRow.querySelectorAll('td');
    const pcType = rowCells[0].innerText.split(searchText)[1];
    const pcState = rowCells[2].innerText;

    return [pcType, pcState];
  }, 'PC-Tipo');

  return {
    nif,
    name,
    school,
    hasKit: true,
    hasRejectedKit: false,
    pcType,
    pcState,
  };
}

async function collectAssignmentFromSearchResultUnassigned(page: Page, nif: string): Promise<AssignmentInterface> {
  await clickOnButton(page, 'table tbody tr:nth-of-type(2) td:nth-of-type(6) a:first-of-type');
  await waitForElementNotVisible(page, SHARED_SELECTOR_LOADING);
  await wait(250);

  const name = await getSelectedOption(page, ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_STUDENT);
  const school = await getSelectedOption(page, ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_SCHOOL);

  return {
    nif,
    name,
    school,
    hasKit: false,
    hasRejectedKit: false,
    pcType: '',
    pcState: '',
  };
}

async function collectAssignmentFromSearchResultUnassignedAndRejected(
  page: Page,
  nif: string,
): Promise<AssignmentInterface> {
  await clickOnButton(page, 'table tbody tr:nth-of-type(2) td:nth-of-type(6) a:first-of-type');
  await waitForElementNotVisible(page, SHARED_SELECTOR_LOADING);
  await wait(250);

  const name = await getInputValue(page, ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_AND_REJECTED_STUDENT);
  const school = await getInputValue(page, ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_AND_REJECTED_SCHOOL);

  return {
    nif,
    name,
    school,
    hasKit: false,
    hasRejectedKit: true,
    pcType: '',
    pcState: '',
  };
}
