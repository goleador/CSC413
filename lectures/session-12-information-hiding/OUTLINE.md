# Session 12 — Information Hiding and Clean Code · outline for approval

**Wednesday October 7 · 75 min · Objectives 2, 3, 4 · M4 due Mon Oct 12 (deadline only)**

Examples come from the engine as the students have built it. No new code
base, no milestone bodies. Monday ended on the question this session opens.

## Hook (0–8 min)

`Game.board()` returns the game's `Board`. The M3 handout required it, and a
renderer needs it. On the projector, two lines in a scratch `Main`:

```java
game.board().place(Position.parse("e8"), null);   // the black king is gone
System.out.println(game.history());                // []
```

The king is gone, the history is empty, it is still White's turn, and all 42
tests are green. Ask: **whose fault is this, and what did `private` buy us?**
Let the room argue for two minutes. `private` hid the field, not the object.
The accessor handed out the thing the field was protecting.

## Concept block 1 — A boundary hides a decision (8–22 min)

- Parnas (1972): a module hides one decision likely to change; the interface
  exposes only what is stable.
- Three decisions `Game` hides, and one it leaks: how squares are stored
  (`Board`, hidden), how a move is matched to text (`findLegalMove`, hidden),
  how moves are generated (after M4, hidden behind one call), and **that the
  board can be edited without playing a move** (leaked by `board()`).
- The invariants a boundary exists to keep: every change to the board goes
  through `play` or `undoLastMove`; `history` and the board agree;
  `sideToMove` flips once per entry. Three bullets, revisited at the end.
- Four ways to stop the leak and what each costs: return nothing (renderer
  moves inside), return a copy (slow, and callers edit the copy), return a
  rendered `String` (the view decides nothing), return a **read-only view**
  (an interface with `pieceAt` and `positionsOf` only). Session 10 sketched
  the last one as `BoardView`; this is where it earns its name.

## Concept block 2 — Clean code makes the boundary visible (22–32 min)

- Names are the interface's documentation: `play` versus `place`, `legalMoves`
  versus `moves`. Monday's "read it aloud" test applied to a class.
- Small public surface: count the public methods on `Game`. Each one is a
  promise kept forever.
- Comments say *why*, never *what*. One good example from their own code, one
  bad one.

## Active work (32–57 min), on their own repositories

1. Everyone lists the public methods of their `Game` and, for each, writes
   what a caller can do with the result that `Game` would not know about.
   `board()` and `history()` are the two that matter; `history()` is safe
   because M3 required a copy. (10 min, pairs, cards collected.)
2. Instructor, on the follow-along repository, **only `Board.java` and a new
   interface**: Extract Interface (Refactor This → Extract Interface) on
   `Board` to a `BoardView` with the read methods. Do not change `Game`; M4 is
   open and `Game.legalMoves()` is this week's edit. Say why you stop there.
   (10 min)
3. Pairs: which methods belong on `BoardView`? Which must stay off it, and
   what breaks if `apply` is on it? (5 min)

## Exit question (57–75 min)

> Your `history()` returns a copy. Name the invariant the copy protects, and
> write the one line a caller could type, without the copy, that breaks it.

Index card. The copy is a graded M3 criterion the handout already states; the
question asks for the reason, not the code.

## What this session does not do

- No `MoveGenerator`, no `isInCheck`, no attack queries, no apply/undo trial.
  M4 is mentioned as a deadline. M5 is not mentioned.
- No edits to `Game` on the projector. If a student asks whether to add a
  `BoardView` to their repository, the answer is "after M4, as its own commit".

## Deliverables once approved

`notes.md` (1,800–2,800 words, same section order), `slides.md` and
`slides.html` (18–25 slides), `notes-INSTRUCTOR-ONLY.md`.
