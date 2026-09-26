import { Ok, Err } from "./result";

export const ok = <T>(data: T): Ok<T> => {
  return new Ok(data);
};

export const notFound = (message?: string) => {
  message ??= "The specified resource could not be found.";
  return new Err({
    _tag: "NotFound",
    message,
  });
};

export const conflict = (message?: string) => {
  message ??= "The operation conflicts with the current state of the resource.";
  return new Err({
    _tag: "Conflict",
    message,
  });
};

export const invalid = (message?: string) => {
  message ??= "The request was invalid.";
  return new Err({
    _tag: "Invalid",
    message,
  });
};
