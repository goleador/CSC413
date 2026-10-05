# Session 11 — instructor-only notes

Solutions to the exercises in `notes.md`, plus the answers to the in-class
questions. Not linked from the site.

## In-class answers

**Hook (min 0–5).** "Where does king safety go?" Let three people answer;
they will name three different places. Then: "Three answers, all defensible,
none obviously right. That is the smell, before we have a name for it."

**Smell hunt (min 15–25).** Expected list, in the order rooms usually find
them: long method; bad names; the `if (p.type == …)` chain; printing mixed in;
the bounds check twice; `charAt(0) - 'a'` magic; the three-line pawn
condition; "it does everything". Name each as it comes up (table in §3 of the
notes). The one they usually miss is Primitive Obsession on the `String`
move; prompt with "what type is the move for the first forty lines?"

**Live demo (min 25–55).** `demos/session-11-refactoring/DEMO-SCRIPT.md`.

**Exit exercise (min 65–75).** See exercise 1 below.

## Exercise solutions

### 1. `report` method

Any two of these, with the matching refactoring:

| Smell | Evidence | Refactoring |
|---|---|---|
| Mysterious Name | `s`, `m`, `n`, `i` | Rename Variable: `text`, `move`, `result`, … |
| Duplicated Code | `m.substring(0, 2) + "-" + m.substring(2, 4)` twice | Extract Function `formatMove(String)` |
| Magic Number / type code | `n == 1`, `2`, `3` for the result | Replace Type Code with enum `Result { WHITE_WINS, BLACK_WINS, DRAW }`; Replace Conditional with Polymorphism is overkill here |
| Primitive Obsession | moves are `String`s sliced by position | Replace Primitive with Object (`Move` record) |
| Long Function (mild) | two jobs: list the moves, state the result | Extract Function `movesAsText`, `resultAsText` |
| Repeated Switches (if `n` is switched on elsewhere) | the `if/else if` on `n` | Replace Conditional with Polymorphism, only if there is a second switch |

Not a smell for this course: `String` concatenation in a loop. It is a
performance habit, and the refactoring (`StringBuilder`) does not change
structure in any way we care about today. If someone raises it, say so.

### 2. Capture test

```java
@Test
void pawnCapturesDiagonally() {
    handler.handleTurn("e2e4");
    handler.handleTurn("d7d5");
    assertTrue(handler.handleTurn("e4d5"));
    assertEquals('P', handler.symbolAt("d5"));
    assertEquals('.', handler.symbolAt("e4"));
    assertEquals(List.of("e2e4", "d7d5", "e4d5"), handler.history());
}
```

Passes on both. That tells them the refactoring preserved a behavior the
original tests never checked, which is good news but *not* something the
tests proved. The lesson: a characterization suite is only as strong as its
coverage, and the honest claim after a refactoring is "the tests I have still
pass", not "behavior is unchanged".

### 3. `symbolAt`

Smell: a public method on `TurnHandler` that exists only for the tests
(Fowler would call it Speculative Generality or, loosely, Insider Trading
between the test and the class). It also still contains a parse of a square
string that belongs to `MoveParser`, which it now calls, so that part is
fixed.

Where to move it: onto `Board` as `symbolAt(Square)`, with the tests calling
`handler.board().symbolAt(MoveParser.parseSquare("e4", 0))`, or a small test
helper that renders the board and reads one character. Either way the test
file changes, which is why we did not do it in the demo: the whole demo
rests on the test file not changing. A refactoring that forces the tests to
change is possible but needs its own argument.

### 4. Which are refactorings

- (a) **No.** Printed output changes. `pawnCannotAdvanceThreeSquares` and
  `unreadableStringIsRejected` fail.
- (b) **No**, though it looks structural. `parseSquare("e2e9", 2)` would now
  throw instead of returning a square that fails `isOnBoard()`, and
  `offBoardSquareIsRejected` fails with an exception instead of a false. To
  make it a refactoring you would have to catch the exception in
  `MoveParser.parse`, which is a worse design than the check we have.
- (c) **Yes.** `isWhite()` can be implemented on top of the enum, nothing
  observable changes, all nine pass. This is Replace Type Code with Enum.
- (d) **No.** The board prints twice after each move;
  `oneMovePrintsAnnouncementAndBoard` fails.

### 5. On their own repository

Nothing to grade. In class on Wednesday, ask who did it and what they
renamed. Watch for the student who "refactored" `legalMoves()` by adding the
king-safety filter: that is the two-hats mistake, and worth a public, kind
correction.

## Things not to do today

- Do not open the reference engine or any student's `Game` on the projector.
  Today's code is the demo project only.
- Do not show `MoveGenerator`. M4 is due in a week; describe it as "move the
  loop into its own class, same list of moves" and nothing more.
- Do not fix the demo's redundant `target.isWhite() != isWhite()` check in
  `Pawn.isDiagonalCapture` live. It is harmless, and removing it is a
  behavior argument, not a structure one.
