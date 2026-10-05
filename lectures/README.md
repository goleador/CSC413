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

## Lecture authoring rules

Written after week 7, when two sessions shipped with milestone solution code
in them. These are not suggestions.

1. **A lecture teaches its named concept.** Chess is the setting; the lecture
   is not a milestone walkthrough. If a session can be summarised as "how to
   do M*n*", it is a tips page, not a lecture.
2. **Never include code that implements a milestone's unimplemented methods**,
   in any session, before or after its due date. Signatures and descriptions
   of required behaviour are fine; a body that would pass the milestone tests
   is not. Milestone help goes in a separate tips page with no solution
   bodies.
3. **Hands-on sessions ship runnable demo projects**: `demos/session-NN-*/before`
   and `after`, each a standalone Maven project with tests that pass in both,
   plus an instructor-only demo script with IntelliJ shortcuts for macOS and
   Windows and a git tag per step.
4. **Every lecture has at least 15 minutes of live coding or active student
   work.** Put it in the minute-by-minute plan before writing anything else.
5. **Speaker notes say what the instructor says or asks.** One to four
   sentences. No boilerplate, no "the notes develop this example", no
   descriptions of the slide.
6. **Slides: one idea, at most 25 words of prose** plus code or a diagram.
   Vary layouts: code-only, full-width list, table, question with reveals.
7. **Prose: say it once.** No hedging chains ("this is not X", "this does not
   establish Y") unless the misconception is the point of the section.
8. **Instructor-only material lives in files named `*-INSTRUCTOR-ONLY.md`**
   (and `DEMO-SCRIPT.md` inside a demo). Nothing links to them from the site.
9. **Outline first.** Write `OUTLINE.md` in the session directory, get it
   approved, then write notes and slides.

Before pushing a session, run `./check-lectures.sh` from the repository root.
It greps for boilerplate speaker notes, for milestone solution bodies in
`lectures/` and `weeks/`, and for instructor-only files linked from the
public site, then runs every demo project's tests. It must print
`all checks passed`.
