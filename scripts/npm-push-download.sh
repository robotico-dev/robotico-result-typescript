#!/usr/bin/env bash
# Copy pack tarball to /var/lib/robotico/robotico-registry/npm (no HTTP publish).
# Woodpecker cannot use `volumes:` (trust); use host Docker socket + nested container.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
METAL="${ROBOTICO_REGISTRY_NPM_HOST:-/var/lib/robotico/robotico-registry/npm}"
COPY_SCRIPT="${ROOT}/scripts/copy-npm-package-to-metal-storage.sh"
IMAGE="${ROBOTICO_NPM_COPY_IMAGE:-mirror.gcr.io/library/node:20-bookworm}"

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
  echo "error: ${METAL} not writable and /var/run/docker.sock missing (cannot copy to metal)" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "error: docker CLI required to bind-mount metal storage from CI" >&2
  exit 1
fi

echo ">>> copy via docker (host metal: ${METAL})"
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "${METAL}:${METAL}" \
  -v "${ROOT}:/work" \
  -w /work \
  -e ROBOTICO_REGISTRY_NPM_HOST="${METAL}" \
  -e PKG_DIR=/work \
  "${IMAGE}" \
  bash scripts/copy-npm-package-to-metal-storage.sh
