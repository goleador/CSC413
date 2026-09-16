# Session 6 — Inheritance & Polymorphism
### The `Piece` hierarchy
**Week 4, Wednesday Sep 16**

> Concept today; hands on Monday. Do not refactor Piece live today; that is
> Monday's session, on a student's real M1 file. Say aloud: M1 due Mon Sep 21;
> M2 opens today, due Mon Sep 28.

---

## By the end of today you can

1. Decide whether a `switch` over piece types should become a family of classes
2. Say what `abstract`, `extends`, `super`, `protected`, `@Override` each *prevent*
3. Tell **is-a** from **is-implemented-like**

> Read these out. Return to them at the recap and ask the room whether each
> one landed.

---

## 1. You have a `Board`

```
8  r n b q k b n r
7  p p p p p p p p
6  . . . . . . . .
5  . . . . . . . .
4  . . . . . . . .
3  . . . . . . . .
2  P P P P P P P P
1  R N B Q K B N R

   a b c d e f g h
```

- `Board`: `place`, `pieceAt`
- `Piece`: a color and a type
- `Position`: a square

**Now: move the knight on b1.**

> This is M1, done. Thirty-two pieces on squares. The first thing a chess
> program does next is move one of them.

---

## Where can the knight on b1 go?

*(reveal: the knight diagram, `assets/knight-b1.svg`)*

*(reveal)* You just applied the knight's rule. **Where is that rule in your code?**

*(reveal)* **Nowhere yet.**

> Let them answer: a3, c3, d2. Then reveal the picture. Then the second
> question, and wait. Piece knows a color and a type; Board knows what stands
> where. Nobody knows how a knight moves.

---

## Where should that code live?

- *(reveal)* On `Board`? It already knows what stands on each square
- *(reveal)* On `Piece`? It knows its own type
- *(reveal)* Somewhere new? A `MoveRules` class

> Collect proposals before revealing any. All three are defensible at this
> point. Do not settle it yet.

---

## Here is one idea, on `Board`

```java
public List<Move> movesFor(Position from) {
    Piece piece = pieceAt(from);
    switch (piece.type()) {
        case KNIGHT -> { /* the eight L-shaped offsets */ }
        case BISHOP -> { /* slide 4 diagonals until blocked */ }
        case ROOK   -> { /* slide 4 lines until blocked */ }
        case QUEEN  -> { /* both */ }
        case KING   -> { /* one step, 8 directions */ }
        case PAWN   -> { /* forward; two from start; capture
                            diagonally; promote; ... 40 lines */ }
    }
}
```

A `Move` is from, to, and what was captured. Section 7.

> Write it well and mean it. Look at the piece, branch on its type, one case
> per kind. The lesson lands only if the room believes this is a reasonable
> design.

---

## What do you think?

*(reveal)* It works. Engines have shipped it.

*(reveal)* Next the engine needs *"does this piece attack that square?"* (for
check). Where does that go? **A second switch.**

*(reveal)* A seventh kind of piece: find every switch by hand. Miss one and
the compiler says nothing.

*(reveal)* The pawn's forty lines sit next to the knight's eight.

> Wait for the room first. Then reveal one at a time. A pawn attacks
> diagonally but moves straight, so attacks is not "could it move there"; it
> needs its own six cases. A piece's value for an AI would be a third switch.

---

## Who knows how a knight moves?

*(reveal)* **The knight.**

*(reveal)* So can a knight be its own class?

*(reveal)* **Yes, if `Piece` is something a `Knight` can be *a kind of*.**

> This is the turn. The switch asks the piece what it is and then does the
> work for it. If each kind is a class, the work lives with the kind and
> nobody has to ask.

---

## The shape of the solution

```java
abstract class Piece {
    abstract List<Move> pseudoLegalMoves(Board board, Position from);
}
class Knight extends Piece { /* the eight offsets */ }
class Rook   extends Piece { /* slide until blocked */ }

// the caller, anywhere in the program:
board.pieceAt(from).pseudoLegalMoves(board, from);   // never asks the type
```

> **Ask the object. Don't ask what it is.**

> A sketch, not the code. Monday's rule was "one reason to change"; today's
> is this. Section 2 fills the sketch in.

---

## 2. A kind of `Piece`

```java
public abstract class Piece {
    private final Color color;
    private final PieceType type;

    protected Piece(Color color, PieceType type) { ... }   // was public

    public Color color() { ... }
    public PieceType type() { ... }
    public char symbol() { ... }                           // unchanged

    public abstract List<Move> pseudoLegalMoves(Board board, Position from);
}
```

> The sketch, in full. The shared parts of M1's Piece stay; each arm of the
> switch becomes a method body in its own class. Same behaviour, new shape.
> Monday we do it live on a real file.

---

## And a `Knight`

```java
public class Knight extends Piece {

    public Knight(Color color) {
        super(color, PieceType.KNIGHT);
    }

    @Override
    public List<Move> pseudoLegalMoves(Board board, Position from) {
        ...   // the eight offsets
    }
}
```

`new Knight(Color.WHITE)`: the class fills in the type.

---

## Six words, one job each

| | *(one row per reveal)* |
|---|---|
| `extends` | `Knight` is a `Piece`: it inherits `color()`, `type()`, `symbol()` |
| `super(...)` | hands `color` and `type` up to `Piece`'s constructor; they are private there |
| `abstract` method | no body: every subclass must supply one, or it does not compile |
| `abstract` class | `new Piece(...)` is an error: there is no "a piece", only kinds |
| `protected` | subclasses may call it; the rest of the program may not |
| `@Override` | compiler check: a typo becomes an error, not a second method |

> One row per reveal; ask a student to restate each. extends and super are
> the mechanism; abstract, protected and @Override are the guards. Most know
> extends; few can say what protected or @Override buys. The typo example
> sticks: psuedoLegalMoves would silently be a new method and the abstract
> one would stay unfulfilled.

---

## 3. The call site does not know

```java
Piece piece = board.pieceAt(from);                       // declared: Piece
List<Move> moves = piece.pseudoLegalMoves(board, from);  // the object decides
```

The **variable** is a `Piece`. The **object** is a `Knight`. Java runs the
object's version.

**That is dynamic dispatch, and it is what "polymorphism" means.**

> The call looks exactly as it did in section 1. What changed is inside:
> there one method body knew all six kinds and branched; here no method
> knows more than one kind.

---

## Add a seventh kind of piece. Which line changes?

```java
for (Position from : board.positionsOf(color)) {
    moves.addAll(board.pieceAt(from).pseudoLegalMoves(board, from));
}
```

*(reveal)* **None.**

*(reveal)* You add a class; nothing else is edited. This is called *open for
extension, closed for modification*.

> This loop is all of move generation minus king safety. Wait for "none".
> Name open/closed once and move on; SOLID has its own week.

---

## 4. Two ways to move

- **Sliders** (bishop, rook, queen): along a line until the edge or a piece
- **Steppers** (knight, king): jump to fixed offsets

Let us trace one of each.

---

## A knight on b1

*(the knight diagram: `assets/knight-b1.svg`)*

> Walk the eight offsets aloud. Count three on the board. Point at the five
> nulls: this is why M0b's offsetOrNull returns null instead of throwing.
> Same loop for the king; only the table differs.

---

## A rook on a1

*(the rook diagram: `assets/rook-a1-blocked.svg`)*

> Up: a2, a3, friend on a4, stop; a4 is not a move. Right: b1, c1, d1, enemy
> on e1, capture, then stop. Left and down: null at once. Five moves. Same
> loop for bishop and queen.

---

## The two loops live on `Piece`

```java
    /** Slides from `from` along each {file, rank} direction until blocked. */
    protected List<Move> slidingMoves(Board board, Position from,
                                      int[][] directions) { ... }

    /** Steps to each {file, rank} offset on the board and not a friend. */
    protected List<Move> steppingMoves(Board board, Position from,
                                       int[][] offsets) { ... }
```

`protected`: subclasses call them; nobody else needs to.

---

## Then a subclass is a table and one line

```java
public class Rook extends Piece {

    private static final int[][] DIRECTIONS = {
            {0, 1}, {1, 0}, {0, -1}, {-1, 0}
    };

    public Rook(Color color) { super(color, PieceType.ROOK); }

    @Override
    public List<Move> pseudoLegalMoves(Board board, Position from) {
        return slidingMoves(board, from, DIRECTIONS);
    }
}
```

---

## Why not `Piece` → `SlidingPiece` → `Rook`?

*(reveal)* A class gets **one** `extends`: one chance to say what it *is*.

*(reveal)* "A rook is a sliding piece." About **chess**, or about **your code**?

*(reveal)* **About the code. Do not inherit it; a helper gives the same reuse.**

> A student will draw the middle class on the board. Let them, then ask the
> chess-or-code question aloud. The queen argument (borrowing sibling tables)
> is for Monday, not today.

---

## Inheritance for is-a. A helper for is-implemented-like.

| | |
|---|---|
| A rook **is a** piece | `extends Piece` |
| A rook **is implemented like** a bishop | shared `slidingMoves` |
| A rook **is a** sliding piece | about the code, not the game: no |

---

## 5. The pawn

Moves forward, captures diagonally, two squares on its first move, turns into
another piece at the end.

**All of it in `Pawn.java`. Nothing else knows pawns are unusual.**

> Section 3's payoff in one sentence: the irregular case costs one class, not
> a special case in every method.

---

## The second question again: does it *attack* that square?

*(reveal)* For five of six pieces it is "can it move there?", so the base
class gives a **default**:

```java
    public boolean attacks(Board board, Position from, Position target) {
        for (Move move : pseudoLegalMoves(board, from)) {
            if (move.to().equals(target)) return true;
        }
        return false;
    }
```

*(reveal)* Not `abstract`: it has a body. Five subclasses never mention it.

---

## The one override

A pawn attacks the two diagonals **whether or not** anything is there, and
does *not* attack the square ahead.

```java
    @Override
    public boolean attacks(Board board, Position from, Position target) {
        ...   // geometry: one rank forward, one file either side
    }
```

Test: `pawnAttacksDifferFromMoves`

> One sentence aloud: this is why a king may later step in front of a pawn
> but never diagonally in front of one.

---

## Two words that sound alike

- **Override**: same signature, in a subclass, replaces the behaviour. `Pawn.attacks`
- **Overload**: same name, different parameters, same class. `String.valueOf(int)`, `String.valueOf(char)`

An override must answer the *same question*, correctly for its kind.

> Override vs overload confuses people for years. String.valueOf is the
> overload example because everyone has called it. Substitutability: change
> the meaning and every caller that trusted Piece breaks.

---

## 6. Two ways to draw the same board

```
r n b q k b n r        ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜
p p p p p p p p        ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟
. . . . . . . .        · · · · · · · ·
. . . . . . . .        · · · · · · · ·
P P P P P P P P        ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙
R N B Q K B N R        ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖
```

Whoever prints the board asks, for each square: **what text goes here?**

**Two answers. The printing loop should not care which.**

> A new question, unrelated to movement. Letters for a plain terminal,
> figures for one with a good font. Same loop over the squares either way;
> only the answer per square differs.

---

## What do *Letters* and *Figures* share?

*(reveal)* Are they kinds of `Piece`? **No.** They are not pieces; they are two
ways to answer one question.

*(reveal)* Do they share any **fields**? **None.**

*(reveal)* Do they share any **code**? **None.**

*(reveal)* **All they share is the question. An abstract class is too much; we
need a promise with nothing attached.**

> Let them try "extends Piece" and reject it. Then the two sharing questions.
> Piece needed an abstract class because there was state and code to share;
> here there is neither.

---

## An interface: the promise, and only the promise

```java
public interface PieceGlyphs {
    String glyphFor(Piece piece);      // null piece = empty square
}
class Letters implements PieceGlyphs {
    public String glyphFor(Piece p) {
        return p == null ? "." : String.valueOf(p.symbol());
    }
}
class Figures implements PieceGlyphs {
    public String glyphFor(Piece p) { /* ♔ ♚ ... */ }
}
// the printing loop, once:
out.print(glyphs.glyphFor(board.pieceAt(square)));   // never asks which
```

> Same move as section 3: the caller asks the object and never asks which it
> has. No fields, no shared bodies, so no class hierarchy is needed. The file
> you were given in M1 writes Letters and Figures as two lambdas inside the
> interface; same thing, shorter. Interfaces get their own session in week 11.

---

## Abstract class or interface?

| | `Piece` | `PieceGlyphs` |
|---|---|---|
| shared state | `color`, `type` | none |
| shared code | helpers, `attacks` | none |
| a promise | `pseudoLegalMoves` | `glyphFor` |
| | **abstract class** | **interface** |

`extends` one class. `implements` any number of interfaces.

> Is-a with shared state or code: abstract class. A capability with nothing
> shared: interface. The asymmetry is one more reason the single extends is
> precious.

---

## 7. `Move`: a value that remembers

```java
public record Move(Position from, Position to, Piece moved,
                   Piece captured, PieceType promotesTo) {

    public static Move quiet(Position from, Position to, Piece moved) { ... }
    public static Move capture(Position from, Position to, Piece moved,
                               Piece captured) { ... }
    public static Move promotion(Position from, Position to, Piece moved,
                                 Piece captured, PieceType promotesTo) { ... }

    public boolean isCapture() { ... }
    public boolean isPromotion() { ... }

    @Override public String toString() { ... }   // "e2e4", "e7e8q"
}
```

> Three things, one sentence each. The move carries the captured piece:
> Monday's "whoever took it remembers"; this is who, and it makes undo
> possible later. Named factories read; new Move(..., null, null) makes you
> count nulls. toString is long algebraic, e2e4 / e7e8q; pawnPromotes
> compares strings. Short on time? One sentence; the handout covers Move.

---

## 8. `Piece` is abstract. Who says `new Knight(WHITE)`?

*(reveal)*

```java
public static Piece create(PieceType type, Color color) {
    return switch (type) {
        case PAWN -> new Pawn(color);
        case KNIGHT -> new Knight(color);
        case BISHOP -> new Bishop(color);
        case ROOK -> new Rook(color);
        case QUEEN -> new Queen(color);
        case KING -> new King(color);
    };
}
```

*(reveal)* Yes, that is a `switch` on `PieceType`.

> Something has to turn data ('n' in FEN, KNIGHT + WHITE in a test) into an
> object. M2 gives you this, working. Say plainly that it is a switch;
> otherwise they conclude the rule is arbitrary.

---

# Switch at the edges. Polymorphism in the middle.

Where data becomes objects, one `switch`, in one place.

No `default`: a seventh type stops the build at the one line to write.

> The Factory pattern; studied properly later. Point out the missing default
> and what it buys.

---

## What this changes for you

`BoardFactory.standard()` sets up the game. **Delete** the loop in your M1 `Main`.

The merge changes two test helpers by one line:

```java
-        return new Piece(color, type);
+        return PieceFactory.create(type, color);
```

From today, only `PieceFactory` says `new` for a piece.

---

**10 minutes · in pairs**

# Add a piece

The **Archbishop** (fairy chess): any bishop move, or any knight move.

> Protect these ten minutes. Take the switch list from one pair and the
> hierarchy list from another; the contrast is the lesson.

---

## Add the Archbishop

1. **Switch design:** every method you would edit
2. **Hierarchy:** what do you *write*? What do you *edit*?
3. `Archbishop extends Bishop`? Chess, or code?
4. It prints as `A`. Where does the letter go?

> For 1, remind them to include attacks, an AI's piece values, and the view's
> glyphs.

---

## What to look for

- *(reveal)* **Switch:** `movesFor`, `attacks`, values, glyphs, and a `default` hiding the gap
- *(reveal)* **Hierarchy:** *write* `Archbishop.java`; *edit* one line each in `PieceType`, `PieceFactory`
- *(reveal)* `extends Bishop` fails is-a. `extends Piece`
- *(reveal)* The letter goes in `PieceType`, by Monday's rule
- *(reveal)* `FIGURES` needs a glyph: a display decision, made in the view

---

## Recap

1. Behaviour differs by kind, and there is a lot of it: **the kinds become classes**
2. **Ask the object.** Adding a kind adds a class; callers do not change
3. **Inheritance for is-a.** A helper for is-implemented-like. A `switch` only at the edge

> End the concept half here. Back to the objective slide: did each of the
> three land?

---

## M2: your turn

```bash
git fetch upstream --tags
git merge m2
./mvnw test        # red; the failures are the assignment
```

**Arrives:** seven scaffolds, `PieceFactory` and `BoardFactory`, ten new
tests. **Stays yours:** `Piece` and `Board`. You edit them.

```
Knight.java: method does not override or implement a method from a supertype
```

Seven times. Fixing it is the assignment.

---

## Build in this order

1. Refactor `Piece` *(Monday, live)*
2. `Main` → `BoardFactory.standard()` **34 run, 10 red**
3. `Move`
4. `Knight`, `King`: one line each **7 red**
5. `Rook`, `Bishop`, `Queen`: one line each **5 red**
6. `Pawn`: the real work **green**

```
Tests run: 34, Failures: 0, Errors: 0   →   git tag submit-m2
```

> Handout and notes section 10 have the full version, and section 11 lists
> the nine common errors with their fixes.

---

**M1 due Mon Sep 21 · M2 due Mon Sep 28**

# Next: Monday Sep 21, hands on

Refactor a real M1 `Piece` live · write `Knight` together ·
review two or three M1 `Board`s

**Bring your M1 `Piece`. It is the file we operate on.**

> Then Wed Sep 23: collections, generics, exceptions; M3 opens.
