import { Err } from "@finance-manager/result";
import type { AppError, AppResult } from "./result";
import type { ClientErrorStatusCode } from "hono/utils/http-status";
import type { Context, TypedResponse } from "hono";
import type { JSONParsed, JSONValue } from "hono/utils/types";

type SuccessResponse<T extends JSONValue> = Response &
  TypedResponse<T, 200, "json">;

type EmptyResponse = Response & TypedResponse<null, 204, "body">;

type ErrorResponse = Response &
  TypedResponse<JSONParsed<string>, ClientErrorStatusCode, "json">;

type MapResponse<T extends JSONValue> =
  | SuccessResponse<T>
  | EmptyResponse
  | ErrorResponse;

// type X = JSONRespond
// type Json<T extends JSONValue, U extends ContentfulStatusCode> = Context["json"];
// type SuccessResponse<T extends JSONValue> = ReturnType<
//   Json<T, Exclude<SuccessStatusCode, ContentlessStatusCode>>
// >;
// type ErrorResponse = ReturnType<typeof c.json<string, ClientErrorStatusCode>>;
// type EmptyResponse = ReturnType<typeof c.body<null, ContentlessStatusCode>>;

// type JSONObject = object | string | boolean | number;
// type ErrorResponse = [string, ClientErrorStatusCode];
// type EmptyResponse = [null, ContentlessStatusCode];
// type SuccessResponse<T extends JSONObject> = [T, SuccessStatusCode];

// type Response<T extends JSONObject> =
//   | SuccessResponse<T>
//   | EmptyResponse
//   | ErrorResponse;

export function mapResult(c: Context, error: Err<AppError>): ErrorResponse;
export function mapResult(c: Context, result: AppResult): EmptyResponse;
export function mapResult<T extends JSONValue>(
  c: Context,
  result: AppResult<T>,
): SuccessResponse<T> | ErrorResponse;

export function mapResult<T extends JSONValue>(
  c: Context,
  result: AppResult<T | void>,
): MapResponse<T> {
  return result.match<MapResponse<T>>({
    Ok: (x) =>
      x === undefined
        ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          (c.body(null, 204) as EmptyResponse)
        : // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          (c.json(x, 200) as SuccessResponse<T>),
    NotFound: (x) => c.json(`${x.resource} not found.`, 404),
    Forbidden: (x) => c.json(x.reason, 403),
    Validation: (x) => c.json(x.issues[0]?.path, 400),
    Conflict: (x) => c.json(x.message, 409),
  });
}
