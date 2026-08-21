import type {
  HttpValidationProblemDetails,
  ProblemDetails,
} from "@/lib/generated";
import { App, type FormInstance } from "antd";

const DEFAULT_TITLE = "Submission failed";
const DEFAULT_CONTENT = "There was a problem submitting your request";

export default function useFormErrorHandler() {
  const { modal } = App.useApp();

  return (form: FormInstance, error: unknown) => {
    let modalError = { title: DEFAULT_TITLE, content: DEFAULT_CONTENT };
    if (isHttpValidationProblemDetails(error))
      return handleValidationFormErrors(form, error);
    if (isProblemDetails(error)) {
      if (error.title) modalError.title = error.title;
      if (error.detail) modalError.content = error.detail;
    }
    modal.error(modalError);
  };
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
