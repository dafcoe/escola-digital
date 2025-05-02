interface CursorPositionInterface {
  row: number;
  column: number;
}

const cliOutput: Record<string, string> = {};

export function wait(timeInMs: number = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeInMs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logExecutionTime<T extends (...args: any[]) => Promise<any>>(fn: T, description?: string): T {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    let cursorPosition: CursorPositionInterface = { row : 0, column: 0 };
    const output = `⚙️ ${description || `Running ${fn.name}`} ... `;

    cliOutput[output] = output;
    console.log(output);

    await getCursorPosition((position: CursorPositionInterface) => {
      cursorPosition = position;
    });

    const startTime = performance.now();
    const fnResult = await fn(...args);
    const endTime = performance.now();

    cliOutput[output] = `${cliOutput[output]}done [⏱️ ${(endTime - startTime).toFixed(2)} ms]`;

    const cliOutputLength = Object.keys(cliOutput).length;

    process.stdout.write(`\x1b[${cursorPosition.row - cliOutputLength};${cursorPosition.column}H`);
    Object.values(cliOutput).forEach((cliOutputEntry) => { console.log(cliOutputEntry); });

    return fnResult;
  } as T;
}

function getCursorPosition(callback: CallableFunction): Promise<boolean> {
  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.setRawMode(true);

    process.stdin.once('data', (buffer) => {
      const  match = /\[(\d+);(\d+)R$/.exec(buffer.toString());

      if (match) {
        const position = match.slice(1, 3).reverse().map(Number);

        callback({ row: position[1], column: position[0] });
        resolve(true);
      }

      process.stdin.setRawMode(false);
      process.stdin.pause();
    });

    process.stdout.write('\x1b[6n');
    process.stdout.emit('data', '\x1b[6n');
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decorateWithExecutionTimeLog<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  description?: string,
): T {
  return logExecutionTime(fn, description);
}
