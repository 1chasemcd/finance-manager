import { Err } from "@finapp/result";

export interface NotFound {
  _tag: "NotFound";
  resource: string;
  id: string;
}

export const notFound = (resource: string, id: string | number): Err<NotFound> => {
  return new Err({
    _tag: "NotFound",
    resource,
    id: id.toString(),
  });
};

export interface Unauthorized {
  _tag: "Unauthorized";
  message: string;
}

export const unauthorized = (message?: string): Err<Unauthorized> => {
  message ??= "Authentication required or invalid credentials.";
  return new Err({
    _tag: "Unauthorized",
    message,
  });
};

export interface Forbidden {
  _tag: "Forbidden";
  message: string;
}

export const forbidden = (message?: string): Err<Forbidden> => {
  message ??= "The requested operation is forbidden.";
  return new Err({
    _tag: "Forbidden",
    message,
  });
};

export interface Validation {
  _tag: "Validation";
  issues: {
    path: string;
    message: string;
  }[];
}

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

export interface Conflict {
  _tag: "Conflict";
  message: string;
}

export const conflict = (message?: string): Err<Conflict> => {
  message ??= "The operation conflicts with the current state of the resource.";
  return new Err({
    _tag: "Conflict",
    message,
  });
};
