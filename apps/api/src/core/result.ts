import { Result, ErrorType } from "@finance-manager/result";

export type AppResult<T = void, E extends ErrorType = AppError> = Result<T, E>;

import { Err } from "@finance-manager/result";

type NotFound = {
  _tag: "NotFound";
  resource: string;
  id: number;
};

type Forbidden = {
  _tag: "Forbidden";
  reason?: string;
};

type Validation = {
  _tag: "Validation";
  issues: {
    path: string;
    message: string;
  }[];
};

type Conflict = {
  _tag: "Conflict";
  message: string;
};

export type AppError = NotFound | Forbidden | Validation | Conflict;

export const notFound = (resource: string, id: number): Err<NotFound> => {
  return new Err({
    _tag: "NotFound",
    resource,
    id,
  });
};

export const conflict = (message?: string): Err<Conflict> => {
  message ??= "The operation conflicts with the current state of the resource.";
  return new Err({
    _tag: "Conflict",
    message,
  });
};

export const invalid = (
  issues: {
    path: string;
    message: string;
  }[],
): Err<Validation> => {
  return new Err({
    _tag: "Validation",
    issues,
  });
};
