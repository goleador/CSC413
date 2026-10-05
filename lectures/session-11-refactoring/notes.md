# Session 11 — Refactoring and Code Smells

**Week 7, Monday October 5 · CSC 413 Software Development**

**Objectives advanced:** 3 (analyze maintainability, cohesion, coupling, and responsibilities), 4 (refactor poorly designed code)

**Milestones:** M3 due tonight, Monday October 5, 11:59 PM. M4 due Monday October 12, 11:59 PM.

## 1. Where your `Game` is tonight

M3 gave the engine a `Game`. It has a `Board`, a `Color` for the side to move,
and a `List<Move>` of the moves played. Four methods do the work:

| Method | What it answers |
|---|---|
| `legalMoves()` | every pseudo-legal move of every piece belonging to the side to move |
| `findLegalMove(String)` | which of those moves, if any, the player typed |
| `play(Move)` | plays one of them, records it, and hands the turn over |
| `undoLastMove()` | takes the last one back |

`legalMoves()` is a walk: visit each square that holds a piece of the side to
move, ask that piece for its moves, collect the answers. Forty-two tests are
green. It is a good design for what it has to do.

Then the next rule arrives. M5 will require that **a move may not leave your
own king in check**. Where does that go? In `play`, before the board changes?
Inside `legalMoves()`, as a filter? In each piece? Hold your answer. A
different question comes first: how would you even check it?

## 2. The question that changes the design

Work through these in order. Each answer is one sentence, and you already
know every one of them.

**When is a king in check?** When an enemy piece could capture it on the next
move.

**How do you know whether one enemy piece could capture it?** Ask the piece.
M2 gave every piece `pseudoLegalMoves(board, from)` and
`attacks(board, from, target)`. That was the point of the hierarchy: the piece
knows how it moves, and nobody else has to.

**How do you know whether *any* enemy piece could?** Walk every square that
holds an enemy piece and ask each one. You have written that walk already. It
is `legalMoves()`.

**So can `legalMoves()` answer it for the enemy?** No, three times over. It
walks the pieces of `sideToMove`, not the enemy's. It is a method of `Game`,
and `Game` is about a turn: it keeps history and hands turns over, which is the
wrong thing to be holding when all you want is a question about a position.
And king safety needs the walk on the board *after* a trial move, not on the
game's current board.

**What does the walk actually need, then?** A board and a color. Nothing else.
What does it read instead? A field, `sideToMove`, which only exists because
`Game` has a turn. The loop's real inputs are hidden behind a field it happens
to have access to. That is a smell, and it has a name in section 4.

**If a function needs only a board and a color, whose method is it?** Not
`Game`'s: `Game` has no business being asked about the enemy's moves on a
hypothetical board. Not `Board`'s: `Board` stores pieces and decides nothing,
a line we drew in M1 and have kept since. It belongs to a class whose only job
is to answer questions about a position. Such a class has no turn and no
history, so it has nothing to remember between calls, so its methods can be
`static` and there is nothing to construct.

You have just designed M4. The handout names the class and its two methods and
gives the order to do it in. What the handout cannot give you is the reason,
and now you have it: the rule that arrives next week needs the walk a second
time, for the other side, on a board that is not the game's. The moment a piece
of code is needed from a second place, its hidden inputs have to become
parameters, and it has to move to where both callers can reach it.

## 3. What you just did is called refactoring

**Refactoring is a change to the structure of a program that does not change
its observable behavior.** That is Fowler's definition (*Refactoring*, 2nd
ed., 2018), and it has a sharp edge. Moving the walk out of `Game` into a new
class, with `Game.legalMoves()` asking that class and returning the same list,
is a refactoring. Filtering the list for king safety is not: the list gets
shorter. Renaming a variable is a refactoring. Fixing a bug is not, however
small the edit, because the program now does something different.

"Observable" means everything a caller can notice. For `legalMoves()` that is
the list of moves and their order; the board after the call, which must be
untouched; whose turn it is; the history; and, standing in for all of it, the
forty-two tests. A refactoring that changes one of those is a bug with good
intentions.

How do you know you preserved behavior? Not by reading. You know because tests
that were green before are green after, **and the tests did not change**.
This is why M4 starts from a green M3. If your M3 is red, M4 is not a
refactoring. It is two jobs at once, and section 6 is about why that hurts.

## 4. The smells in this story, named

A **code smell** is something in the code that is not a bug but usually points
at one coming. Fowler's catalog (chapter 3) names about two dozen. These are
the ones in `Game`'s story, with the refactoring that answers each and the
IntelliJ command that performs it:

| What you noticed | Fowler's name | The refactoring (catalog name) | IntelliJ · macOS / Windows |
|---|---|---|---|
| The walk reads `sideToMove`, a field, when its real input is a color | a hidden input; **Feature Envy** when the data belongs to another object | Parameterize Function, Change Function Declaration | Change Signature ⌘F6 / Ctrl+F6 |
| `Game` would change for two unrelated reasons: how turns work, and what "legal" means | **Divergent Change** | Extract Class, Move Function | Move F6 |
| The walk is needed in two places, so it would soon exist twice | **Duplicated Code** | Extract Function, then call it from both | Extract Method ⌥⌘M / Ctrl+Alt+M |
| Putting the king filter inside the existing loop makes one method with two jobs | **Long Function** | Extract Function | ⌥⌘M / Ctrl+Alt+M |
| Writing "is the king attacked?" as a `switch` on piece type | **Repeated Switches** | Replace Conditional with Polymorphism; M2 already did it, so ask `Piece.attacks` | — |
| `p`, `x`, `tmp` in your own code | **Mysterious Name** | Rename Variable | ⇧F6 / Shift+F6 |

Two of these deserve a sentence. **Divergent Change** is Fowler's name for
what session 9 called low cohesion: one class you edit for several unrelated
reasons. **Repeated Switches** is the smell session 6 spent an hour on, and it
comes back the moment someone writes attack detection as a `switch` over piece
types instead of asking the pieces.

## 5. The moves M4 needs, and how the IDE does them

M4 is three moves, and IntelliJ has a command for each. Learn them on
something you have already finished, then do M4 with them.

**Extract Method (⌥⌘M / Ctrl+Alt+M).** Select a block of code; IntelliJ works
out which variables flow in and out, picks parameters and a return type, and
replaces the block with a call. If the same block exists elsewhere in the
class, it offers to replace that too.

**Change Signature (⌘F6 / Ctrl+F6).** Add, remove, reorder, or rename
parameters, and IntelliJ updates every caller. This is the move that turns a
hidden input into a parameter: add the parameter, give the existing callers a
default value, and replace the field use inside the body.

**Move (F6).** Moves a method or a class to another class or package and fixes
every reference. For a method that reads no instance fields, IntelliJ offers to
make it `static` on the way.

In class we ran these on the M2 pieces in the follow-along repository, code
that has been done for a week. `Piece.slidingMoves` is the shared slide loop
that `Rook`, `Bishop`, and `Queen` call. We inlined it into `Rook` (⌥⌘N), so
`Rook` carried its own copy again, ran the tests, then extracted it back
(⌥⌘M), watched the direction table show up as a hidden input, made it a
parameter (⌘F6), and pulled the method up to `Piece` (Refactor This, ⌃T /
Ctrl+Alt+Shift+T, Pull Members Up). Four moves, tests after each, and the
file ended where it started. Every one of those moves is one M4 asks of the
walk in `Game`:

| On the slide loop | On the generation loop, this week |
|---|---|
| the direction table, a field, became a parameter | `sideToMove`, a field, becomes a `Color` parameter |
| the loop moved from `Rook` to `Piece`, where every slider can reach it | the loop moves from `Game` to a class with no state, where `Game` and M5 can both reach it |
| `Rook` became one line | `Game.legalMoves()` becomes one line |
| ten movement tests, identical before and after | forty-two tests, identical before and after |

The rhythm is the lesson: one move, run the tests, read the diff, commit. Then
the next move. Small commits make `git reset --hard` to the last green state a
thirty-second recovery instead of an evening.

## 6. Refactor first, then add the feature

Kent Beck describes two hats. Wearing the refactoring hat, you change
structure and run the existing tests; they must stay green. Wearing the
feature hat, you write a new test that fails and make it pass. You may switch
hats as often as you like. You never wear both, and never in one commit.

The reason is diagnostic. Suppose you move the walk and add the king filter in
the same edit, and a test goes red. Is the move wrong, or the filter, or the
test's idea of the filter? Three explanations, one failure. Keep the jobs
apart and each red test has one cause.

This is why M4 and M5 are two milestones. **M4 is the refactoring.** The walk
moves, the list of moves is identical, the forty-two tests stay green from the
first step to the last, and the diff shows a cut and a paste plus one line.
**M5 is the feature.** The list changes: moves that expose your king disappear,
and new tests say so. If you find yourself writing king-safety code during
M4, stop. You have both hats on.

## 7. Exercises

**1. Read your own loop.** Open your `Game.legalMoves()`. List every field it
reads. For each one, say whether a caller who had only a `Board` could supply
it as an argument. Write the signature you would want *before* you open the
M4 handout, then compare.

**2. Which of these are refactorings of `Game`?** For each, say whether the
observable behavior changes and name a test that would notice. (a) Renaming
the field `history` to `played`. (b) Making `history()` return the live list
instead of a copy. (c) Making `legalMoves()` return the moves sorted by
destination. (d) Moving the walk to a new class and having `legalMoves()`
return what that class returns.

**3. `Piece.attacks`** is written once, on the base class, as "is `target`
among my moves". One piece needs its own version. Which, and why? What would
go wrong in M5 if it did not have one?

**4. The order of work.** M4's handout lists three steps and says the tests
pass after step 2. Explain why the tests cannot tell the difference between
doing step 3 and skipping it, and what you would read instead.

**5. Exit question from class.** Name two smells in this method and the
refactoring that answers each.

```java
public String report(List<String> moves, int n) {
    String s = "";
    for (int i = 0; i < moves.size(); i++) {
        String m = moves.get(i);
        if (i % 2 == 0) {
            s = s + (i / 2 + 1) + ". " + m.substring(0, 2) + "-" + m.substring(2, 4) + " ";
        } else {
            s = s + m.substring(0, 2) + "-" + m.substring(2, 4) + "\n";
        }
    }
    if (n == 1) {
        s = s + "White wins";
    } else if (n == 2) {
        s = s + "Black wins";
    } else if (n == 3) {
        s = s + "Draw";
    }
    return s;
}
```

Solutions and discussion are in the instructor's copy of these notes.

## Reading

- Martin Fowler, *Refactoring*, 2nd ed. (Addison-Wesley, 2018). Chapter 1 is a
  worked example of today's rhythm; chapter 3 is the smell catalog; the
  refactoring catalog is online at
  [refactoring.com/catalog](https://refactoring.com/catalog/).
- IntelliJ IDEA documentation, *Refactoring code*: the automated refactorings
  and their shortcuts.

**Related material:** [M4 handout](../../assignments/m4-move-generator/handout.md),
[session 6 notes](../session-06-piece-hierarchy/notes.md),
[session 9 notes](../session-09-cohesion-coupling/notes.md).
