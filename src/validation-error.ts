import type { ErrorSeverity } from "./error-severity.js";
import type { IError } from "./i-error.js";

/** Validation error with field-specific messages. */
export interface ValidationError extends IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly errors: Readonly<Record<string, readonly string[]>>;
}
