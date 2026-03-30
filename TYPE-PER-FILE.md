# Law: one type per file

In `src/` (excluding `index.ts` and `*.test.ts`), each file declares **at most one** top-level type (class, interface, type alias, enum). Function-only files are allowed.

Enforced by ESLint rule `robotico/one-top-level-type` (see `eslint.config.js`).
