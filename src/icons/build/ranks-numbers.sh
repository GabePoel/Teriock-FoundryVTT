#!/usr/bin/env bash

# Requires ImageMagick

set -euo pipefail
shopt -s nullglob

CLASSES_DIR="../classes"
NUMBERS_DIR="./numbers"
OUT_DIR="../ranks"
GRAVITY="center"
GEOMETRY="+0+0"

mkdir -p "$OUT_DIR"

if command -v magick >/dev/null 2>&1; then
  COMPOSITE=(magick composite)
elif command -v composite >/dev/null 2>&1; then
  COMPOSITE=(composite)
else
  echo "Error: ImageMagick not found." >&2
  exit 1
fi

class_files=("$CLASSES_DIR"/*.webp)
number_files=("$NUMBERS_DIR"/*.webp)

if (( ${#class_files[@]} == 0 )); then
  echo "No .webp files found in $CLASSES_DIR" >&2
  exit 1
fi
if (( ${#number_files[@]} == 0 )); then
  echo "No .webp files found in $NUMBERS_DIR" >&2
  exit 1
fi

for class in "${class_files[@]}"; do
  class_base="${class##*/}"
  class_name="${class_base%.webp}"

  for num in "${number_files[@]}"; do
    num_base="${num##*/}"
    num_name="${num_base%.webp}"

    out="$OUT_DIR/rank-${num_name}-${class_name}.webp"

    "${COMPOSITE[@]}" -gravity "$GRAVITY" -geometry "$GEOMETRY" \
      "$num" "$class" "$out"

    echo "Wrote $out"
  done
done

