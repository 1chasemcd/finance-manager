import { Ok } from "./result";

export function ok<T>(data: T): Ok<T>;
export function ok(): Ok<void>;

export function ok<T>(data?: T): Ok<T> | Ok<void> {
  return arguments.length === 0 ? new Ok(undefined) : new Ok(data as T);
}
