# English Learning System — B2 → C1+ Director

Personal AI-powered learning dashboard built with Cursor.

## Source of truth (edit this file)

- **Main app:** `english-pet-project.html` — all dashboard code lives here.
- **Root stub:** `index.html` — redirects to `english-pet-project.html` so GitHub Pages opens the app at the repo URL.
- **Repo folder:** `OneDrive-EPAM/4. Personal/1. VIBECODING/English system project` (synced locally; same clone as GitHub).

Do **not** maintain parallel copies under `/tmp` or old `english-learning-system.html` paths — one file only.

## What this is

A single-file HTML dashboard that tracks my journey from B2 to C1+ English,
targeting Director-level professional communication.

## Features

- **Career XP system** — progress tied to real learning actions only
- **Habit calendar** — 12-week learning activity grid
- **Session log** — tracks every vocab / grammar / speaking / transcript session
- **Gap radar** — self-assessed progress on 5 key areas
- **Exercise tracker** — marks Anki reviews, roleplays, transcript analysis as done
- **Achievements** — unlocked based on actual milestones

## Tech stack

- Vanilla HTML/CSS/JS, zero dependencies
- LocalStorage for persistence
- AnkiConnect API integration (localhost:8765) — sync from desktop Anki
- Readwise API — Kindle highlights pipeline

## Roadmap

- [x] Anki sync (deck stats + reviews)
- [x] Responsive layout improvements
- [x] GitHub Pages hosting
- [ ] Transcript upload + analysis in-dashboard

## How to run

Open `english-pet-project.html` in any browser (or `index.html`, which forwards to it). No server needed.

## Git workflow

1. Edit `english-pet-project.html` locally (this folder).
2. `git add` + `git commit` + `git push` (or run `./deploy.sh "your message"`).
3. GitHub Pages updates from `main` — give it ~1 minute.

In **new Cursor chats**, paste the full path to `english-pet-project.html` above so the model edits the tracked file, not a copy in `/tmp`.
