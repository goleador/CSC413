# Session 12 — Information Hiding and Clean Code · outline for approval

**Wednesday October 7 · 75 min · Objectives 2, 3, 4 · M4 due Mon Oct 12 (deadline only)**

Demo code: `demos/session-12-information-hiding/`, a continuation of Monday's
`after/`. Same nine tests plus two new ones. No engine code, no milestone bodies.

## Hook (0–8 min)

Open Monday's `after/`. Add one innocent method, `public Board getBoard()`,
"so the view can draw the board". Then, in `Main`, two lines:

```java
handler.getBoard().set(MoveParser.parseSquare("e8", 0), null);   // black king gone
System.out.println(handler.history());                            // []
```

Run it. The king is gone, the history is empty, it is still White's turn, and
all nine tests are green. Ask: **whose fault is this, and what did `private`
buy us?** Let the room argue for two minutes. Answer: `private` hid the field,
not the object. The accessor handed out the thing the field was protecting.

## Concept block 1 — A boundary hides a decision (8–22 min)

- Parnas (1972): a module hides one design decision that is likely to change;
  its interface exposes only what is stable. Slide with the paper's title and
  one sentence.
- Three decisions `TurnHandler` is currently hiding, and one it leaks:
  how squares are stored (`Piece[][]`, hidden), how a move is parsed
  (`MoveParser`, hidden), how the board is printed (`BoardPrinter`, hidden),
  and **that the board can be edited without playing a move** (leaked by
  `getBoard()`).
- The invariants a boundary exists to keep: *every change to the board goes
  through `play`; `history` and the board agree; `whiteToMove` flips exactly
  once per entry*. Written as three bullets, revisited after the demo.
- Reveal slide: four ways to stop the leak and what each costs.
  Return nothing (the printer moves inside). Return a copy (slow, callers may
  edit the copy and be confused). Return a rendered `String` (view decides
  nothing). Return a **read-only view** (an interface with only `get`). We do
  the last one.

## Concept block 2 — Clean code is what makes the boundary visible (22–32 min)

- Names are the interface's documentation: `play` vs `set`, `isLegal` vs
  `flag`. Monday's "read it aloud" test, now applied to a class, not a method.
- Small public surface: count the `public` methods on `TurnHandler` before
  and after. Every public method is a promise you keep forever.
- Comments: say *why*, never *what*. One good example from the demo
  (the pawn's forward square is not an attack), one bad one (`// undo`).
- Short, no slide code beyond what the demo shows.

## Demo (32–57 min) — `before/` → `after/`, tests after every step

Instructor script with IntelliJ shortcuts (macOS / Windows) in
`DEMO-SCRIPT.md`, one git tag per step, same mechanism as Monday.

1. **Characterize the leak.** New test `boardAccessorExposesMutation` that
   does exactly what the hook did and asserts the king is gone. It passes.
   Say: a characterization test can pin a bug. We keep it until step 4 makes
   it impossible to write.
2. **Extract Interface** (Refactor This → Extract Interface, ⌃T / Ctrl+Alt+Shift+T)
   on `Board`: `BoardView` with `get(Square)` and `isPathClear` only.
3. **Change Signature** (⌘F6 / Ctrl+F6) on `getBoard()`: return type
   `BoardView`; rename to `board()`. `BoardPrinter.print(BoardView)`. The
   `set` call in `Main` no longer compiles: that is the result.
4. Delete the characterization test from step 1, because it cannot be written
   any more. Replace it with `historyIsACopy` (`handler.history().clear()`
   does not change the next call) and a test that the printer works through
   a `BoardView`.
5. **Encapsulate** the remaining leak: `Piece` subclasses reach `board.get`
   through `BoardView` too, so a piece can never change the board while
   deciding whether it may move. Change `canMoveTo(Board, …)` to
   `canMoveTo(BoardView, …)` with Change Signature; nine files, one shortcut.
6. **Rename** anything that now lies. `TurnHandler` → `Game`? Ask the room;
   do what they say if the tests stay green.

End state: `after/` with `BoardView`, eleven tests green, `Main` unable to
edit the board.

## In-class exercise (57–68 min), in pairs

A fifteen-line `Scoreboard` class on a slide: public `int[] points`, a
`List<String> getPlayers()` that returns the field, and an `addResult` that
keeps a `leader` field in sync. Students list **three things a caller can
break without calling any method named `add`**, and propose a fix for each.
Collect: one break and one fix per pair. Answers in `notes-INSTRUCTOR-ONLY.md`.

## Exit question (68–75 min)

> Your M3 `history()` returns a copy. Name the invariant the copy protects,
> and one line a caller could write, without the copy, that breaks it.

Written, one index card each. (The copy is a graded M3 criterion the handout
already states; the question asks for the reason, not the code.)

## What this session does not do

- No `MoveGenerator`, no `isInCheck`, no attack queries, no apply/undo trial.
  M4 is mentioned once, as a deadline. M5 is not mentioned.
- No `BoardView` on the real engine: the demo project only. If a student asks
  whether to add one to their repository, the answer is "after M4, as its own
  commit".

## Deliverables once approved

`notes.md` (1,800–2,800 words, same section order), `slides.md` + `slides.html`
(18–25 slides), `notes-INSTRUCTOR-ONLY.md`, `demos/session-12-information-hiding/
{before,after,steps,DEMO-SCRIPT.md,build-demo-repo.sh}` with tests green in
both and the step sequence replayed.
