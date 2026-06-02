#!/usr/bin/env bash
# One-time: register robotico/robotico-result-typescript on dvalin and trigger main pipeline.
#
# Prerequisites:
#   WOODPECKER_TOKEN — personal access token from https://dvalin.robotico.dev/user/token
#   (login via Gitea OAuth as a user with access to robotico/robotico-result-typescript)
#
# Optional repo secrets (Woodpecker UI or POST /api/repos/{id}/secrets):
#   publish_token — npm publish to https://download.robotico.dev/npm/
#   gitea_token   — push release tags to brokkr
#
# Usage:
#   WOODPECKER_TOKEN=... bash scripts/activate-woodpecker-dvalin.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

WOODPECKER_HOST="${WOODPECKER_HOST:-https://dvalin.robotico.dev}"
FORGE_REMOTE_ID="${FORGE_REMOTE_ID:-162}" # brokkr gitea id for robotico/robotico-result-typescript
OWNER="${CI_REPO_OWNER:-robotico}"
NAME="${CI_REPO_NAME:-robotico-result-typescript}"

if [[ -z "${WOODPECKER_TOKEN:-}" ]]; then
  echo "error: set WOODPECKER_TOKEN (dvalin → User settings → CLI/API tokens)" >&2
  exit 1
fi

auth=(-H "Authorization: Bearer ${WOODPECKER_TOKEN}")

echo "Activating ${OWNER}/${NAME} (forge_remote_id=${FORGE_REMOTE_ID})..."
activate_out="$(curl -sS "${auth[@]}" -X POST \
  "${WOODPECKER_HOST}/api/repos?forge_remote_id=${FORGE_REMOTE_ID}")"
repo_id="$(printf '%s' "${activate_out}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)"

if [[ -z "${repo_id}" ]]; then
  lookup="$(curl -sS "${auth[@]}" "${WOODPECKER_HOST}/api/repos/lookup/${OWNER}/${NAME}" 2>/dev/null || true)"
  repo_id="$(printf '%s' "${lookup}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || true)"
fi

if [[ -z "${repo_id}" ]]; then
  echo "error: activate/lookup failed:" >&2
  echo "${activate_out}" >&2
  exit 1
fi

echo "Woodpecker repo id=${repo_id} — ${WOODPECKER_HOST}/${OWNER}/${NAME}"

echo "Triggering pipeline on main..."
curl -sS "${auth[@]}" -X POST \
  "${WOODPECKER_HOST}/api/repos/${repo_id}/pipelines" \
  -H "Content-Type: application/json" \
  -d '{"branch":"main"}' | python3 -m json.tool 2>/dev/null || true

echo "Done. Badge: ${WOODPECKER_HOST}/api/badges/${OWNER}/${NAME}/status.svg"
