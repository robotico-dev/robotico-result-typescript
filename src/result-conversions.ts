/**
 * Conversions between ResultVoid, Result<T>, and ResultTyped<T, E>.
 */

import type { IError } from "./errors.js";
import type { ResultVoid } from "./result-void.js";
import { freezeVoidErr, freezeVoidOk } from "./result-void.js";
import type { Result } from "./result-value.js";
import { freezeErr, freezeOk } from "./result-value.js";
import type { ResultTyped } from "./result-typed.js";

/**
 * Converts Result<T> to ResultVoid (drops the value when ok).
 *
 * @param r - The result
 * @returns Ok (void) or Err(error)
 */
export function fromVoidResult<T>(r: Result<T>): ResultVoid {
  return r._tag === "ok" ? freezeVoidOk() : freezeVoidErr(r.error);
}

/**
 * Converts ResultTyped<T, E> to ResultVoid.
 *
 * @param r - The typed result
 * @returns Ok (void) or Err(error)
 */
export function fromVoidTyped<T, E extends IError>(
  r: ResultTyped<T, E>
): ResultVoid {
  return r._tag === "ok" ? freezeVoidOk() : freezeVoidErr(r.error);
}

/**
 * Converts ResultTyped<T, E> to Result<T> (error type becomes IError).
 *
 * @param r - The typed result
 * @returns Result with same structure
 */
export function fromTypedToResult<T, E extends IError>(
  r: ResultTyped<T, E>
): Result<T> {
  return r._tag === "ok" ? freezeOk(r.value) : freezeErr(r.error);
}

/**
 * Converts Result<T> to ResultTyped<T, IError> (explicit error type).
 *
 * @param r - The result
 * @returns ResultTyped with IError
 */
export function fromWithIError<T>(r: Result<T>): ResultTyped<T, IError> {
  return r._tag === "ok"
    ? Object.freeze({ _tag: "ok" as const, value: r.value })
    : Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Widens error type from E to IError (ResultTyped<T, E> to ResultTyped<T, IError>).
 *
 * @param r - The typed result
 * @returns ResultTyped with IError
 */
export function fromTypedWithIError<T, E extends IError>(
  r: ResultTyped<T, E>
): ResultTyped<T, IError> {
  return r._tag === "ok"
    ? Object.freeze({ _tag: "ok" as const, value: r.value })
    : Object.freeze({ _tag: "err" as const, error: r.error });
}
