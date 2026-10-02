import type { Result, ErrorType } from "@finapp/result";

export type AppResult<T = void, E extends ErrorType = AppError> = Result<T, E>;

import { Err } from "@finapp/result";

interface NotFound {
  _tag: "NotFound";
  resource: string;
  id: number;
}

interface Forbidden {
  _tag: "Forbidden";
  reason: string;
}

interface Validation {
  _tag: "Validation";
  issues: {
    path: string;
    message: string;
  }[];
}

interface Conflict {
  _tag: "Conflict";
  message: string;
}

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

export const forbidden = (reason?: string): Err<Forbidden> => {
  reason ??= "The requested operation is forbidden.";
  return new Err({
    _tag: "Forbidden",
    reason,
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
