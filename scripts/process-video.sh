#!/bin/bash
# Spracuje surové video hodinky do web-optimalizovanej hover-loop verzie:
# HDR -> SDR (macOS avconvert), stredový 4:5 orez, kompresia, jemný
# crossfade loop (koniec sa prelína so začiatkom, žiadny tvrdý strih).
#
# Použitie: scripts/process-video.sh <vstupne-video> <referencia> [fade-sekundy] [start-offset-sekundy]
# start-offset odreže začiatok videa (napr. ak kamera najprv panuje cez zápästie
# predtým, než sa dostane na ciferník) — slučka potom začína až odtiaľto.
# Výstup:   public/watches/<referencia>/loop.mp4
# Voliteľne CROP_OVERRIDE="crop=w:h:x:y" (v pixeloch SDR videa) nahradí stredový orez,
# napr. keď treba hodinky v zábere priblížiť alebo posunúť. CRF (predvolene 24) mení kompresiu.

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Použitie: $0 <vstupne-video> <referencia> [fade-sekundy] [start-offset-sekundy]" >&2
  exit 1
fi

INPUT="$1"
REF="$2"
FADE="${3:-0.6}"
START="${4:-0}"

if [ ! -f "$INPUT" ]; then
  echo "Vstupný súbor neexistuje: $INPUT" >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
  echo "Chýba ffmpeg/ffprobe. Nainštaluj: brew install ffmpeg" >&2
  exit 1
fi

if ! command -v avconvert >/dev/null; then
  echo "Chýba avconvert (mal by byť súčasťou macOS)." >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$REPO_ROOT/public/watches/$REF"
mkdir -p "$OUT_DIR"

TMP_SDR="$(mktemp -t sdr_XXXXXX).mov"
trap 'rm -f "$TMP_SDR"' EXIT

echo "1/2 Prevádzam HDR -> SDR (avconvert)…"
avconvert -s "$INPUT" -o "$TMP_SDR" -p Preset1920x1080 --replace >/dev/null

WIDTH=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=nokey=1:noprint_wrappers=1 "$TMP_SDR")
HEIGHT=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nokey=1:noprint_wrappers=1 "$TMP_SDR")
FULL_DURATION=$(ffprobe -v error -show_entries format=duration -of default=nokey=1:noprint_wrappers=1 "$TMP_SDR")
DURATION=$(python3 -c "print(round($FULL_DURATION - $START, 3))")

if (( $(python3 -c "print(1 if $DURATION <= 0 else 0)") )); then
  echo "start-offset $START je dlhší než video (dĺžka ${FULL_DURATION}s)." >&2
  exit 1
fi

# Stredový orez na pomer 4:5 (rovnaký pomer ako karty a galéria fotiek).
CROP_H=$(python3 -c "print(int($WIDTH*5/4))")
if [ "$CROP_H" -gt "$HEIGHT" ]; then
  CROP_W=$(python3 -c "print(int($HEIGHT*4/5))")
  CROP_H=$HEIGHT
  X_OFF=$(python3 -c "print(int(($WIDTH-$CROP_W)/2))")
  CROP="crop=$CROP_W:$CROP_H:$X_OFF:0"
else
  Y_OFF=$(python3 -c "print(int(($HEIGHT-$CROP_H)/2))")
  CROP="crop=$WIDTH:$CROP_H:0:$Y_OFF"
fi

CROP="${CROP_OVERRIDE:-$CROP}"

MAIN_DUR=$(python3 -c "print(round($DURATION - $FADE, 3))")

if (( $(python3 -c "print(1 if $MAIN_DUR <= 0 else 0)") )); then
  echo "Video je príliš krátke pre fade $FADE s (dĺžka ${DURATION}s)." >&2
  exit 1
fi

echo "2/2 Orez, kompresia a crossfade loop…"
ffmpeg -y -loglevel error -ss "$START" -i "$TMP_SDR" -filter_complex "
[0:v]$CROP,scale=640:800,format=yuv420p,split=3[s1][s2][s3];
[s1]trim=0:$MAIN_DUR,setpts=PTS-STARTPTS[main];
[s2]trim=$MAIN_DUR:$DURATION,setpts=PTS-STARTPTS[tail];
[s3]trim=0:$FADE,setpts=PTS-STARTPTS[head];
[tail][head]xfade=transition=fade:duration=$FADE:offset=0[xf];
[main][xf]concat=n=2:v=1:a=0[outv]
" -map "[outv]" -an -c:v libx264 -preset slow -crf "${CRF:-24}" -movflags +faststart -pix_fmt yuv420p \
  "$OUT_DIR/loop.mp4"

echo "Hotovo: $OUT_DIR/loop.mp4 ($(du -h "$OUT_DIR/loop.mp4" | cut -f1))"
