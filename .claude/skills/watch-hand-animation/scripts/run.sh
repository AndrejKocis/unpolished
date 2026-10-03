#!/usr/bin/env bash
# usage: run.sh <fit|build|check|render|measure> <config.json> [args...]
# Creates tmp/hand-anim/.venv (numpy + opencv) on first use.
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
VENV="$ROOT/tmp/hand-anim/.venv"
if [ ! -x "$VENV/bin/python" ]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q numpy opencv-python-headless
fi
command -v ffmpeg >/dev/null || { echo "ffmpeg missing: brew install ffmpeg" >&2; exit 1; }
exec "$VENV/bin/python" "$(cd "$(dirname "$0")" && pwd)/$1.py" "${@:2}"
