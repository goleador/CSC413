# Session 11 — Refactoring and Code Smells
### Same behavior, better structure
**Week 7, Monday Oct 5**

> Say aloud: M3 is due tonight at 11:59 PM, M4 Monday October 12. Today is
> not about either. Today we take apart a program none of you wrote.

---

## A classmate wrote this. It works. Nine tests pass.

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

> Leave it up for twenty seconds and say nothing. Then: it works, the tests
> are green, nobody is complaining. Your job is to add king safety.

---

## Add king safety. Where does it go?

- *(reveal)* Before the `switch`?
- *(reveal)* Inside each branch?
- *(reveal)* After `flag`, before `board.set`?

*(reveal)* **Three answers, all defensible. That is the smell, before we have a name for it.**

> Take three answers from the room before revealing anything. Each answer is
> a different place. Ask: why can three smart people not agree on where one
> rule goes?

---

## By the end of today you can

1. Say what a refactoring must preserve, and tell one from a feature
2. Find and name six smells in a method you did not write
3. Fix each one with the IDE, tests green after every step

> Read these out. The third is the one we spend half the class on, so warn
> them: laptops open, this repository, follow along.

---

# Part one — What refactoring is

---

## The definition

> A change to the structure of a program that does not change its observable
> behavior. — Martin Fowler, *Refactoring*, 2nd ed.

- *(reveal)* Rename a variable: **yes**
- *(reveal)* Fix a one-character bug: **no**
- *(reveal)* Add king safety: **no**

> Ask: is fixing a bug a refactoring? Someone says yes because it is small.
> Small is not the criterion. Did the program's behavior change? Then it is
> not a refactoring, however small.

---

## What is observable about `handleTurn`?

- *(reveal)* The `boolean` it returns
- *(reveal)* Every line it prints
- *(reveal)* The board afterwards
- *(reveal)* Whose turn it is
- *(reveal)* The history list

> Collect answers before revealing. The one the room forgets is the printed
> output. Say: if I move the printing and the board comes out one line early,
> I changed behavior.

---

## Tests before the first rename

**Characterization tests** record what the code does today, right or wrong,
so that any change is caught.

```
$ ./mvnw test
Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

*(reveal)* They do not say what the code *should* do. They say what it *does*.

> Run the suite in IntelliJ now, on the projector. Say: refactoring without
> tests is just editing. These nine are the only reason I will dare to touch
> eighty lines in the next half hour.

---

## The test that is watching

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

> This is the one that catches me if I break the printing. Point at the blank
> line before the file letters. The text block compares the whole output,
> byte for byte.

---

## What do the tests touch?

`handleTurn` · `isWhiteToMove` · `history` · `symbolAt`

*(reveal)* **Nothing else.** They do not know `Piece` exists or what its fields are called.

*(reveal)* Test the surface you intend to keep. A test that reaches into the
structure breaks when the structure changes, and then you cannot tell a
broken test from broken behavior.

> Ask: why did I not write a test for the Piece class? Wait. The answer is
> that Piece is about to change shape, and I want the tests to stay still
> while it does.

---

# Part two — Smell hunt
**Five minutes, in pairs.** List every smell you can find in `handleTurn`. Paper or chat.

> Put the code wall back on the second screen or on their laptops. Walk the
> room. Five minutes, then collect one smell per pair, no repeats.

---

## What you found

- *(reveal)* **Long Function** · 79 lines, six jobs
- *(reveal)* **Duplicated Code** · the bounds check twice; the parse three times
- *(reveal)* **Repeated Switches** · `switch (p.type)`, six cases, in a method about turns
- *(reveal)* **Divergent Change** · rules, syntax, and screen all live here
- *(reveal)* **Mysterious Name** · `p`, `x`, `tmp`, `flag`, `chk`
- *(reveal)* **Primitive Obsession** · a square is two `int`s; a move is a `String`
- *(reveal)* **Magic Number** · `- 'a'`, `7`, `1` and `6`
- *(reveal)* **Complicated conditional** · the pawn: three clauses, eleven comparisons

> Reveal each one as the room names it, in whatever order it comes, and give
> it Fowler's name. The one they miss is Primitive Obsession on the move
> string: ask what type the move is for the first forty lines.

---

## Each smell has a refactoring. Each refactoring has a key.

| Smell | Refactoring (Fowler) | IntelliJ | macOS | Windows |
|---|---|---|---|---|
| Mysterious Name | Rename Variable | Rename | ⇧F6 | Shift+F6 |
| Duplicated Code, Long Function | Extract Function | Extract Method | ⌥⌘M | Ctrl+Alt+M |
| Primitive Obsession | Replace Primitive with Object | new record, Change Signature | ⌘F6 | Ctrl+F6 |
| Divergent Change | Extract Class, Move Function | Move | F6 | F6 |
| Repeated Switches | Replace Conditional with Polymorphism | by hand, then Inline | ⌥⌘N | Ctrl+Alt+N |
| Complicated conditional | Decompose Conditional | Extract Method, Extract Variable | ⌥⌘M, ⌥⌘V | Ctrl+Alt+M, Ctrl+Alt+V |

> These are the keys for the next thirty minutes. Say: the IDE finds every
> use when it renames and every variable that flows in and out when it
> extracts. Find-and-replace does neither, and that is where refactorings go
> wrong.

---

# Part three — Switch to IntelliJ
**Thirty minutes.** Tests after every step. You call the next step.

> DEMO-SCRIPT.md, steps 1 to 10: rename (2 min), isOffBoard (2), Square and
> parseSquare (3), MoveParser (3), BoardPrinter (2), isValidMovement (2),
> Piece hierarchy (5), pawn conditions (2), play and announce (2), isLegal
> (2). Ask "what next?" before every step and take two answers. If a step
> goes wrong: git reset --hard step-NN.

---

## Checkpoint · after step 4

```java
public boolean handleTurn(String input) {
    Optional<Move> parsed = MoveParser.parse(input);
    if (parsed.isEmpty()) {
        System.out.println("Cannot read move: " + input);
        return false;
    }
    Move move = parsed.get();
    Square from = move.from();
    Square to = move.to();
    Piece piece = board.get(from);
    if (piece == null || piece.white != whiteToMove) {
        ...
```

Parsing is someone else's job now. One `Cannot read move` instead of three.

> Ask which lines of the old method they would want to test without a board.
> The parse. Then it wants to be its own class, and the three identical error
> branches collapse into one.

---

## Checkpoint · after step 7

```java
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

```java
// in handleTurn: nobody asks what the piece is
if (!piece.canMoveTo(board, from, to)) {
    System.out.println("Illegal move: " + input);
    return false;
}
```

> Session 6 made this argument on paper. Now they have watched it happen: the
> switch asked the piece what it was and did its job for it; now nobody asks.
> Point out the one switch that survives, in Board.initial, and say why:
> construction, not behavior.

---

## Checkpoint · after step 10

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

**Parse it. If it is not legal, say so. Otherwise play it and announce it.**

> Read it aloud as four sentences. Then ask the question from slide three
> again: where does king safety go? Now they can point: one more clause in
> isLegal. That is the whole payoff.

---

## What changed in the test file?

*(reveal)*
```
$ git diff step-00 step-10 -- src/test
$
```

*(reveal)* **Nothing.** Ten steps, fourteen files, same nine tests, same nine green.

> Run the diff live before revealing. Empty output. Say: this is the whole
> argument. Structure changed everywhere; behavior, as far as these tests can
> see, did not change at all.

---

# Part four — Two hats

---

## Never wear both at once

| Refactoring hat | Feature hat |
|---|---|
| Change structure. Run the tests. They prove nothing else changed. | Add behavior. Write a new test that fails until you do. |

*(reveal)* Both in one commit, and a test goes red: **three explanations**.
The extraction, the rule, or the test's idea of the rule.

> Kent Beck's image, which Fowler borrows. Ask: if you extract a method and
> add a rule in the same edit and a test fails, what broke? Wait for them to
> see there is no way to know.

---

## M4 and M5 are the two hats

| | M4 · due Mon Oct 12 | M5 · after that |
|---|---|---|
| Hat | Refactoring | Feature |
| What moves | Move generation leaves `Game` for a class of its own | Nothing moves |
| The move list | Identical before and after | Moves that expose your king disappear |
| Tests | Your 42 stay green throughout | New ones say what changed |

> Say exactly this much about M4 and no more: the loop moves, the list does
> not change, the diff is a cut and a paste. If you catch yourself writing
> king-safety code during M4, you have both hats on, and when a test fails
> you will not know why.

---

## Exit question · name two smells and the refactoring for each

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

> Two minutes, written, handed in on the way out. Answers: Mysterious Name
> (s, m, n) via Rename; Duplicated Code (the substring formatting twice) via
> Extract Function; Magic Numbers 1 2 3 for the result via an enum; Primitive
> Obsession on the move strings. String concatenation in a loop is not a
> smell for us; say so if it comes up.

---

# Next: Wednesday Oct 7
**M3 due tonight 11:59 PM · M4 due Mon Oct 12**

Information hiding and clean code. We open `after/` again and ask what a
caller can break through `getBoard()`.

> Point them at demos/session-11-refactoring on the course site: both
> projects, same tests, open either in IntelliJ. Exercise 5 in the notes is
> on their own repository, and I will ask on Wednesday who did it.
