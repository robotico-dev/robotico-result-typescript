# Contributing

## Versioning

This package follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (semver). Update `CHANGELOG.md` for every release.

**Woodpecker (Brokkr / dvalin):** bump `"version"` in `package.json` only, merge to `main`. CI on `https://dvalin.robotico.dev` creates tag `v{version}` and publishes to `https://download.robotico.dev/npm/`. Do not create release tags manually. See repo `scripts/` and `bluelake-architecture/06-deployment/woodpecker-dvalin/pilot-robotico-npm-typescript.adoc`.

## Quality bar

- **Lint:** `npm run lint` (ESLint with type-aware rules, zero warnings).
- **Format:** `npm run format:check` (Prettier).
- **Tests:** `npm run test` (Vitest); include unit tests and functor/monad law tests for `Result<T>` and `ResultTyped<T, E>`.
- **Coverage:** `npm run test:coverage` must meet configured thresholds (e.g. 90% branches/functions/lines/statements).
- **Build:** `npm run build` must succeed with strict TypeScript (`strict`, `noUncheckedIndexedAccess`).

## Combine vs combine2/3/4

- **combine** / **collect** / **sequence:** first error wins; no aggregation.
- **combine2**, **combine3**, **combine4:** tuple results; **all errors are aggregated** on failure. Use when you need to collect every error, not just the first.
