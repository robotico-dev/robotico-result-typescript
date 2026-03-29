import { ErrorSeverity } from "./error-severity.js";
import type { IError } from "./i-error.js";
import type { SimpleError } from "./simple-error.js";

/**
 * Creates a simple error with full control over message, code, severity, innerError, and context.
 */
export function createSimpleError(
  message: string,
  code: string = "ERROR",
  severity: ErrorSeverity = ErrorSeverity.Error,
  innerError: IError | null = null,
  context: Readonly<Record<string, unknown>> = Object.freeze({})
): SimpleError {
  return Object.freeze({
    message,
    code,
    severity,
    innerError,
    context:
      context && Object.keys(context).length > 0
        ? Object.freeze({ ...context })
        : Object.freeze({}),
  });
}

/**
 * Creates a simple error with only a message (code "ERROR", severity Error).
 */
export function simpleError(message: string): SimpleError {
  return createSimpleError(message, "ERROR", ErrorSeverity.Error);
}
