# Session 12 — Information Hiding and Clean Code · outline for approval

**Wednesday October 7 · 75 min · Objectives 2, 3, 4 · M4 due Mon Oct 12 (deadline only)**

Revised October 6. One definition, *encapsulation is controlling what other
code may know about an object and do to it*, and the eight points that
argue it. The `Board` leak is the hook and the example for point 4, and
nothing else. Every chess example is code the students have written:
`Position` (session 3, M1), `Board` (M1–M3), `Game` (M3), the four packages
(session 9), the `BoardView` sketch (session 10). Nothing from M4's bodies,
nothing from M5.

## Hook (0–6 min)

Two lines in a scratch `Main`: `game.board().place(e8, null)`, then print
the history. King gone, history empty, 42 tests green. Whose fault?
`private` hid the field, not the object. Move on.

## The definition (6–10 min)

What they arrived with versus what to leave with. Three goals: protect
invariants, hide decisions that might change, reduce coupling.

## The eight points (10–60 min)

1. **`private` is a mechanism, not encapsulation.** `BankAccount` with a
   setter versus with `deposit`/`withdraw`. (5 min)
2. **The central idea is protecting invariants.** Define the word. Table of
   three. `Position`'s compact constructor, live: `new Position(8, 0)`
   throws. `Game`'s three invariants and its two operations. (10 min)
3. **Hide decisions that might change.** `pieceAt` over `Piece[8][8]`;
   `Piece[64]` would change no caller. Parnas, coupling. (5 min)
4. **Don't leak mutable state.** `board()` returns the object; `history()`
   returns a copy. Live: `history().clear()` throws. The fix: `BoardView`,
   with `Game.board()` declared to return it. Live: Extract Interface on
   `Board`, read methods only, `Game` closed, revert. Not yet, M4 is open.
   (12 min)
5. **Tell objects what to do.** `game.play(move)` versus the outside half.
   Caller: call `play`. Designer: expose `play`, no way around it. (6 min)
6. **Not about hiding everything.** `Position` and `Move` are records. The
   question is what another part needs. (4 min)
7. **Boundaries above the class.** Packages, the `Game` Javadoc rule, the
   `Board` comment about `factory`; service reading another's tables. (5 min)
8. **Encapsulation has a cost.** Hide what callers should not depend on, no
   more. (3 min)

## Close (60–75 min)

Mental model and the four questions, asked of `Game` out loud. The diagram:
easier to change. Exit card:

> Your `history()` returns a copy. Name the invariant the copy protects, and
> write the one line a caller could type, without the copy, that breaks it.

## What this session does not do

- No `MoveGenerator` bodies, no king safety, no M5.
- No edits to `Game` on the projector. No student exercises; the exit card
  is the only thing students write.
