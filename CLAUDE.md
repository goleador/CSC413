# CLAUDE.md — CSC 413 course site

GitHub Pages site for CSC 413 Software Development (SFSU), served from `main`.
Students build one chess engine across the semester; lectures, handouts, and
demos live here.

## Layout

- `lectures/session-NN-topic/` — `notes.md`, `slides.md`, `slides.html`,
  optional `slides.css`, `OUTLINE.md` while a session is being planned,
  `notes-INSTRUCTOR-ONLY.md` for answer keys.
- `demos/session-NN-topic/` — `before/` and `after/` Maven projects, `steps/`
  patches, `DEMO-SCRIPT.md` (instructor only), `build-demo-repo.sh`.
- `assignments/m*/handout.md` — milestone handouts.
- `weeks/week-NN.html`, `index.html` — the public site. `guide.html?d=path`
  renders a markdown file from the repo.
- `assets/slides.css`, `assets/slides.js` — shared deck styling and keys.

## Rules that override everything else

Read **`lectures/README.md` → "Lecture authoring rules"** before touching any
lecture, slide deck, or demo. In short: a lecture teaches its concept, never
contains milestone solution bodies, ships runnable before/after demo code for
hands-on sessions, has real speaker notes, and starts as an approved outline.

## Decks

`slides.html` is hand-written HTML on the shared stylesheet; `slides.md` is
the plain-text source of record in the same order. There is no build step.
Keep both in sync. Question slides use `class="reveal"` on each step.

## Demo projects

JDK 25 (Temurin), `./mvnw`, JUnit 5. `./mvnw -q test` must pass in both
`before/` and `after/`, and the test files must be identical between them.

## Never publish

`*-INSTRUCTOR-ONLY.md`, `DEMO-SCRIPT.md`, or anything under `grading/`. Do not
link them from `index.html` or `weeks/`.
