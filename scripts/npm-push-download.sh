#!/usr/bin/env bash
# Copy pack tarball to /var/lib/robotico/robotico-registry/npm (no HTTP publish).
# Woodpecker cannot use `volumes:` in YAML; use host Docker socket + host paths.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
METAL="${ROBOTICO_REGISTRY_NPM_HOST:-/var/lib/robotico/robotico-registry/npm}"
COPY_SCRIPT="${ROOT}/scripts/copy-npm-package-to-metal-storage.sh"
IMAGE="${ROBOTICO_NPM_COPY_IMAGE:-mirror.gcr.io/library/node:20-bookworm}"
WORK_IN_CONTAINER="${WOODPECKER_WORKSPACE:-/woodpecker/src}"

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
WORK_HOST=""
if WORK_HOST="$(docker inspect "${CID}" --format '{{range .Mounts}}{{if eq .Destination "'"${WORK_IN_CONTAINER}"'"}}{{.Source}}{{end}}{{end}}' 2>/dev/null)" && [[ -n "${WORK_HOST}" && -d "${WORK_HOST}" ]]; then
  :
elif [[ -d "${WORK_IN_CONTAINER}" ]]; then
  WORK_HOST="${WORK_IN_CONTAINER}"
else
  echo "error: cannot resolve host workspace mount from container ${CID}" >&2
  exit 1
fi

echo ">>> copy via docker (work=${WORK_HOST} metal=${METAL})"
docker run --rm \
  -v "${WORK_HOST}:${WORK_IN_CONTAINER}" \
  -v "${METAL}:${METAL}" \
  -w "${WORK_IN_CONTAINER}" \
  -e ROBOTICO_REGISTRY_NPM_HOST="${METAL}" \
  -e PKG_DIR="${WORK_IN_CONTAINER}" \
  "${IMAGE}" \
  bash "${WORK_IN_CONTAINER}/scripts/copy-npm-package-to-metal-storage.sh"
