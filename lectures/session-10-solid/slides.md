# Session 10 — SOLID
### Five lenses on the engine you already built
**Week 6, Wednesday Sep 30**

> Frame: recognition, not instruction. Every lens ends on a line they wrote.
> Say aloud: M3 due Mon Oct 5; M4 due Mon Oct 12. Protect §7 and §8.

---

## By the end of today you can

1. State each SOLID principle in one sentence and point at the line in your repo where you applied it, or chose not to
2. Given a new feature, name the class it belongs to and the principle that says so
3. Read a class that does everything and say, cut by cut, what leaves and where it goes

---

## 1. Five names for things you have mostly done

| | Principle | One sentence | You met it |
|---|---|---|---|
| **S** | Single responsibility | one reason to change | Monday; M4 |
| **O** | Open/closed | add behaviour by adding code, not editing working code | the Archbishop |
| **L** | Liskov substitution | a subclass works wherever its parent is expected | `Piece` |
| **I** | Interface segregation | no caller depends on methods it does not use | `Main` sees `Game` |
| **D** | Dependency inversion | depend on abstractions, not concrete classes | `List<Move>`; `Piece piece` |

*(reveal)* A checklist to run over a design, not five laws. Each is a judgement, and each has a place in your repo where you chose not to follow it.

---

## 2. S — one reason to change. Sharper: *who would ask?*

| Class | One sentence | Who asks for a change |
|---|---|---|
| `Board` | stores which piece is on which square | you, for speed |
| six pieces | how one piece moves | the rules committee |
| `MoveGenerator` | a position and a colour → that colour's moves | the rules committee |
| `Game` | plays one game's moves in turn order, remembers them | you, for endings and undo |
| `TextBoardRenderer` | draws a board as text | the player |

*(reveal)* One class, one asker. Before M4, two people had reason to open `Game.java`. After, one.

---

## Two ways to get S wrong

*(reveal)* **The class that does everything.** §8.

*(reveal)* **The opposite:** a `Turn` class, a `History` class, a `SideToMove` class, each with one field. A hundred files that do nothing alone.

*(reveal)* "…and remembers them" is one job: undo cannot exist without the memory.

*(reveal)* The test is whether the parts would ever **change separately**, not whether you can name them separately.

---

## 3. O — open for extension, closed for modification

Add an Archbishop.

```java
for (Position from : board.positionsOf(color)) {
    moves.addAll(board.pieceAt(from).pseudoLegalMoves(board, from));
}
```

*(reveal)* One new class. This loop, `Board`, `Game`, the tests: **unchanged.**

*(reveal)* Code you never edit never breaks. The mechanism: an abstraction with polymorphism behind it. Every place that would have `switch`ed on type is now closed.

---

## Is `PieceFactory.create` a violation?

```java
return switch (type) {
    case PAWN   -> new Pawn(color);
    case KNIGHT -> new Knight(color);
    ...
};
```

*(reveal)* **Yes.** Add a seventh piece; edit this. So is `Board.createPromoted`.

*(reveal)* Somewhere, `new Knight(...)` has to be written. Somewhere has to know the list.

*(reveal)* The win is not zero switches. It is **exactly one, on purpose, at the edge.** Week 9 says why that one is a pattern.

> Say "violation" out loud. Students who learn "no switches ever" spend week 9 confused.

---

## Next week M5 edits `legalMoves`. Violation?

*(reveal)* Open/closed does not say never edit. It says: design so the changes you can **predict** are additions.

*(reveal)* A new piece, a new view: predictable, and additions. M5's filter: you could not have closed against it without building it.

*(reveal)* Which changes to predict is the judgement. The principle says what to aim for, not which bets to place.

---

## 4. L — a subclass keeps every promise its parent made

```java
Piece piece = board.pieceAt(from);
moves.addAll(piece.pseudoLegalMoves(board, from));
```

`piece` is one of six classes. The loop works because each honours `Piece`'s promise: moves from `from`, none off-board, none onto a friend, each recording the mover.

*(reveal)* The compiler checks the signature. **Nothing checks the promise** except you and `PieceMovementTest`.

---

## Is `Pawn.attacks` a violation?

The promise: *true if this piece could capture an enemy on `target`.*

*(reveal)* The default consults the piece's own moves. Right for five pieces. Wrong for the pawn, which advances straight and captures diagonally.

*(reveal)* `Pawn` overrides to **keep** the promise, not to change it. That is what subclasses are for.

*(reveal)* Overriding to mean something *different* is the violation.

> Half the room thinks overriding is a violation by definition. Land the keep-vs-change distinction here.

---

## What a violation looks like

- *(reveal)* A `Piece` whose `pseudoLegalMoves` throws: "this piece does not move." The loop crashes on a legal board.
- *(reveal)* A subclass that returns `null` instead of an empty list. Every caller needs a check it did not need.
- *(reveal)* A `Knight` whose moves include a friendly square. `Board.apply` happily overwrites the friend.

*(reveal)* **L is what makes O safe.** Adding a piece without editing the loop works only if the new piece is substitutable.

---

## 5. I — no caller depends on methods it does not use

`Main` at M3 sees five methods of `Game`: `legalMoves`, `findLegalMove`, `play`, `undoLastMove`, `board()`.

*(reveal)* It does not see `MoveGenerator`. Not the `ArrayList`. It cannot reach `Board.place` through `Game`. **If it could, one day it would.**

*(reveal)* Monday's package-private `pseudoLegalMoves`: the same principle at package level.

*(reveal)* Inside `Piece`: `slidingMoves`, `steppingMoves` are `protected`. Subclasses need them; the engine never sees them.

*(reveal)* M9: a window cannot honestly implement `nextAction()`. One fat `BoardView` would force it to. Week 11.

---

## 6. D — depend on abstractions

```java
List<Move> moves = new ArrayList<>();   // List, not ArrayList
Piece piece = board.pieceAt(from);      // Piece, not Knight
```

*(reveal)* `MoveGenerator` imports `Piece`, never a subclass. The six subclasses depend on `Piece` too. Every arrow points at the abstract thing in the middle.

*(reveal)*
```
grep -r "Knight" src/main      # who names the concrete class?
```

*(reveal)* `PieceFactory`. Nothing else in the engine. **That is what inverted means.**

*(reveal)* M9: `BoardView view = chooseView(args)`. Six views, one `Game`, one expression. The bonus track lives on this line.

> One sentence on dependency injection: Game(Board, Color) is a small case; the tests inject a board.

---

**7 minutes · in pairs**

# 7. Where does it belong?

Class or package · one sentence why · which letter

1. A `hasMoved` flag, for castling
2. "Is e4 attacked by Black?"
3. Draw the board from Black's side
4. How many pawns does White have?
5. "Is this position checkmate?"
6. Load a saved game from a text file

> Answers in the notes. Number 1 is the argument; spend the room time there.

---

# 8. A class that does everything

It plays chess. It fits on two screens. It is every decision you made this month, undone.

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

Each cut: **what leaves** · **where it goes in your engine** · **which letter**.

1. *(reveal)* `print()` → `TextBoardRenderer`. S. "A Swing window means rewriting this."
2. *(reveal)* the `switch` in `canMove` → six `Piece` subclasses; `pathClear` → `slidingMoves`. O, D.
3. *(reveal)* `squares`, `setUp`, the two assignments → `Board.apply`, `BoardFactory.standard()`. S.
4. *(reveal)* `whiteToMove`, the flip, "Not your piece" → `Game.sideToMove`. S.
5. *(reveal)* the `Scanner`, parsing, messages → a view and a controller (M9); `Position.parse` + `findLegalMove`. I.
6. *(reveal)* `boolean isWhite` → `Color`; `char letter` → `PieceType`. Session 3's closed sets. D, in miniature.

*(reveal)* What is left is `Game`. It was not wrong about what a chess program needs. It was wrong about how many classes that is.

> Let the room find them; you only name the letters. Feedback about the code, never the author.

---

## The words for what you built

| Term | Where |
|---|---|
| SRP | `Game` after M4; `Board`; `TextBoardRenderer` |
| OCP | `Piece.pseudoLegalMoves` abstract; the Archbishop is one new file |
| LSP | six pieces through one `Piece`; `Pawn.attacks` keeps the promise |
| ISP | `Main` sees five methods of `Game`; `pseudoLegalMoves` is package-private |
| DIP | `MoveGenerator` imports `Piece`, never `Knight`; `List<Move>` |
| The one allowed switch | `PieceFactory.create`: OCP broken on purpose, once, at the edge |
| God class | `ChessGame`: every principle, missing |

---

**M3 due Mon Oct 5 · M4 due Mon Oct 12**

# Next: Monday Oct 5

Refactoring and code smells: names for what is wrong with working code, and the safe moves that fix it.

M5 opens: king safety. Forty lines, all in `MoveGenerator`, and `Game` does not open.
