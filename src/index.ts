import puppeteer, { Page } from 'puppeteer';
import { login } from './pages/login/login.page';
import { logout } from './pages/logout/logout.page';
import { generateStudentAssignmentsByClassNameReport } from './reports/assignments-student';

async function run(): Promise<void> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await login(page, { skipTimeLog: false });
  await generateStudentReports(page);
  await logout(page);

  await browser.close();
}

async function generateStudentReports(page: Page): Promise<void> {
  const studentNifsByClassName: Record<string, string[]> = {};

  await generateStudentAssignmentsByClassNameReport(page, studentNifsByClassName);
}

run();
