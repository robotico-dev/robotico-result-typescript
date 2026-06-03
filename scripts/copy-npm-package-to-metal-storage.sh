#!/usr/bin/env bash
# Copy packed npm tarball + Verdaccio metadata to bare metal (no npm publish / no HTTP).
#
#   PKG_DIR=path/to/package bash mishima-suite/mishima-downloads/scripts/copy-npm-package-to-metal-storage.sh
#
# Env:
#   ROBOTICO_REGISTRY_NPM_HOST  default /var/lib/robotico/robotico-registry/npm
#   ROBOTICO_NPM_PUBLIC_URL     tarball URLs in manifest (default https://download.robotico.dev/npm/)
#   VERDACCIO_UID / VERDACCIO_GID  default 10001 (Verdaccio container user)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_DIR="${PKG_DIR:-${1:-}}"
if [[ -z "$PKG_DIR" ]]; then
  PKG_DIR="$(pwd)"
fi
PKG_DIR="$(cd "$PKG_DIR" && pwd)"
export PKG_DIR

METAL="${ROBOTICO_REGISTRY_NPM_HOST:-/var/lib/robotico/robotico-registry/npm}"
VERDACCIO_UID="${VERDACCIO_UID:-10001}"
VERDACCIO_GID="${VERDACCIO_GID:-10001}"

if [[ ! -d "$METAL" ]]; then
  echo "error: metal npm storage not found: $METAL (create with bootstrap-edge-registry-dirs.sh)" >&2
  exit 1
fi

if [[ ! -w "$METAL" ]]; then
  echo "error: not writable: $METAL (mount volume or fix permissions)" >&2
  exit 1
fi

cd "$PKG_DIR"
node "${SCRIPT_DIR}/copy-npm-package-to-metal-storage.mjs"

# Verdaccio runs as UID 10001 in mishima-downloads compose
if command -v chown >/dev/null 2>&1; then
  NAME="$(node -p "require('./package.json').name")"
  if [[ "$NAME" == @*/* ]]; then
    SCOPE="${NAME%%/*}"
    PKG="${NAME#*/}"
    DEST="${METAL}/${SCOPE}/${PKG}"
  else
    DEST="${METAL}/${NAME}"
  fi
  if [[ -d "$DEST" ]]; then
    chown -R "${VERDACCIO_UID}:${VERDACCIO_GID}" "$DEST" 2>/dev/null || true
  fi
fi
