# Result invariants

1. **Tagged union** — A value is exactly one of `Ok` or `Err`; `isSuccess` / `isError` are mutually exclusive.
2. **No accidental throws** — Combinators (`map`, `flatMap`, `match`, etc.) propagate `Err` without throwing for normal control flow.
3. **Stable error model** — `IError` carries code, message, and optional metadata; `SimpleError` and `ExceptionError` are the usual concrete shapes.
4. **Void success** — `ResultVoid` uses `success()` / `error(...)` with the same tagging rules as `Result<T>`.
