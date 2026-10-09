#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

ROOT="$(repo_root)"
OUT_DIR="${1:-$ROOT/artifacts/visual-pr/local}"
mkdir -p "$OUT_DIR"

if [[ "$(uname -s)" != "Darwin" ]]; then
  die "Local visual review requires macOS with Xcode"
fi

require_cmd xcrun
require_cmd bun

export EXPO_PUBLIC_VISUAL_REVIEW=1
export EXPO_PUBLIC_SITE_ORIGIN="${EXPO_PUBLIC_SITE_ORIGIN:-http://127.0.0.1:${VISUAL_REVIEW_PORT}}"
export TOOLS_ROOT="$ROOT"

log "Starting fixture server"
bun "$SCRIPT_DIR/fixture-server.mjs" &
FIXTURE_PID=$!
trap 'kill "$FIXTURE_PID" >/dev/null 2>&1 || true' EXIT
sleep 1

if command -v maestro >/dev/null 2>&1; then
  log "Maestro $(maestro --version 2>/dev/null || echo available)"
else
  log "Maestro not on PATH; capture will use simctl io screenshots"
fi

bash "$SCRIPT_DIR/run-side.sh" "local" "$ROOT" "$OUT_DIR"
log "Local capture written to $OUT_DIR"
