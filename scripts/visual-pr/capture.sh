#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

APP_PATH="${1:?Usage: capture.sh <app-path> <output-dir> [simulator-udid]}"
OUT_DIR="${2:?}"
SIM_UDID="${3:-}"
TOOLS_ROOT="${TOOLS_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
MAESTRO_FLOW="${MAESTRO_FLOW:-$TOOLS_ROOT/.maestro/main-paths.yaml}"

mkdir -p "$OUT_DIR"
require_cmd xcrun

if [ -z "$SIM_UDID" ]; then
  SIM_NAME="$(sanitize_simulator_name "$SIMULATOR_NAME")"
  SIM_UDID="$(ensure_simulator "$SIM_NAME")"
else
  SIM_NAME="${SIMULATOR_NAME}"
fi

log "Booting simulator $SIM_NAME ($SIM_UDID)"
boot_simulator "$SIM_UDID"
xcrun simctl uninstall booted "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl install booted "$APP_PATH"

VIDEO_PATH="$OUT_DIR/tour.mp4"
rm -f "$VIDEO_PATH"
log "Starting simctl video recording"
xcrun simctl io booted recordVideo --codec=h264 --force "$VIDEO_PATH" >/dev/null 2>&1 &
RECORD_PID=$!
cleanup_recording() {
  if kill -0 "$RECORD_PID" >/dev/null 2>&1; then
    kill -INT "$RECORD_PID" >/dev/null 2>&1 || true
    wait "$RECORD_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup_recording EXIT

xcrun simctl launch booted "$BUNDLE_ID"
wait_for_app_idle 4

CAPTURE_OK=0
if command -v maestro >/dev/null 2>&1; then
  log "Running Maestro flow $MAESTRO_FLOW"
  MAESTRO_DIR="$OUT_DIR/maestro"
  mkdir -p "$MAESTRO_DIR"
  if maestro test --debug-output "$MAESTRO_DIR" "$MAESTRO_FLOW"; then
    CAPTURE_OK=1
    find "$MAESTRO_DIR" -name '*.png' -exec cp {} "$OUT_DIR/" \;
  else
    log "Maestro failed; falling back to simctl screenshots"
  fi
else
  log "Maestro is not installed; using simctl fallback"
fi

if [ "$CAPTURE_OK" -eq 0 ]; then
  bash "$SCRIPT_DIR/fallback-tour.sh" "$OUT_DIR"
fi

cleanup_recording
trap - EXIT

if command -v ffmpeg >/dev/null 2>&1 && [ -f "$VIDEO_PATH" ]; then
  log "Creating GIF preview"
  ffmpeg -y -i "$VIDEO_PATH" \
    -vf "fps=8,scale=390:-1:flags=lanczos" \
    -t 20 \
    "$OUT_DIR/tour.gif" >/dev/null 2>&1 || log "GIF conversion skipped"
fi

cat > "$OUT_DIR/manifest.json" <<JSON
{
  "bundleId": "$BUNDLE_ID",
  "simulator": "$SIM_NAME",
  "udid": "$SIM_UDID",
  "appPath": "$APP_PATH",
  "screens": [
    "home",
    "home-copied",
    "home-new",
    "browse",
    "browse-work",
    "favorites",
    "settings",
    "support",
    "privacy",
    "personalize-fallback",
    "copy-sheet"
  ]
}
JSON

log "Capture complete: $OUT_DIR"
