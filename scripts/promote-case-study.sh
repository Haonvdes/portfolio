#!/usr/bin/env bash
# Promote a case study's -v3 build to its live filename in case-studies/.
# Overwrites the live file with the v3 content, then deletes the v3 source.
# Older files (-v2, -new, legacy) are left untouched.
#
# Usage: scripts/promote-case-study.sh <case-name> [<case-name> ...]
#   Known case names: customer-engagement, healthcare, lending, marketing-platform
#
# web-3 is deliberately not in the map below — do not add it until told to.
set -euo pipefail
cd "$(dirname "$0")/.."

KNOWN_NAMES="customer-engagement healthcare lending marketing-platform"

source_for() {
  case "$1" in
    customer-engagement) echo "customer-engagement-v3.html" ;;
    healthcare)          echo "healthcare-v3.html" ;;
    lending)             echo "lending-new-v3.html" ;;
    marketing-platform)  echo "marketing-platform-v3.html" ;;
    *)                   echo "" ;;
  esac
}

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <case-name> [<case-name> ...]" >&2
  echo "Known case names: $KNOWN_NAMES" >&2
  exit 1
fi

for name in "$@"; do
  src="$(source_for "$name")"
  if [[ -z "$src" ]]; then
    echo "Unknown case name: $name (known: $KNOWN_NAMES)" >&2
    exit 1
  fi

  src_path="case-studies/$src"
  dest_path="case-studies/$name.html"

  if [[ ! -f "$src_path" ]]; then
    echo "Source not found: $src_path" >&2
    exit 1
  fi

  cp "$src_path" "$dest_path"
  rm "$src_path"
  echo "Promoted $src_path -> $dest_path"
done
