import type { Result } from "@finapp/result";

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.isErr) {
    throw new Error(`Expected Ok result, received error: ${JSON.stringify(result.error)}`);
  }
  return result.data;
}

export function unwrapError<T, E>(result: Result<T, E>): E {
  if (result.isOk) {
    throw new Error(`Expected Err result, received value: ${JSON.stringify(result.data)}`);
  }
  return result.error;
}
