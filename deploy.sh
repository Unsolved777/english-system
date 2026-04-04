#!/bin/bash
# Commit + push this repo. Source of truth: english-pet-project.html in THIS folder.
# GitHub Pages: https://unsolved777.github.io/english-system/

set -e
cd "$(dirname "$0")"

MSG="${1:-Update English dashboard}"

git add index.html english-pet-project.html english-pet-project.css \
  english-pet-project.constants.js \
  english-pet-project.app.js english-pet-project.state.js english-pet-project.calculations.js \
  english-pet-project.achievements.js english-pet-project.render.js english-pet-project.topics.js \
  english-pet-project.anki.js \
  README.md deploy.sh .gitignore
git status --short
git commit -m "$MSG" || { echo "Nothing to commit or commit failed."; exit 1; }
git push

echo ""
echo "✅ Pushed. Pages usually update within ~1 minute:"
echo "   https://unsolved777.github.io/english-system/"
