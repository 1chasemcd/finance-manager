import { Err } from "@finance-manager/result";
import { AppError, AppResult } from "./result";
import { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";

type Object = object | string | boolean | number;
type Response = [Object, ContentfulStatusCode];
type EmptyResponse = [null, StatusCode];

export function mapResult(error: Err<AppError>): Response;
export function mapResult(result: AppResult): EmptyResponse;
export function mapResult<T extends Object>(result: AppResult<T>): Response;

export function mapResult<T extends Object | undefined>(
  result: AppResult<T>,
): Response | EmptyResponse {
  return result.matchTag<Response | EmptyResponse>({
    Ok: (x) => (x === undefined ? [null, 204] : [x, 200]),
    NotFound: (x) => [`${x.resource} not found`, 404],
    Forbidden: (x) => [x.reason ?? "The requested operation is forbidden", 403],
    Validation: (x) => [x.issues, 400],
    Conflict: (x) => [x.message, 409],
  });
}
