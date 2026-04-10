/**
 * Error types and factories for @robotico/result — barrel re-exports (one type per module).
 */

export { ErrorSeverity } from "./error-severity.js";
export type { IError } from "./i-error.js";
export type { SimpleError } from "./simple-error.js";
export type { ValidationError } from "./validation-error.js";
export type { ExceptionError } from "./exception-error.js";
export type { ErrorBase } from "./error-base.js";
export type { AggregateErrorType } from "./aggregate-error-type.js";
export { createSimpleError, simpleError } from "./create-simple-error.js";
export { createSimpleErrorFromUnknownBrowserReason } from "./create-simple-error-from-unknown-browser-reason.js";
export {
  createValidationError,
  validationErrorForField,
} from "./create-validation-error.js";
export { createExceptionError } from "./create-exception-error.js";
export { createError } from "./create-chained-error.js";
export {
  createAggregateError,
  aggregateError,
} from "./create-aggregate-error.js";
