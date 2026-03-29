import { ErrorSeverity } from "./error-severity.js";
import type { AggregateErrorType } from "./aggregate-error-type.js";
import type { IError } from "./i-error.js";

/**
 * Creates an aggregate error combining multiple errors.
 */
export function createAggregateError(
  message: string,
  errors: readonly IError[]
): AggregateErrorType {
  const list = [...errors];
  return Object.freeze({
    message,
    code: "AGG_ERRORS",
    severity: ErrorSeverity.Error,
    innerError: list[0] ?? null,
    context: Object.freeze({}),
    errors: Object.freeze(list),
  });
}

/**
 * Creates an aggregate error with an auto-generated message.
 */
export function aggregateError(errors: readonly IError[]): AggregateErrorType {
  return createAggregateError(
    `Multiple errors occurred (${errors.length} total)`,
    errors
  );
}
