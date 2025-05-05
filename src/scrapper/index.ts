import puppeteer  from 'puppeteer';
import { login } from './pages/login/login.page';
import { logout } from './pages/logout/logout.page';
import { generateStudentAssignmentsByClassNameReport } from './reports/assignments-student';

async function run(): Promise<void> {
  const browser = await puppeteer.launch();
  globalThis.page  = await browser.newPage();
  await globalThis.page.setViewport({ width: 1920, height: 1080 });
  const cliArguments = getCliArguments();

  await login();
  await generateStudentReports(cliArguments);
  await logout();

  await browser.close();
}

function getCliArguments()  {
  const args: Record<string, string> = {};

  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.split('=');

    args[key.replace('--', '')] = value;
  });

  if (!args.name || !args.nifs) {
    throw new Error('"name" or "nifs" argument is missing');
  }

  return {
    [args.name || 'report-name']: (args.nifs || '')
      .replaceAll(' ', '')
      .split(',')
      .filter((nif) => nif.length > 0),
  };
};

async function generateStudentReports(cliArguments: Record<string, string[]> = {}): Promise<void> {
  const studentNifsByClassName: Record<string, string[]>[] = [
    cliArguments,
    // { 'report-name': ['123456789'] },
  ];

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
