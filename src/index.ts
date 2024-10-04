import puppeteer  from 'puppeteer';
import { login } from './pages/login/login.page';
import { logout } from './pages/logout/logout.page';
import { generateStudentAssignmentsByClassNameReport } from './reports/assignments-student';

async function run(): Promise<void> {
  const browser = await puppeteer.launch();
  globalThis.page  = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await login();
  await generateStudentReports();
  await logout();

  await browser.close();
}

async function generateStudentReports(): Promise<void> {
  const studentNifsByClassNameAndGrade: Record<string, Record<string, string[]>> = {};

  for (let index = 0; index < Object.entries(studentNifsByClassNameAndGrade).length; index++) {
    const [grade, studentNifs] = Object.entries(studentNifsByClassNameAndGrade)[index];

    await generateStudentAssignmentsByClassNameReport(studentNifs, `student-assignments-${grade}`);
  }
}

run();
