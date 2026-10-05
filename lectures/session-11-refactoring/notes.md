# Session 11 — Refactoring and Code Smells

**Week 7, Monday October 5 · CSC 413 Software Development**

**Objectives advanced:** 3 (analyze maintainability, cohesion, coupling, and responsibilities), 4 (refactor poorly designed code)

**Milestones:** M3 due tonight, Monday October 5, 11:59 PM. M4 due Monday October 12, 11:59 PM.

## 1. You have already refactored once, and you have already been paid for it

Session 7 was a refactoring, though we did not call it that. Session 6 showed
the design most people write first for piece movement: one method, one
`switch`, one case per kind of piece.

```java
// in Board, or in a new MoveRules class
public List<Move> movesFor(Position from) {
    Piece piece = pieceAt(from);
    switch (piece.type()) {
        case KNIGHT -> { /* the eight L-shaped offsets */ }
        case BISHOP -> { /* slide along four diagonals until blocked */ }
        case ROOK   -> { /* slide along four straight lines until blocked */ }
        case QUEEN  -> { /* both of the above */ }
        case KING   -> { /* one step in eight directions */ }
        case PAWN   -> { /* forward one; two from the start rank; capture
                            diagonally; promote on the last rank; ... */ }
    }
}
```

It works, and engines have shipped it. Session 7 took it apart live. `Piece`
became abstract with one new method, each case became a class, and the
caller stopped asking what the piece is:

```java
public abstract class Piece {
    ...
    public abstract List<Move> pseudoLegalMoves(Board board, Position from);
}

public class Knight extends Piece {
    private static final int[][] OFFSETS = { { 1, 2 }, { 2, 1 }, { 2, -1 }, { 1, -2 },
                                             { -1, -2 }, { -2, -1 }, { -2, 1 }, { -1, 2 } };
    @Override
    public List<Move> pseudoLegalMoves(Board board, Position from) {
        return steppingMoves(board, from, OFFSETS);
    }
}

// the caller, anywhere in the program:
board.pieceAt(from).pseudoLegalMoves(board, from);   // never asks the type
```

Nothing the program did changed that day. The same moves came out for the
same pieces. What changed was the shape.

One week later M2 asked a second question of every piece: *does this piece
attack that square?* In the `switch` design that is a second method with a
second six-way `switch`:

```java
// the switch design, one week later
public boolean attacks(Position from, Position target) {
    Piece piece = pieceAt(from);
    switch (piece.type()) {
        case KNIGHT -> { /* is target one of the eight offsets? */ }
        case BISHOP -> { /* slide the diagonals again, looking for target */ }
        case ROOK   -> { /* slide the lines again */ }
        case QUEEN  -> { /* both, again */ }
        case KING   -> { /* one step, again */ }
        case PAWN   -> { /* NOT the movement rule: the two forward diagonals */ }
    }
}
```

Six cases, five of them repeating work the first switch already does, and
the pawn's case different from its movement case because a pawn moves
straight and captures diagonally. Miss one and the compiler says nothing. In
your design, it was this:

```java
// Piece: the default, true for five of the six pieces
public boolean attacks(Board board, Position from, Position target) {
    for (Move move : pseudoLegalMoves(board, from)) {
        if (move.to().equals(target)) {
            return true;
        }
    }
    return false;
}

// Pawn: the one piece whose attacks are not its moves
@Override
public boolean attacks(Board board, Position from, Position target) {
    int direction = color().pawnDirection();
    Position diagonal1 = from.offsetOrNull(1, direction);
    Position diagonal2 = from.offsetOrNull(-1, direction);
    return target.equals(diagonal1) || target.equals(diagonal2);
}
```

One default method and one override. Open your `Pawn` and look at it. That
override is what the refactoring bought you, and you collected it a week ago.

The same lesson, smaller, is in your sliding pieces. `Rook`, `Bishop`, and
`Queen` all slide until something stops them. Written the direct way, each
one carries the loop:

```java
// Rook, written on its own; Bishop and Queen the same with their own DIRECTIONS
@Override
public List<Move> pseudoLegalMoves(Board board, Position from) {
    List<Move> moves = new ArrayList<>();
    for (int[] d : DIRECTIONS) {
        Position to = from.offsetOrNull(d[0], d[1]);
        while (to != null) {
            Piece p = board.pieceAt(to);
            if (p == null) {
                moves.add(Move.quiet(from, to, this));
            } else {
                if (p.color() != color()) {
                    moves.add(Move.capture(from, to, this, p));
                }
                break;
            }
            to = to.offsetOrNull(d[0], d[1]);
        }
    }
    return moves;
}
```

Sixty lines across three files, identical except for the table. Written
once, the loop is a helper on `Piece` that takes the table as a parameter,
and each piece is one line:

```java
// Piece
protected List<Move> slidingMoves(Board board, Position from, int[][] directions) {
    ... the same loop, over `directions` instead of a field ...
}

// Rook
@Override
public List<Move> pseudoLegalMoves(Board board, Position from) {
    return slidingMoves(board, from, DIRECTIONS);
}
```

Both versions pass the same tests. Now suppose the slide rule has a bug, say
it lets a rook slide through its own pawn. With one copy you fix it once.
With three you fix it three times, or you fix two and forget the queen, and
the rook and bishop tests go green while the queen stays wrong. Copies drift.
We will break one in class and watch exactly that happen.

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
at one coming. Fowler's catalog (chapter 3) names about two dozen. Here are
the ones in this story, each pointed at the line it lives on:

**The walk reads a field it should take as a parameter.** The line is
`for (Position from : board.positionsOf(sideToMove))`. The signature,
`legalMoves()`, says the method takes nothing; its answer depends on
`sideToMove`. So nobody can ask the same question about the other color
without changing the game's state first. Fowler does not name this smell; he
names the fix, **Parameterize Function** (chapter 11), and its motivation is
exactly this: two callers want the same logic with one value varying. The
IDE command is Change Signature (⌘F6 / Ctrl+F6).

**One class, two reasons to change.** `Game` as a file. `play`,
`undoLastMove`, `history`, and `sideToMove` are about running a turn, and
that part is finished tonight. `legalMoves()` is about the rules of chess,
and the rules change in M5, M8, and M12. Every one of those would edit
`Game`. Fowler: **Divergent Change**, what session 9 called low cohesion. The
fix is **Extract Class** and **Move Function**; the IDE command is Move (F6).

**The same loop, twice.** The walk, "for each square in `positionsOf(color)`,
ask `pieceAt(square)`," would appear once collecting moves and once asking
`attacks`. The version you can already see is the slide loop in section 1:
twenty lines in `Rook`, `Bishop`, and `Queen`, identical except for the
table. Fowler: **Duplicated Code**. The fix is **Extract Function** and, for
the pieces, **Pull Up Method**; the IDE command is Extract Method (⌥⌘M /
Ctrl+Alt+M).

**One method, two jobs.** What `legalMoves()` becomes if the filter goes
inside it: a paragraph that generates candidates, then a paragraph that
tries each one, checks, and undoes. Thirty lines under one name. Fowler:
**Long Function**. The fix is **Extract Function**.

**A switch on the kind of piece, again.** `switch (piece.type())` in
`movesFor`, then again in `attacks`, then again for piece values. The easy
wrong way to write "is the king attacked?" in M5 is a third one. Fowler:
**Repeated Switches**. The fix is **Replace Conditional with Polymorphism**,
which you did in session 7, so the answer in M5 is to ask `Piece.attacks`.

**Names that say nothing.** `d` and `p` in the slide loop. Fowler:
**Mysterious Name**. The fix is **Rename Variable** (⇧F6 / Shift+F6), and it
is the one you can do in thirty seconds today.

| Line | Smell | Refactoring | IntelliJ · macOS / Windows |
|---|---|---|---|
| `positionsOf(sideToMove)` inside `legalMoves()` | a field used where a parameter belongs | Parameterize Function | Change Signature ⌘F6 / Ctrl+F6 |
| `Game`: turn-running and rules in one class | Divergent Change | Extract Class, Move Function | Move F6 |
| the slide loop in three pieces; the walk needed twice | Duplicated Code | Extract Function, Pull Up Method | Extract Method ⌥⌘M / Ctrl+Alt+M |
| generate, then filter, in `legalMoves()` | Long Function | Extract Function | ⌥⌘M / Ctrl+Alt+M |
| `switch (piece.type())`, a second and third time | Repeated Switches | Replace Conditional with Polymorphism | done in session 7 |
| `d`, `p` | Mysterious Name | Rename Variable | ⇧F6 / Shift+F6 |

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
