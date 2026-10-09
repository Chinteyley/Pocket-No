# Shared helpers for visual PR capture scripts.
# shellcheck shell=bash

BUNDLE_ID="${BUNDLE_ID:-dev.ctey.pocketno}"
SIMULATOR_NAME="${SIMULATOR_NAME:-iPhone 16}"
SCHEME_HINT="${SCHEME_HINT:-PocketNo}"
VISUAL_REVIEW_PORT="${VISUAL_REVIEW_PORT:-8787}"
DERIVED_DATA_DIR="${DERIVED_DATA_DIR:-$HOME/.cache/pocket-no-deriveddata}"

log() {
  printf '::group::%s\n' "$*" >/dev/null 2>&1 || true
  printf '[visual-pr] %s\n' "$*"
}

die() {
  printf '[visual-pr] ERROR: %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || pwd
}

sanitize_simulator_name() {
  local preferred="$1"
  if xcrun simctl list devices available | grep -Fq "$preferred"; then
    printf '%s\n' "$preferred"
    return
  fi

  local fallback
  fallback="$(
    xcrun simctl list devices available \
      | sed -n 's/^[[:space:]]*\(iPhone [^()]*(.*\)$/\1/p' \
      | sed 's/[[:space:]]*([^)]*)[[:space:]]*([^)]*)$//' \
      | sed 's/[[:space:]]*$//' \
      | tail -n 1
  )"

  if [ -z "$fallback" ]; then
    die "No available iPhone simulator found"
  fi

  printf '%s\n' "$fallback"
}

ensure_simulator() {
  local name="$1"
  local udid
  udid="$(
    xcrun simctl list devices available \
      | grep -E "^[[:space:]]*${name} \\(" \
      | sed -n 's/.*(\([A-F0-9-]\{36\}\)).*/\1/p' \
      | head -n 1
  )"

  if [ -z "$udid" ]; then
    udid="$(xcrun simctl create "$name" "$name" 2>/dev/null || true)"
  fi

  if [ -z "$udid" ]; then
    die "Could not resolve simulator UDID for $name"
  fi

  printf '%s\n' "$udid"
}

boot_simulator() {
  local udid="$1"
  xcrun simctl boot "$udid" >/dev/null 2>&1 || true
  xcrun simctl bootstatus "$udid" -b
  xcrun simctl ui "$udid" appearance light >/dev/null 2>&1 || true
  xcrun simctl status_bar "$udid" override \
    --time "9:41" \
    --dataNetwork wifi \
    --wifiMode active \
    --wifiBars 3 \
    --cellularMode active \
    --cellularBars 4 \
    --operatorName "" \
    --batteryState charged \
    --batteryLevel 100 >/dev/null 2>&1 || true
  xcrun simctl spawn "$udid" defaults write com.apple.Accessibility ReduceMotionEnabled -bool true >/dev/null 2>&1 || true
}

find_built_app() {
  local derived="$1"
  find "$derived/Build/Products" -name '*.app' -type d \
    ! -name '*Shortcuts*' \
    ! -path '*iphoneos*' \
    | head -n 1
}

detect_workspace_and_scheme() {
  local ios_dir="$1"
  local workspace=""
  local scheme="$SCHEME_HINT"

  if [ -d "$ios_dir/${SCHEME_HINT}.xcworkspace" ]; then
    workspace="$ios_dir/${SCHEME_HINT}.xcworkspace"
  elif [ -d "$ios_dir/Pocket-No.xcworkspace" ]; then
    workspace="$ios_dir/Pocket-No.xcworkspace"
    scheme="Pocket-No"
  else
    workspace="$(find "$ios_dir" -maxdepth 1 -name '*.xcworkspace' -print | head -n 1)"
  fi

  if [ -z "$workspace" ]; then
    die "No Xcode workspace found in $ios_dir"
  fi

  printf '%s\t%s\n' "$workspace" "$scheme"
}

wait_for_app_idle() {
  sleep "${1:-2}"
}
