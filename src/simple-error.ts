import type { ErrorSeverity } from "./error-severity.js";
import type { IError } from "./i-error.js";

/** Simple implementation of IError with full control over all properties. */
export interface SimpleError extends IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
}
