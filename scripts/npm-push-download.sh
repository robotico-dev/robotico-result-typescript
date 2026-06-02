#!/usr/bin/env bash
# Publish to Brokkr npm (Gitea Packages). Never overwrites an existing version.
set -euo pipefail

REGISTRY="${NPM_PUSH_REGISTRY:-https://brokkr.robotico.dev/api/packages/robotico/npm/}"
TOKEN="${PUBLISH_TOKEN:?Set PUBLISH_TOKEN (Woodpecker secret publish_token)}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

NAME="$(node -p "require('./package.json').name")"
VERSION="$(bash scripts/read-package-version.sh)"

if [[ ! -f package.json ]]; then
  echo "error: package.json not found" >&2
  exit 1
fi

npm config set "${REGISTRY}:_authToken" "${TOKEN}"

set +e
out="$(npm publish --registry "${REGISTRY}" --access public 2>&1)"
code=$?
set -e
printf '%s\n' "$out"

if [[ "$code" -eq 0 ]]; then
  echo "[OK] ${NAME}@${VERSION} — published to ${REGISTRY}"
  exit 0
fi

if echo "$out" | grep -qiE 'cannot publish over|already exists|409|conflict|previously published|version.*exists|EPUBLISHCONFLICT'; then
  echo "[WARN] ${NAME}@${VERSION} — version already on registry (not overwritten)"
  exit 0
fi

echo "[ERROR] npm publish failed for ${NAME}@${VERSION}" >&2
exit 1
