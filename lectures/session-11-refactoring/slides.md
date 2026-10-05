**CSC 413 · Week 7 · Monday Oct 5**

# Refactoring and Code Smells

### How to change the shape of code without changing what it does

> Say aloud: M3 is due tonight at 11:59 PM, M4 Monday October 12. Today is not about either. Today we take apart a program none of you wrote.

---

## Here is a method a classmate wrote. It works. Nine tests pass.

*(the full 79-line `handleTurn`, two columns, small type)*

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

> Leave it up for twenty seconds and say nothing. Then: it works, the tests are green, nobody is complaining. It plays one chess move from a string like e2e4.

---

## A new rule arrives: a move may not leave your own king in check. Where do you add it?

- *(reveal)* Before the `switch`, next to the other checks?
- *(reveal)* Inside the `switch`, once in every case?

- *(reveal)* After the `switch`, just before the board changes?

*(reveal)* **Three reasonable answers, none obviously right. That is the problem we fix today.**

> Take three answers from the room before revealing anything; they will pick different places. Ask: why can three smart people not agree on where one rule goes? Because the method does six jobs and nobody can tell where one ends.

---

## By the end of today you can

1. Explain what refactoring is, and what it is not
2. Spot the common problems in a method and call them by their names

3. Fix them with IntelliJ, running the tests after every change

> Read these out. The third is the one we spend half the class on, so warn them: laptops open, demos/session-11-refactoring, follow along.

---

**Part one**

# What refactoring is

---

## Refactoring changes the shape of the code, not what it does

> A change to the structure of a program that does not change its observable behavior. — Martin Fowler, *Refactoring*, 2nd ed.

- *(reveal)* Renaming a variable: **refactoring**.
- *(reveal)* Fixing a bug: **not refactoring**. The program behaves differently now.

- *(reveal)* Adding the king rule: **not refactoring**, for the same reason.

> Ask: is fixing a bug a refactoring? Someone says yes because it is small. Small is not the criterion. Did the program's behavior change? Then it is not a refactoring, however small the edit.

---

## "What it does" means everything a caller can notice

For `handleTurn`, that is:

- *(reveal)* the `true` or `false` it returns
- *(reveal)* every line it prints

- *(reveal)* what the board looks like afterwards
- *(reveal)* whose turn it is

- *(reveal)* the list of moves played

> Collect answers before revealing. The one the room forgets is the printed output. Say: if I move the printing code and the board comes out one line early, I changed behavior.

---

## Before touching the code, write tests that pin down what it does today

These are **characterization tests**. They do not judge the code. They record it, bugs included.

```
$ ./mvnw test
Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

*(reveal)* Nine of them for `handleTurn`. From now on, a red test means I changed behavior.

> Run the suite in IntelliJ now, on the projector. Say: refactoring without tests is just editing and hoping. These nine are the only reason I will dare to touch eighty lines in the next half hour.

---

## One of the nine: the exact output after e2e4

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

> This is the test that catches me if I break the printing. Point at the blank line before the file letters. The text block compares the whole output, byte for byte.

---

## The tests call only the public methods, so they survive the refactoring

They use `handleTurn`, `isWhiteToMove`, `history`, and `symbolAt`.

*(reveal)* They never mention `Piece`, `Board`, or how a square is stored. **Those are exactly the things about to change.**

*(reveal)* Test what you promise to keep. Not how you keep it.

> Ask: why did I not write a test for the Piece class? Wait. Piece is about to change shape completely, and I want the tests to stay still while it does.

---

**Part two · five minutes, in pairs**

# What is wrong with this method?

Write down everything you can find. Paper or chat.

> Put the code wall back on the second screen or on their laptops. Walk the room. Five minutes, then collect one problem per pair, no repeats.

---

## What you found, and what the book calls it

- *(reveal)* It is 79 lines long and does six different jobs → **Long Function**
- *(reveal)* The same bounds check appears twice → **Duplicated Code**

- *(reveal)* A `switch` on what kind of piece it is → **Repeated Switches**
- *(reveal)* Rules, input format, and printing all live in one method → **Divergent Change**

- *(reveal)* `p`, `x`, `tmp`, `flag`, `chk` → **Mysterious Name**
- *(reveal)* A square is two `int`s and a move is a `String` → **Primitive Obsession**

- *(reveal)* `- 'a'`, `7`, `1` and `6` with no explanation → **Magic Number**
- *(reveal)* The pawn rule is one three-line boolean → **Complicated conditional**

> Reveal each as the room names it, in whatever order it comes, and give it the book's name. Fowler calls these code smells: things that are not bugs but usually mean trouble. The one they miss is the move being a String for forty lines; ask what type the move is.

---

## Every smell has a fix with a name, and IntelliJ has a key for it

| Smell | The fix (Fowler's name) | IntelliJ key · macOS / Windows |
|---|---|---|
| Mysterious Name | Rename | ⇧F6 / Shift+F6 |
| Duplicated Code, Long Function | Extract Function | ⌥⌘M / Ctrl+Alt+M |
| Primitive Obsession | Replace Primitive with Object | new `record`, then ⌘F6 / Ctrl+F6 |
| Divergent Change | Extract Class, Move Function | F6 |
| Repeated Switches | Replace Conditional with Polymorphism | by hand, then Inline ⌥⌘N / Ctrl+Alt+N |
| Complicated conditional | Decompose Conditional | ⌥⌘M / Ctrl+Alt+M on each clause |

> These are the keys for the next thirty minutes. Say: the IDE finds every use when it renames, and every variable flowing in and out when it extracts. Find-and-replace does neither, and that is where hand refactorings go wrong.

---

**Part three · thirty minutes, live**

# We fix them one at a time

Tests after every change. You choose what we fix next.

> DEMO-SCRIPT.md, steps 1 to 10: rename (2 min), isOffBoard (2), Square and parseSquare (3), MoveParser (3), BoardPrinter (2), isValidMovement (2), Piece hierarchy (5), pawn conditions (2), play and announce (2), isLegal (2). Ask "what next?" before every step and take two answers. If a step goes wrong: git reset --hard step-NN.

---

## First we gave things real names, then we removed the duplicate check

**Before**

```java
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
```

**After Rename and Extract Method**

```java
int fromFile = input.charAt(0) - 'a';
int fromRank = input.charAt(1) - '1';
int toFile = input.charAt(2) - 'a';
int toRank = input.charAt(3) - '1';
if (isOffBoard(fromFile, fromRank)) {
    System.out.println("Cannot read move: " + input);
    return false;
}
if (isOffBoard(toFile, toRank)) {
    System.out.println("Cannot read move: " + input);
    return false;
}
```

> Renaming is how you read code you do not understand yet; every rename is a small claim the compiler checks. Then IntelliJ found the second copy of the bounds check for me. Duplicates drift apart; one method cannot.

---

## Then parsing the string moved into its own class

**Before**

```java
if (input == null || input.length() != 4) {
    System.out.println("Cannot read move: " + input);
    return false;
}
int fromFile = input.charAt(0) - 'a';
int fromRank = input.charAt(1) - '1';
int toFile = input.charAt(2) - 'a';
int toRank = input.charAt(3) - '1';
if (isOffBoard(fromFile, fromRank)) { ... }
if (isOffBoard(toFile, toRank)) { ... }
```

**After: `MoveParser` and a `Move` record**

```java
Optional<Move> parsed = MoveParser.parse(input);
if (parsed.isEmpty()) {
    System.out.println("Cannot read move: " + input);
    return false;
}
Move move = parsed.get();

// MoveParser.parse: the length check, both
// squares, both bounds checks, in one place
// that knows nothing about pieces or turns.
```

> Ask which lines of the old method they would want to test without a board. The parsing. Then it wants to be its own class. The three identical "Cannot read move" branches become one.

---

## The switch became six small classes, one per kind of piece

**Before**

```java
switch (piece.type) {
    case 'N':
        movementAllowed = (Math.abs(fileDelta) == 1
                && Math.abs(rankDelta) == 2) || ...;
        break;
    case 'K':
        ...
    case 'R':
        ...
    case 'B':
    case 'Q':
    case 'P':
        ...  // six cases, 24 lines
}
```

**After**

```java
public class Knight extends Piece {
    @Override
    public boolean canMoveTo(Board board, Square from, Square to) {
        int fileDelta = to.file() - from.file();
        int rankDelta = to.rank() - from.rank();
        return (Math.abs(fileDelta) == 1 && Math.abs(rankDelta) == 2)
            || (Math.abs(fileDelta) == 2 && Math.abs(rankDelta) == 1);
    }
}

// and in handleTurn, one line for every kind of piece:
if (!piece.canMoveTo(board, from, to)) { ... }
```

> Session 6 made this argument on paper. Now they have watched it happen: the switch asked the piece what it was and then did its job for it; now the piece answers for itself. One switch survives, in Board.initial, where pieces are built: construction, not behavior.

---

## The finished method reads as four sentences

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

**Read the move. If it is not legal, say so. Otherwise play it, then announce it.**

> Read it aloud. Then ask the question from the start again: where does the king rule go? Now everyone can point: one more line in isLegal. That is the whole payoff.

---

## And the test file did not change at all

```
$ git diff step-00 step-10 -- src/test
$
```

*(reveal)* Ten changes, fourteen files, same nine tests, still green. **We changed the shape of the code and nothing it does.**

> Run the diff live before revealing. Empty output. Say: this is the whole argument. The structure changed everywhere; the behavior, as far as these tests can see, did not change at all.

---

**Part four**

# Refactoring and new features are separate jobs

---

## Never refactor and add behavior in the same commit

**When refactoring**

Change the structure. Run the *existing* tests. They must stay green.

**When adding a feature**

Write a *new* test that fails. Make it pass. Touch nothing else.

*(reveal)* Do both at once and a red test has three possible causes: the restructuring, the new rule, or the test itself. **You cannot tell which.**

> Kent Beck calls these two hats, and says you may switch as often as you like but never wear both. Ask: you extract a method and add a rule in one edit, and a test fails. What broke? Wait until they see there is no way to know.

---

## Your next two milestones are exactly these two jobs

|  | M4 · due Mon Oct 12 | M5 · after that |
|---|---|---|
| Which job | Refactoring | New feature |
| What changes | Move generation moves out of `Game` into its own class | Moves that leave your king in check are no longer legal |
| The list of moves | Identical before and after | Gets shorter in some positions |
| Tests | Your 42 stay green the whole time | New tests arrive that say what changed |

> Say exactly this much about M4 and no more: the loop moves, the list does not change, the diff is a cut and a paste. If you catch yourself writing king-safety code during M4, you are doing both jobs at once, and when a test fails you will not know why.

---

## Exit question: find two smells here and name the fix for each

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

> Two minutes, written, handed in on the way out. Answers: Mysterious Name (s, m, n) fixed by Rename; Duplicated Code (the substring formatting twice) fixed by Extract Function; the magic numbers 1, 2, 3 for the result fixed by an enum; Primitive Obsession on the move strings. String concatenation in a loop is not a smell for us; say so if it comes up.

---

**M3 due tonight 11:59 PM · M4 due Mon Oct 12**

# Next: Wednesday Oct 7

Information hiding. We open today's finished code again and ask what a caller can break through a `getBoard()` method.

> Point them at demos/session-11-refactoring on the course site: both projects, same tests, open either in IntelliJ. Exercise 5 in the notes is on their own repository, and I will ask on Wednesday who did it.
