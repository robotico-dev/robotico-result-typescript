import type { ErrorSeverity } from "./error-severity.js";
import type { IError } from "./i-error.js";

/** Error that wraps an exception (JS Error). */
export interface ExceptionError extends IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly exception: unknown;
}
