# English Learning System — B2 → C1+ Director

Personal AI-powered learning dashboard built with Cursor.

## Source of truth (edit these files)

The app is split so tools only load what you touch (smaller context, fewer tokens):

| File | Role |
|------|------|
| `english-pet-project.html` | Markup and tab structure (~1.1k lines) |
| `english-pet-project.css` | All styles |
| `english-pet-project.constants.js` | XP, career levels, calendar labels, C1 topics, **EXERCISES** (single source) |
| `english-pet-project.app.js` | Entry (`type="module"`): tabs, session log, exercise actions, `window.*` hooks |
| `english-pet-project.state.js` | `localStorage` load/save, default + normalized state |
| `english-pet-project.calculations.js` | XP, streak, `escapeHtml` |
| `english-pet-project.achievements.js` | Achievement definitions (uses calculations) |
| `english-pet-project.render.js` | DOM: progress tab, habit calendar, exercise bank render |
| `english-pet-project.topics.js` | C1+ focus board + drag-and-drop |
| `english-pet-project.anki.js` | AnkiConnect sync |

- **Root stub:** `index.html` — redirects to `english-pet-project.html` so GitHub Pages opens the app at the repo URL.
- **Repo folder:** `OneDrive-EPAM/4. Personal/1. VIBECODING/English system project` (synced locally; same clone as GitHub).

Do **not** maintain parallel copies under `/tmp` or duplicate old `english-learning-system.html` trees — keep a single repo checkout.

## What this is

A static HTML/CSS/JS dashboard that tracks my journey from B2 to C1+ English,
targeting Director-level professional communication.

## Features

- **Career XP system** — progress tied to real learning actions only
- **Habit calendar** — 12-week learning activity grid
- **Session log** — tracks every vocab / grammar / speaking / transcript session
- **Gap radar** — self-assessed progress on 5 key areas
- **Exercise tracker** — marks Anki reviews, roleplays, transcript analysis as done
- **Achievements** — unlocked based on actual milestones

## Tech stack

- Vanilla HTML/CSS/JS, zero npm dependencies
- ES modules (`english-pet-project.app.js` entry) — split by responsibility
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

1. Edit locally: behavior in `english-pet-project.app.js` / feature modules; config & syllabus in `english-pet-project.constants.js`; styles in `english-pet-project.css`.
2. `git add` + `git commit` + `git push` (or run `./deploy.sh "your message"`).
3. GitHub Pages updates from `main` — give it ~1 minute.

In **new Cursor chats**, point at the file you are changing (e.g. `english-pet-project.app.js` for wiring, `english-pet-project.render.js` for progress UI, `english-pet-project.css` for layout) so the model does not load the whole tree unnecessarily. Same folder path as above.
