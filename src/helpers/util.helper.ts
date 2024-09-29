export function wait(timeInMs: number = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeInMs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logExecutionTime<T extends (...args: any[]) => Promise<any>>(fn: T, description?: string): T {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    process.stdout.write(`⚙️${description || `Running ${fn.name}`} ... `);

    const startTime = performance.now();
    const fnResult = await fn(...args);
    const endTime = performance.now();

    process.stdout.write(`done (⏱️${(endTime - startTime).toFixed(2)} ms)\n`);

    return fnResult;
  } as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decorateWithExecutionTimeLog<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  description?: string,
): T {
  return logExecutionTime(fn, description);
}
