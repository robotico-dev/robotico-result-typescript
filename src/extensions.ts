/**
 * Extension-style functions: Match, Tap, TapError, Recover, Ensure, Collect, Sequence.
 */

import type { IError } from "./errors.js";
import { simpleError } from "./errors.js";
import type { Result, ResultTyped, ResultVoid } from "./result.js";
import { errorOf, successOf, successTyped } from "./result.js";

// --- Match (void Result) ---

/**
 * Pattern match on void Result: runs onSuccess() when ok, onError(e) when err.
 *
 * @param r - The void result
 * @param onSuccess - Handler when ok
 * @param onError - Handler when err
 * @returns The result of the handler that ran
 */
export function matchVoid<TResult>(
  r: ResultVoid,
  onSuccess: () => TResult,
  onError: (e: IError) => TResult
): TResult {
  return r._tag === "ok" ? onSuccess() : onError(r.error);
}

/**
 * Pattern match on void Result (void return): runs onSuccess() or onError(e).
 *
 * @param r - The void result
 * @param onSuccess - Handler when ok
 * @param onError - Handler when err
 */
export function matchVoidVoid(
  r: ResultVoid,
  onSuccess: () => void,
  onError: (e: IError) => void
): void {
  if (r._tag === "ok") onSuccess();
  else onError(r.error);
}

// --- Tap / TapError / RecoverWith (void Result) ---

/**
 * Runs action when ok; returns the same void result.
 *
 * @param r - The void result
 * @param action - Side effect when ok
 * @returns The same result
 */
export function tapVoid(r: ResultVoid, action: () => void): ResultVoid {
  if (r._tag === "ok") action();
  return r;
}

/**
 * Runs action when err; returns the same void result.
 *
 * @param r - The void result
 * @param action - Side effect when err
 * @returns The same result
 */
export function tapErrorVoid(
  r: ResultVoid,
  action: (e: IError) => void
): ResultVoid {
  if (r._tag === "err") action(r.error);
  return r;
}

/**
 * Returns r if ok; otherwise returns fallback (void).
 *
 * @param r - The void result
 * @param fallback - Result to return when err
 * @returns r or fallback
 */
export function recoverWithVoid(
  r: ResultVoid,
  fallback: ResultVoid
): ResultVoid {
  return r._tag === "ok" ? r : fallback;
}

// --- Match (Result<T>) ---

/**
 * Pattern match on Result&lt;T&gt;: onSuccess(value) when ok, onError(e) when err.
 *
 * @param r - The result
 * @param onSuccess - Handler with value when ok
 * @param onError - Handler when err
 * @returns The result of the handler that ran
 */
export function match<T, TResult>(
  r: Result<T>,
  onSuccess: (value: T) => TResult,
  onError: (e: IError) => TResult
): TResult {
  return r._tag === "ok" ? onSuccess(r.value) : onError(r.error);
}

/**
 * Pattern match on Result&lt;T&gt; (void return).
 *
 * @param r - The result
 * @param onSuccess - Handler with value when ok
 * @param onError - Handler when err
 */
export function matchVoidResult<T>(
  r: Result<T>,
  onSuccess: (value: T) => void,
  onError: (e: IError) => void
): void {
  if (r._tag === "ok") onSuccess(r.value);
  else onError(r.error);
}

// --- Match (Result<T, E>) ---

/**
 * Pattern match on ResultTyped&lt;T, E&gt;: onSuccess(value) when ok, onError(e) when err.
 *
 * @param r - The typed result
 * @param onSuccess - Handler with value when ok
 * @param onError - Handler with typed error when err
 * @returns The result of the handler that ran
 */
export function matchTyped<T, E extends IError, TResult>(
  r: ResultTyped<T, E>,
  onSuccess: (value: T) => TResult,
  onError: (e: E) => TResult
): TResult {
  return r._tag === "ok" ? onSuccess(r.value) : onError(r.error);
}

// --- Tap / TapError (Result<T>) ---

/**
 * Runs action with value when ok; returns the same result.
 *
 * @param r - The result
 * @param action - Side effect with value when ok
 * @returns The same result
 */
export function tap<T>(r: Result<T>, action: (value: T) => void): Result<T> {
  if (r._tag === "ok") action(r.value);
  return r;
}

/**
 * Runs action with error when err; returns the same result.
 *
 * @param r - The result
 * @param action - Side effect when err
 * @returns The same result
 */
export function tapError<T>(
  r: Result<T>,
  action: (e: IError) => void
): Result<T> {
  if (r._tag === "err") action(r.error);
  return r;
}

// --- Tap / TapError (Result<T, E>) ---

/**
 * Runs action with value when ok (ResultTyped); returns the same result.
 *
 * @param r - The typed result
 * @param action - Side effect with value when ok
 * @returns The same result
 */
export function tapTyped<T, E extends IError>(
  r: ResultTyped<T, E>,
  action: (value: T) => void
): ResultTyped<T, E> {
  if (r._tag === "ok") action(r.value);
  return r;
}

/**
 * Runs action with error when err (ResultTyped); returns the same result.
 *
 * @param r - The typed result
 * @param action - Side effect when err
 * @returns The same result
 */
export function tapErrorTyped<T, E extends IError>(
  r: ResultTyped<T, E>,
  action: (e: E) => void
): ResultTyped<T, E> {
  if (r._tag === "err") action(r.error);
  return r;
}

// --- Recover (Result<T>) ---

/**
 * When err, replace with Ok(fallback(error)); when ok return r.
 *
 * @param r - The result
 * @param fallback - Function from error to value
 * @returns r or Ok(fallback(error))
 */
export function recover<T>(
  r: Result<T>,
  fallback: (e: IError) => T
): Result<T> {
  if (r._tag === "ok") return r;
  return successOf(fallback(r.error));
}

/**
 * When err, return Ok(fallbackValue); when ok return r.
 *
 * @param r - The result
 * @param fallbackValue - Value to use when err
 * @returns r or Ok(fallbackValue)
 */
export function recoverWith<T>(r: Result<T>, fallbackValue: T): Result<T> {
  return r._tag === "ok" ? r : successOf(fallbackValue);
}

/**
 * When err, return fallback result; when ok return r.
 *
 * @param r - The result
 * @param fallback - Result to return when err
 * @returns r or fallback
 */
export function recoverWithResult<T>(
  r: Result<T>,
  fallback: Result<T>
): Result<T> {
  return r._tag === "ok" ? r : fallback;
}

// --- Recover (Result<T, E>) ---

/**
 * When err, replace with Ok(fallback(error)) (ResultTyped); when ok return r.
 *
 * @param r - The typed result
 * @param fallback - Function from E to T
 * @returns r or Ok(fallback(error))
 */
export function recoverTyped<T, E extends IError>(
  r: ResultTyped<T, E>,
  fallback: (e: E) => T
): ResultTyped<T, E> {
  if (r._tag === "ok") return r;
  return successTyped<T, E>(fallback(r.error));
}

/**
 * When err, return Ok(fallbackValue) (ResultTyped); when ok return r.
 *
 * @param r - The typed result
 * @param fallbackValue - Value when err
 * @returns r or Ok(fallbackValue)
 */
export function recoverWithTyped<T, E extends IError>(
  r: ResultTyped<T, E>,
  fallbackValue: T
): ResultTyped<T, E> {
  return r._tag === "ok" ? r : successTyped<T, E>(fallbackValue);
}

/**
 * When err, return fallback (ResultTyped); when ok return r.
 *
 * @param r - The typed result
 * @param fallback - Result when err
 * @returns r or fallback
 */
export function recoverWithResultTyped<T, E extends IError>(
  r: ResultTyped<T, E>,
  fallback: ResultTyped<T, E>
): ResultTyped<T, E> {
  return r._tag === "ok" ? r : fallback;
}

// --- Ensure ---

/**
 * When ok, return r if predicate(value) is true; else Err(errorFactory(value)).
 *
 * @param r - The result
 * @param predicate - Condition on value
 * @param errorFactory - Produces error when predicate fails
 * @returns r or Err(errorFactory(value))
 */
export function ensure<T>(
  r: Result<T>,
  predicate: (value: T) => boolean,
  errorFactory: (value: T) => IError
): Result<T> {
  if (r._tag === "err") return r;
  return predicate(r.value) ? r : errorOf<T>(errorFactory(r.value));
}

/**
 * When ok, return r if predicate(value) is true; else Err(simpleError(errorMessage)).
 *
 * @param r - The result
 * @param predicate - Condition on value
 * @param errorMessage - Message when predicate fails
 * @returns r or Err(simpleError(errorMessage))
 */
export function ensureMessage<T>(
  r: Result<T>,
  predicate: (value: T) => boolean,
  errorMessage: string
): Result<T> {
  return ensure(r, predicate, () => simpleError(errorMessage));
}

// --- GetValueOrDefault ---

/**
 * Returns the value when ok; otherwise undefined.
 *
 * @param r - The result
 * @returns value or undefined
 */
export function getValueOrDefault<T>(r: Result<T>): T | undefined {
  return r._tag === "ok" ? r.value : undefined;
}

// --- MapError (Result<T> IError -> IError) ---

/**
 * Maps the error when err; when ok returns r.
 *
 * @param r - The result
 * @param errorMapping - Function from IError to IError
 * @returns r or Err(errorMapping(error))
 */
export function mapErrorResult<T>(
  r: Result<T>,
  errorMapping: (e: IError) => IError
): Result<T> {
  if (r._tag === "ok") return r;
  return errorOf<T>(errorMapping(r.error));
}

// --- Collect / Sequence ---

/**
 * Collects an iterable of results into one. First error wins (same as sequence).
 *
 * @param results - Iterable of Result&lt;T&gt;
 * @returns Ok([...values]) if all ok, else Err(first error)
 */
export function collect<T>(results: Iterable<Result<T>>): Result<readonly T[]> {
  const arr: T[] = [];
  for (const r of results) {
    if (r._tag === "ok") arr.push(r.value);
    else return errorOf<readonly T[]>(r.error);
  }
  return successOf(arr);
}

/**
 * Alias for collect: first error wins.
 *
 * @param results - Iterable of Result&lt;T&gt;
 * @returns Ok([...values]) if all ok, else Err(first error)
 */
export function sequence<T>(
  results: Iterable<Result<T>>
): Result<readonly T[]> {
  return collect(results);
}

/**
 * Yields only the values from ok results in the iterable.
 *
 * @param results - Iterable of Result&lt;T&gt;
 * @yields T for each ok result
 */
export function* chooseSuccessful<T>(
  results: Iterable<Result<T>>
): Generator<T> {
  for (const r of results) {
    if (r._tag === "ok") yield r.value;
  }
}
