# Contributing

## Versioning

Semantic Versioning — update `CHANGELOG.md` for every release.

**Woodpecker (Brokkr → dvalin):** bump `"version"` in `package.json` only, merge to `main` on `https://brokkr.robotico.dev/robotico/robotico-result-typescript`. CI on `https://dvalin.robotico.dev` creates tag `v{version}` and copies the pack tarball to Verdaccio metal (`/var/lib/robotico/robotico-registry/npm/`), served at `https://download.robotico.dev/npm/`. Do not push release tags manually.

**dvalin secret:** `gitea_token` (Brokkr push for tags). Register the repo on dvalin once via `scripts/activate-woodpecker-dvalin.sh`.

## Local verify

`npm run verify` (lint, format, build, coverage, docs as configured in `package.json`).
