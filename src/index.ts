export async function timeoutFetch(
  input: string | URL,
  timeoutMs: number,
  init: RequestInit = {},
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  if (
    !Number.isSafeInteger(timeoutMs) ||
    timeoutMs < 1 ||
    timeoutMs > 2147483647
  )
    throw new RangeError(
      "timeoutMs must be an integer between 1 and 2147483647",
    );
  const controller = new AbortController();
  const timer = setTimeout(
    () =>
      controller.abort(new DOMException("Request timed out", "TimeoutError")),
    timeoutMs,
  );
  const signal = init.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal;
  try {
    signal.throwIfAborted();
    return await fetcher(input, { ...init, signal });
  } finally {
    clearTimeout(timer);
  }
}
