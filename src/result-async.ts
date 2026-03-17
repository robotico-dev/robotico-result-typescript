/**
 * Async helpers: mapAsync, bindAsync, mapErrorAsync for Result types.
 */

import type { IError } from "./errors.js";
import type { Result, ResultTyped, ResultVoid } from "./result.js";

/**
 * Async map for void Result: when ok, run async mapping and return Ok(mapped).
 *
 * @param r - The void result
 * @param mapping - Async function that produces the value when ok
 * @returns Promise of Ok(mapped value) or Err(error)
 */
export async function mapVoidAsync<TMapped>(
  r: ResultVoid,
  mapping: () => Promise<TMapped>
): Promise<Result<TMapped>> {
  if (r._tag === "ok")
    return Object.freeze({ _tag: "ok" as const, value: await mapping() });
  return Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Async bind for void Result: when ok, run async binding and return its result.
 *
 * @param r - The void result
 * @param binding - Async function that returns Result<TMapped> when ok
 * @returns Promise of the binding result or Err(error)
 */
export async function bindVoidAsync<TMapped>(
  r: ResultVoid,
  binding: () => Promise<Result<TMapped>>
): Promise<Result<TMapped>> {
  if (r._tag === "ok") return await binding();
  return Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Async map for Result&lt;T&gt;: when ok, run async mapping on value.
 *
 * @param r - The result
 * @param mapping - Async function from T to TMapped
 * @returns Promise of Ok(mapped value) or Err(error)
 */
export async function mapAsync<T, TMapped>(
  r: Result<T>,
  mapping: (value: T) => Promise<TMapped>
): Promise<Result<TMapped>> {
  if (r._tag === "ok")
    return Object.freeze({
      _tag: "ok" as const,
      value: await mapping(r.value),
    });
  return Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Async bind for Result&lt;T&gt;: when ok, run async binding on value.
 *
 * @param r - The result
 * @param binding - Async function from T to Result&lt;TMapped&gt;
 * @returns Promise of the binding result or Err(error)
 */
export async function bindAsync<T, TMapped>(
  r: Result<T>,
  binding: (value: T) => Promise<Result<TMapped>>
): Promise<Result<TMapped>> {
  if (r._tag === "ok") return await binding(r.value);
  return Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Async mapError for Result&lt;T&gt;: when err, run async error mapping.
 *
 * @param r - The result
 * @param errorMapping - Async function from IError to TMappedErr
 * @returns Promise of Ok(value) or Err(mapped error)
 */
export async function mapErrorAsync<T, TMappedErr extends IError>(
  r: Result<T>,
  errorMapping: (e: IError) => Promise<TMappedErr>
): Promise<ResultTyped<T, TMappedErr>> {
  if (r._tag === "ok")
    return Object.freeze({ _tag: "ok" as const, value: r.value });
  return Object.freeze({
    _tag: "err" as const,
    error: await errorMapping(r.error),
  });
}

/**
 * Async map for ResultTyped&lt;T, E&gt;: when ok, run async mapping on value.
 *
 * @param r - The typed result
 * @param mapping - Async function from T to TMapped
 * @returns Promise of Ok(mapped value) or Err(error)
 */
export async function mapTypedAsync<T, E extends IError, TMapped>(
  r: ResultTyped<T, E>,
  mapping: (value: T) => Promise<TMapped>
): Promise<ResultTyped<TMapped, E>> {
  if (r._tag === "ok")
    return Object.freeze({
      _tag: "ok" as const,
      value: await mapping(r.value),
    });
  return Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Async bind for ResultTyped&lt;T, E&gt;: when ok, run async binding on value.
 *
 * @param r - The typed result
 * @param binding - Async function from T to ResultTyped&lt;TMapped, E&gt;
 * @returns Promise of the binding result or Err(error)
 */
export async function bindTypedAsync<T, E extends IError, TMapped>(
  r: ResultTyped<T, E>,
  binding: (value: T) => Promise<ResultTyped<TMapped, E>>
): Promise<ResultTyped<TMapped, E>> {
  if (r._tag === "ok") return await binding(r.value);
  return Object.freeze({ _tag: "err" as const, error: r.error });
}

/**
 * Async mapError for ResultTyped&lt;T, E&gt;: when err, run async error mapping.
 *
 * @param r - The typed result
 * @param errorMapping - Async function from E to EMapped
 * @returns Promise of Ok(value) or Err(mapped error)
 */
export async function mapErrorTypedAsync<
  T,
  E extends IError,
  EMapped extends IError,
>(
  r: ResultTyped<T, E>,
  errorMapping: (e: E) => Promise<EMapped>
): Promise<ResultTyped<T, EMapped>> {
  if (r._tag === "ok")
    return Object.freeze({ _tag: "ok" as const, value: r.value });
  return Object.freeze({
    _tag: "err" as const,
    error: await errorMapping(r.error),
  });
}
