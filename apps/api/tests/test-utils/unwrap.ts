import type { Result } from "@finapp/result";

export function unwrap<T, E>(result: Result<T, E>): T;
export function unwrap<T, E>(result: Promise<Result<T, E>>): Promise<T>;
export function unwrap<T, E>(result: Result<T, E> | Promise<Result<T, E>>): T | Promise<T> {
  if (result instanceof Promise) return result.then(unwrap) as Promise<T>;

  if (result.isErr)
    throw new Error(`Expected Ok result, received error: ${JSON.stringify(result.error)}`);

  return result.data;
}

export function unwrapError<T, E>(result: Result<T, E>): E;
export function unwrapError<T, E>(result: Promise<Result<T, E>>): Promise<E>;
export function unwrapError<T, E>(result: Result<T, E> | Promise<Result<T, E>>): E | Promise<E> {
  if (result instanceof Promise) return result.then(unwrapError) as Promise<E>;

  if (result.isOk)
    throw new Error(`Expected Err result, received value: ${JSON.stringify(result.data)}`);

  return result.error;
}
