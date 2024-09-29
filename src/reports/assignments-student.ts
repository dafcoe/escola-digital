import { Page } from 'puppeteer';
import { PageActionOptionsInterface } from '../pages/shared.interface';
import { AssignmentInterface } from '../pages/assignments/assignments.interface';
import { writeDataToSpreadsheet } from '../spreadsheet/spreadsheet-writer';
import { decorateWithExecutionTimeLog } from '../helpers/util.helper';
import { searchAssignmentByNif } from '../pages/assignments/search/search.page';

export async function generateStudentAssignmentsByClassNameReport(
  page: Page,
  studentNifsByClassName: Record<string, string[]>,
  options: PageActionOptionsInterface = {},
): Promise<void> {
  const bookName = 'student-assignments-by-class-name';
  const studentAssignmentsByClassName: Record<string, AssignmentInterface[]> = {};

  const report = async () => {
    for (let index = 0; index < Object.keys(studentNifsByClassName).length; index++) {
      const [className, studentNifs] = Object.entries(studentNifsByClassName)[index];
      studentAssignmentsByClassName[className] = await searchAssignmentByNifs(page, studentNifs);
    }

    writeDataToSpreadsheet(hydrateStudentAssignmentsByClassName(studentAssignmentsByClassName), bookName);
  };

  const decoratedWithExecutionTimeLogReport = decorateWithExecutionTimeLog(
    report,
    'Generating student assignments by class name report',
  );

  return options.skipTimeLog ? await report() : await decoratedWithExecutionTimeLogReport();
}

async function searchAssignmentByNifs(page: Page, nifs: string[]): Promise<AssignmentInterface[]> {
  const assignments: AssignmentInterface[] = [];

  for (let index = 0; index < nifs.length; index++) {
    assignments.push(await searchAssignmentByNif(page, nifs[index]));
  }

  return assignments;
}

function hydrateStudentAssignmentsByClassName(
  studentAssignmentsByClassName: Record<string, AssignmentInterface[]>,
): Record<string, Record<string, string>[]> {
  return Object.entries(studentAssignmentsByClassName).reduce((acc, [className, assignments]) => ({
    ...acc,
    [className]: assignments.map((assignment) => hydrateStudentAssignment(assignment)),
  }), {});
}

function hydrateStudentAssignment(
  { nif, name, school, hasKit, hasRejectedKit, pcType, pcState }: AssignmentInterface,
): Record<string, string> {
  const mappedHasKit = !school ? '' : hasKit ? 'sim' : 'não';
  const mappedHasRejectedKit = !school ? '' : hasKit ? '' : hasRejectedKit ? 'sim' : 'não';

  return {
    'NIF': nif,
    'Nome': name,
    'Escola': school,
    'Tem Kit?': mappedHasKit,
    'Rejeitou Kit?': mappedHasRejectedKit,
    'Tipo do PC': pcType,
    'Estado do PC': pcState,
  };
}
