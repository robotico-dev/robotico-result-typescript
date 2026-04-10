import { createSimpleError } from "./create-simple-error.js";
import { ErrorSeverity } from "./error-severity.js";
import type { IError } from "./i-error.js";

function domExceptionInnerError(ex: DOMException): IError {
  return createSimpleError(
    ex.message || ex.name,
    ex.name,
    ErrorSeverity.Error,
    null,
    Object.freeze({
      domExceptionCode: ex.code,
      domExceptionName: ex.name,
    })
  );
}

function errorInnerError(ex: Error): IError {
  return createSimpleError(ex.message || "Error", ex.name || "Error");
}

function unknownToInnerError(reason: unknown): IError | null {
  if (reason instanceof DOMException) {
    return domExceptionInnerError(reason);
  }
  if (reason instanceof Error) {
    return errorInnerError(reason);
  }
  return null;
}

/**
 * Maps an unknown thrown value (typically from IndexedDB / localStorage / DOM)
 * to an outer {@link IError} with a stable `code`, optional inner error, and DOMException context.
 */
export function createSimpleErrorFromUnknownBrowserReason(
  reason: unknown,
  outerCode: string,
  defaultMessage: string
): IError {
  const inner = unknownToInnerError(reason);
  const message = reason instanceof Error ? reason.message : String(reason);
  const context: Record<string, unknown> = {};
  if (reason instanceof DOMException) {
    context.domExceptionCode = reason.code;
    context.domExceptionName = reason.name;
  }
  return createSimpleError(
    message || defaultMessage,
    outerCode,
    ErrorSeverity.Error,
    inner,
    Object.freeze(context)
  );
}
