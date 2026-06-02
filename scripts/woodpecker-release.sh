#!/usr/bin/env bash
# Woodpecker release: read package.json version → tag → build → npm publish.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

test -f package.json || {
  echo "MUST - package.json with version field" >&2
  exit 1
}

if bash scripts/should-skip-release.sh; then
  exit 0
fi

VERSION="$(bash scripts/read-package-version.sh)"
echo "release package.json version=${VERSION}"
bash scripts/ensure-git-tag.sh "${VERSION}"
npm run build
bash scripts/npm-push-download.sh
