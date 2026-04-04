#!/bin/bash
# Commit + push this repo. Source of truth: english-pet-project.html in THIS folder.
# GitHub Pages: https://unsolved777.github.io/english-system/

set -e
cd "$(dirname "$0")"

MSG="${1:-Update English dashboard}"

git add index.html english-pet-project.html README.md deploy.sh .gitignore
git status --short
git commit -m "$MSG" || { echo "Nothing to commit or commit failed."; exit 1; }
git push

echo ""
echo "✅ Pushed. Pages usually update within ~1 minute:"
echo "   https://unsolved777.github.io/english-system/"
