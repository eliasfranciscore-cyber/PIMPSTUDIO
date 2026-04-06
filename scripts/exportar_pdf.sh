#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Uso: $0 <entrada.md> <salida.pdf>"
  exit 1
fi

INPUT="$1"
OUTPUT="$2"

if [[ ! -f "$INPUT" ]]; then
  echo "No existe el archivo de entrada: $INPUT"
  exit 1
fi

if command -v pandoc >/dev/null 2>&1; then
  pandoc "$INPUT" -o "$OUTPUT"
  echo "PDF generado: $OUTPUT"
else
  echo "pandoc no está instalado."
  echo "Instálalo con: brew install pandoc"
  echo "Mientras tanto, puedes convertir el markdown manualmente desde tu editor."
  exit 2
fi
