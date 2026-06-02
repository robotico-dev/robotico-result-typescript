#!/usr/bin/env bash
# Emit version from package.json (single source of truth for npm releases).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "${ROOT}/package.json" ]]; then
  echo "error: missing ${ROOT}/package.json" >&2
  exit 1
fi

VERSION="$(node -p "require('${ROOT}/package.json').version" | tr -d '\r')"

if [[ -z "${VERSION}" ]]; then
  echo "error: version is empty — set \"version\" in package.json" >&2
  exit 1
fi

if [[ "${VERSION}" =~ ^v ]]; then
  echo "error: version must not include a 'v' prefix (use 1.0.0 not v1.0.0)" >&2
  exit 1
fi

if ! [[ "${VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]]; then
  echo "error: version '${VERSION}' is not a valid semver-like release id" >&2
  exit 1
fi

printf '%s' "${VERSION}"
