/**
 * Result<T> — success value or error. Core operations: map, bind, getValue, expectSuccess.
 */

import type { IError } from "./errors.js";
import { createValidationError } from "./errors.js";
import type { ResultTyped } from "./result-typed.js";
import type { ResultVoid } from "./result-void.js";

/** Result with a value on success: Ok(value) or Err(error). */
export type Result<T> =
  | { readonly _tag: "ok"; readonly value: T }
  | { readonly _tag: "err"; readonly error: IError };

export function freezeOk<T>(value: T): Result<T> {
  return Object.freeze({ _tag: "ok" as const, value });
}

export function freezeErr<T>(err: IError): Result<T> {
  return Object.freeze({ _tag: "err" as const, error: err });
}

/** Creates a successful result with value. */
export function successOf<T>(value: T): Result<T> {
  return freezeOk(value);
}

/**
 * Creates an error result.
 *
 * @param err - The error (must not be null)
 * @returns Err(err)
 * @throws Error when err is null
 */
export function errorOf<T>(err: IError): Result<T> {
  if (err == null) throw new Error("error must not be null");
  return freezeErr(err);
}

/**
 * Creates a validation error result with data type.
 *
 * @param errors - Map of field name to list of error messages
 * @param message - Optional overall message
 * @param code - Optional code (default "VAL_FAILED")
 * @returns Err(ValidationError)
 * @throws Error when errors is empty
 */
export function validationError<T>(
  errors: Readonly<Record<string, readonly string[]>>,
  message?: string | null,
  code?: string
): Result<T> {
  return Object.freeze({
    _tag: "err" as const,
    error: createValidationError(errors, message, code ?? "VAL_FAILED"),
  });
}

/** Type guard: true if result is ok with value. */
export function isSuccessOf<T>(r: Result<T>): r is { _tag: "ok"; value: T } {
  return r._tag === "ok";
}

/** Type guard: true if result is err. */
export function isErrorOf<T>(
  r: Result<T>
): r is { _tag: "err"; error: IError } {
  return r._tag === "err";
}

/**
 * Maps void result to Result<TMapped> using the given mapping (only when ok).
 *
 * @param r - The void result
 * @param mapping - Function that produces the value when ok
 * @returns Ok(mapping()) or propagates error
 */
export function mapVoid<TMapped>(
  r: ResultVoid,
  mapping: () => TMapped
): Result<TMapped> {
  return r._tag === "ok"
    ? Object.freeze({ _tag: "ok" as const, value: mapping() })
    : Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Bind (flatMap) for void result: when ok, run binding and return its result.
 *
 * @param r - The void result
 * @param binding - Function that returns Result<TMapped> when ok
 * @returns The result of binding() or propagates error
 */
export function bindVoid<TMapped>(
  r: ResultVoid,
  binding: () => Result<TMapped>
): Result<TMapped> {
  return r._tag === "ok"
    ? binding()
    : Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Map the value if ok; otherwise propagate error.
 *
 * @param r - The result
 * @param mapping - Function from T to TMapped
 * @returns Ok(mapping(value)) or propagates error
 */
export function map<T, TMapped>(
  r: Result<T>,
  mapping: (value: T) => TMapped
): Result<TMapped> {
  return r._tag === "ok"
    ? Object.freeze({ _tag: "ok" as const, value: mapping(r.value) })
    : Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Bind (flatMap): when ok, apply binding and return its result.
 *
 * @param r - The result
 * @param binding - Function from T to Result<TMapped>
 * @returns The result of binding(value) or propagates error
 */
export function bind<T, TMapped>(
  r: Result<T>,
  binding: (value: T) => Result<TMapped>
): Result<TMapped> {
  return r._tag === "ok"
    ? binding(r.value)
    : Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Map the error if err; otherwise pass through ok.
 *
 * @param r - The result
 * @param errorMapping - Function from IError to TMappedErr
 * @returns Ok(value) or Err(errorMapping(error))
 */
export function mapError<T, TMappedErr extends IError>(
  r: Result<T>,
  errorMapping: (e: IError) => TMappedErr
): ResultTyped<T, TMappedErr> {
  return r._tag === "ok"
    ? Object.freeze({ _tag: "ok" as const, value: r.value })
    : Object.freeze({ _tag: "err" as const, error: errorMapping(r.error) });
}

/** Returns the value if ok; otherwise undefined. */
export function getValue<T>(r: Result<T>): T | undefined {
  return r._tag === "ok" ? r.value : undefined;
}

/**
 * Returns the value if ok; throws if err. Use only at process/API boundaries (e.g. HTTP handler, CLI).
 * Prefer match/getValue in domain/app code to keep Results explicit.
 *
 * @param r - The result
 * @param exceptionBuilder - Optional function to build the thrown Error from IError
 * @returns The value when ok
 * @throws The error (or exceptionBuilder(error)) when err
 */
export function expectSuccess<T>(
  r: Result<T>,
  exceptionBuilder?: (e: IError) => Error
): T {
  if (r._tag === "err") {
    const ex = exceptionBuilder
      ? exceptionBuilder(r.error)
      : new Error(r.error.message);
    throw ex;
  }
  return r.value;
}

/**
 * Throws if error (void Result). Use at boundaries only.
 *
 * @param r - The void result
 * @param exceptionBuilder - Optional function to build the thrown Error
 * @throws The error when r is err
 */
export function expectSuccessVoid(
  r: ResultVoid,
  exceptionBuilder?: (e: IError) => Error
): void {
  if (r._tag === "err") {
    const ex = exceptionBuilder
      ? exceptionBuilder(r.error)
      : new Error(r.error.message);
    throw ex;
  }
}
