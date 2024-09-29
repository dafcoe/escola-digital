export function wait(timeInMs: number = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeInMs));
}

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

export function decorateWithExecutionTimeLog<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  description?: string,
): T {
  return logExecutionTime(fn, description);
}
