import { ErrorSeverity } from "./error-severity.js";
import type { ErrorBase } from "./error-base.js";
import type { IError } from "./i-error.js";

/**
 * Creates an error with an optional caused-by chain.
 */
export function createError(
  message: string,
  causedBy?: readonly IError[] | null
): ErrorBase {
  const list = causedBy && causedBy.length > 0 ? [...causedBy] : [];
  const inner = list[0] ?? null;
  return Object.freeze({
    message,
    code: "ERROR",
    severity: ErrorSeverity.Error,
    innerError: inner,
    context: Object.freeze({}),
    causedBy: Object.freeze(list),
  });
}
