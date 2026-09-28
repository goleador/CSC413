# Session 10 — SOLID
### Five names for what you did in M2
**Week 6, Wednesday Sep 30**

> Open with Monday's question: why does one M4 method have no modifier?
> Take answers; resolve in §5. Say aloud: M3 due Mon Oct 5; M4 due Mon
> Oct 12. Protect §7 and §8.

---

## Where you are this morning

- **M2** is in.
- **M3** due Monday. Most of you: `apply`, `undo` done; somewhere inside `Game`.
- **M4** open since Monday. Two methods. One question left open: *why does one have no access modifier?*

*(reveal)* Monday named three ideas you had already used. Today names five more, and the claim is the same: **you applied four of these in M2 and in the scaffold you are filling in now.** The fifth is what M4 asks.

---

## By the end of today you can

1. State each SOLID principle in one sentence and point at the line in your repo, today, where you applied it or chose not to
2. Take each job M3 still asks of you and say which class it belongs to, before writing it
3. Read a class that does everything and say, cut by cut, what leaves and where it goes in your engine

---

## 1. Five names

| | Principle | One sentence | Where you did it |
|---|---|---|---|
| **S** | Single responsibility | one reason to change | M2: seven files. Monday: the scaffold. |
| **O** | Open/closed | add behaviour by adding code, not editing working code | M2: the Archbishop |
| **L** | Liskov substitution | a subclass works wherever its parent is expected | M2: six classes through one `Piece` |
| **I** | Interface segregation | no caller depends on methods it does not use | the scaffold's `public` surface; Monday's question |
| **D** | Dependency inversion | depend on abstractions, not concrete classes | `List<Move>`; `Piece piece`; who names `Knight` |

*(reveal)* A checklist, not five laws. Each is a judgement, and each has a place in your repo where you chose not to follow it.

---

## 2. S — one reason to change. Sharper: *who would ask?*

| Class | One sentence | Who would ask |
|---|---|---|
| six pieces | how one piece moves | the rules committee |
| `Board` | stores which piece is on which square | you, for a faster representation |
| `TextBoardRenderer` | draws a board as text | the player |
| *(reveal)* `Game`, as scaffolded | plays one game's moves in turn order and remembers them, **and** generates them | you, for turns and undo; **and** the rules committee, for king safety |

*(reveal)* One asker per class, except the last row. **That is the whole case for M4 in one table.**

> Put the last row up with the "and"s bold. Monday did the argument; do not redo it.

---

## Two ways to get S wrong

*(reveal)* **The class that does everything.** §8.

*(reveal)* **The opposite:** a `Turn` class, a `History` class, a `SideToMove` class, each with one field. A hundred files that do nothing alone.

*(reveal)* "…and remembers them" is one job: undo cannot exist without the memory.

*(reveal)* The test is whether two parts would ever **change separately**, not whether you can name them separately.

---

## 3. O — open for extension, closed for modification

Add an Archbishop.

*(reveal)* One new file. `Board`, the loop, `TextBoardRenderer`, and all 34 tests: **unchanged.** They cannot break, because no file they test is edited.

*(reveal)* Code you never edit never breaks. The mechanism is the one you used: an abstraction with polymorphism behind it. Every place that would have `switch`ed on type is now closed.

---

## Is `PieceFactory.create` a violation?

```java
return switch (type) {
    case PAWN   -> new Pawn(color);
    case KNIGHT -> new Knight(color);
    ...
};
```

*(reveal)* **Yes.** Add a seventh piece; edit this. So is `Board.createPromoted`, if you wrote it.

*(reveal)* Somewhere, `new Knight(...)` has to be written. Somewhere has to know the list.

*(reveal)* The win is not zero switches. It is **exactly one, on purpose, at the edge.** Week 9 says why that one is a pattern.

> Say "violation" out loud. "No switches ever" makes week 9 confusing.

---

## M4's `legalMoves` returns the list unchanged. M5 edits it. Violation?

*(reveal)* Open/closed does not say never edit. It says: design so the changes you can **predict** arrive as additions.

*(reveal)* A new piece, a new way to draw the board: predictable, and additions. The king-safety filter changes what "legal" means; you could not close against it without writing it.

*(reveal)* Which changes to predict is the judgement. The principle says what to aim for, not which bets to place.

---

## 4. L — a subclass keeps every promise its parent made

How `PieceMovementTest` gets a piece: `PieceFactory.create(type, color)`, returning a `Piece`. Then it calls `pseudoLegalMoves`. It never asks which of your six classes it is holding.

*(reveal)* It works because each honours `Piece`'s promise: moves from `from`, none off-board, none onto a friend, each recording the mover.

*(reveal)* The compiler checks the signature. **Nothing checks the promise** except you and those tests.

---

## Is `Pawn.attacks` a violation? You wrote it.

The promise: *true if this piece could capture an enemy on `target`.*

*(reveal)* The default consults the piece's own moves. Right for five pieces. Wrong for the pawn: advances straight, captures diagonally.

*(reveal)* `Pawn` overrides to **keep** the promise for a case the default gets wrong. That is what overriding is for.

*(reveal)* Overriding to mean something *different* is the violation.

> Half the room thinks overriding is a violation by definition. Land keep-vs-change here.

---

## What a violation would look like, in your classes

- *(reveal)* A `Piece` whose `pseudoLegalMoves` throws: "this piece does not move." The loop crashes on a legal board.
- *(reveal)* A subclass that returns `null` instead of an empty list. Every caller needs a check it did not need.
- *(reveal)* A `Knight` whose moves include a friendly square. `Board.apply` overwrites the friend, because `apply` checks nothing and was told it could trust the `Move`.

*(reveal)* **L is what makes O safe.** Adding a piece without editing the loop works only if the new piece is substitutable.

---

## 5. I — no caller depends on methods it does not use

`Game` from the outside: two constructors and seven `public` methods. Three `private` fields. A caller cannot reach the history list, cannot call `Board.place` through `Game`.

*(reveal)* **If it could, one day it would.**

*(reveal)* Inside `Piece`: `slidingMoves`, `steppingMoves` are `protected`. Subclasses need them; nothing else sees them.

---

## Monday's question: why does `pseudoLegalMoves` have no modifier?

*(reveal)* Visible inside `engine`, and nowhere else.

*(reveal)* Come M5, `legalMoves` filters out moves that leave your king in check. `pseudoLegalMoves` will still return them.

*(reveal)* A caller outside the engine using it would offer a player **moves the rules forbid.**

*(reveal)* The narrow surface is `Game.legalMoves()`, and `Game` decides what "legal" means. Interface segregation at the package level, enforced by the compiler.

*(reveal)*
```
Main.java: pseudoLegalMoves(Board,Color) is not public in MoveGenerator;
           cannot be accessed from outside package
```

> Have them say it before the reveals. Show the compile error live if you have not.

---

## 6. D — depend on abstractions

```java
List<Move> moves = new ArrayList<>();   // List, not ArrayList
Piece piece = board.pieceAt(from);      // Piece, not Knight
```

*(reveal)* `Board` holds `Piece`s. The loop asks a `Piece`. The six subclasses extend `Piece`. Every arrow points at the abstract thing in the middle.

*(reveal)*
```
grep -rl "Knight" src/main
# Knight.java   PieceFactory.java   and nothing else
```

*(reveal)* That is what "inverted" means: the code that moves pieces does not depend on the knight. Both depend on `Piece`.

*(reveal)* One more you did already: `Game(Board board, Color sideToMove)`. The tests hand `Game` a board; `Game` never asks where it came from. **Dependency injection.** Your first one.

---

**7 minutes · in pairs**

# 7. Where does each piece of M3 belong?

Class · one sentence why · which letter

1. Move a piece from one square to another, no questions asked
2. Decide whether a move is allowed right now, and refuse it if not
3. Turn `"e2e4"` into a `Move`, or discover there is no such move
4. Build the queen a pawn turns into on the last rank
5. List every move White can make in this position
6. Show the board after each move

> These are M3's own jobs. Answers in the notes. Number 4 is the argument; number 5 is Monday in one line.

---

# 8. A class that does everything

It plays chess. It uses nothing you have not seen. It is every decision you made this month, undone.

> Hand out the printed copy; the next two slides are too dense to read from the back.

---

## `ChessGame`, part 1

```java
public class ChessGame {
    private final Piece[][] squares = new Piece[8][8];
    private boolean whiteToMove = true;
    private final Scanner in = new Scanner(System.in);

    public void run() {
        setUp();
        while (true) {
            print();
            System.out.print((whiteToMove ? "White" : "Black") + "> ");
            String line = in.nextLine().trim();
            if (line.equals("quit")) return;
            if (line.length() != 4) { System.out.println("Type a move like e2e4"); continue; }
            int ff = line.charAt(0) - 'a', fr = line.charAt(1) - '1';
            int tf = line.charAt(2) - 'a', tr = line.charAt(3) - '1';
            Piece piece = squares[ff][fr];
            if (piece == null || piece.isWhite() != whiteToMove) { System.out.println("Not your piece"); continue; }
            if (!canMove(piece, ff, fr, tf, tr)) { System.out.println("Illegal"); continue; }
            squares[tf][tr] = piece;  squares[ff][fr] = null;
            whiteToMove = !whiteToMove;
        }
    }
    private void setUp() { /* "RNBQKBNR", two loops of new Piece(...) */ }
```

---

## `ChessGame`, part 2

```java
    private boolean canMove(Piece piece, int ff, int fr, int tf, int tr) {
        int df = Math.abs(tf - ff), dr = Math.abs(tr - fr);
        Piece target = squares[tf][tr];
        if (target != null && target.isWhite() == piece.isWhite()) return false;
        switch (piece.letter()) {
            case 'N': return df * dr == 2;
            case 'K': return df <= 1 && dr <= 1;
            case 'R': return (df == 0 || dr == 0) && pathClear(ff, fr, tf, tr);
            case 'B': return df == dr && pathClear(ff, fr, tf, tr);
            case 'Q': return (df == 0 || dr == 0 || df == dr) && pathClear(ff, fr, tf, tr);
            case 'P': int dir = piece.isWhite() ? 1 : -1;
                      if (df == 0 && tr - fr == dir && target == null) return true;
                      return df == 1 && tr - fr == dir && target != null;
            default:  return false;
        }
    }
    private void print() {
        for (int r = 7; r >= 0; r--) { /* System.out.print each square */ }
        System.out.println("  a b c d e f g h");
    }
    record Piece(char letter, boolean isWhite) { ... }
}
```

What does this class know? Who would ask for a change? How many reasons to open it?

---

## Take it apart

Each cut: **what leaves** · **which class in your repo** · **which letter**.

1. *(reveal)* `print()` → `TextBoardRenderer`. S. "To draw it a second way, every line changes."
2. *(reveal)* the `switch` in `canMove` → your six `Piece` subclasses; `pathClear` → `slidingMoves`. O, D.
3. *(reveal)* `squares`, `setUp`, the two assignments → `Board.apply`, `BoardFactory.standard()`. S.
4. *(reveal)* `whiteToMove`, the flip, "Not your piece" → `Game.sideToMove`. S.
5. *(reveal)* the `Scanner`, parsing, messages → `Main`, for now; the parsing is `findLegalMove`. I.
6. *(reveal)* `boolean isWhite` → `Color`; `char letter` → `PieceType`. Session 3's closed sets. D, in miniature.

*(reveal)* What is left is `Game`. It was not wrong about what a chess program needs. It was wrong about how many classes that is.

> Let the room find them; you name only the letters. Feedback about the code, never the author.

---

## The words for what you built

| Term | Where, today |
|---|---|
| SRP | six pieces; `Board`; the scaffold's `Game`, with two askers until M4 |
| OCP | `Piece.pseudoLegalMoves` abstract; the Archbishop is one new file |
| LSP | `PieceMovementTest` holds six classes to one promise; `Pawn.attacks` keeps it |
| ISP | `Game`'s public surface; the M4 method with no modifier |
| DIP | `Board` holds `Piece`, never `Knight`; `Game(Board, Color)` |
| The one allowed switch | `PieceFactory.create`: OCP broken on purpose, once, at the edge |
| God class | `ChessGame`: every principle, missing |

---

**M3 due Mon Oct 5 · M4 due Mon Oct 12**

# Next: Monday Oct 5

Refactoring and code smells: names for what is wrong with working code, and the safe moves that fix it.

M5 opens: king safety, the rule no single piece can enforce. It lands in the class you made room for this week.
