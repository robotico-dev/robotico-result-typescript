#!/usr/bin/env bash
# Copy pack tarball to /var/lib/robotico/robotico-registry/npm (no HTTP publish).
# Woodpecker cannot use `volumes:` in YAML; use host Docker socket + volumes-from CI step.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
METAL="${ROBOTICO_REGISTRY_NPM_HOST:-/var/lib/robotico/robotico-registry/npm}"
COPY_SCRIPT="${ROOT}/scripts/copy-npm-package-to-metal-storage.sh"
IMAGE="${ROBOTICO_NPM_COPY_IMAGE:-mirror.gcr.io/library/node:20-bookworm}"
WORK="${WOODPECKER_WORKSPACE:-/woodpecker/src}"

run_copy() {
  export PKG_DIR="${ROOT}"
  export ROBOTICO_REGISTRY_NPM_HOST="${METAL}"
  bash "${COPY_SCRIPT}"
}

if [[ -w "${METAL}" ]]; then
  run_copy
  exit 0
fi

if [[ ! -S /var/run/docker.sock ]]; then
  echo "error: ${METAL} not writable and /var/run/docker.sock missing" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "error: docker CLI required to bind-mount metal storage from CI" >&2
  exit 1
fi

CID="$(hostname)"
echo ">>> copy via docker (volumes-from=${CID} metal=${METAL})"
docker run --rm \
  --volumes-from "${CID}" \
  -v "${METAL}:${METAL}" \
  -w "${WORK}" \
  -e ROBOTICO_REGISTRY_NPM_HOST="${METAL}" \
  -e PKG_DIR="${WORK}" \
  "${IMAGE}" \
  bash scripts/copy-npm-package-to-metal-storage.sh
