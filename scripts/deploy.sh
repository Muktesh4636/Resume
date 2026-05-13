#!/usr/bin/env bash
# Deploy production build to resumebuilder.fun VPS.
#
# Usage:
#   ./scripts/deploy.sh
#   npm run deploy
#
# Auth (pick one):
#   1) SSH key (recommended):  export DEPLOY_SSH_KEY="$HOME/.ssh/id_ed25519"
#   2) Password:              export DEPLOY_SSH_PASS='your-password'
#                             (same as env SSHPASS for sshpass)
#   3) Optional: copy scripts/env.deploy.example → scripts/.env.deploy and edit (gitignored)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/scripts/.env.deploy" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/scripts/.env.deploy"
  set +a
fi

REMOTE_USER="${DEPLOY_USER:-root}"
REMOTE_HOST="${DEPLOY_HOST:-72.61.148.117}"
REMOTE_PATH="${DEPLOY_PATH:-/var/www/resumebuilder.fun}"

RSYNC_OPTS=( -avz --delete )

rsync_ssh() {
  if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
    if [[ ! -f "$DEPLOY_SSH_KEY" ]]; then
      echo "Error: DEPLOY_SSH_KEY is set but not a readable file: $DEPLOY_SSH_KEY" >&2
      exit 1
    fi
    rsync "${RSYNC_OPTS[@]}" \
      -e "ssh -i ${DEPLOY_SSH_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
      "$ROOT/dist/" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" || return 1
    return 0
  fi

  local pass="${DEPLOY_SSH_PASS:-${SSHPASS:-}}"
  if [[ -n "$pass" ]] && command -v sshpass >/dev/null 2>&1; then
    SSHPASS="$pass" rsync "${RSYNC_OPTS[@]}" \
      -e 'sshpass -e ssh -o StrictHostKeyChecking=accept-new' \
      "$ROOT/dist/" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" || return 1
    return 0
  fi

  rsync "${RSYNC_OPTS[@]}" -e 'ssh -o StrictHostKeyChecking=accept-new' \
    "$ROOT/dist/" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" || return 1
  return 0
}

echo "→ npm run build"
npm run build

echo "→ rsync dist/ → ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
if ! rsync_ssh; then
  echo "" >&2
  echo "Rsync failed (usually SSH auth). Fix:" >&2
  echo "  • Copy scripts/env.deploy.example → scripts/.env.deploy" >&2
  echo "  • Set DEPLOY_SSH_KEY=/path/to/private_key  OR  DEPLOY_SSH_PASS=…" >&2
  echo "  • Or run: export DEPLOY_SSH_KEY=\$HOME/.ssh/id_ed25519 && npm run deploy" >&2
  exit 1
fi

SITE_URL="${DEPLOY_PUBLIC_URL:-https://resumebuilder.fun}"
JS_PATH="$(grep -Eo '/assets/index-[a-zA-Z0-9_-]+\.js' "$ROOT/dist/index.html" | head -1 || true)"
if [[ -n "$JS_PATH" ]] && command -v curl >/dev/null 2>&1; then
  echo "→ Smoke test: GET ${SITE_URL}${JS_PATH}"
  code="$(curl -sS -o /dev/null -w "%{http_code}" "${SITE_URL}${JS_PATH}" || echo "000")"
  if [[ "$code" != "200" ]]; then
    echo "Warning: main bundle returned HTTP $code — check upload or try a hard refresh (Shift+Reload)." >&2
  fi
fi

echo "→ Done. Site: ${SITE_URL}/"
echo "  If visitors still see a blank page after deploy, set no-cache headers for HTML on nginx (see scripts/nginx-resumebuilder.fun.example.conf)."
