#!/usr/bin/env bash
# Commit and push redesign (via push.sh), then put the same commit live on main.
# Usage: npm run release -- ["commit message"]
set -euo pipefail

cd "$(dirname "$0")/.."

branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" != "redesign" ]; then
  echo "Release runs from redesign — you are on $branch." >&2
  exit 1
fi

# push.sh exits without pushing when the tree is clean, so the push below still
# sends redesign in that case.
bash scripts/push.sh "$@"

if ! git push origin redesign redesign:main; then
  echo >&2
  echo "main has commits redesign doesn't. Run:" >&2
  echo "  git fetch origin && git merge origin/main" >&2
  echo "then npm run release again." >&2
  exit 1
fi

echo "Released: main is now $(git rev-parse --short HEAD). stpnguyen.com updates in about a minute."
