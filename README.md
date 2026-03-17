# @robotico-dev/result

**Result** type for success/error handling in TypeScript: `Ok(value)` | `Err(error)`. Supports void results, typed errors, and async. Aligned with Robotico.Result (C#) and dev.robotico.result (Kotlin).

## Install

```bash
npm install @robotico-dev/result
```

**Requirements:** Node.js >= 18.

## Quick start

```ts
import {
  successOf,
  errorOf,
  map,
  bind,
  match,
  getValue,
  expectSuccess,
  tryResult,
  combine,
  createSimpleError,
} from "@robotico-dev/result";

const r = successOf(42);
map(r, (x) => x + 1);           // Ok(43)
bind(r, (x) => successOf(x * 2));
match(r, (v) => v, (e) => e.message);
getValue(r);                     // 42 | undefined

// At process/API boundaries only: throw if error
const value = expectSuccess(r);  // throws with error message if Err

// Wrap exceptions
const r2 = tryResult(() => JSON.parse(input));
const r3 = await tryAsync(() => fetchSomething());

// Combine multiple results (first error wins)
combine([r, r2]);               // Result<readonly [T1, T2]>
```

## When to use what

- **Inside domain/app:** Prefer `match`, `map`, `bind`, `getValue` — keep Results until the boundary.
- **At boundaries (HTTP, CLI):** Use `expectSuccess` / `expectSuccessVoid` to turn failure into a thrown error, or `match` to format responses.

## Error types

```ts
import {
  simpleError,
  createValidationError,
  validationErrorForField,
  createExceptionError,
  aggregateError,
} from "@robotico-dev/result";

simpleError("Something went wrong");
createValidationError({ email: ["invalid"], name: ["required"] });
validationErrorForField("email", "invalid");
createExceptionError(caughtException);
aggregateError([err1, err2]);
```

## Void and typed results

- **ResultVoid** — success with no value: `success()`, `error(err)`, `mapVoid`, `bindVoid`.
- **Result&lt;T&gt;** — success value or `IError`.
- **ResultTyped&lt;T, E&gt;** — success value or custom error type `E extends IError`: `successTyped`, `errorTyped`, `mapTyped`, `bindTyped`, `mapErrorTyped`.

## Try and combine

- **tryResult(fn)** / **tryAsync(fn)** — catch exceptions and return `Result<T>`.
- **tryVoid** / **tryVoidAsync** — same for void actions.
- **combine(results)** — collect iterable of results into `Result<readonly T[]>` (first error wins).
- **combine2(r1, r2)** … **combine4** — tuple results; all errors aggregated on failure.

## Quality and coverage

- **Principal quality bar (10/10):** Strict TypeScript, type-aware ESLint, full JSDoc, law-based tests (functor and monad laws for Result), and coverage thresholds: **≥90%** for branches, statements, functions, and lines. CI fails if thresholds are not met. See [CHANGELOG.md](./CHANGELOG.md). Versioning: [Semantic Versioning](https://semver.org/).

## API docs

Run `npm run docs` to generate API documentation in `docs/` (requires [TypeDoc](https://typedoc.org/)).

## License

MIT. See [repository](https://github.com/robotico-dev/robotico-result-typescript) for more.
