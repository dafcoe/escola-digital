import puppeteer  from 'puppeteer';
import { login } from './pages/login/login.page';
import { logout } from './pages/logout/logout.page';
import { generateStudentAssignmentsByClassNameReport } from './reports/assignments-student';

async function run(): Promise<void> {
  const browser = await puppeteer.launch();
  globalThis.page  = await browser.newPage();
  await globalThis.page.setViewport({ width: 1920, height: 1080 });

  await login();
  await generateStudentReports();
  await logout();

  await browser.close();
}

async function generateStudentReports(): Promise<void> {
  const studentNifsByClassName: Record<string, string[]>[] = [];

  for (let index = 0; index < studentNifsByClassName.length; index++) {
    const nifsByClassName = Object.values(studentNifsByClassName)[index];
    const reportNameSuffix = Object.keys(nifsByClassName)[0].replaceAll(' ', '-').toLowerCase();

    await generateStudentAssignmentsByClassNameReport(
      nifsByClassName,
      `student-assignments-${reportNameSuffix}`,
    );
  }
}

run();
