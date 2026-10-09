#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

APP_ROOT="${1:-$(repo_root)}"
OUT_DIR="${2:-}"
cd "$APP_ROOT"

require_cmd bun
require_cmd xcodebuild
require_cmd pod

export CI="${CI:-1}"
export EXPO_NO_TELEMETRY=1
export EXPO_PUBLIC_VISUAL_REVIEW="${EXPO_PUBLIC_VISUAL_REVIEW:-1}"
export EXPO_PUBLIC_SITE_ORIGIN="${EXPO_PUBLIC_SITE_ORIGIN:-http://127.0.0.1:${VISUAL_REVIEW_PORT}}"

log "Installing JS dependencies in $APP_ROOT"
if [ -f bun.lock ]; then
  bun install --frozen-lockfile
else
  bun install
fi

log "Patching Info.plist for local fixture networking (CI/local visual review only)"
bun "$SCRIPT_DIR/patch-local-networking.mjs" "$APP_ROOT"

log "Generating native iOS project"
bunx expo prebuild --platform ios --non-interactive --no-install

log "Installing CocoaPods"
(
  cd ios
  pod install --deployment 2>/dev/null || pod install
)

IFS=$'\t' read -r WORKSPACE SCHEME < <(detect_workspace_and_scheme "$APP_ROOT/ios")
mkdir -p "$DERIVED_DATA_DIR"

SIM_NAME="$(sanitize_simulator_name "$SIMULATOR_NAME")"
SIM_UDID="$(ensure_simulator "$SIM_NAME")"
DESTINATION="platform=iOS Simulator,id=${SIM_UDID}"

LOG_PATH="${OUT_DIR:-$APP_ROOT}/xcodebuild-visual-pr.log"
if [ -n "$OUT_DIR" ]; then
  mkdir -p "$OUT_DIR"
fi

log "Building $SCHEME for simulator $SIM_NAME ($SIM_UDID)"
set -o pipefail
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -sdk iphonesimulator \
  -destination "$DESTINATION" \
  -derivedDataPath "$DERIVED_DATA_DIR" \
  -skipPackagePluginValidation \
  -skipMacroValidation \
  ARCHS="$(uname -m)" \
  ONLY_ACTIVE_ARCH=YES \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  COMPILER_INDEX_STORE_ENABLE=NO \
  EXPO_NO_CAPABILITY_SYNC=1 \
  build | tee "$LOG_PATH"

APP_PATH="$(find_built_app "$DERIVED_DATA_DIR")"
[ -n "$APP_PATH" ] || die "Built .app not found under $DERIVED_DATA_DIR"

log "Built app: $APP_PATH"
if [ -n "$OUT_DIR" ]; then
  mkdir -p "$OUT_DIR"
  printf '%s\n' "$APP_PATH" > "$OUT_DIR/app-path.txt"
  printf '%s\n' "$SIM_UDID" > "$OUT_DIR/simulator-udid.txt"
  printf '%s\n' "$SIM_NAME" > "$OUT_DIR/simulator-name.txt"
fi
