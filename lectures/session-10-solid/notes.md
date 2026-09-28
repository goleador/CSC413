# Session 10 — SOLID: Five Lenses on the Engine You Already Built

**Week 6, Wednesday September 30** · CSC 413 Software Development
**Objectives advanced:** 2 (SOLID design principles), 3 (analyze designs for maintainability, extensibility, and responsibility assignment), 5 (design patterns, foreshadowed)
**Milestone supported:** M4 — `MoveGenerator` (due Monday Oct 12, 11:59 PM). M3 is due Monday Oct 5.

---

## Today's objective

Monday gave you three words for one question. Today you get five more,
with a mnemonic, and a claim: you have already applied four of them
without knowing their names. We read your engine through each lens, place
six new features in the classes they belong to, and take a working one-file
chess program apart.

**By the end of today you can:**

1. State each SOLID principle in one sentence and point at the line in your
   repo where you applied it, or the line where you chose not to.
2. Given a new feature, name the class it belongs to and the principle that
   says so.
3. Read a class that does everything and say, cut by cut, what leaves and
   where it goes.

---

## 1. SOLID: five names for things you have mostly done

| | Principle | In one sentence | You met it |
|---|---|---|---|
| **S** | Single responsibility | a class has one reason to change | Monday; M4 |
| **O** | Open/closed | add behaviour by adding code, not editing working code | session 6's Archbishop |
| **L** | Liskov substitution | a subclass must work wherever its parent is expected, without the caller knowing | the `Piece` hierarchy |
| **I** | Interface segregation | a caller should not depend on methods it does not use | `Main` sees `Game`, not the loop |
| **D** | Dependency inversion | depend on abstractions, not on concrete classes | `List<Move>`; `Piece piece` |

The letters were assembled by Robert Martin around 2000; the ideas are
older, and two of them have other people's names on them. Treat the
acronym as a checklist to run over a design, not as five laws. Each one is
a judgement, the way DRY was a judgement in session 6, and each has a
place in your engine where you deliberately did not follow it. We will
find those too.

---

## 2. S — Single responsibility

Monday's cohesion, with a name and a sharper question. Martin's phrasing:
*a class should have one reason to change.* The sharper question is **who
would ask for the change?** Reasons come from people.

| Class | One sentence | Who would ask for a change |
|---|---|---|
| `Board` | stores which piece is on which square | you, for speed or a different representation |
| the six pieces | how one piece moves | the rules committee, if a knight's L changed |
| `MoveGenerator` | turns a position and a colour into that colour's moves | the rules committee: king safety, castling |
| `Game` | plays the moves of one game in turn order and remembers them | you, for endings and undo |
| `TextBoardRenderer` | draws a board as text | the player, who wants it prettier |

One class, one asker. M4 is this principle applied: before it, two askers
had reason to open `Game.java`; after it, one.

Two ways to get this wrong. The first is the class that does everything,
which we meet in §8. The second is the opposite: a `Turn` class, a
`History` class, a `SideToMove` class, each with one field, until the
program is a hundred files that do nothing alone. SRP does not say one
method per class. `Game`'s sentence has "and remembers them" in it, and
that is one job, because undo cannot exist without the memory. The test is
whether the parts would ever change separately, not whether you can name
them separately.

---

## 3. O — Open/closed

Bertrand Meyer, 1988: software should be *open for extension, closed for
modification.* You should be able to add behaviour by adding code, without
editing code that already works.

You did this in session 6 and named it once. `Piece.pseudoLegalMoves` is
abstract; every kind of piece answers it; and the loop, now in
`MoveGenerator`, never asks what kind it is looking at. Add an Archbishop:
one new class, and the loop, `Board`, `Game`, and the tests do not change.
Closed to modification, open to extension.

Why it matters: editing working code risks breaking it, and tests catch
that only after the fact. Code you never edit never breaks. The mechanism
that makes this possible is the one you have been using, an abstraction
with polymorphism behind it. Every place that would have needed a
`switch (piece.type())` is a place that is now closed.

**The honest counterexample is in your repo.** `PieceFactory.create` is a
`switch` over `PieceType`. Add a seventh piece and you edit it. So is
`Board.createPromoted`, if you chose the switch for M3. Is that a violation?
Yes, and a deliberate one. Somewhere, something has to know the full list
of concrete classes, because somewhere `new Knight(...)` has to be written.
The factory's job is to be that one place, at the edge where data becomes
objects. The win is not zero switches; it is exactly one, and week 9 is
about why that one is a pattern.

**A harder case, next week.** M5 tightens `legalMoves`. That is editing
working code. Is that a violation? Open/closed does not say never edit. It
says design so that the changes you can *predict* are additions. You can
predict a new piece and a new view, and those are additions. You could not
usefully have designed M4's `legalMoves` to be closed against M5's filter
without building M5. Which changes to predict is the judgement; the
principle tells you what to aim for, not which bets to place.

---

## 4. L — Liskov substitution

Barbara Liskov, 1987: if `S` is a subtype of `T`, then objects of type `T`
may be replaced with objects of type `S` without changing what the program
does. In plain words: **a subclass must keep every promise its parent
made.**

Your loop depends on this entirely:

```java
Piece piece = board.pieceAt(from);
moves.addAll(piece.pseudoLegalMoves(board, from));
```

`piece` might be any of six classes. The loop works because every one of
them honours what `Piece` promised: a list of moves from `from`, none off
the board, none landing on a friendly piece, each recording the mover.
That promise is in `Piece`'s javadoc. The compiler checks the signature;
nothing checks the promise except you and the tests.

`Pawn.attacks` overrides `Piece.attacks`. Is that a violation? Look at the
promise: *true if this piece could capture an enemy on `target`.* The
default answers by consulting the piece's own moves, which is right for
five pieces and wrong for the pawn, which advances straight and captures
diagonally. `Pawn` overrides to keep the promise, not to change it.
Overriding is what subclasses are for. Overriding to mean something
different is the violation.

What a violation looks like:

- A `Piece` subclass whose `pseudoLegalMoves` throws
  `UnsupportedOperationException` because "this piece does not move". The
  loop crashes on a legal board.
- A subclass that returns `null` instead of an empty list. Every caller
  now needs a null check it did not need before.
- A `Knight` whose moves include a square holding its own colour. The
  promise said none would. `Board.apply` will happily overwrite the
  friendly piece.

`PieceMovementTest` is, in effect, a Liskov test: six classes held to the
same expectations through the same `Piece` reference.

**L is what makes O safe.** Open/closed promised you could add a piece
without editing the loop. That promise holds only if the new piece is
substitutable. A subclass that breaks its parent's contract forces the
callers open again.

---

## 5. I — Interface segregation

*No caller should be forced to depend on methods it does not use.* Keep
the surface a caller sees as narrow as its needs.

Your `Main` at M3 talks to `Game`: `legalMoves`, `findLegalMove`, `play`,
`undoLastMove`, `board()`. Five methods. It does not see `MoveGenerator`.
It does not see the `ArrayList` behind `history()`. It cannot reach
`Board.place` through `Game`. If `Main` could call `place`, one day it
would, and then the view would be editing the model.

Monday's package-private `pseudoLegalMoves` is this principle at the
package level: the engine's surface to the outside is `Game`, and one
method that outsiders should not build on is not offered to them.

Smaller, in `Piece`: `pseudoLegalMoves`, `attacks`, `color`, `type`,
`symbol` are `public`. `slidingMoves` and `steppingMoves` are `protected`.
Subclasses need the helpers; the engine does not, and does not see them.
Access modifiers are how Java segregates an interface inside one class.

**Where it will bite: M9.** A console view is happy to be asked "what does
the player want?" in a loop. A window is not; it does nothing until someone
clicks, and it reports the click when it happens. If `BoardView` were one
fat interface with `nextAction()` on it, the window would have to implement
a method it cannot honestly implement. The reference splits the surface so
that each kind of view depends only on what it uses. That is week 11's
problem; today, know that it is this principle.

---

## 6. D — Dependency inversion

*Depend on abstractions, not on concrete classes.* Or, in Monday's words:
point the arrows at what changes least.

You have been doing this since session 8:

```java
List<Move> moves = new ArrayList<>();     // depends on List, not ArrayList
Piece piece = board.pieceAt(from);        // depends on Piece, not Knight
```

Now look at it as a graph. `MoveGenerator` imports `Piece` and never a
subclass. The six subclasses depend on `Piece` too, by extending it. Every
arrow points at the abstract thing in the middle, and the concrete things
at the edges never point at each other. `grep -r "Knight" src/main` and
see who names the concrete class: `PieceFactory`, and nothing else in the
engine. That is what inverted means: the high-level loop does not depend
on the low-level knight; both depend on `Piece`.

**Where it pays: M9.** The reference's `Main` declares
`BoardView view = chooseView(args)`, the interface, and the whole user
interface swaps with one expression. Six views in the reference repo, one
`Game`, no `if` in the engine asking which. The bonus track lives on this
line.

One sentence on a cousin you will hear about: **dependency injection** is a
technique for doing this, handing a class the thing it depends on instead
of letting it build its own. Your `Game(Board board, Color sideToMove)`
constructor is a small case. The tests inject a board; `Game` never asks
where it came from.

---

## 7. In-class exercise: where does it belong?

In pairs, seven minutes. Six features that are coming. For each, name the
class (or package) it goes in, say in one sentence why, and name the
letter you leaned on.

1. A `hasMoved` flag, so that castling can tell whether the king or the
   rook has moved.
2. "Is e4 attacked by Black?"
3. Draw the board from Black's side, rank 1 at the top.
4. How many pawns does White have?
5. "Is this position checkmate?"
6. Load a saved game from a text file.

Then, five minutes as a room. Number 1 is the argument; spend the time
there.

---

## 8. Code review: a class that does everything

This program plays chess. Two people can sit at it and move pieces, it
refuses moves that break the geometry, and it fits on two screens. It is
also every decision you made this month, undone.

```java
public class ChessGame {

    private final Piece[][] squares = new Piece[8][8];
    private boolean whiteToMove = true;
    private final Scanner in = new Scanner(System.in);

    public static void main(String[] args) {
        new ChessGame().run();
    }

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

            squares[tf][tr] = piece;
            squares[ff][fr] = null;
            whiteToMove = !whiteToMove;
        }
    }

    private void setUp() {
        String back = "RNBQKBNR";
        for (int f = 0; f < 8; f++) {
            squares[f][0] = new Piece(back.charAt(f), true);
            squares[f][1] = new Piece('P', true);
            squares[f][6] = new Piece('P', false);
            squares[f][7] = new Piece(back.charAt(f), false);
        }
    }

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
            case 'P':
                int dir = piece.isWhite() ? 1 : -1;
                if (df == 0 && tr - fr == dir && target == null) return true;
                return df == 1 && tr - fr == dir && target != null;
            default: return false;
        }
    }

    private boolean pathClear(int ff, int fr, int tf, int tr) {
        // step from (ff, fr) toward (tf, tr); false if any square between is occupied
        ...
    }

    private void print() {
        for (int r = 7; r >= 0; r--) {
            System.out.print((r + 1) + " ");
            for (int f = 0; f < 8; f++) {
                Piece p = squares[f][r];
                System.out.print(p == null ? ". " : p.symbol() + " ");
            }
            System.out.println();
        }
        System.out.println("  a b c d e f g h");
    }

    record Piece(char letter, boolean isWhite) {
        char symbol() { return isWhite ? letter : Character.toLowerCase(letter); }
    }
}
```

**Ask of it:** what does this class know? Who would ask for a change to it?
How many reasons does it have to open?

Then the room takes it apart. Each cut names what leaves, where it goes in
*your* engine, and which letter says so. There are at least six. Start
with the easiest, and do not stop until `ChessGame` is either empty or is
`Game`.

**How to give feedback**, from session 7: about the code, never the author.
"This method both draws and decides" not "you mixed things up". Say what
it costs: "to add a Swing window, every line in `print` and `run` changes."

---

## 9. Recap and M4

1. **S** is Monday, named. One asker per class. M4 gave `Game` one asker.
2. **O** and **L** are a pair: adding a piece without editing the loop
   works only because every piece keeps `Piece`'s promise.
3. **I** and **D** are about the arrows: narrow surfaces, pointed at the
   abstract thing in the middle. `Main` sees `Game`; the loop sees `Piece`.
4. Every principle has a line in your repo where you chose not to follow it,
   and could say why. That is what knowing a principle means.

The words, and where they are in your repo after M4:

| Term | Where |
|---|---|
| SRP | `Game` after M4; `Board`; `TextBoardRenderer` |
| OCP | `Piece.pseudoLegalMoves` abstract; the Archbishop needs one new file |
| LSP | six pieces through one `Piece` reference; `Pawn.attacks` keeps the promise |
| ISP | `Main` sees five methods of `Game`; `pseudoLegalMoves` is package-private |
| DIP | `MoveGenerator` imports `Piece`, never `Knight`; `List<Move>` |
| The one allowed switch | `PieceFactory.create`: OCP broken on purpose, once, at the edge |
| God class | §8's `ChessGame`: every principle, missing |

**M4 by Monday Oct 12.** Merge, move the loop, one line in `Game`, read your
diff. If M3 is still red, M3 first; it is due Monday.

---

## Next session

Monday Oct 5: refactoring and code smells. The names for things that are
wrong with working code, a catalogue of the safe moves that fix them, and
M5: king safety, forty lines that land in `MoveGenerator` and nowhere
else. M3 is due that night.

---

## INSTRUCTOR ONLY

**Timing (75 min):** objective 3 · §1 table 5 · §2 S 8 · §3 O 10 · §4 L 10
· §5 I 7 · §6 D 7 · §7 exercise 12 · §8 god class 10 · recap 3. If behind,
cut §5 and §6 to one slide each (the `Main`/`Game` point and the `grep
Knight` point) and protect §7 and §8. If ahead, let §8 run; it is the best
ten minutes of the week.

**§1: say the "you have mostly done these" claim and mean it.** The room
has heard SOLID as a job-interview list. The frame today is recognition,
not instruction. Every lens ends by pointing at a line they wrote.

**§3: the factory switch must be called a violation out loud.** Students
who learn "no switches ever" will spend week 9 confused. The sentence is:
"one switch, on purpose, at the edge, and week 9 explains why that one is a
pattern." The M5 paragraph is there because someone will ask "isn't
tightening `legalMoves` a modification?" next week. Pre-empt it.

**§4: `Pawn.attacks` is the example to spend time on.** Half the room
thinks overriding is a Liskov violation by definition. The distinction to
land: overriding to *keep* the promise for a case the default gets wrong,
versus overriding to *change* the promise. Then the three violations, fast.

**§7 answers.**

1. `hasMoved`: the tempting answer is a field on `Piece`. Costs: pieces
   become mutable, two identical rooks now differ, and `Move`'s `moved`
   field would carry state that changes under it. On `Board`? Not storage.
   The answer is that "has the king moved" is a fact about the **history**,
   and `Game` already has one: has any move in `history` started from e1
   with a king? M12 decides the exact mechanism; the room should reach
   "not `Piece`, not `Board`, somewhere that sees history". Letters: S (who
   would ask? the castling rule, which is `engine`) and L (a mutable piece
   breaks "same fields, same piece").
2. `isAttacked(board, e4, BLACK)`: `MoveGenerator`, M5. Needs every black
   piece; no piece can see the others; `Piece.attacks` is the most one
   piece says, and the generator sums it. S.
3. Flipped board: `view`. A flag on `TextBoardRenderer` or a second
   renderer; the model does not change. O: a new way of drawing is new
   code. (The reference's renderer takes a perspective.)
4. Pawn count: `Board`, a query over storage like `positionsOf`. Or a
   caller computes it from `positionsOf` and `pieceAt`; both fine. Not
   `Game`: nothing about turns or history. S.
5. Checkmate: `MoveGenerator`, M8: no legal moves *and* in check, built from
   `legalMoves` and `isInCheck`; `Game` exposes it as `status()`. Not
   `King`: needs the whole board. Some pairs say `Game`; accept it with
   "and what does `Game` call to find out?"
6. Load from file: `factory`. `BoardFactory.fromFen` already turns text into
   a board; a file reader belongs beside it, or in a new `io` package. This
   is where checked exceptions arrive (session 8 §5). M7. D: the engine
   depends on a `Board`, not on where it came from.

**§8 cuts, in the order that usually works.**

1. `print()` → `TextBoardRenderer`. Everyone sees it. S; and the cost line:
   "a Swing window means rewriting this method."
2. The `switch` in `canMove` → six `Piece` subclasses behind
   `pseudoLegalMoves`; `pathClear` → `slidingMoves`. O, and D: the loop
   will depend on `Piece`, not on `'N'`.
3. `squares`, `setUp`, and the two assignment lines in `run` → `Board`
   with `apply`, and `BoardFactory.standard()`. S.
4. `whiteToMove`, the flip, and "Not your piece" → `Game.sideToMove` and
   generating moves for the side to move only. S.
5. The `Scanner`, the parsing of `"e2e4"`, and the messages → a view and a
   controller (M9); the parsing is `Position.parse` plus `findLegalMove`.
   I: the loop should see only what `Game` offers.
6. `boolean isWhite` → `Color`; `char letter` → `PieceType`. Session 3's
   closed sets. D, in miniature: depend on a type, not on a character.

When it is done, what is left is `Game`: a board, a side to move, and
`play`. Say that aloud. The god class was not wrong about what a chess
program needs; it was wrong about how many classes that is.

**Decisions taken in writing this session, for the record.** SOLID is
taught as recognition over the students' own M2/M3/M4 code, not as a
fresh list; the "deliberate violation" for each principle is named so that
the room leaves with judgement rather than rules. The §7 answer for
`hasMoved` points at history without committing M12 to a mechanism; check
against the reference when M12 is written (the syllabus row already says
"special moves that depend on history"). The god class is in the notes
only; it is not in any repo and should not be.

**Check before class:** §8's `ChessGame` on one slide *and* printed, since
it is too long to read from the projector · §7's six features on the board
before the pairs start · M3 red-count check-in at the door: who is still
on step 4 or earlier gets pointed at the M3 handout's Common problems.
