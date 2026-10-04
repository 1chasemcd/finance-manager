import type { Result, ErrorType } from "@finapp/result";

export type AppResult<T = void, E extends ErrorType = AppError> = Result<T, E>;

import { Err } from "@finapp/result";

export interface NotFound {
  _tag: "NotFound";
  resource: string;
  id: string;
}

export interface Unauthorized {
  _tag: "Unauthorized";
  message: string;
}

export interface Forbidden {
  _tag: "Forbidden";
  message: string;
}

export interface Validation {
  _tag: "Validation";
  issues: {
    path: string;
    message: string;
  }[];
}

export interface Conflict {
  _tag: "Conflict";
  message: string;
}

export type AppError = NotFound | Unauthorized | Forbidden | Validation | Conflict;

export const notFound = (resource: string, id: string): Err<NotFound> => {
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

export const unauthorized = (message?: string): Err<Unauthorized> => {
  message ??= "Authentication required or invalid credentials.";
  return new Err({
    _tag: "Unauthorized",
    message,
  });
};

export const forbidden = (message?: string): Err<Forbidden> => {
  message ??= "The requested operation is forbidden.";
  return new Err({
    _tag: "Forbidden",
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
