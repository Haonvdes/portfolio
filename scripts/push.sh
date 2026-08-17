#!/usr/bin/env bash
# Stage everything, commit, and push the current branch in one step.
# Usage: ./scripts/push.sh ["commit message"]
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -z "$(git status --porcelain)" ]; then
  echo "Nothing to commit — working tree is clean."
  exit 0
fi

git add -A

git status --short
echo

if [ -n "${1:-}" ]; then
  message="$1"
else
  read -r -p "Commit message (leave blank for a timestamp): " message
  if [ -z "$message" ]; then
    message="Update $(date '+%Y-%m-%d %H:%M:%S')"
  fi
fi

git commit -m "$message"

branch="$(git rev-parse --abbrev-ref HEAD)"

if git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
  git push
else
  git push -u origin "$branch"
fi

echo "Pushed to $branch."
