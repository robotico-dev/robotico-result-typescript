import type { ErrorSeverity } from "./error-severity.js";
import type { IError } from "./i-error.js";

/** Aggregate error combining multiple errors. */
export interface AggregateErrorType extends IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly errors: readonly IError[];
}
