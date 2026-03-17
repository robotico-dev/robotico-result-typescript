/**
 * ResultTyped<T, E> — Result with a specific error type E. mapTyped, bindTyped, mapErrorTyped.
 */

import type { IError } from "./errors.js";

/** Result with typed error E: Ok(value) or Err(error of type E). */
export type ResultTyped<T, E extends IError> =
  | { readonly _tag: "ok"; readonly value: T }
  | { readonly _tag: "err"; readonly error: E };

export function successTyped<T, E extends IError>(value: T): ResultTyped<T, E> {
  return Object.freeze({ _tag: "ok" as const, value });
}

/**
 * Creates a typed error result.
 *
 * @param err - The error (must not be null)
 * @returns Err(err)
 * @throws Error when err is null
 */
export function errorTyped<T, E extends IError>(err: E): ResultTyped<T, E> {
  if (err == null) throw new Error("error must not be null");
  return Object.freeze({ _tag: "err" as const, error: err });
}

/**
 * Map the value if ok (ResultTyped); otherwise propagate error.
 *
 * @param r - The typed result
 * @param mapping - Function from T to TMapped
 * @returns Ok(mapping(value)) or propagates error
 */
export function mapTyped<T, E extends IError, TMapped>(
  r: ResultTyped<T, E>,
  mapping: (value: T) => TMapped
): ResultTyped<TMapped, E> {
  return r._tag === "ok"
    ? Object.freeze({ _tag: "ok" as const, value: mapping(r.value) })
    : Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Bind (flatMap) for ResultTyped.
 *
 * @param r - The typed result
 * @param binding - Function from T to ResultTyped<TMapped, E>
 * @returns The result of binding(value) or propagates error
 */
export function bindTyped<T, E extends IError, TMapped>(
  r: ResultTyped<T, E>,
  binding: (value: T) => ResultTyped<TMapped, E>
): ResultTyped<TMapped, E> {
  return r._tag === "ok"
    ? binding(r.value)
    : Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Map the error type for ResultTyped.
 *
 * @param r - The typed result
 * @param errorMapping - Function from E to EMapped
 * @returns Ok(value) or Err(errorMapping(error))
 */
export function mapErrorTyped<T, E extends IError, EMapped extends IError>(
  r: ResultTyped<T, E>,
  errorMapping: (e: E) => EMapped
): ResultTyped<T, EMapped> {
  return r._tag === "ok"
    ? Object.freeze({ _tag: "ok" as const, value: r.value })
    : Object.freeze({ _tag: "err" as const, error: errorMapping(r.error) });
}

/**
 * Throws if error (ResultTyped). Use at boundaries only.
 *
 * @param r - The typed result
 * @param exceptionBuilder - Optional function to build the thrown Error
 * @returns The value when ok
 * @throws The error when r is err
 */
export function expectSuccessTyped<T, E extends IError>(
  r: ResultTyped<T, E>,
  exceptionBuilder?: (e: E) => Error
): T {
  if (r._tag === "err") {
    const ex = exceptionBuilder
      ? exceptionBuilder(r.error)
      : new Error(r.error.message);
    throw ex;
  }
  return r.value;
}
