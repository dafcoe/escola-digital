import * as xlsx from 'xlsx';

export function writeDataToSpreadsheet<T>(
  data: Record<string, T[]>,
  bookName: string = (Date.now()).toString(),
): void {
  const book = xlsx.utils.book_new();

  Object.entries(data).forEach(([key, value]) => {
    xlsx.utils.book_append_sheet(book, xlsx.utils.json_to_sheet(value), key);
  });

  xlsx.writeFile(book, `./spreadsheets/${bookName}.xlsx`);
}
