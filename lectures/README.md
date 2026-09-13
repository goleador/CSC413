# Lectures

One directory per session, named `session-NN-topic/`, each containing:

- `notes.md` — the written class notes: prose a student can learn from if they
  miss class, with full code examples, reasoning, pitfalls, and exercises.
- `slides.html` — the in-class deck, presented straight from the browser. One
  idea per slide, short code fragments, speaker notes in `<aside class="notes">`.
- `slides.md` — the deck's plain-text source of record, kept in the same order
  so it can be diffed and read without a browser.

## Presenting

Open `slides.html` and press <kbd>F</kbd>.

| Key | |
|---|---|
| <kbd>→</kbd> <kbd>space</kbd> / <kbd>←</kbd> | next / previous |
| <kbd>F</kbd> | fullscreen |
| <kbd>S</kbd> | speaker notes |
| <kbd>D</kbd> | dark mode — for projectors that wash out white |
| <kbd>B</kbd> | blank the screen |
| <kbd>?</kbd> | all shortcuts |

**Question slides step through.** Give any element inside a slide
`class="reveal"` and it starts hidden; each <kbd>→</kbd> shows the next one
before the deck advances, and <kbd>←</kbd> hides them again in reverse. The
convention: a slide whose heading is a question shows *only* the question
first, then reveals the options or the answer. Printing shows everything.

Styling lives in `assets/slides.css` and `assets/slides.js`, shared by every
deck and built on the same palette as the course site. No CDN and no build step:
the decks work offline, which matters in a classroom with unreliable wifi.
Print to PDF from the browser for a handout — one slide per page.

Notes and slides stay synchronized — same section order, same examples, same
terminology — so a student can map any slide to its notes section.

## Two meetings per week

The section meets **Monday and Wednesday**, which gives roughly **28 sessions**
across the semester — but the topic map in the syllabus is organised by *week*,
one topic per row. Each weekly topic therefore spans two meetings.

How to split a week is decided when that week's material is written; there is no
blanket rule. The pattern that usually fits: the first meeting introduces the
concept and its chess motivation, and the second is hands-on — live coding, a
design exercise, code review, or milestone help. The syllabus already promises
"in-class design exercises and code review", so the second meeting has a job
whether or not it gets its own deck.

Weeks 3 and 12 have only one meeting (Labor Day, Veterans Day), and week 14 has
none (Thanksgiving). Plan those weeks accordingly.

**Fall 2026 adjustment.** The Wednesday September 9 class was cancelled, so
week 3 ended up with no meeting at all. The session map shifted by one meeting
and re-converged in week 5, whose topic is light because enums and records were
already covered in session 3:

| Session | Date | Topic | Milestone |
|---|---|---|---|
| 5 | Mon Sep 14 | OO design: `Board` & `Piece` (week 3's topic) | M1 opens, due Mon Sep 21 |
| 6 | Wed Sep 16 | Inheritance & polymorphism: the `Piece` hierarchy | M2 opens, due Mon Sep 28 |
| 7 | Mon Sep 21 | Hands-on: refactor `Piece` live, write `Knight`, review M1 `Board`s | — |
| 8 | Wed Sep 23 | Collections, generics, exceptions | M3 opens |

Week 6 onward follows the syllabus as written.

Every session names the course objective(s) it advances and the chess milestone
it supports. See the course context pack §6 for the session map and §9 for the
per-lecture template.

Instructor-only material (exercise solutions, answer keys) is labelled
**INSTRUCTOR ONLY** inline and kept separable from the student handout.
