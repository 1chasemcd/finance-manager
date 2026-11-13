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

function isFunction(f: unknown): f is (data: unknown) => unknown {
  return typeof f === "function" && f.length === 1;
}

export function match<
  DataType,
  ErrorType extends string,
  CaseType extends Record<ErrorType, unknown>,
  OkReturnType,
>(
  result: Result<DataType, ErrorType>,
  cases: CaseType & {
    Ok:
      ((data: DataType) => OkReturnType) | Exclude<OkReturnType, (data: DataType) => OkReturnType>;
  } & Record<Exclude<keyof CaseType, "Ok" | ErrorType>, never>,
): Exclude<CaseType[keyof CaseType] | OkReturnType, (data: DataType) => OkReturnType>;
export function match<DataType, OkReturnType, ErrorReturnType>(
  result: Result<DataType>,
  cases: {
    Ok:
      ((data: DataType) => OkReturnType) | Exclude<OkReturnType, (data: DataType) => OkReturnType>;
    Err: ErrorReturnType;
  },
): Exclude<OkReturnType, (data: DataType) => OkReturnType> | ErrorReturnType;
export function match<DataType, ErrorType extends string | void>(
  result: Result<DataType, ErrorType>,
  cases: Record<string, unknown>,
) {
  if (result.isOk) {
    invariant("Ok" in cases, `case 'Ok' not handled in ${JSON.stringify(cases)}`);
    if (isFunction(cases["Ok"])) return cases["Ok"](result.data);
    return cases["Ok"];
  }

  const err = result.error;
  if (typeof err === "string") {
    invariant(err in cases, `case '${err}' not handled in ${JSON.stringify(cases)}`);
    return cases[err];
  }

  invariant("Err" in cases, `case 'Err' not handled in ${JSON.stringify(cases)}`);
  return cases["Err"];
}
