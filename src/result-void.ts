/**
 * Void Result type — success (no data) or error.
 * Aligned with Robotico.Result (C#) and dev.robotico.result (Kotlin).
 */

import type { IError } from "./errors.js";
import { createValidationError } from "./errors.js";

/** Result with no value: either ok (success) or err (error). */
export type ResultVoid =
  | { readonly _tag: "ok" }
  | { readonly _tag: "err"; readonly error: IError };

export function freezeVoidOk(): ResultVoid {
  return Object.freeze({ _tag: "ok" as const });
}

export function freezeVoidErr(error: IError): ResultVoid {
  return Object.freeze({ _tag: "err" as const, error });
}

/** Creates a successful void result (no value). */
export function success(): ResultVoid {
  return freezeVoidOk();
}

/**
 * Creates an error void result.
 *
 * @param err - The error (must not be null)
 * @returns Err(err)
 * @throws Error when err is null
 */
export function error(err: IError): ResultVoid {
  if (err == null) throw new Error("error must not be null");
  return freezeVoidErr(err);
}

/**
 * Creates a validation error result (void).
 *
 * @param errors - Map of field name to list of error messages
 * @param message - Optional overall message
 * @param code - Optional code (default "VAL_FAILED")
 * @returns Err(ValidationError)
 * @throws Error when errors is empty (see createValidationError)
 */
export function validationErrorVoid(
  errors: Readonly<Record<string, readonly string[]>>,
  message?: string | null,
  code?: string
): ResultVoid {
  return freezeVoidErr(
    createValidationError(errors, message, code ?? "VAL_FAILED")
  );
}

/** Type guard: true if result is ok. */
export function isSuccess(r: ResultVoid): boolean {
  return r._tag === "ok";
}

/** Type guard: true if result is err. */
export function isError(r: ResultVoid): r is { _tag: "err"; error: IError } {
  return r._tag === "err";
}
