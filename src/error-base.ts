import type { ErrorSeverity } from "./error-severity.js";
import type { IError } from "./i-error.js";

/** Base error with optional caused-by chain (for aggregation). */
export interface ErrorBase extends IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly causedBy: readonly IError[];
}
