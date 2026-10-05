# Session 11 — Refactoring and Code Smells

**Week 7, Monday October 5 · CSC 413 Software Development**

**Objectives advanced:** 3 (analyze maintainability, cohesion, coupling, and responsibilities), 4 (refactor poorly designed code)

**Milestones:** M3 due tonight, Monday October 5, 11:59 PM. M4 due Monday October 12, 11:59 PM.

Today's code is not the chess engine. It is a small chess-flavored program in
[`demos/session-11-refactoring`](../../demos/session-11-refactoring/), written
so that we can take a working, tangled method apart in class without touching
anyone's milestone. Open `before/` in IntelliJ and follow along; `after/` is
where we end up.

## 1. A classmate wrote this. It works.

`TurnHandler.handleTurn` takes a string such as `"e2e4"`, plays the move if it
is legal, and prints the board. Nine tests pass. Here it is, in full:

```java
public boolean handleTurn(String input) {
    if (input == null || input.length() != 4) {
        System.out.println("Cannot read move: " + input);
        return false;
    }
    int x = input.charAt(0) - 'a';
    int y = input.charAt(1) - '1';
    int x2 = input.charAt(2) - 'a';
    int y2 = input.charAt(3) - '1';
    if (x < 0 || x > 7 || y < 0 || y > 7) {
        System.out.println("Cannot read move: " + input);
        return false;
    }
    if (x2 < 0 || x2 > 7 || y2 < 0 || y2 > 7) {
        System.out.println("Cannot read move: " + input);
        return false;
    }
    Piece p = board.get(x, y);
    if (p == null || p.white != whiteToMove) {
        System.out.println("Illegal move: " + input);
        return false;
    }
    Piece tmp = board.get(x2, y2);
    if (tmp != null && tmp.white == p.white) {
        System.out.println("Illegal move: " + input);
        return false;
    }
    int dx = x2 - x;
    int dy = y2 - y;
    boolean flag = false;
    switch (p.type) {
        case 'N':
            flag = (Math.abs(dx) == 1 && Math.abs(dy) == 2) || (Math.abs(dx) == 2 && Math.abs(dy) == 1);
            break;
        case 'K':
            flag = Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx != 0 || dy != 0);
            break;
        case 'R':
            flag = (dx == 0 || dy == 0) && (dx != 0 || dy != 0) && chk(x, y, x2, y2);
            break;
        case 'B':
            flag = Math.abs(dx) == Math.abs(dy) && dx != 0 && chk(x, y, x2, y2);
            break;
        case 'Q':
            flag = (dx == 0 || dy == 0 || Math.abs(dx) == Math.abs(dy)) && (dx != 0 || dy != 0) && chk(x, y, x2, y2);
            break;
        case 'P':
            int dir = p.white ? 1 : -1;
            int start = p.white ? 1 : 6;
            flag = (dx == 0 && dy == dir && tmp == null)
                    || (dx == 0 && dy == 2 * dir && y == start && tmp == null && board.get(x, y + dir) == null)
                    || (Math.abs(dx) == 1 && dy == dir && tmp != null && tmp.white != p.white);
            break;
    }
    if (!flag) {
        System.out.println("Illegal move: " + input);
        return false;
    }
    board.set(x2, y2, p);
    board.set(x, y, null);
    history.add(input);
    whiteToMove = !whiteToMove;
    System.out.println((p.white ? "White" : "Black") + " plays " + input);
    for (int r = 7; r >= 0; r--) {
        StringBuilder sb = new StringBuilder();
        sb.append(r + 1).append("  ");
        for (int f = 0; f < 8; f++) {
            Piece q = board.get(f, r);
            sb.append(q == null ? '.' : q.symbol());
            if (f < 7) {
                sb.append(' ');
            }
        }
        System.out.println(sb);
    }
    System.out.println();
    System.out.println("   a b c d e f g h");
    return true;
}
```

The only other method in the file is the helper the sliding pieces call.
Its name tells you nothing; its body says that every square strictly between
the two given squares must be empty, so a rook cannot slide through a pawn:

```java
// every square strictly between (a,b) and (c,d) is empty
private boolean chk(int a, int b, int c, int d) {
    int sx = Integer.signum(c - a);
    int sy = Integer.signum(d - b);
    int f = a + sx;
    int r = b + sy;
    while (f != c || r != d) {
        if (board.get(f, r) != null) {
            return false;
        }
        f += sx;
        r += sy;
    }
    return true;
}
```

Now the assignment changes: a move that leaves your own king in check must be
refused. Where in those eighty lines does that go? Before the `switch`? Inside
one of its cases? After `flag` is computed but before the board changes? Every
answer is a guess, because the method does six jobs and the new rule touches
three of them. The problem is not that the code is wrong. It is that the code
cannot be *changed* with confidence. That is what refactoring is for.

## 2. Refactoring, and why the tests come first

**Refactoring is a change to the structure of a program that does not change
its observable behavior.** Martin Fowler's definition, from *Refactoring*
(2nd edition, 2018), adds "to make it easier to understand and cheaper to
modify." Both halves matter. Renaming a variable is a refactoring. Fixing a
bug is not, even if it is a one-character change, because the program now does
something different. Adding king safety is not, because `legalMoves()` returns
a different list.

"Observable" is wider than it sounds. For `handleTurn` it includes the return
value, every line printed, the board afterwards, whose turn it is, and the
history list. A refactoring that leaves the pawn on e4 but prints the board
one line early has changed behavior.

How do you know you preserved it? You cannot by reading. The method is eighty
lines, you are about to touch most of them, and your attention is finite. You
know because **a test suite that passed before passes after, unchanged.** This
is why refactoring without tests is just editing, and why the tests come
before the first rename.

`before/` has no tests when the classmate hands it over, so we write
**characterization tests**: tests that record what the code does *today*,
right or wrong, so that any change is caught. They do not say what the code
should do. They say what it does. Nine of them pin `handleTurn`:

| Test | What it pins |
|---|---|
| `legalPawnMoveIsPlayed` | `e2e4` returns true; the pawn is on e4, e2 is empty |
| `unreadableStringIsRejected` | `"hello"` returns false and prints `Cannot read move: hello` |
| `offBoardSquareIsRejected` | `e2e9` and `i2i4` are refused; the board is untouched |
| `wrongSideCannotMove` | Black cannot move first |
| `turnSwitchesAfterEachLegalMove` | White, then Black, then White |
| `historyGrowsOnlyForLegalMoves` | two legal moves and one illegal one leave two entries |
| `knightJumpsButRookIsBlocked` | `b1c3` is played; `a8a6` is refused because a7 is occupied |
| `pawnCannotAdvanceThreeSquares` | `e2e5` is refused with `Illegal move: e2e5` |
| `oneMovePrintsAnnouncementAndBoard` | the exact eleven lines printed after `e2e4` |

The last one captures `System.out` and compares the whole output to a text
block. It is the test most likely to catch a careless extraction of the
printing code, which is exactly the extraction we want to make.

```java
@Test
void oneMovePrintsAnnouncementAndBoard() {
    handler.handleTurn("e2e4");
    String expected = """
            White plays e2e4
            8  r n b q k b n r
            7  p p p p p p p p
            6  . . . . . . . .
            5  . . . . . . . .
            4  . . . . P . . .
            3  . . . . . . . .
            2  P P P P . P P P
            1  R N B Q K B N R

               a b c d e f g h
            """;
    assertEquals(expected, printed());
}
```

Notice what the tests touch: `handleTurn`, `isWhiteToMove`, `history`, and
`symbolAt`. Nothing else. They do not know whether there is a `Piece` class
or what its fields are called. That is deliberate. A test that reaches into
the structure breaks when the structure changes, and then you cannot tell a
broken test from broken behavior. Test the surface you intend to keep.

## 3. The smell hunt

A **code smell** is a surface feature of code that usually points at a deeper
problem. Fowler's catalog (chapter 3) names about two dozen. A smell is not a
verdict; it is a reason to look closer. Here is what the room found in
`handleTurn`, with the catalog names and the classroom names you may know
them by:

| Smell (Fowler) | Also called | Where in `handleTurn` |
|---|---|---|
| **Long Function** | Long Method | 79 lines, six jobs |
| **Duplicated Code** | — | the bounds check, twice; the square parse, three times counting `symbolAt` |
| **Repeated Switches** | Switch on Type | `switch (p.type)`: six cases, in a method about turns |
| **Divergent Change** | Mixed Responsibilities | change the board's look, the move syntax, or the rules, and you edit this one method |
| **Mysterious Name** | Poor Names | `p`, `x`, `tmp`, `flag`, `chk`, `dx` |
| **Primitive Obsession** | — | a square is two `int`s; a move is a `String` for forty lines |
| **Magic Number** | — | `- 'a'`, `- '1'`, `7`, `1` and `6` for the pawn's start ranks |
| **Complicated conditional** | Long Boolean | the pawn rule: three clauses, eleven comparisons |

Two of these deserve a word. **Divergent Change** is Fowler's name for a
module that changes for several unrelated reasons; session 9 called the same
thing low cohesion. **Repeated Switches** is the smell session 6 built a
whole lecture on: a `switch` on a piece's type asks the object what it is and
then does the object's job for it. Here it even needs a `break` per case to
work at all. In a program with one such switch it is
tolerable. In a chess program there will be a second (attacks), a third
(piece value), and then a seventh piece type arrives.

Each smell has a refactoring that answers it, and IntelliJ has a shortcut for
most of them:

| Smell | Refactoring (Fowler's catalog name) | IntelliJ | macOS | Windows |
|---|---|---|---|---|
| Mysterious Name | Rename Variable, Change Function Declaration | Rename | ⇧F6 | Shift+F6 |
| Duplicated Code | Extract Function | Extract Method | ⌥⌘M | Ctrl+Alt+M |
| Long Function | Extract Function | Extract Method | ⌥⌘M | Ctrl+Alt+M |
| Primitive Obsession | Replace Primitive with Object | new record, then Change Signature | ⌘F6 | Ctrl+F6 |
| Divergent Change | Extract Class, Move Function | Move | F6 | F6 |
| Repeated Switches | Replace Conditional with Polymorphism | by hand, then Inline | ⌥⌘N | Ctrl+Alt+N |
| Complicated conditional | Decompose Conditional, Extract Variable | Extract Method, Extract Variable | ⌥⌘M, ⌥⌘V | Ctrl+Alt+M, Ctrl+Alt+V |
| Magic Number | Replace Magic Literal, Extract Variable | Extract Constant / Variable | ⌥⌘C, ⌥⌘V | Ctrl+Alt+C, Ctrl+Alt+V |

The IDE matters more than it looks. When IntelliJ extracts a method it finds
every variable that flows in and out, picks the parameters and the return
type, and offers to replace duplicates. When it renames, it renames every
use. Doing the same by hand with find-and-replace is where refactorings go
wrong, and it is why the shortcuts are worth learning this week.

## 4. The live refactor, in ten steps

In class we take `before/` to `after/` in ten steps, running the tests after
each one. The instructor's exact sequence is in the demo repository's git
history, one commit per step. Here are the states that matter.

**Steps 1 and 2: rename, then remove the duplicate.** Renaming is how you read
code you do not understand yet: every rename is a small claim, and the
compiler checks it. With names in place the duplicated bounds check is
obvious, and Extract Method on the first copy offers to replace the second:

```java
if (isOffBoard(fromFile, fromRank)) { … }
if (isOffBoard(toFile, toRank)) { … }

private static boolean isOffBoard(int file, int rank) {
    return file < 0 || file > 7 || rank < 0 || rank > 7;
}
```

**Step 3: a square gets a name.** Two `int`s that always travel together are
one thing without a name. A record gives it one, and the bounds check moves
onto it, where it belongs. The three copies of the parse become one method:

```java
public record Square(int file, int rank) {
    public boolean isOnBoard() {
        return file >= 0 && file <= 7 && rank >= 0 && rank <= 7;
    }
}

private static Square parseSquare(String text, int offset) {
    return new Square(text.charAt(offset) - 'a', text.charAt(offset + 1) - '1');
}
```

**Step 4: parsing leaves the method.** Which lines of `handleTurn` would you
want to test without a board? The parsing. So it becomes a class of its own,
and the three `Cannot read move` branches collapse into one:

```java
public static Optional<Move> parse(String input) {
    if (input == null || input.length() != 4) {
        return Optional.empty();
    }
    Square from = parseSquare(input, 0);
    Square to = parseSquare(input, 2);
    if (!from.isOnBoard() || !to.isOnBoard()) {
        return Optional.empty();
    }
    return Optional.of(new Move(from, to, input));
}
```

```java
Optional<Move> parsed = MoveParser.parse(input);
if (parsed.isEmpty()) {
    System.out.println("Cannot read move: " + input);
    return false;
}
Move move = parsed.get();
```

**Step 5: printing leaves the method.** Extract Method on the fourteen
printing lines, then Move it to a new `BoardPrinter`. The output test is the
one watching.

**Steps 6 and 7: the switch becomes a hierarchy.** First Extract Method
names the switch `isValidMovement`. Then the question is who should own it,
and the answer is each piece. `Piece` becomes abstract with one new method,
and each branch becomes a class:

```java
public abstract class Piece {
    …
    public abstract boolean canMoveTo(Board board, Square from, Square to);
}

public class Knight extends Piece {
    public Knight(boolean white) {
        super('N', white);
    }

    @Override
    public boolean canMoveTo(Board board, Square from, Square to) {
        int fileDelta = to.file() - from.file();
        int rankDelta = to.rank() - from.rank();
        return (Math.abs(fileDelta) == 1 && Math.abs(rankDelta) == 2)
                || (Math.abs(fileDelta) == 2 && Math.abs(rankDelta) == 1);
    }
}
```

The caller no longer asks what the piece is:

```java
if (!piece.canMoveTo(board, from, to)) {
    System.out.println("Illegal move: " + input);
    return false;
}
```

One `switch` on the letter survives, in `Board.initial()`, where the pieces
are built. That switch is construction, not behavior, and it is the same
compromise the engine makes in its factory.

**Step 8: the pawn rule becomes three questions.** Decompose Conditional: each
clause of the long boolean is extracted into a method whose name is the
question it answers.

```java
@Override
public boolean canMoveTo(Board board, Square from, Square to) {
    return isSingleStep(board, from, to)
            || isDoubleStepFromStart(board, from, to)
            || isDiagonalCapture(board, from, to);
}
```

The test of this step is whether you can read the method aloud.

**Steps 9 and 10: state change apart from output, and one legality check.**
The last lines of the method changed the board, the history, the turn, and
the screen. Now one method changes state and never prints; another prints and
never changes state. The three `Illegal move` branches, which all printed the
same line, become one `isLegal`. The finished method:

```java
public boolean handleTurn(String input) {
    Optional<Move> parsed = MoveParser.parse(input);
    if (parsed.isEmpty()) {
        System.out.println("Cannot read move: " + input);
        return false;
    }
    Move move = parsed.get();
    if (!isLegal(move)) {
        System.out.println("Illegal move: " + input);
        return false;
    }
    Piece mover = board.get(move.from());
    play(move);
    announce(mover, move);
    return true;
}
```

Parse it. If it is not legal, say so. Otherwise play it and announce it. Four
sentences, four lines. And now the question from section 1 has an answer: king
safety is one more clause in `isLegal`, or one more line in `play` that tries
the move and takes it back. You can point at where it goes.

Across all ten steps the test file did not change by one character:

```bash
git diff step-00 step-10 -- src/test
```

prints nothing. That is the whole argument.

## 5. Refactoring and feature work are different hats

Kent Beck's image, which Fowler borrows, is two hats. Wearing the refactoring
hat you change structure and run the tests to prove nothing else changed.
Wearing the feature hat you add behavior and write a new test that fails
until you do. You may swap hats as often as you like, but **never wear both at
once**, and never in the same commit.

The reason is diagnostic. Suppose you extract a method and add a rule in the
same edit, and a test goes red. Is the extraction wrong, or the rule, or the
test's expectation of the rule? You now have three explanations for one
failure. Keep them apart and each red test has one cause.

This is the shape of your next two milestones, and it is why they are two
milestones. **M4 is a refactoring.** The code that generates moves moves out
of `Game` into a class of its own, and `Game` asks that class instead. The
list of moves is identical before and after, your forty-two tests stay green
throughout, and the diff shows a cut and a paste. **M5 is a feature.** The
list of moves changes: moves that leave your king in check disappear. New
tests will say so. If you find yourself writing king-safety code while doing
M4, stop: you have both hats on, and when a test fails you will not know
why.

The practical cycle for any refactoring, this week and after: pick one smell,
make the smallest change that answers it, run the tests, read the diff,
commit. Then pick the next one. Ten small commits beat one large one every
time something goes wrong, because `git reset --hard` to the last green state
costs nothing.

## 6. Exercises

**1. Exit question from class.** This method is from a different program. Name
two smells and the refactoring that answers each.

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

**2. A characterization test of your own.** `before/`'s tests never try a
capture. Write one that pins what `handleTurn` does when a white pawn on e4
takes a black pawn on d5. Run it on `before/`, then on `after/`. Does it pass
on both? What does that tell you?

**3. A step that was skipped.** `after/` still has `symbolAt` on
`TurnHandler`, which only exists for the tests. Which smell is that? Where
would you move it, and what would break?

**4. Which of these are refactorings?** For each, say whether the observable
behavior of `handleTurn` changes, and name a test that would notice.
(a) Replacing `"Illegal move: "` with `"Illegal: "`. (b) Making `Square`
reject off-board coordinates in its constructor. (c) Replacing the `boolean
white` field with a `Color` enum. (d) Having `play` also print the board.

**5. On your own repository.** Open your M3 `Game`. Run the tests. Pick one
Mysterious Name and one Long Function, fix each with the IDE in its own
commit, run the tests after each. Do not add behavior. Then read `git log`
and check that each commit message says *what* changed, not *why the tests
still pass*.

Solutions and discussion are in the instructor's copy of these notes.

## Reading

- Martin Fowler, *Refactoring: Improving the Design of Existing Code*, 2nd
  ed. (Addison-Wesley, 2018). Chapter 1 is a thirty-page worked example of
  exactly what we did today, on a different program; chapter 3 is the smell
  catalog; chapters 6–12 are the refactoring catalog, with the names used
  above.
- The catalog online: [refactoring.com/catalog](https://refactoring.com/catalog/).
- IntelliJ IDEA documentation: *Refactoring code*, for the full list of
  automated refactorings and their shortcuts.

**Related material:** [the demo projects](../../demos/session-11-refactoring/),
[session 6 notes](../session-06-piece-hierarchy/notes.md) (why the switch
becomes a hierarchy), [session 9 notes](../session-09-cohesion-coupling/notes.md)
(cohesion, which Divergent Change measures), [M4 handout](../../assignments/m4-move-generator/handout.md).
