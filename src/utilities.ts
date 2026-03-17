/**
 * Utilities: Combine (multiple results into one), Try (exception to Result).
 */

import type { IError } from "./errors.js";
import { createExceptionError } from "./errors.js";
import { aggregateError } from "./errors.js";
import type { Result, ResultVoid } from "./result.js";
import { success, errorOf, successOf } from "./result.js";
import { freezeVoidErr } from "./result-void.js";
import { collect } from "./extensions.js";

function toAggregate(errors: IError[]): IError {
  if (errors.length === 1) return errors[0]!;
  return aggregateError(errors);
}

function collectErrorsFromResults(results: Result<unknown>[]): IError[] {
  const list: IError[] = [];
  for (const r of results) {
    if (r._tag === "err") list.push(r.error);
  }
  return list;
}

/**
 * Combines an iterable of results into a single result of array.
 * **First error wins:** returns the first Err encountered; does not aggregate.
 * Same as collect/sequence. For tuple results with **aggregated errors**, use combine2/3/4.
 *
 * @param results - Iterable of Result&lt;T&gt;
 * @returns Ok([...values]) if all ok; Err(first error) if any failed
 */
export function combine<T>(results: Iterable<Result<T>>): Result<readonly T[]> {
  return collect(results);
}

/**
 * Internal: combines an array of results into one; aggregates errors on failure.
 * Used by combine2/3/4 to avoid duplicated logic.
 */
function combineResults(
  results: Result<unknown>[]
): Result<readonly unknown[]> {
  const errors = collectErrorsFromResults(results);
  if (errors.length > 0) return errorOf(toAggregate(errors));
  const values: unknown[] = [];
  for (const r of results) {
    if (r._tag === "ok") values.push(r.value);
  }
  return successOf(values);
}

/**
 * Combines two results into a single result containing a tuple.
 * **Aggregates all errors:** if both are Err, returns Err(aggregate(r1.error, r2.error)).
 * Unlike combine/collect, which use first error only.
 *
 * @param r1 - First result
 * @param r2 - Second result
 * @returns Ok([v1, v2]) or Err(aggregated errors)
 */
export function combine2<T1, T2>(
  r1: Result<T1>,
  r2: Result<T2>
): Result<readonly [T1, T2]> {
  return combineResults([r1, r2]) as Result<readonly [T1, T2]>;
}

/**
 * Combines three results into a single result containing a tuple.
 * **Aggregates all errors** on failure (unlike combine/collect: first error only).
 *
 * @param r1 - First result
 * @param r2 - Second result
 * @param r3 - Third result
 * @returns Ok([v1, v2, v3]) or Err(aggregated errors)
 */
export function combine3<T1, T2, T3>(
  r1: Result<T1>,
  r2: Result<T2>,
  r3: Result<T3>
): Result<readonly [T1, T2, T3]> {
  return combineResults([r1, r2, r3]) as Result<readonly [T1, T2, T3]>;
}

/**
 * Combines four results into a single result containing a tuple.
 * **Aggregates all errors** on failure (unlike combine/collect: first error only).
 *
 * @param r1 - First result
 * @param r2 - Second result
 * @param r3 - Third result
 * @param r4 - Fourth result
 * @returns Ok([v1, v2, v3, v4]) or Err(aggregated errors)
 */
export function combine4<T1, T2, T3, T4>(
  r1: Result<T1>,
  r2: Result<T2>,
  r3: Result<T3>,
  r4: Result<T4>
): Result<readonly [T1, T2, T3, T4]> {
  return combineResults([r1, r2, r3, r4]) as Result<readonly [T1, T2, T3, T4]>;
}

/**
 * Executes a synchronous function and converts any thrown exception into a Result.
 * Exceptions are wrapped via createExceptionError unless errorFactory is provided.
 *
 * @param func - Synchronous function that may throw
 * @param errorFactory - Optional function to convert thrown value to IError
 * @returns Ok(func()) or Err(error)
 */
export function tryResult<T>(
  func: () => T,
  errorFactory?: (ex: unknown) => IError
): Result<T> {
  try {
    return successOf(func());
  } catch (ex) {
    const err = errorFactory ? errorFactory(ex) : createExceptionError(ex);
    return errorOf<T>(err);
  }
}

/**
 * Executes an async function and converts any thrown exception/rejection into a Result.
 * Exceptions are wrapped via createExceptionError unless errorFactory is provided.
 *
 * @param func - Async function that may throw or reject
 * @param errorFactory - Optional function to convert thrown value to IError
 * @returns Promise of Ok(value) or Err(error)
 */
export async function tryAsync<T>(
  func: () => Promise<T>,
  errorFactory?: (ex: unknown) => IError
): Promise<Result<T>> {
  try {
    return successOf(await func());
  } catch (ex) {
    const err = errorFactory ? errorFactory(ex) : createExceptionError(ex);
    return errorOf<T>(err);
  }
}

/**
 * Executes a void action and converts any thrown exception into a void Result.
 * Use at boundaries (e.g. before returning) to avoid uncaught exceptions.
 *
 * @param action - Void function that may throw
 * @param errorFactory - Optional function to convert thrown value to IError
 * @returns Ok (void) or Err(error)
 */
export function tryVoid(
  action: () => void,
  errorFactory?: (ex: unknown) => IError
): ResultVoid {
  try {
    action();
    return success();
  } catch (ex) {
    const err = errorFactory ? errorFactory(ex) : createExceptionError(ex);
    return freezeVoidErr(err);
  }
}

/**
 * Executes an async void action and converts any thrown exception/rejection into a void Result.
 *
 * @param action - Async void function that may throw or reject
 * @param errorFactory - Optional function to convert thrown value to IError
 * @returns Promise of Ok (void) or Err(error)
 */
export async function tryVoidAsync(
  action: () => Promise<void>,
  errorFactory?: (ex: unknown) => IError
): Promise<ResultVoid> {
  try {
    await action();
    return success();
  } catch (ex) {
    const err = errorFactory ? errorFactory(ex) : createExceptionError(ex);
    return freezeVoidErr(err);
  }
}
