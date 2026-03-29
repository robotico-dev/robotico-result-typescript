import { ErrorSeverity } from "./error-severity.js";
import type { ExceptionError } from "./exception-error.js";

/**
 * Wraps a thrown exception (Error or other) as ExceptionError.
 */
export function createExceptionError(exception: unknown): ExceptionError {
  const err =
    exception instanceof Error ? exception : new Error(String(exception));
  return Object.freeze({
    message: err.message ?? "An exception occurred",
    code: "ERROR",
    severity: ErrorSeverity.Error,
    innerError: null,
    context: Object.freeze({}),
    exception,
  });
}
