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
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT_ALTERNATIVE,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_TIER,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_TIER_ALTERNATIVE,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_AND_REJECTED_STUDENT,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_AND_REJECTED_TIER,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_STUDENT,
  ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_TIER,
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
  nif: string,
  options: PageActionOptionsInterface = {},
): Promise<AssignmentInterface> {
  const searchAssignmentByNif = async (): Promise<AssignmentInterface> => {
    await clickOnButton(ASSIGNMENTS_SELECTOR_NAV_LIST_ITEM_ANCHOR);
    await waitForElementNotVisible(SHARED_SELECTOR_LOADING);
    await selectOption(ASSIGNMENTS_SELECTOR_FASE, '1');
    await waitForElementNotVisible(SHARED_SELECTOR_LOADING);
    await clickOnButton(ASSIGNMENTS_SELECTOR_SEARCH_TAB);
    await waitForElementVisible(ASSIGNMENTS_SELECTOR_SEARCH_TAB_SELECTED);
    await typeOnInput(ASSIGNMENTS_SELECTOR_SEARCH_NIF, nif);
    await clickOnButton(ASSIGNMENTS_SELECTOR_SEARCH_SUBMIT);
    await page.waitForNavigation();
    return await collectAssignment(nif);
  };
  const decoratedWithExecutionTimeLogSearchAssignmentByNif = decorateWithExecutionTimeLog(
    searchAssignmentByNif,
    `Searching assignment for nif ${nif}`,
  );

  return options.skipTimeLog
    ? await searchAssignmentByNif()
    : await decoratedWithExecutionTimeLogSearchAssignmentByNif();
}

async function collectAssignment(nif: string): Promise<AssignmentInterface> {
  const searchResultTypeActionMap: Record<SearchResultType, CallableFunction> = {
    invalid: collectAssignmentFromSearchResultInvalid,
    assigned: collectAssignmentFromSearchResultAssigned,
    unassigned: collectAssignmentFromSearchResultUnassigned,
    'unassigned-and-rejected': collectAssignmentFromSearchResultUnassignedAndRejected,
  };
  const searchResultType = await getSearchResultType(nif);

  if (!searchResultType) throw new Error('An unexpected error has occurred while collecting an assignment');

  return await searchResultTypeActionMap[searchResultType](nif);
}

async function getSearchResultType(nif: string): Promise<SearchResultType | undefined> {
  const isInvalid = nif.length < 3 || await isSearchResultInvalid();
  if (isInvalid) return 'invalid';

  const isAssigned = await isSearchResultAssigned();
  if (isAssigned) return 'assigned';

  const isUnassigned = await isSearchResultUnassigned();
  if (isUnassigned) return 'unassigned';

  const isUnassignedAndRejected = await isSearchResultUnassignedAndRejected();
  if (isUnassignedAndRejected) return 'unassigned-and-rejected';

  return undefined;
}

async function isSearchResultInvalid(): Promise<boolean> {
  return await elementHasText(
    SHARED_SELECTOR_ALERT_INFO,
    'O aluno não pertence a este AE/EnA ou deixou de beneficiar de ASE A, B ou C',
  );
}

async function isSearchResultAssigned(): Promise<boolean> {
  const hasFase = await elementHasText('table tbody tr:first-of-type td:first-of-type', 'fase');
  const hasAssignedKit = await elementHasText('table tbody tr:nth-of-type(2) td:nth-of-type(5)', 'sim');

  return hasFase && hasAssignedKit;
}

async function isSearchResultUnassigned(): Promise<boolean> {
  const hasFase = await elementHasText('table tbody tr:first-of-type td:first-of-type', 'fase');
  const hasAssignedKit = await elementHasText('table tbody tr:nth-of-type(2) td:nth-of-type(4)', 'sim');
  const hasRejectedKit = await elementHasText('table tbody tr:nth-of-type(2) td:nth-of-type(5)', 'sim');

  return !hasFase && !hasAssignedKit && !hasRejectedKit;
}

async function isSearchResultUnassignedAndRejected(): Promise<boolean> {
  const hasFase = await elementHasText('table tbody tr:first-of-type td:first-of-type', 'fase');
  const hasAssignedKit = await elementHasText('table tbody tr:nth-of-type(2) td:nth-of-type(4)', 'sim');
  const hasRejectedKit = await elementHasText('table tbody tr:nth-of-type(2) td:nth-of-type(5)', 'sim');

  return !hasFase && !hasAssignedKit && hasRejectedKit;
}

async function collectAssignmentFromSearchResultInvalid(nif: string): Promise<AssignmentInterface> {
  return {
    nif,
    name: '',
    tier: '',
    school: '',
    hasKit: false,
    hasRejectedKit: false,
    pcType: '',
    pcState: '',
  };
}

async function collectAssignmentFromSearchResultAssigned(nif: string): Promise<AssignmentInterface> {
  const school = await page.$eval('table tbody tr:nth-of-type(2) td:nth-of-type(4)', (element) => element.innerText);

  await clickOnButton('table tbody tr:nth-of-type(2) td:nth-of-type(6) a');
  await waitForElementNotVisible(SHARED_SELECTOR_LOADING);
  await wait(500);

  const student = await elementExists(ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT)
    ? await getInputValue(ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT)
    : await getInputValue(ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT_ALTERNATIVE);

  const name = student.split('-').map((studentPart) => studentPart.trim())[1];

  const tier = await elementExists(ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_STUDENT)
    ? await getInputValue(ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_TIER)
    : await getInputValue(ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_ASSIGNED_TIER_ALTERNATIVE);

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
    tier,
    school,
    hasKit: true,
    hasRejectedKit: false,
    pcType,
    pcState,
  };
}

async function collectAssignmentFromSearchResultUnassigned(nif: string): Promise<AssignmentInterface> {
  const school = await page.$eval('table tbody tr:nth-of-type(2) td:nth-of-type(3)', (element) => element.innerText);

  await clickOnButton('table tbody tr:nth-of-type(2) td:nth-of-type(6) a:first-of-type');
  await waitForElementNotVisible(SHARED_SELECTOR_LOADING);
  await wait(500);

  const name = await getSelectedOption(ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_STUDENT);
  const tier = await getSelectedOption(ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_TIER);

  return {
    nif,
    name,
    tier,
    school,
    hasKit: false,
    hasRejectedKit: false,
    pcType: '',
    pcState: '',
  };
}

async function collectAssignmentFromSearchResultUnassignedAndRejected(nif: string): Promise<AssignmentInterface> {
  const school = await page.$eval('table tbody tr:nth-of-type(2) td:nth-of-type(3)', (element) => element.innerText);

  await clickOnButton('table tbody tr:nth-of-type(2) td:nth-of-type(6) a:first-of-type');
  await waitForElementNotVisible(SHARED_SELECTOR_LOADING);
  await wait(500);

  const name = await getInputValue(ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_AND_REJECTED_STUDENT);
  const tier = await getSelectedOption(ASSIGNMENTS_SELECTOR_SEARCH_DETAIL_UNASSIGNED_AND_REJECTED_TIER);

  return {
    nif,
    name,
    tier,
    school,
    hasKit: false,
    hasRejectedKit: true,
    pcType: '',
    pcState: '',
  };
}
