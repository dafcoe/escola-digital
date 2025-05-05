globalThis.prevLogIndentationLevel = -1;
globalThis.currLogIndentationLevel = -1;

export function wait(timeInMs: number = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeInMs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logExecutionTime<T extends (...args: any[]) => Promise<any>>(fn: T, description?: string): T {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    currLogIndentationLevel ++;

    const logIndentationLevelDiff = currLogIndentationLevel - prevLogIndentationLevel;
    const logIndentationSpaces = ' '.repeat(currLogIndentationLevel * 3);
    const logNewLine = logIndentationLevelDiff ? '' : '\n';

    console.log(`${logNewLine}${logIndentationSpaces}⚙️ ${description || `Running ${fn.name}`}`);

    const startTime = performance.now();
    const fnResult = await fn(...args);
    const endTime = performance.now();

    console.log(`${logIndentationSpaces}✅ Done [⏱️ ${(endTime - startTime).toFixed(2)} ms]`);

    prevLogIndentationLevel = currLogIndentationLevel;
    currLogIndentationLevel --;

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
