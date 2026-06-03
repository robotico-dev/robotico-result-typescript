#!/usr/bin/env bash
# Publish to download.robotico.dev npm (Verdaccio → bare metal under /var/lib/robotico/robotico-registry/npm).
# ADR: authoritative storage is on pest, not Brokkr Gitea Packages.
#
# Woodpecker secrets:
#   publish_token — Verdaccio htpasswd password for VERDACCIO_USER (see mishima-downloads phase-2 runbook)
#   VERDACCIO_USER — optional env (default: ci)
#
# Optional: NPM_PUSH_REGISTRY (default https://download.robotico.dev/npm/)
# Lab loopback: NPM_PUSH_REGISTRY=http://127.0.0.1:4873/npm/
set -euo pipefail

REGISTRY="${NPM_PUSH_REGISTRY:-https://download.robotico.dev/npm/}"
VERDACCIO_USER="${VERDACCIO_USER:-ci}"
TOKEN="${PUBLISH_TOKEN:?Set PUBLISH_TOKEN (Verdaccio htpasswd password for ${VERDACCIO_USER})}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

# Consumer .npmrc in repo must not override publish registry/auth.
if [[ -f .npmrc ]]; then
  mv .npmrc .npmrc.ci-bak
  restore_npmrc() { [[ -f .npmrc.ci-bak ]] && mv .npmrc.ci-bak .npmrc; }
  trap restore_npmrc EXIT
fi

NAME="$(node -p "require('./package.json').name")"
VERSION="$(bash scripts/read-package-version.sh)"

if [[ ! -f package.json ]]; then
  echo "error: package.json not found" >&2
  exit 1
fi

TMP_NPMRC="$(mktemp)"
trap 'rm -f "$TMP_NPMRC"' EXIT
AUTH_B64="$(printf '%s:%s' "${VERDACCIO_USER}" "${TOKEN}" | base64 | tr -d '\n')"
REGISTRY_KEY="${REGISTRY#https://}"
REGISTRY_KEY="${REGISTRY_KEY#http://}"
REGISTRY_KEY="${REGISTRY_KEY%/}"
{
  echo "registry=${REGISTRY}"
  echo "//${REGISTRY_KEY}/:_auth=${AUTH_B64}"
  echo "//${REGISTRY_KEY}/:always-auth=true"
  echo "email=woodpecker@dvalin.robotico.dev"
} >"${TMP_NPMRC}"

export NPM_CONFIG_USERCONFIG="${TMP_NPMRC}"

echo ">>> npm whoami (${REGISTRY})"
npm whoami --registry "${REGISTRY}"

set +e
out="$(npm publish --registry "${REGISTRY}" --access public 2>&1)"
code=$?
set -e
printf '%s\n' "$out"

if [[ "$code" -eq 0 ]]; then
  echo "[OK] ${NAME}@${VERSION} — published to ${REGISTRY} (Verdaccio storage on download.robotico.dev)"
  exit 0
fi

if echo "$out" | grep -qiE 'cannot publish over|already exists|409|conflict|previously published|version.*exists|EPUBLISHCONFLICT'; then
  echo "[WARN] ${NAME}@${VERSION} — version already on registry (not overwritten)"
  exit 0
fi

echo "[ERROR] npm publish failed for ${NAME}@${VERSION}" >&2
exit 1
