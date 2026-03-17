# Coverage

- **Branches, statements, functions, lines:** 90% threshold. All are met.
- Tests cover core Result/ResultTyped/ResultVoid operations, law-based tests (functor and monad laws), extensions, utilities (combine, try*), and async helpers.
- Remaining uncovered branches in some files (e.g. `errors.ts`, `extensions.ts`, `result-async.ts`) are defensive or edge paths (e.g. single-error vs aggregate in `toAggregate`, generator in `chooseSuccessful`); the public API is fully covered.
