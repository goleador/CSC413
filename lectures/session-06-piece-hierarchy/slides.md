# Session 6 — Inheritance & Polymorphism
### The `Piece` hierarchy
**Week 4, Wednesday Sep 16**

> Concept today; hands on Monday. Do not refactor Piece live today — that
> is Monday's session, on a student's real M1 file.

---

## Where this sits

- M1 is in progress — due **Mon Sep 21**
- Your `Piece` knows *what it is*. Today we ask it **where it can go**
- That is **M2**, due **Mon Sep 28, 11:59 PM**
- Monday: the hands-on half — refactor your `Piece` live, write `Knight` together

Monday I said `Piece` is a class because of a requirement two days away.
**This is the requirement.**

---

## Monday's rule, and today's

> **Every class has one reason to change.**
> — Monday

> **Ask the object. Don't ask what it is.**
> — today

The moment you write `if (piece.type() == KNIGHT)` — or `instanceof` —
**stop.** Whatever you were about to do belongs inside `Knight`.

---

## 1. The obvious answer

```java
public List<Move> movesFor(Board board, Position from) {
    Piece piece = board.pieceAt(from);
    switch (piece.type()) {
        case KNIGHT -> { /* eight L-shaped offsets */ }
        case BISHOP -> { /* slide 4 diagonals until blocked */ }
        case ROOK   -> { /* slide 4 lines until blocked */ }
        case QUEEN  -> { /* both */ }
        case KING   -> { /* one step, 8 directions */ }
        case PAWN   -> { /* forward; two from start; capture
                            diagonally; promote; ... 40 lines */ }
    }
}
```

It works. Engines have shipped it.

> Write it well and mean it. The lesson lands only if the room believes
> this is a reasonable design.

---

## What happens next

- **M5 asks: does this piece *attack* that square?** Pawns differ → a second six-way switch.
- **The bonus AI asks: what is it worth?** A third.
- Six types × N questions. Add a type → find and edit *every* switch. Miss one → the compiler says nothing.
- **The pawn's 40 lines** sit in the middle of a method about all pieces.

---

## Monday's rule does not rescue it

*"Put the answer inside the enum"* works for a letter.

Here each arm needs the `Board`, the `Position`, a `List<Move>` —
`PieceType` would import half the model and grow to 200 lines of six
unrelated bodies.

**When the *behaviour* differs by kind, and it is substantial, the kinds
should be classes.**

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

`new Knight(Color.WHITE)` — the *type* is a fact about the class, so the
class supplies it.

---

## Six words, one line each

| | |
|---|---|
| `extends` | `Knight` **is-a** `Piece`. `color()`, `symbol()` written once, inherited six times |
| `super(...)` | set up the superclass part first |
| `abstract` method | a **promise**: every concrete subclass answers this. No body. Compiler-enforced |
| `abstract` class | **cannot be instantiated** — there is no such thing as "a piece" |
| `protected` | subclasses and the package; not the world |
| `@Override` | *check* that I am overriding — catches a misspelling |

> Go slowly. Most know `extends`; few can say what `protected` or
> `@Override` prevents.

---

## `@Override` — the message you will see today

```
Knight.java: method does not override or implement
             a method from a supertype
```

Seven times, right after `git merge m2` — because *your* `Piece` has no
`pseudoLegalMoves` yet.

**That error is the assignment.**

---

## 3. The call site does not know

```java
Piece piece = board.pieceAt(from);                       // declared: Piece
List<Move> moves = piece.pseudoLegalMoves(board, from);  // the object decides
```

The **variable** is a `Piece`. The **object** is a `Knight`.
Java looks at the object — **dynamic dispatch**.

The caller never asks "what kind are you?"

---

## All of move generation

```java
for (Position from : board.positionsOf(color)) {
    moves.addAll(board.pieceAt(from).pseudoLegalMoves(board, from));
}
```

**Add a seventh kind of piece. Which line changes?**

> Wait for "none". That silence is the whole point.

---

# Open for extension, closed for modification.

## Add a class. Edit nothing.

The O in SOLID — week 6 does all five letters. Today you only need to
see it happen once.

---

## 4. Two movement families

- **Sliders** — bishop, rook, queen. Glide until the edge or a piece. Capture an enemy; blocked by a friend.
- **Steppers** — knight, king. Jump to fixed offsets. Land if empty or enemy.

Two loops. Not five copies of them.

---

## Helpers on the base class

```java
    /** Slides from `from` along each {file, rank} direction until blocked. */
    protected List<Move> slidingMoves(Board board, Position from,
                                      int[][] directions) { ... }

    /** Steps to each {file, rank} offset on the board and not a friend. */
    protected List<Move> steppingMoves(Board board, Position from,
                                       int[][] offsets) { ... }
```

`to = to.offsetOrNull(dx, dy)` until `null` — **this is why M0b returned
null instead of throwing.**

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

**Java has single inheritance.** One `extends`, one *is-a*. Spend it on what
the thing **is**.

*"A rook is a sliding piece"* — a statement about chess, or about your
program?

If it is about your program, **do not inherit it.** A protected helper
gives the same reuse without spending the slot.

> Expect someone to draw this on the board. Let them, then apply the
> test out loud.

---

## The queen tells you it is the wrong axis

A queen moves like a rook **and** a bishop. `Queen extends Rook, Bishop`
does not exist.

The instinct — *"borrow `Rook.DIRECTIONS` + `Bishop.DIRECTIONS`"* —
couples three classes, opens two `private` tables, and makes "which way
does a queen move?" a two-file question.

**Eight literal pairs in `Queen` answer it on sight.**

Duplication is not free — but it is cheaper here than the coupling.
DRY is a judgement, not a reflex.

---

## Inheritance for is-a. Helpers for is-implemented-like.

| | |
|---|---|
| A rook **is a** piece | `extends Piece` ✅ |
| A rook **is implemented like** a bishop | `slidingMoves` helper ✅ |
| A rook **is a** sliding piece | ❌ a fact about your code |

---

## 5. The pawn breaks every rule

Only piece that moves one way · whose capture differs from its move ·
with a special first move · that turns into something else.

**All of it in `Pawn.java`.** Nothing else in the engine knows pawns are
strange.

The irregular case costs **one class** — not a special case in every
method that touches a piece.

---

## A second question: does it *attack* that square?

For five of six pieces: "can it move there?" So the base class provides a
**default** — a body, not `abstract`:

```java
    public boolean attacks(Board board, Position from, Position target) {
        for (Move move : pseudoLegalMoves(board, from)) {
            if (move.to().equals(target)) return true;
        }
        return false;
    }
```

Five subclasses never mention it.

---

## The one override

A pawn attacks the two diagonals **whether or not anything is there** — and
does *not* attack the square ahead, even though it can move there.

```java
    @Override
    public boolean attacks(Board board, Position from, Position target) {
        ...   // geometry: one rank forward, one file either side
    }
```

One override, in the one class where the rule differs.
M5: a king may step *in front of* a pawn; never *diagonally in front*.

---

## Two more words

- **Override** — same signature, subclass *replaces* the behaviour. `Pawn.attacks`.
- **Overload** — same name, different parameters, same class. Your given renderer: `render(Board)` and `render(Board, Color)`.
- **Substitutability** — anywhere a `Piece` is expected, a `Pawn` must work. `Pawn.attacks` answers *the same question*, correctly for a pawn. Change the *meaning* and every caller breaks. (The L. Week 6.)

---

## 6. Interfaces: a contract with no state

An abstract class bundles **state** + **shared code** + **a promise**.

Sometimes all you have is the promise. You already own one — Monday's
given `PieceGlyphs`:

```java
@FunctionalInterface
public interface PieceGlyphs {
    String glyphFor(Piece piece);

    PieceGlyphs LETTERS = piece ->
            piece == null ? "." : String.valueOf(piece.symbol());
    PieceGlyphs FIGURES = piece -> { ... };   // ♔ ♚ ·
}
```

One method. Two implementations, as lambdas. The renderer never knows which.

---

## Abstract class or interface?

| | |
|---|---|
| **is-a**, with shared state or code | `abstract class` — `Piece` |
| **can-do** — a capability, a contract | `interface` — `PieceGlyphs`; week 11's `BoardView` |

`extends` **one** class. `implements` **any number** of interfaces.
That asymmetry is why the one `extends` is spent on meaning.

---

## 7. `Move` — a value that remembers

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

---

## Three decisions in `Move`

- **`captured` travels with the move.** Monday: no `remove` on `Board` — *"whoever took it remembers."* This is who. M8's undo reads it here.
- **Named static factories.** `Move.quiet(from, to, knight)` reads. `new Move(from, to, knight, null, null)` counts nulls.
- **`toString` is long algebraic** — `e2e4`, `e7e8q`. What the console reads and prints in M9; what `pawnPromotes` compares.

---

## 8. Who says `new Knight(WHITE)` now?

Something has to turn **data** — `'n'` in FEN, `KNIGHT` + `WHITE` in a test —
into an **object**. M2 hands you it, working:

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

**A `switch` on `PieceType`.** After two lectures against it.

---

# Switch at the edges. Polymorphism in the middle.

At the boundary where data becomes objects, *something* maps a name to
a class — in **exactly one place**.

No `default` branch: add a seventh type and this file **stops compiling**.
The compiler points at the one line to write. That is a feature.

The **Factory pattern** — week 9 studies it. Today it is given.

> Say plainly that it is a switch. If you do not, they conclude the rule
> is arbitrary.

---

## Two consequences you will see

**`BoardFactory.standard()`** sets up a game — and replaces the loop you
wrote in `Main` for M1. Delete the loop. That is what factories are for.

**The merge rewrites two of your tests**, one line each:

```java
-        return new Piece(color, type);
+        return PieceFactory.create(type, color);
```

There is no `new Piece` any more. That is the cost an abstract class
imposes on its callers — and why, after today, **only the factory says
`new`** for a piece.

---

**10 minutes · in pairs**

# Add a piece

The **Archbishop** (fairy chess): any bishop move, or any knight move.

---

## Add the Archbishop

1. **Switch design:** list every method you would edit. Include `attacks`, the AI's value, the view.
2. **Hierarchy:** what do you *write*? What do you *edit*?
3. `Archbishop extends Bishop`? Apply the test from §4.
4. It prints as `A`. Where does the letter go?

---

## What to look for

- **Switch:** `movesFor`, `attacks`, the value table, the glyph switch — plus a `default` somewhere that swallows the new type silently. Every one found by hand.
- **Hierarchy:** *write* `Archbishop.java`, ~15 lines: `steppingMoves` (knight offsets) + `slidingMoves` (diagonals), one list appended to the other. *Edit* `PieceType` (one constant) and `PieceFactory` (one case — the compiler tells you). **Nothing** in `Board`, move generation, or the renderer.
- **`extends Bishop`** fails is-a. `extends Piece`.
- **The letter** goes in `PieceType`. Monday's rule, the day after.
- `FIGURES` would need a glyph — a *display* decision, made in the view.

---

## M2 — your turn

```bash
git fetch upstream --tags
git merge m2
./mvnw test        # red — the failures are the assignment
```

**Arrives:** seven scaffolds (`Move`, `Knight`, `Bishop`, `Rook`, `Queen`,
`King`, `Pawn` — signatures, javadoc, tables; bodies throw) · `PieceFactory`
+ `BoardFactory`, given · `PieceMovementTest`, 10 tests · the one-line test change.

**Does not arrive:** `Piece` or `Board`. Yours from M1. You edit them.

```
Knight.java: method does not override or implement a method from a supertype
```
× 7. That error is the assignment.

---

## Build in this order

1. **Refactor `Piece`** — `abstract`, `protected` ctor, abstract `pseudoLegalMoves`, `attacks` default, the two helpers *(Monday, live)* → `Main`: "Piece is abstract"
2. **`Main`** → `BoardFactory.standard()` → **34 run, 10 red**
3. **`Move`** — factories, predicates, `toString` (flips nothing alone)
4. **`Knight`, `King`** — one line each on `steppingMoves` → **7 red**
5. **`Rook`, `Bishop`, `Queen`** — one line each on `slidingMoves` → **5 red**
6. **`Pawn`** — `pseudoLegalMoves` and `attacks`. The real work → **green**

---

## Done looks like

```
./mvnw test
Tests run: 34, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

**34** = M0b's 11 + M1's 13, all still passing, + 10 new.

```bash
git tag submit-m2 && git push origin main --tags
```

---

## When it goes wrong

- **"does not override" ×7** — `Piece` lacks `pseudoLegalMoves`, or the signature differs
- **"Piece is abstract"** — a `new Piece` survives, usually in `Main`. Use the factory
- **Conflict in `PieceTest`** — you edited a test; take theirs
- **`knightInCorner` throws** — `new Position(...)` off-board; use `offsetOrNull`
- **"must not slide past a capture"** — add the capture, *then* `break`
- **Queen gets 14, not 27** — one table; she has eight directions of her own
- **Pawn jumps the blocker** — check one-step *before* two-step
- **`pawnPromotes` gets 1, not 4** — the last rank expands to four moves
- **`pawnAttacks` fails** — `Pawn.attacks` is geometry, not `pseudoLegalMoves`

---

**M1 due Mon Sep 21 · M2 due Mon Sep 28**

# Next: Monday Sep 21 — hands on

Refactor a real M1 `Piece` live · write `Knight` together ·
review two or three M1 `Board`s against the one-sentence test

**Bring your M1 `Piece`. It is the file we operate on.**

> Then Wed Sep 23: collections, generics, exceptions — M3 opens.
