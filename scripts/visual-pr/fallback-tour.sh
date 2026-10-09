#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

OUT_DIR="${1:?Usage: fallback-tour.sh <output-dir>}"
mkdir -p "$OUT_DIR"

screenshot() {
  local name="$1"
  xcrun simctl io booted screenshot "$OUT_DIR/${name}.png"
  log "Captured $name"
}

open_route() {
  local url="$1"
  xcrun simctl openurl booted "$url" >/dev/null
  wait_for_app_idle 3
}

wait_for_app_idle 4
screenshot "home"

xcrun simctl launch booted "$BUNDLE_ID" >/dev/null 2>&1 || true
wait_for_app_idle 2
screenshot "home-copied"

open_route "pocketno:///"
screenshot "home-new"

open_route "pocketno:///browse"
screenshot "browse"
screenshot "browse-work"

open_route "pocketno:///favorites"
screenshot "favorites"

open_route "pocketno:///settings"
screenshot "settings"

open_route "pocketno:///support"
screenshot "support"

open_route "pocketno:///privacy"
screenshot "privacy"

open_route "pocketno:///personalize"
screenshot "personalize-fallback"

open_route "pocketno:///copy?entry=app"
screenshot "copy-sheet"
