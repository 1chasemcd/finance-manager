import { Err } from "@finance-manager/result";
import { AppError, AppResult } from "./result";
import { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";

type Object = object | string | boolean | number;
type Response = [Object, ContentfulStatusCode];
type EmptyResponse = [null, StatusCode];

function mapError(error: AppError): Response {
  switch (error._tag) {
    case "NotFound":
      return [`${error.resource} not found`, 404];

    default:
      return ["Internal Server Error", 500];
  }
}

export function mapResult(error: Err<AppError>): Response;
export function mapResult(result: AppResult): EmptyResponse;
export function mapResult<T extends Object>(result: AppResult<T>): Response;

export function mapResult<T extends Object | undefined>(
  result: AppResult<T>,
): Response | EmptyResponse {
  if (result.isOk && result.data !== undefined) return [result.data, 200];
  if (result.isOk) return [null, 204];
  return mapError(result.error);
}
