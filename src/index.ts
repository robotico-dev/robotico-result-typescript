/**
 * @robotico/result — Result type for success/error handling in TypeScript.
 * Aligned with Robotico.Result (C#) and dev.robotico.result (Kotlin).
 *
 * @packageDocumentation
 */

// Errors
export {
  ErrorSeverity,
  type IError,
  type SimpleError,
  type ValidationError,
  type ExceptionError,
  type ErrorBase,
  type AggregateErrorType,
  createSimpleError,
  simpleError,
  createValidationError,
  validationErrorForField,
  createExceptionError,
  createError,
  createAggregateError,
  aggregateError,
} from "./errors.js";

// Core Result types and factories
export type { ResultVoid, Result, ResultTyped } from "./result.js";
export {
  success,
  error,
  validationErrorVoid,
  validationError,
  isSuccess,
  isError,
  mapVoid,
  bindVoid,
  successOf,
  errorOf,
  isSuccessOf,
  isErrorOf,
  map,
  bind,
  mapError,
  getValue,
  successTyped,
  errorTyped,
  mapTyped,
  bindTyped,
  mapErrorTyped,
  fromVoidResult,
  fromVoidTyped,
  fromTypedToResult,
  fromWithIError,
  fromTypedWithIError,
  expectSuccess,
  expectSuccessVoid,
  expectSuccessTyped,
} from "./result.js";

// Extensions: Match, Tap, Recover, Ensure, Collect
export {
  matchVoid,
  matchVoidVoid,
  tapVoid,
  tapErrorVoid,
  recoverWithVoid,
  match,
  matchVoidResult,
  matchTyped,
  tap,
  tapError,
  tapTyped,
  tapErrorTyped,
  recover,
  recoverWith,
  recoverWithResult,
  recoverTyped,
  recoverWithTyped,
  recoverWithResultTyped,
  ensure,
  ensureMessage,
  getValueOrDefault,
  mapErrorResult,
  collect,
  sequence,
  chooseSuccessful,
} from "./extensions.js";

// Utilities: Try, Combine
export {
  combine,
  combine2,
  combine3,
  combine4,
  tryResult,
  tryAsync,
  tryVoid,
  tryVoidAsync,
} from "./utilities.js";

// Async helpers
export {
  mapVoidAsync,
  bindVoidAsync,
  mapAsync,
  bindAsync,
  mapErrorAsync,
  mapTypedAsync,
  bindTypedAsync,
  mapErrorTypedAsync,
} from "./result-async.js";
