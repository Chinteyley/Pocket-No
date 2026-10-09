#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

SIDE="${1:?Usage: run-side.sh <base|head> <app-root> <output-dir>}"
APP_ROOT="${2:?}"
OUT_DIR="${3:?}"

mkdir -p "$OUT_DIR"
log "Building and capturing $SIDE from $APP_ROOT"
bash "$SCRIPT_DIR/build-ios-simulator.sh" "$APP_ROOT" "$OUT_DIR"
APP_PATH="$(cat "$OUT_DIR/app-path.txt")"
SIM_UDID="$(cat "$OUT_DIR/simulator-udid.txt")"
bash "$SCRIPT_DIR/capture.sh" "$APP_PATH" "$OUT_DIR" "$SIM_UDID"
