#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

OUT_DIR="${1:?Usage: fallback-tour.sh <output-dir>}"
TOOLS_ROOT="${TOOLS_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
mkdir -p "$OUT_DIR"

screenshot() {
  local name="$1"
  xcrun simctl io booted screenshot "$OUT_DIR/${name}.png"
  log "Captured $name"
}

dismiss_open_prompt() {
  # Prefer the Maestro flow: wait until the sheet is visible, then tap Open.
  if command -v maestro >/dev/null 2>&1 && [ -f "$TOOLS_ROOT/.maestro/dismiss-open.yaml" ]; then
    maestro test "$TOOLS_ROOT/.maestro/dismiss-open.yaml" >/dev/null 2>&1 || true
  fi

  local _i
  for _i in 1 2 3; do
    osascript >/dev/null 2>&1 <<'APPLESCRIPT' || true
tell application "Simulator" to activate
delay 0.2
tell application "System Events"
  if exists process "Simulator" then
    tell process "Simulator"
      if exists (button "Open" of window 1) then
        click button "Open" of window 1
      else if exists (button "Open" of sheet 1 of window 1) then
        click button "Open" of sheet 1 of window 1
      end if
    end tell
  end if
end tell
APPLESCRIPT
    wait_for_app_idle 1
  done
}

# Last resort only. Caller must have already failed in-app navigation.
open_route() {
  local url="$1"
  xcrun simctl openurl booted "$url" >/dev/null
  dismiss_open_prompt
  wait_for_app_idle 3
}

wait_for_app_idle 4
screenshot "home"

xcrun simctl launch booted "$BUNDLE_ID" >/dev/null 2>&1 || true
wait_for_app_idle 2
screenshot "home-copied"
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
