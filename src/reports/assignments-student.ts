import { PageActionOptionsInterface } from '../pages/shared.interface';
import { AssignmentInterface } from '../pages/assignments/assignments.interface';
import { writeDataToSpreadsheet } from '../spreadsheet/spreadsheet-writer';
import { decorateWithExecutionTimeLog } from '../helpers/util.helper';
import { searchAssignmentByNif } from '../pages/assignments/search/search.page';

export async function generateStudentAssignmentsByClassNameReport(
  studentNifsByClassName: Record<string, string[]>,
  reportName: string = 'student-assignments-by-class-name',
  options: PageActionOptionsInterface = {},
): Promise<void> {
  const studentAssignmentsByClassName: Record<string, AssignmentInterface[]> = {};

  const report = async () => {
    for (let index = 0; index < Object.keys(studentNifsByClassName).length; index++) {
      const [className, studentNifs] = Object.entries(studentNifsByClassName)[index];
      studentAssignmentsByClassName[className] = await searchAssignmentsByClassName(className, studentNifs);
    }

    writeDataToSpreadsheet(hydrateStudentAssignmentsByClassName(studentAssignmentsByClassName), reportName);
  };

  const decoratedWithExecutionTimeLogReport = decorateWithExecutionTimeLog(
    report,
    'Generating student assignments by class name report',
  );

  return options.skipTimeLog ? await report() : await decoratedWithExecutionTimeLogReport();
}

async function searchAssignmentsByClassName(
  className: string,
  nifs: string[],
  options: PageActionOptionsInterface = {},
): Promise<AssignmentInterface[]> {
  const search = async () => {
    return await searchAssignmentByNifs(nifs);
  };

  const decoratedWithExecutionTimeLogSearch = decorateWithExecutionTimeLog(
    search,
    `️Searching assignments for class "${className}"`,
  );

  return options.skipTimeLog ? await search() : await decoratedWithExecutionTimeLogSearch();
}

async function searchAssignmentByNifs(nifs: string[]): Promise<AssignmentInterface[]> {
  const assignments: AssignmentInterface[] = [];

  for (let index = 0; index < nifs.length; index++) {
    assignments.push(await searchAssignmentByNif(nifs[index]));
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
  { nif, name, tier, school, hasKit, hasRejectedKit, pcType, pcState }: AssignmentInterface,
): Record<string, string> {
  const mappedTier = tier.toLowerCase() === 'sem escalão' ? '' : tier.toUpperCase().split('ESCALÃO ')[1];
  const mappedHasKit = !school ? '' : hasKit ? 'sim' : 'não';
  const mappedHasRejectedKit = !school ? '' : hasKit ? '' : hasRejectedKit ? 'sim' : 'não';

  return {
    'NIF': nif,
    'Nome': name,
    'Escalão': mappedTier,
    'Escola': school,
    'Tem Kit?': mappedHasKit,
    'Rejeitou Kit?': mappedHasRejectedKit,
    'Tipo do PC': pcType.toUpperCase(),
    'Estado do PC': pcState.toLowerCase(),
  };
}
