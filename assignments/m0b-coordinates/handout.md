# M0b — Board Coordinates

**Course:** CSC 413 Software Development
**Milestone:** M0b · Week 2
**Objectives advanced:** 1 (OO software in modern Java), 7 (test and debug)
**Assigned:** Wednesday, September 2
**Due:** Wednesday, September 9, 11:59 PM

---

## The idea

The first milestone with real code in it: `Position`, a square on the board,
and `Color`, the two sides. Everything in the engine is built on these two —
`Board` is a grid of positions, a `Piece` stands on one, a `Move` goes from one
to another.

In Wednesday's class we build the skeleton together: the record header, the
stubs, the bounds check, the constructor, and `toString`. The graded work is
what remains, and it is **yours alone** — about 35 lines the course materials
deliberately do not contain:

1. **`Position.parse`** — algebraic notation in, position out. Flips four
   tests at once.
2. **`Position.offsetOrNull`** — the offset position, or null off the board.
   Three lines.
3. **`Color`'s four bodies** — replace the stubs this milestone delivered.

The tests are the specification. Read them first. Every step we did together is
in the [session 4 notes](https://goleador.github.io/CSC413/guide.html?d=lectures/session-04-position/notes),
and the design reasoning is in [session 3](https://goleador.github.io/CSC413/guide.html?d=lectures/session-03-java-review/notes).

---

## Getting the milestone

The [weekly loop](https://goleador.github.io/CSC413/guide.html?g=git-workflow):

```bash
git fetch upstream --tags
git merge m0b
./mvnw test        # a compile error — that error is the assignment
```

If you are working in a group, one member merges and pushes; the others pull.

---

## What "done" looks like

From inside your repository:

```bash
./mvnw test
```

ends green:

```
Tests run: 11, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Eleven: three from `ToolchainTest`, five from `PositionTest`, three from
`ColorTest`. Right after the class session you will be at
`Tests run: 11, Failures: 1, Errors: 7` — eight red. That is the intended
starting point, and the red count is your to-do list.

---

## What you submit

```bash
git tag submit-m0b
git push origin main --tags
```

**The tag is the submission.** Verify on GitHub: your repository → Tags →
`submit-m0b`.

---

## How it is graded

| Criterion | Weight |
|---|---|
| All eleven tests green (`./mvnw test`, checked by clone-and-run) | 70% |
| The shipped signatures unchanged — later milestones build on them | 20% |
| `submit-m0b` tag pushed | 10% |

---

## Common problems

- **`UnsupportedOperationException: M0b: your turn`** — a stub you have not
  replaced yet. The stack trace names the method.
- **`cannot find symbol: class Position`** — the file is not at
  `src/main/java/edu/sfsu/csc413/chess/model/Position.java`, or the package
  line disagrees with the path.
- **`e2` prints as `151`** — the missing `""` in `toString`; `'a' + file` is
  `int` arithmetic until something in the expression is a String.
- **`valueEquality` fails** — you wrote `class`, not `record`.

**Monday, September 7 is Labor Day** — no class. The next meeting is the day
this is due, so questions go to email, early.

---

## A note on the stubs

`Color.java` arrived with its bodies throwing on purpose. The signatures are a
fixed contract — pawn movement in M3 calls them — but the values inside are
facts about chess you can derive from the board, or read out of `ColorTest`.
Reading expected behaviour out of a test is not cheating; it is what tests are
for.
