import { Err, ErrorType, Ok, Result } from "./result";

export function ok<T>(data: T): Ok<T>;
export function ok(): Ok<void>;

export function ok<T>(data?: T): Ok<T> | Ok<void> {
  return arguments.length === 0 ? new Ok(undefined) : new Ok(data as T);
}

export function err(): Err<{ _tag: "Err" }>;
export function err<T extends string>(tag: T): Err<{ _tag: T }>;
export function err(
  tag?: string,
  data?: Record<string, unknown>,
): Err<{ _tag: string; [key: string]: unknown }> {
  return new Err({
    _tag: tag ?? "Err",
    ...data,
  });
}

export function invariant<T, E extends ErrorType>(
  result: Result<T, E>,
  message?: string,
): asserts result is Ok<T>;
export function invariant(condition: unknown, message: string): asserts condition;
export function invariant(value: unknown, message?: string) {
  if (isResult(value) && value.isErr) throw new Error(message ?? value.toString());
  if (!value) throw new Error(message);
}

export function isResult<T, E extends ErrorType>(value: unknown): value is Result<T, E> {
  return value instanceof Ok || value instanceof Err;
}
