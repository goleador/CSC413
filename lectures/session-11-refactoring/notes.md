# Session 11 — Refactoring and Code Smells

**Week 7, Monday October 5 · CSC 413 Software Development**

**Objectives advanced:** 3 (analyze maintainability, cohesion, coupling, and responsibilities), 4 (refactor poorly designed code)

**Milestones:** M3 due tonight, Monday October 5, 11:59 PM. M4 due Monday October 12, 11:59 PM.

## 1. You have already refactored once, and you have already been paid for it

Session 7 was a refactoring, though we did not call it that. M1's `Board`
could have grown a `movesFor(Position)` with a `switch` on the piece's type:
one case per kind, the pawn's forty lines next to the knight's eight. Session
6 showed that design and said it works; engines have shipped it. Then session
7 took it apart live: `Piece` became abstract, each case became a class, and
the caller stopped asking what the piece is:

```java
board.pieceAt(from).pseudoLegalMoves(board, from);   // never asks the type
```

Nothing the program did changed that day. The same moves came out for the
same pieces. What changed was the shape.

One week later M2 asked for `attacks(board, from, target)`: does this piece
threaten that square? In the `switch` design that is a second `switch`, six
more cases, and the pawn's case is different from its movement case because
a pawn moves straight and captures diagonally. Miss one case and the compiler
says nothing. In your design it was one default method on `Piece` and one
override in `Pawn`. Open your `Pawn` and look at it. That override is what
the refactoring bought you, and you collected it a week ago.

The same lesson, smaller, is in your sliding pieces. `Rook`, `Bishop`, and
`Queen` all slide until something stops them. Some of you wrote that loop
once, as a helper on `Piece`, and call it three times with different
direction tables. Some of you wrote it three times. Both pass the tests. Now
suppose the slide rule has a bug, say it lets a rook slide through its own
pawn. With one copy you fix it once. With three copies you fix it three
times, or you fix two and forget the queen, and the two tests that cover the
rook and bishop go green while the queen stays wrong. Copies drift. We will
break one in class and watch exactly that happen.

So here is what refactoring is for. **Refactoring is changing the shape of
code, without changing what it does, so that the next change is small.** The
gain is measured one way: how small did the next change become? Session 7's
refactoring turned "a second switch with six cases" into "one override." The
shared slide loop turns "fix it three times" into "fix it once." You do not
refactor because the code is ugly. You refactor because you know what is
coming and the current shape makes it expensive.

## 2. The next change, written both ways

You know what is coming. M5 will require that **a move may not leave your own
king in check.** Here is what checking that needs, in words:

> For each candidate move: try it on the board. Ask whether any piece of the
> *other* color now attacks my king. Take the move back. Keep the candidate
> only if the answer was no.

Two things in that paragraph are new. The board gets changed and restored in
the middle of answering a question. And the question is asked about the
*other* color, in the middle of computing *this* color's moves.

Now write it both ways. Not the code, the shape.

**Inside `Game` as it stands tonight.** Your `legalMoves()` walks the pieces of
`sideToMove`. The attack check needs a walk over the pieces of the opposite
color. So either `Game` grows a second loop, nearly identical to the first
but with the color flipped, or the first loop gets a color parameter, at
which point it no longer reads anything from `Game`. The trial moves call
`board.apply` and `board.undo` from inside `Game`, the class whose promise is
that the board changes only through `play` and `undoLastMove`. And
`legalMoves()` becomes thirty lines doing two jobs: generate candidates, then
filter them. Next come checkmate and stalemate in M8, which ask "is this
color in check, and does it have any legal move?", and perft in M11 and any
AI, which ask "what are the legal moves for this color on this board?" with
no game in hand. Each one either lives inside `Game` too or has to construct
a fake `Game` to ask.

**Beside a walk that takes a board and a color.** The walk's two real inputs
are explicit: a board, a color. The attack check is its sibling: the same
walk, over `color.opposite()`, asking each piece `attacks` instead of
collecting its moves. The filter sits next to both and calls them with the
right color each time. It lives in a class that has no turn and no history
and nothing to remember between calls, so its methods are `static` and there
is nothing to construct. `Game.legalMoves()` is one line that passes its board
and its side to move, and `Game` does not change again when M5, M8, or M11
arrive.

| | Inside `Game`, as it stands | Beside a walk that takes a board and a color |
|---|---|---|
| Where king safety goes | into `legalMoves()`, which doubles in length | one filter, next to the walk it filters |
| Asking about the other color | a second loop, or flip `sideToMove` and flip it back | pass `color.opposite()` |
| Trial `apply` and `undo` | inside the class that promises the board only changes through `play` | inside a class that owns no game and makes no such promise |
| What `Game` changes in M5, M8, M11 | every time | nothing |
| Who can ask "legal moves for Black here?" | only a `Game` with Black to move | anyone with a board |

That table is the gain, and you can read it today. **The reshaping in the
right-hand column is M4.** It moves the walk out of `Game`, gives it its two
inputs as parameters, and leaves `Game.legalMoves()` as one line that returns
exactly the list it returns now. The M4 handout names the class and its two
methods and gives the order of work. The rule itself is M5. Nothing about the
list of moves changes this week; the forty-two tests pin that, and they are
how you know the reshaping did only what it was supposed to.

## 3. What counts as "without changing what it does"

Fowler's definition (*Refactoring*, 2nd ed., 2018): a change to the structure
of a program that does not change its observable behavior. The edge is sharp.
Moving the walk out of `Game` with the same list coming back: refactoring.
Filtering the list for king safety: not refactoring, the list gets shorter.
Renaming a variable: refactoring. Fixing a bug: not refactoring, however small
the edit.

"Observable" means everything a caller can notice. For `legalMoves()` that is
the list of moves and its order, the board after the call (untouched), whose
turn it is, the history, and, standing in for all of it, the forty-two tests.
You do not establish any of that by reading. You establish it because tests
that were green before are green after, **and the tests did not change**.
That is why M4 starts from a green M3. If your M3 is red, M4 is two jobs at
once, and section 6 is about why that hurts.

## 4. The smells in this story, named

A **code smell** is something in the code that is not a bug but usually points
at one coming. Fowler's catalog (chapter 3) names about two dozen. These are
the ones in the two columns above, with the refactoring that answers each and
the IntelliJ command that performs it:

| What you noticed | Fowler's name | The refactoring (catalog name) | IntelliJ · macOS / Windows |
|---|---|---|---|
| The walk reads `sideToMove`, a field, when its real input is a color | a hidden input; **Feature Envy** when the data belongs to another object | Parameterize Function, Change Function Declaration | Change Signature ⌘F6 / Ctrl+F6 |
| `Game` would change for two unrelated reasons: how turns work, and what "legal" means | **Divergent Change** | Extract Class, Move Function | Move F6 |
| The walk needed twice, so it would exist twice; the slide loop in three pieces | **Duplicated Code** | Extract Function, Pull Up Method | Extract Method ⌥⌘M / Ctrl+Alt+M |
| Generate, then filter, in one method | **Long Function** | Extract Function | ⌥⌘M / Ctrl+Alt+M |
| "Is the king attacked?" as a `switch` on piece type | **Repeated Switches** | Replace Conditional with Polymorphism; you did it in session 7, so ask `Piece.attacks` | — |
| `d`, `p`, `tmp` | **Mysterious Name** | Rename Variable | ⇧F6 / Shift+F6 |

**Divergent Change** is Fowler's name for what session 9 called low cohesion:
one class you edit for several unrelated reasons. **Repeated Switches** is
session 6's smell, and it comes back the moment someone writes attack
detection as a `switch` over piece types instead of asking the pieces.

## 5. The moves M4 needs, and how the IDE does them

M4 is three moves, and IntelliJ has a command for each.

**Extract Method (⌥⌘M / Ctrl+Alt+M).** Select a block; IntelliJ works out
which variables flow in and out, picks parameters and a return type, and
replaces the block with a call. If the same block exists elsewhere in the
class, it offers to replace that too.

**Change Signature (⌘F6 / Ctrl+F6).** Add, remove, reorder, or rename
parameters; every caller is updated. This is the move that turns a hidden
input into a parameter: add the parameter, give existing callers a default,
replace the field use in the body.

**Move (F6).** Moves a method or class elsewhere and fixes every reference.
For a method that reads no instance fields, IntelliJ offers to make it
`static` on the way.

In class we used them on code that was finished a week ago, the sliding
pieces, and we started by making the drift from section 1 real. In the
follow-along repository `Piece.slidingMoves` is shared by `Rook`, `Bishop`,
and `Queen`. We inlined it into `Rook` (⌥⌘N), so `Rook` had its own copy
again, and the tests stayed green: that is a refactoring too, in the wrong
direction. Then we "fixed a bug" in `Rook`'s copy only, so a rook could slide
through its own pawn. `rookBlocking` went red; `queenCombinesDirections`
stayed green, because the queen uses the other copy. Two copies, one fix,
one piece wrong. Then the way back: Extract Method on the loop (⌥⌘M), with
`DIRECTIONS` showing up as the hidden input; Change Signature (⌘F6) to make
it a parameter; Pull Members Up (Refactor This, ⌃T / Ctrl+Alt+Shift+T) to
`Piece`; delete the duplicate. Green, one copy, file back where it started.

Every one of those moves is one M4 asks of the walk in `Game`:

| On the slide loop, in class | On the generation loop, this week |
|---|---|
| the direction table, a field, became a parameter | `sideToMove`, a field, becomes a `Color` parameter |
| the loop moved from `Rook` to `Piece`, where every slider reaches it | the loop moves from `Game` to a class with no state, where `Game` and M5 both reach it |
| `Rook` became one line | `Game.legalMoves()` becomes one line |
| the movement tests, identical before and after | the 42 tests, identical before and after |

The rhythm is the lesson: one move, run the tests, read the diff, commit.
Small commits make `git reset --hard` to the last green state a thirty-second
recovery instead of an evening.

## 6. Refactor first, then add the feature

Kent Beck's two hats. Wearing the refactoring hat, you change structure and
run the existing tests; they must stay green. Wearing the feature hat, you
write a new test that fails and make it pass. Switch as often as you like.
Never wear both, and never in one commit.

The reason is diagnostic. Move the walk and add the king filter in the same
edit, and a test goes red. Is the move wrong, or the filter, or the test's
idea of the filter? Three explanations, one failure. Keep the jobs apart and
each red test has one cause.

That is why M4 and M5 are two milestones. **M4 is the refactoring.** The walk
moves, the list is identical, the forty-two tests stay green from the first
step to the last, and the diff shows a cut and a paste plus one line. **M5 is
the feature.** The list changes, and new tests say so. If you find yourself
writing king-safety code during M4, stop. You have both hats on.

## 7. Exercises

**1. Read your own loop.** Open your `Game.legalMoves()`. List every field it
reads. For each, say whether a caller who had only a `Board` could supply it
as an argument. Write the signature you would want *before* you open the M4
handout, then compare.

**2. Count your copies.** How many times does the slide-until-blocked loop
appear in your `model` package? If more than once: extract it with the IDE,
tests after each step, and commit the extraction on its own. If once: find
the step loop shared by `Knight` and `King` and answer the same question.

**3. Which of these are refactorings of `Game`?** For each, say whether the
observable behavior changes and name a test that would notice. (a) Renaming
the field `history` to `played`. (b) Making `history()` return the live list
instead of a copy. (c) Making `legalMoves()` return the moves sorted by
destination. (d) Moving the walk to a new class and having `legalMoves()`
return what that class returns.

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
  catalog of refactorings is at
  [refactoring.com/catalog](https://refactoring.com/catalog/).
- IntelliJ IDEA documentation, *Refactoring code*.

**Related material:** [M4 handout](../../assignments/m4-move-generator/handout.md),
[session 6 notes](../session-06-piece-hierarchy/notes.md),
[session 7 notes](../session-07-piece-refactor/notes.md),
[session 9 notes](../session-09-cohesion-coupling/notes.md).
