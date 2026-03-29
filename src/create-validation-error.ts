import { ErrorSeverity } from "./error-severity.js";
import type { ValidationError } from "./validation-error.js";

/**
 * Creates a validation error with field-specific messages. Requires at least one field error.
 *
 * @throws Error when errors is empty
 */
export function createValidationError(
  errors: Readonly<Record<string, readonly string[]>>,
  message?: string | null,
  code?: string
): ValidationError {
  if (!errors || Object.keys(errors).length === 0) {
    throw new Error("At least one validation error is required");
  }
  const totalErrors = Object.values(errors).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const fieldCount = Object.keys(errors).length;
  const msg =
    message ??
    `Validation failed with ${totalErrors} error(s) across ${fieldCount} field(s)`;
  return Object.freeze({
    message: msg,
    code: code ?? "VAL_FAILED",
    severity: ErrorSeverity.Warning,
    innerError: null,
    context: Object.freeze({}),
    errors: Object.freeze(
      Object.fromEntries(
        Object.entries(errors).map(([k, v]) => [k, Object.freeze([...v])])
      )
    ),
  });
}

/**
 * Creates a validation error for a single field.
 */
export function validationErrorForField(
  fieldName: string,
  errorMessage: string
): ValidationError {
  return createValidationError(
    { [fieldName]: [errorMessage] },
    `Validation failed for ${fieldName}: ${errorMessage}`,
    `VAL_${fieldName.toUpperCase()}`
  );
}
