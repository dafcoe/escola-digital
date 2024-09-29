import puppeteer, { Page } from 'puppeteer';
import { login } from './pages/login/login.page';
import { logout } from './pages/logout/logout.page';
import { searchAssignmentByNif } from './pages/assignments/search/search.page';
import { AssignmentInterface } from './pages/assignments/assignments.interface';

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await login(page, { skipTimeLog: false });

  const assignments = await searchAssignmentByNifs(page, [
    '12345',
    '253270154',
    '280146540',
    '255007736',
  ]);

  // await page.screenshot({path: 'sshots/search.png'});
  console.log(assignments);

  await logout(page);

  await browser.close();
}

async function searchAssignmentByNifs(page: Page, nifs: string[]): Promise<AssignmentInterface[]> {
  const assignments: AssignmentInterface[] = [];

  for (let index = 0; index < nifs.length; index++) {
    assignments.push(await searchAssignmentByNif(page, nifs[index]));
  }

  return assignments;
}

run();
