# CSC 413 — Software Development
San Francisco State University · Fall 2026 · Instructor: Rodrigo

Course materials for CSC 413. The chess engine itself lives in two separate
repositories — see [Repositories](#repositories) below.

## Layout

| Directory | Contents |
|---|---|
| `lectures/` | Per-session class notes and slide decks (`session-NN-topic/`) |
| `assignments/` | Milestone handouts, rubrics, and starter material |
| `guides/` | Standalone how-tos: tooling setup, Git workflow, FEN, debugging |

## The project

One console-based, object-oriented chess engine, built across the semester in
milestones (M0–M13). Every lecture uses it as its example: when the topic is
inheritance the example is the `Piece` hierarchy; when it's MVC it's separating
`Game` from `ConsoleView`. Concepts compound instead of restarting each week.

## Repositories

The code is versioned separately from the course materials, so the engine can be
released to students a milestone at a time without touching lectures or handouts.

| Repository | Who | Contents |
|---|---|---|
| `CSC413` (this one) | everyone | Lectures, assignments, guides, syllabus |
| `CSC413-chess-reference` | instructor | The complete engine. Source of truth; the milestone scaffolds are generated from it |
| `CSC413-chess-starter` | students | Generated scaffolds and tests, tagged `m0`…`m13`. What students pull each week |

Students never clone either chess repo directly. They get their own repo in week
one and add the starter as an `upstream` remote — see `guides/git-workflow.md`.

## Quick start (instructor)

```bash
git clone https://github.com/goleador/CSC413-chess-reference.git
cd CSC413-chess-reference
./mvnw test      # run the test suite — no Maven installation needed
./mvnw compile exec:java -Dexec.mainClass=edu.sfsu.csc413.chess.Main
```

Students follow `guides/environment-setup.md` instead, which starts from their
own repository.

**Requires JDK 25 (LTS).** Students install [Eclipse Temurin 25](https://adoptium.net)
— specifically Temurin rather than the Oracle build, which is only free inside a
licence window. On Apple Silicon choose the **aarch64** package; on Intel Macs,
**x64**. Verify with `java -version` *and* `javac -version` — both must say 25.

The Maven Wrapper (`./mvnw`) downloads Maven itself on first run, so students
need only a JDK and IntelliJ.

## Conventions

Class names, notation, and scope are fixed across all sessions so that examples
line up week to week — see the course context pack for the canonical list.
Board rendering is uppercase = white, lowercase = black, `.` = empty; moves are
long algebraic (`e2e4`, `e7e8q`); positions are FEN.

Instructor-only content (solutions, answer keys, grading notes) is always
clearly labelled and kept separable from student-facing handouts.
