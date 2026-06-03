#!/usr/bin/env bash
# Register this repo on dvalin (Woodpecker) and trigger main.
#
# Prerequisites:
#   WOODPECKER_TOKEN — https://dvalin.robotico.dev/user/token
#   GITEA_TOKEN or BROKKR_MIRANDA_PWD — Brokkr API (resolve forge_remote_id)
#
# Woodpecker repo secret (UI or API): gitea_token — push release tags to Brokkr
#
# Usage (from repo root):
#   WOODPECKER_TOKEN=... BROKKR_MIRANDA_PWD=... bash scripts/activate-woodpecker-dvalin.sh
#
# Bulk (all @robotico/*-typescript):
#   WOODPECKER_TOKEN=... BROKKR_MIRANDA_PWD=... bash ../../scripts/activate-woodpecker-typescript-patterns.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

WOODPECKER_HOST="${WOODPECKER_HOST:-https://dvalin.robotico.dev}"
BROKKR_BASE="${BROKKR_BASE:-https://brokkr.robotico.dev}"
BROKKR_ORG="${BROKKR_ORG:-robotico}"
BROKKR_USER="${BROKKR_USER:-miranda}"
OWNER="${CI_REPO_OWNER:-robotico}"
NAME="${CI_REPO_NAME:-$(basename "$ROOT")}"

if [[ -z "${WOODPECKER_TOKEN:-}" ]]; then
  echo "error: set WOODPECKER_TOKEN (dvalin → User settings → CLI/API tokens)" >&2
  exit 1
fi

GITEA_TOKEN="${GITEA_TOKEN:-${BROKKR_MIRANDA_PWD:-}}"
if [[ -z "${GITEA_TOKEN}" ]]; then
  echo "error: set GITEA_TOKEN or BROKKR_MIRANDA_PWD for Brokkr API" >&2
  exit 1
fi

wp_auth=(-H "Authorization: Bearer ${WOODPECKER_TOKEN}")
gitea_auth=(-u "${BROKKR_USER}:${GITEA_TOKEN}")

FORGE_REMOTE_ID="${FORGE_REMOTE_ID:-}"
if [[ -z "${FORGE_REMOTE_ID}" ]]; then
  FORGE_REMOTE_ID="$(curl -sS "${gitea_auth[@]}" \
    "${BROKKR_BASE}/api/v1/repos/${BROKKR_ORG}/${NAME}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)"
fi

if [[ -z "${FORGE_REMOTE_ID}" ]]; then
  echo "error: ${BROKKR_ORG}/${NAME} not found on Brokkr — mirror/push first" >&2
  exit 1
fi

echo "Activating ${OWNER}/${NAME} (forge_remote_id=${FORGE_REMOTE_ID})..."
activate_out="$(curl -sS "${wp_auth[@]}" -X POST \
  "${WOODPECKER_HOST}/api/repos?forge_remote_id=${FORGE_REMOTE_ID}")"
repo_id="$(printf '%s' "${activate_out}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)"

if [[ -z "${repo_id}" ]]; then
  lookup="$(curl -sS "${wp_auth[@]}" "${WOODPECKER_HOST}/api/repos/lookup/${OWNER}/${NAME}" 2>/dev/null || true)"
  repo_id="$(printf '%s' "${lookup}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || true)"
fi

if [[ -z "${repo_id}" ]]; then
  echo "error: activate/lookup failed:" >&2
  echo "${activate_out}" >&2
  exit 1
fi

echo "Woodpecker repo id=${repo_id} — ${WOODPECKER_HOST}/${OWNER}/${NAME}"

echo "Triggering pipeline on main..."
curl -sS "${wp_auth[@]}" -X POST \
  "${WOODPECKER_HOST}/api/repos/${repo_id}/pipelines" \
  -H "Content-Type: application/json" \
  -d '{"branch":"main"}' | python3 -m json.tool 2>/dev/null || true

echo "Done. Badge: ${WOODPECKER_HOST}/api/badges/${OWNER}/${NAME}/status.svg"
echo "Set Woodpecker secret gitea_token on this repo for release tag push."
