import type { ErrorSeverity } from "./error-severity.js";

/**
 * Base interface for all errors reported using Result types.
 * Implement or use createSimpleError, createValidationError, etc.
 */
export interface IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
}
