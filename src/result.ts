/**
 * Result types and core operations. Re-exports from result-void, result-value, result-typed, result-conversions.
 * Aligned with Robotico.Result (C#) and dev.robotico.result (Kotlin).
 *
 * @packageDocumentation
 */

// Void result
export type { ResultVoid } from "./result-void.js";
export {
  success,
  error,
  validationErrorVoid,
  isSuccess,
  isError,
} from "./result-void.js";

// Result<T>
export type { Result } from "./result-value.js";
export {
  successOf,
  errorOf,
  validationError,
  isSuccessOf,
  isErrorOf,
  mapVoid,
  bindVoid,
  map,
  bind,
  mapError,
  getValue,
  expectSuccess,
  expectSuccessVoid,
} from "./result-value.js";

// ResultTyped<T, E>
export type { ResultTyped } from "./result-typed.js";
export {
  successTyped,
  errorTyped,
  mapTyped,
  bindTyped,
  mapErrorTyped,
  expectSuccessTyped,
} from "./result-typed.js";

// Conversions
export {
  fromVoidResult,
  fromVoidTyped,
  fromTypedToResult,
  fromWithIError,
  fromTypedWithIError,
} from "./result-conversions.js";
