#!/bin/bash
# One-command deploy: copy latest file → commit → push → live in 60s

SRC="/Users/dzmitryhaurylenka/Library/CloudStorage/OneDrive-EPAM/4. Personal/Experiments/english-learning-system.html"
DEST="$(dirname "$0")/index.html"

cp "$SRC" "$DEST"

cd "$(dirname "$0")"

git add index.html

# Use provided message or default
MSG="${1:-Update dashboard}"
git commit -m "$MSG"

git push

echo ""
echo "✅ Live at: https://unsolved777.github.io/english-system/"
