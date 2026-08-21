import type {
  HttpValidationProblemDetails,
  ProblemDetails,
} from "@/lib/generated";
import { App, type FormInstance } from "antd";
import { useCallback } from "react";

const DEFAULT_TITLE = "Error";
const DEFAULT_CONTENT = "An unexpected problem occurred";

export function useFormErrorHandler() {
  const { modal } = App.useApp();

  return useCallback(
    (form: FormInstance, error: unknown) => {
      let modalError = { title: DEFAULT_TITLE, content: DEFAULT_CONTENT };
      if (isHttpValidationProblemDetails(error))
        return handleValidationFormErrors(form, error);
      if (isProblemDetails(error)) {
        if (error.title) modalError.title = error.title;
        if (error.detail) modalError.content = error.detail;
      }
      modal.error(modalError);
    },
    [modal],
  );
}

export function useErrorHandler() {
  const { modal } = App.useApp();

  return useCallback(
    (error: unknown) => {
      let modalError = { title: DEFAULT_TITLE, content: DEFAULT_CONTENT };
      if (isHttpValidationProblemDetails(error)) {
        if (error.title) modalError.title = error.title;
        if (error.errors) modalError.content = joinFieldValidationErrors(error);
      }
      if (isProblemDetails(error)) {
        if (error.title) modalError.title = error.title;
        if (error.detail) modalError.content = error.detail;
      }
      modal.error(modalError);
    },
    [modal],
  );
}

function handleValidationFormErrors(
  form: FormInstance,
  problem: HttpValidationProblemDetails,
) {
  if (!problem.errors) return;
  form.setFields(
    Object.entries(problem.errors).map(([field, messages]) => ({
      name: field,
      errors: messages,
    })),
  );
}

function joinFieldValidationErrors(problem: HttpValidationProblemDetails) {
  return Object.entries(problem.errors ?? {})
    .flatMap(([field, messages]) =>
      messages.map((message) => `${field}: ${message}`),
    )
    .join("\n");
}

function isHttpValidationProblemDetails(
  error: unknown,
): error is HttpValidationProblemDetails {
  return (
    typeof error === "object" &&
    error !== null &&
    Object.hasOwn(error, "errors")
  );
}

function isProblemDetails(error: unknown): error is ProblemDetails {
  return (
    typeof error === "object" &&
    error !== null &&
    (Object.hasOwn(error, "title") || Object.hasOwn(error, "detail"))
  );
}
