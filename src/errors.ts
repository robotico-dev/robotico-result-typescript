/**
 * Error types for @robotico/result — aligned with Robotico.Result.Errors.
 */

/** Error severity levels. */
export enum ErrorSeverity {
  Info = 0,
  Warning = 1,
  Error = 2,
  Critical = 3,
}

/**
 * Base interface for all errors reported using Result types.
 * Implement or use createSimpleError, createValidationError, etc.
 */
export interface IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
}

/** Simple implementation of IError with full control over all properties. */
export interface SimpleError extends IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
}

/**
 * Creates a simple error with full control over message, code, severity, innerError, and context.
 *
 * @param message - Human-readable message
 * @param code - Machine-readable code (default "ERROR")
 * @param severity - ErrorSeverity (default Error)
 * @param innerError - Optional cause
 * @param context - Optional key-value context (default {})
 * @returns A frozen SimpleError instance
 */
export function createSimpleError(
  message: string,
  code: string = "ERROR",
  severity: ErrorSeverity = ErrorSeverity.Error,
  innerError: IError | null = null,
  context: Readonly<Record<string, unknown>> = Object.freeze({})
): SimpleError {
  return Object.freeze({
    message,
    code,
    severity,
    innerError,
    context:
      context && Object.keys(context).length > 0
        ? Object.freeze({ ...context })
        : Object.freeze({}),
  });
}

/**
 * Creates a simple error with only a message (code "ERROR", severity Error).
 *
 * @param message - Human-readable message
 * @returns A frozen SimpleError instance
 */
export function simpleError(message: string): SimpleError {
  return createSimpleError(message, "ERROR", ErrorSeverity.Error);
}

/** Validation error with field-specific messages. */
export interface ValidationError extends IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly errors: Readonly<Record<string, readonly string[]>>;
}

/**
 * Creates a validation error with field-specific messages. Requires at least one field error.
 *
 * @param errors - Map of field name to list of error messages
 * @param message - Optional overall message (default derived from errors)
 * @param code - Optional code (default "VAL_FAILED")
 * @returns A frozen ValidationError instance
 * @throws Error when errors is empty
 */
export function createValidationError(
  errors: Readonly<Record<string, readonly string[]>>,
  message?: string | null,
  code?: string
): ValidationError {
  if (!errors || Object.keys(errors).length === 0) {
    throw new Error("At least one validation error is required");
  }
  const totalErrors = Object.values(errors).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const fieldCount = Object.keys(errors).length;
  const msg =
    message ??
    `Validation failed with ${totalErrors} error(s) across ${fieldCount} field(s)`;
  return Object.freeze({
    message: msg,
    code: code ?? "VAL_FAILED",
    severity: ErrorSeverity.Warning,
    innerError: null,
    context: Object.freeze({}),
    errors: Object.freeze(
      Object.fromEntries(
        Object.entries(errors).map(([k, v]) => [k, Object.freeze([...v])])
      )
    ),
  });
}

/**
 * Creates a validation error for a single field.
 *
 * @param fieldName - The field name
 * @param errorMessage - The error message for that field
 * @returns A frozen ValidationError with one field
 */
export function validationErrorForField(
  fieldName: string,
  errorMessage: string
): ValidationError {
  return createValidationError(
    { [fieldName]: [errorMessage] },
    `Validation failed for ${fieldName}: ${errorMessage}`,
    `VAL_${fieldName.toUpperCase()}`
  );
}

/** Error that wraps an exception (JS Error). */
export interface ExceptionError extends IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly exception: unknown;
}

/**
 * Wraps a thrown exception (Error or other) as ExceptionError.
 *
 * @param exception - The thrown value (Error or any)
 * @returns A frozen ExceptionError with message from exception
 */
export function createExceptionError(exception: unknown): ExceptionError {
  const err =
    exception instanceof Error ? exception : new Error(String(exception));
  return Object.freeze({
    message: err.message ?? "An exception occurred",
    code: "ERROR",
    severity: ErrorSeverity.Error,
    innerError: null,
    context: Object.freeze({}),
    exception,
  });
}

/** Base error with optional caused-by chain (for aggregation). */
export interface ErrorBase extends IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly causedBy: readonly IError[];
}

/**
 * Creates an error with an optional caused-by chain.
 *
 * @param message - Human-readable message
 * @param causedBy - Optional list of causing errors
 * @returns A frozen ErrorBase (innerError is first of causedBy)
 */
export function createError(
  message: string,
  causedBy?: readonly IError[] | null
): ErrorBase {
  const list = causedBy && causedBy.length > 0 ? [...causedBy] : [];
  const inner = list[0] ?? null;
  return Object.freeze({
    message,
    code: "ERROR",
    severity: ErrorSeverity.Error,
    innerError: inner,
    context: Object.freeze({}),
    causedBy: Object.freeze(list),
  });
}

/** Aggregate error combining multiple errors. */
export interface AggregateErrorType extends IError {
  readonly message: string;
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly innerError: IError | null;
  readonly context: Readonly<Record<string, unknown>>;
  readonly errors: readonly IError[];
}

/**
 * Creates an aggregate error combining multiple errors.
 *
 * @param message - Human-readable message
 * @param errors - List of errors to aggregate
 * @returns A frozen AggregateErrorType
 */
export function createAggregateError(
  message: string,
  errors: readonly IError[]
): AggregateErrorType {
  const list = [...errors];
  return Object.freeze({
    message,
    code: "AGG_ERRORS",
    severity: ErrorSeverity.Error,
    innerError: list[0] ?? null,
    context: Object.freeze({}),
    errors: Object.freeze(list),
  });
}

/**
 * Creates an aggregate error with an auto-generated message.
 *
 * @param errors - List of errors to aggregate
 * @returns A frozen AggregateErrorType with message "Multiple errors occurred (n total)"
 */
export function aggregateError(errors: readonly IError[]): AggregateErrorType {
  return createAggregateError(
    `Multiple errors occurred (${errors.length} total)`,
    errors
  );
}
