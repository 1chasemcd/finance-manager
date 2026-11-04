import { Err, Ok } from "./result";
import type { Result } from "./result";

export function ok<T>(data: T): Ok<T>;
export function ok(): Ok<void>;
export function ok<T>(data?: T): Ok<T> | Ok<void> {
  return arguments.length === 0 ? new Ok(undefined) : new Ok(data as T);
}

export function err<T>(data: T): Err<T>;
export function err(): Err<void>;
export function err<T>(data?: T): Err<T> | Err<void> {
  return arguments.length === 0 ? new Err(undefined) : new Err(data as T);
}

export function invariant<T, E>(result: Result<T, E>, message?: string): asserts result is Ok<T>;
export function invariant(condition: unknown, message: string): asserts condition;
export function invariant(value: unknown, message?: string) {
  if (isResult(value) && value.isErr) throw new Error(message ?? value.toString());
  if (!value) throw new Error(message);
}

export function isResult<T, E>(value: unknown): value is Result<T, E> {
  return value instanceof Ok || value instanceof Err;
}
