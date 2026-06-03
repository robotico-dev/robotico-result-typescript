# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] - 2026-06-03

### Fixed

- npm 10 publish auth: use `//download.robotico.dev/npm/:_auth` (not legacy global `_auth`).

## [1.0.6] - 2026-06-03

### Fixed

- Woodpecker publish targets `download.robotico.dev/npm/` (Verdaccio → metal storage), not Brokkr; uses htpasswd `_auth` like `mishima-downloads` scripts.

## [1.0.5] - 2026-06-03

### Fixed

- Woodpecker publish: do not commit `.npmrc` in package repo (scoped registry redirected publish to Verdaccio without CI token).

## [1.0.4] - 2026-06-03

### Changed

- Woodpecker publish: use Brokkr Gitea Packages npm (`publish_token`); consumer installs via `download.robotico.dev/npm` (`.npmrc`).

## [1.0.3] - 2026-06-03

### Changed

- Woodpecker CI and release wiring on dvalin (tag + npm); superseded by 1.0.4 publish fix.

## [1.0.2] - 2026-04-10

### Added

- **`createSimpleErrorFromUnknownBrowserReason`** — maps `unknown` catches (including `DOMException` and `Error`) to a single outer `IError` with a caller-supplied `code` and default message; used by Robotico IndexedDB / localStorage adapters for consistent `innerError` and `context`.

### Changed

- **`tsconfig`**: `lib` includes **`DOM`** so `DOMException` is typed for the new helper.

## [1.0.1] - 2026-03-29

### Changed

- Error types and factories split into one module per exported type; `errors` entry re-exports unchanged for consumers.

### Added

- `verify` script (lint, build, coverage, docs).

## [0.1.0] - Initial release

### Added

- **ResultVoid**, **Result&lt;T&gt;** — Success/error types with `success`, `error`, `map`, `bind`, `match`, `tap`, `recover`, `ensure`, `collect`, `sequence`.
- **ResultTyped&lt;T, E&gt;** — Typed error with `successTyped`, `errorTyped`, `mapTyped`, `bindTyped`, `mapErrorTyped`.
- **IError**, **SimpleError**, **ValidationError**, **ExceptionError**, **AggregateErrorType** — Error types and factories (`createSimpleError`, `createValidationError`, `createExceptionError`, `aggregateError`, etc.).
- **tryResult**, **tryAsync**, **tryVoid**, **tryVoidAsync** — Exception-to-Result utilities.
- **combine**, **combine2**, **combine3**, **combine4** — Combine multiple results (first error or aggregated).
- Async helpers: `mapVoidAsync`, `bindVoidAsync`, `mapAsync`, `bindAsync`, etc.
- Law-based tests (functor and monad laws for Result); 90% coverage thresholds.

[Unreleased]: https://github.com/robotico-dev/robotico-result-typescript/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/robotico-dev/robotico-result-typescript/releases/tag/v0.1.0
