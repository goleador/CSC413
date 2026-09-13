# Session 5 — OO Design: `Board` & `Piece`
### Every question today has more than one answer that compiles
**Week 4, Monday Sep 14**

> Last Wednesday was cancelled, so this is week 3's session on week 4's
> Monday. Two sentences on the calendar, then the M0b debrief, then new
> material.

---

## The calendar, adjusted

- **Today** — this session · **M1 opens**, due **Mon Sep 21**
- **Wednesday** — inheritance & polymorphism · **M2 opens**
- **Mon Sep 21** — M2 hands-on: live refactor and code review
- **Wed Sep 23** — collections, generics, exceptions · M3 opens
- **Week 6** — back on the syllabus

Revised dates are on the course site.

---

## Where this sits

- M0b is behind you — you have `Position` and `Color`
- Today: the things that *hold* them — **`Board`** and **`Piece`**
- That is **M1**, due **Mon Sep 21, 11:59 PM**

This is where the course stops being a Java review and starts being a
design course.

---

## Week 2's rule, and this week's

> **Make invalid code impossible.**
> — week 2

> **Every class should have one reason to change.**
> — this week

When you cannot say what a class is responsible for in one sentence
without **"and"**, it is doing two jobs.

---

## 1. Is a `Piece` a value or an identity?

```java
Piece rook = new Piece(Color.WHITE, PieceType.ROOK);
```

Two white rooks, a1 and h1 — the *same rook written twice*?

- **value** → `record`
- **identity** → `class`

> Take the vote before giving the answer. By the equality test, the
> `record` camp is right.

---

## By the equality test: a value

A white rook is a white rook. The board remembers where each one stands.

So — `record`?

**A requirement decides it. This one is two days away.**

---

## Wednesday's requirement

Each *kind* of piece answers "where can I go?" differently.

Java's way: **subclasses**. A `record` is `final` — it cannot be extended.

```java
public class Piece {
    private final Color color;
    private final PieceType type;

    public Piece(Color color, PieceType type) { ... }
    public Color color() { ... }
    public PieceType type() { ... }
}
```

`class` — so that `Knight` and `Rook` can be *kinds of* `Piece`.

---

## `class` ≠ mutable

- `color` is **final** — white does not turn black
- `type` is **final** — a rook does not become a bishop
- Every field final: as much a value as a record, with the door to
  subclasses open

Make each field as immutable as its meaning allows. Usually that is all
of them.

> Color first, type second — "white rook". Wednesday's subclasses call
> `super(color, PieceType.KNIGHT)`.

---

## "But has *this* rook moved? Castling needs it."

**Whose fact is that?** The *game's history*, not the rook's.

It lives where the history lives — `Game`, in M12.

A `hasMoved` flag on the piece = a fact stored where it does not belong,
and a second copy of the truth to keep in sync.

> Promotion is the same story: M12 *replaces* the pawn.

---

## Heads-up: models built for a database look different

Two kinds of object, both legitimate:

- a **value** — defined by its fields. `e2` is `e2`. `Position`.
- an **entity** — defined by an identity that outlives its fields. A user. A row.

This course lives mostly in the first world. If you work with an ORM or a
database model, you will meet the second: mutable fields, equality by `id`,
nothing `final`. **Recognise it; don't assume someone is wrong.**

Most languages have a value construct that does what `record` does —
equality from fields, immutable fields: Kotlin `data class`, C# `record`,
Python `@dataclass(frozen=True)`, Swift `struct` … table in the notes.

> One slide, two minutes. They need to know the difference exists and that
> they will see models that go the other way. No prescriptions.

---

## `PieceType` — the closed set again

```java
public enum PieceType { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING; }
```

Six kinds, fixed since the fifteenth century.

Same bucket, same argument as `Color` in week 2.

---

## 2. The board prints as text

```
r n b q k b n r
p p p p p p p p
. . . . . . . .
. . . . . . . .
P P P P P P P P
R N B Q K B N R
```

Uppercase white · lowercase black · `.` empty

**Something has to turn a piece into a character. Where?**

---

## Three places it could live

- **In the view** — works until a *second* view (week 11). Two copies, one wrong within a month.
- **In `Piece`** — if knights print `H`, which class did you edit? A fact about knights, in the class for all pieces.
- **In `PieceType`** — the letter is a property of the type ✅

---

## The answer lives with the data

```java
public enum PieceType {
    PAWN('P'), KNIGHT('N'), BISHOP('B'),
    ROOK('R'), QUEEN('Q'), KING('K');

    private final char symbol;

    PieceType(char symbol) { this.symbol = symbol; }

    public char symbol() { return symbol; }

    /** The inverse: 'n' or 'N' → KNIGHT; 'X' → IllegalArgumentException */
    public static PieceType fromSymbol(char letter) { ... }
}
```

`N` for knight — the king already took `K`. FEN reads these back.

---

## And `Piece.symbol()` is two lines

```java
    public char symbol() {
        char letter = type.symbol();
        return color == Color.WHITE
                ? letter : Character.toLowerCase(letter);
    }

    @Override
    public String toString() { return String.valueOf(symbol()); }
```

Two `symbol()`s on purpose: the **type's** is always uppercase; the
**piece's** knows its color.

**No `switch` anywhere in the engine.**

---

# Writing `switch` over an enum?

## Check whether the answer belongs *inside* the enum.

> The session's transferable idea. Write it on the board.
> Flag that **Wednesday is the exception** — how a piece moves is
> polymorphism, not a constructor argument — or they over-apply it.

---

## 3. A board *has* 64 squares. It **is** not 64 squares.

```java
// Option A — the board IS the array
Piece[][] board = new Piece[8][8];
board[4][1] = new Piece(Color.WHITE, PieceType.PAWN);

// Option B — the board HAS an array
public class Board {
    private final Piece[][] squares =
            new Piece[Position.BOARD_SIZE][Position.BOARD_SIZE];
}
```

---

## What Option A costs you

- Every class must know which index is the file — one of them gets it backwards
- Nothing stops `board[9][4]`
- Nothing stops a caller clearing the array
- M7 (FEN) and M8 (undo) have **no object to live on**

Option B is **composition**: has-a, privately.

---

## The proof of encapsulation

Swap `Piece[8][8]` for `Piece[64]`, or for bitboards —
**no other class changes by a character.**

That is what encapsulation buys.

Not "private is good practice" — *the ability to change your mind later.*

---

## The interface, decided before the implementation

```java
public Board()                                     // empty
public Piece pieceAt(Position position)            // null if nothing
public boolean isEmpty(Position position)
public void place(Position position, Piece piece)  // replaces; null clears
public List<Position> positionsOf(Color color)     // where is white?
@Override public String toString()                 // one-line dump
```

Ask what **callers** need, not what the array offers.

---

## Five decisions hiding in six signatures

- **Always a `Position`, never two ints** — M0b's guarantee, spent here. No bounds checks.
- **`pieceAt` returns `null`** — 32 empty squares at the start; empty is ordinary.
- **`place` replaces; `null` clears. No `remove`.** Who needs the old piece? *Whoever took it* — Wednesday's `Move` records it.
- **No `startingPosition()`** — setup is a *factory*'s job. M2 hands you `BoardFactory`; `Main` does it for M1.
- **`positionsOf` is a query** — passes the one-sentence test.

---

## 4. The trap: which index is which?

```java
    /** Indexed [file][rank], both 0-based — the same order as Position. */
    private final Piece[][] squares = ...
```

`squares[position.file()][position.rank()]` — reads like the record.

Rank-first has one advantage: `squares[r]` names a rank, handy for
*printing*. Which is the job we are about to keep out of `Board`.

**Store it one way. Everywhere.**

---

## The one flip: `toString()` is FEN

```
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
```

Rank 8 first · `/` between ranks · a digit per run of empties

```java
    for (int rank = Position.BOARD_SIZE - 1; rank >= 0; rank--) {
        // this rank, file a to h
        if (rank > 0) text.append('/');
    }
```

The only descending loop in the class. Empty board: `8/8/8/8/8/8/8/8`.

---

## Drawing the board is not the model's job

Rank numbers, a file legend, `.` vs `·`, **which end is at the top** —
decisions about a *display*, not facts about chess.

So M1 hands you a view. Two files, in `view`, read but not edited:

- `PieceGlyphs` — how a view spells a piece (`LETTERS`, `FIGURES`)
- `TextBoardRenderer` — a `Board` as lines of text, from either side

```java
System.out.println(new TextBoardRenderer(PieceGlyphs.LETTERS).render(board));
```

---

## What it prints

```
8 r n b q k b n r
7 p p p p p p p p
6 . . . . . . . .
5 . . . . . . . .
4 . . . . . . . .
3 . . . . . . . .
2 P P P P P P P P
1 R N B Q K B N R
  a b c d e f g h
```

It calls **one** thing on `Board`: `pieceAt`.
`render(board, Color.BLACK)` flips the screen — without touching the model.

> Show the renderer; scroll to the one `pieceAt` call. Week 11 starts here.

---

## 5. Packages

```
...chess.model     Position, Color, PieceType, Piece, Board
...chess.view      PieceGlyphs, TextBoardRenderer   (given today)
...chess.factory   (M2)  PieceFactory, BoardFactory
...chess.engine    (M3+) MoveGenerator, Game
...chess           Main
```

`model` = the **nouns**. They know what things are — not how a game is
played or displayed. `view` → `model`; `model` → nothing.

---

**10 minutes · in pairs**

# Find the responsibility bug

> Not style. *Responsibility.* Ask of each line: is `Board` the class
> that should be deciding this?

---

## It compiles. It passes its test.

```java
public void movePiece(Position from, Position to) {
    Piece piece = squares[from.file()][from.rank()];
    if (piece == null) {
        System.out.println("No piece at " + from);
        return;
    }
    if (piece.type() == PieceType.PAWN && from.file() != to.file()
            && squares[to.file()][to.rank()] == null) {
        System.out.println("Illegal pawn move");
        return;
    }
    squares[to.file()][to.rank()] = piece;
    squares[from.file()][from.rank()] = null;
}
```

It compiles. It passes its test. It is wrong.

---

## What it does wrong

- **Enforces a rule** — legality belongs to the pieces (M2) and `MoveGenerator` (M3). One rule here, and by M5 `Board` is the whole engine.
- **Prints** — unusable from a GUI, untestable without capturing stdout.
- **Fails silently** — the caller believes the move happened. M0b's constructor *throws*.
- **Forgets what it captured** — M8's undo has nothing to work with.
- **Re-does `place` with raw indices** — the second `[file][rank]`, the one that gets swapped.
- **The name lies** — a board mutation, not a chess move.

---

# `Board` stores which piece is on which square.

## One sentence. No "and".

That method fails the test half a dozen ways.

**Deleting it is the fix** — `place` already does the part that was
`Board`'s job.

---

## M1 — your turn

```bash
git fetch upstream --tags
git merge m1
./mvnw test        # red — the failures are the assignment
```

The merge brings **three tests**, **two view files** (read, don't edit),
and the handout. No stubs: **`PieceType`, `Piece`, `Board` from empty files.**

First error: `PieceGlyphs.java: cannot find symbol: class Piece` —
the given view asking for the model it draws. Write the class it names.

---

## Build in this order

1. `PieceType` — constants, `symbol()`, `fromSymbol()`
2. `Piece` — two final fields, ctor (color first), `symbol()`, `toString()`
3. `Board` — array, `pieceAt`, `isEmpty`, `place`, `positionsOf` → **24 run, 7 red**
4. `toString()` — the FEN dump; the tests pin the format
5. `Main` — set up the start position in a loop; print it through the renderer

---

## Done looks like

```
./mvnw test
Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

**24** = M0b's 11 (all still passing) + 13 new.

A milestone that breaks an earlier milestone's tests is **not done**.

```bash
git tag submit-m1 && git push origin main --tags
```

---

## When it goes wrong

- **`cannot find symbol` in a `view` file** — write the `model` class it names
- **Mirrored / upside-down** — the renderer is right; *your* `place` or `pieceAt` swapped file and rank
- **`8/8/8/8/8/8/8/8` fails** — a digit per square instead of per run; or a `/` after rank 1
- **NPE in `toString`** — no null check; 32 empty squares at the start
- **`ArrayIndexOutOfBounds: 8`** — a `<=` that needs `<`
- **Both kings print `K`** — `Piece.symbol()` is not lowercasing black
- **M0b's tests fail** — you edited `Position`; revert, those are fixed contracts

---

## And the real point of M1

```
8 r n b q k b n r
7 p p p p p p p p
  ...
1 R N B Q K B N R
  a b c d e f g h
```

A chessboard, out of your own terminal.

---

**M1 due Mon Sep 21, 11:59 PM**

# Next: Wednesday Sep 16

Inheritance & polymorphism — **M2: the `Piece` hierarchy**

Today's `Piece` knows nothing about how it moves.
Wednesday we ask each piece where it can go — **and the answer is not a `switch`.**

> Bring today's `Piece`, in whatever state. We refactor it live; it being
> *their* code is the part that teaches.
