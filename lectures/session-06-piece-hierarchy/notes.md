# Session 6 — Inheritance & Polymorphism: the `Piece` Hierarchy

**Week 4, Wednesday September 16** · CSC 413 Software Development
**Objectives advanced:** 2 (inheritance, polymorphism, abstraction, interfaces), 3 (analyze designs for extensibility and responsibility assignment), 5 (a first look at the Factory pattern)
**Milestone supported:** M2 — the `Piece` hierarchy (assigned today, due Monday Sep 28, 11:59 PM)

---

## Today's objective

M1 is due Monday. M2 opens today and is due the Monday after. Next Monday's
class is hands-on: we take a real M1 `Piece` and turn it into the abstract
class described below, together, on the projector.

**By the end of today you can:**

1. Look at a `switch` over piece types and say whether it should stay a
   `switch` or become a family of classes, and why.
2. Read `abstract`, `extends`, `super`, `protected`, and `@Override` in a
   Java file and say what each one *prevents*.
3. Tell **is-a** from **is-implemented-like**, and use inheritance only for
   the first.

---

## 1. Where the question comes from

Start from what you have. M1 gives you a `Board` that can `place` a piece on
a square and tell you what stands at any `Position`, a `Piece` that knows its
color and its type, and thirty-two pieces standing where a game begins:

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

The first thing a chess program does after setting up is move a piece. So
let us move the knight on b1.

**Where can the knight on b1 go?** Work it out before reading on.

![An 8×8 board with a white knight on b1. Eight arrows leave b1. Three land on the board, on a3, c3 and d2, which are highlighted. The other five point off the board to dashed squares labelled null.](assets/knight-b1.svg)

Three squares: a3, c3, d2. You knew that because you know the knight's rule:
two squares one way, one square the other, in every combination, as long as
the target is on the board. Now the question that matters for today: **where
is that rule in your code?**

Nowhere. `Piece` knows a color and a type. `Board` knows what stands on each
square. `Position` knows how to step to a neighbour. Not one line of the
program knows how a knight moves, and the same is true for the other five
kinds. Before the program can move anything, we have to put that knowledge
somewhere.

**Where should that code live?** Think about it before reading on. There are
three candidates, and each has something going for it:

- On `Board`. It already knows what stands on every square, and it is where
  the move will be applied.
- On `Piece`. It knows its own type, which is what decides the rule.
- Somewhere new: a `MoveRules` or `MoveGenerator` class whose only job is
  the rules of movement.

Here is one idea, the one most people write first. It could sit on `Board` or in a new class; the shape is the same
either way:

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

Look at the piece, branch on its type, one case per kind. The method returns
a list of `Move`s rather than a list of squares because a move needs to
remember more than its destination, in particular what it captured; section 7
defines `Move`. The moves it returns are *pseudo-legal*: everything the piece
could do by its own rules, ignoring whether the move would leave its own king
in check. Check is a rule about the whole position, and it is built later, on
top of this.

**What do you think of it?** Again, form an opinion before reading on.

It works, and real engines have shipped exactly this. Now push on it. The
next thing the engine will need, in order to detect check, is a second
question about every piece: *does this piece attack that square?* For most
pieces that is the same as "could it move there?", but a pawn moves straight
and captures diagonally, so it needs its own answer. Where does that go? In a
second method, with a second six-way `switch` over the same six cases. If we
later give each piece a value so an AI can evaluate a position, that is a
third. Every new question about pieces becomes another copy of the same
`switch`.

Now imagine adding a seventh kind of piece. You would have to find every one
of those switches and add a case, and if you missed one the compiler would
not tell you; the bug would show up later as a queen that cannot capture.
And look at the pawn. It moves one way, captures another, has a special first
move, and turns into a different piece at the end. Its forty lines sit inside
a method that is also about knights and rooks, and they would sit there again
inside `attacks`.

Could the rule go inside `PieceType`, the way the letter did on Monday? No.
The letter was one character. Each of these arms needs the `Board`, the
`Position`, and a list of `Move`s; `PieceType` would have to import half the
model and hold six unrelated method bodies. This is the exception I mentioned
on Monday: when the *behaviour* differs by kind, and there is a lot of it,
the kinds should be **classes**.

**So ask a different question: who knows how a knight moves?** The knight.
The `switch` asks the piece what it is and then does the knight's work *for*
it. What if a knight were its own class, and did its own work? That is
possible if `Piece` becomes something a `Knight` can be *a kind of*. Here is
the shape of that solution, as a sketch:

```java
abstract class Piece {
    abstract List<Move> pseudoLegalMoves(Board board, Position from);
}
class Knight extends Piece { /* the eight offsets */ }
class Rook   extends Piece { /* slide until blocked */ }

// the caller, anywhere in the program:
board.pieceAt(from).pseudoLegalMoves(board, from);   // never asks the type
```

Each arm of the switch becomes a method body in a class of its own, and the
caller never looks at the type. That gives us the rule for today, which the
rest of the session works out:

> **Ask the object. Don't ask what it is.**
>
> Give each kind of piece its own class and let it answer for itself. When
> you catch yourself writing `switch (piece.type())`,
> `if (piece.type() == KNIGHT)`, or `instanceof`, pause: whatever you were
> about to write probably belongs inside `Knight`.

---

## 2. Inheritance: a kind of `Piece`

Here is the sketch from section 1 in full. The shared parts of your M1
`Piece` stay; what is new is the `abstract` method. Next to it is the first
of the subclasses, `Knight`:

```java
public abstract class Piece {

    private final Color color;
    private final PieceType type;

    protected Piece(Color color, PieceType type) {     // was public
        this.color = color;
        this.type = type;
    }

    public Color color() { return color; }
    public PieceType type() { return type; }
    public char symbol() { ... }                       // unchanged from M1

    /**
     * Every move this piece could make from {@code from}, ignoring whether
     * it would leave its own king in check.
     */
    public abstract List<Move> pseudoLegalMoves(Board board, Position from);
}
```

```java
public class Knight extends Piece {

    public Knight(Color color) {
        super(color, PieceType.KNIGHT);
    }

    @Override
    public List<Move> pseudoLegalMoves(Board board, Position from) {
        ...   // the eight offsets; section 4
    }
}
```

Six words are doing the work here. Two of them, `extends` and `super`, are
the mechanism of inheritance. The other four are guards the compiler enforces
for you.

- **`extends`** — `Knight` *is a* `Piece`, so everything `Piece` has,
  `Knight` has too. You write `color()`, `type()`, and `symbol()` once, and
  all six kinds of piece get them.
- **`super(...)`** — `color` and `type` are private fields of `Piece`, so
  `Knight` cannot assign them. Instead it hands the values up to the `Piece`
  constructor, which is the one place they are set. That call has to be the
  first line of the `Knight` constructor. Notice also that the type is no
  longer a parameter: you write `new Knight(Color.WHITE)`, because a knight's
  type is a fact about the class and the class fills it in.
- **`abstract` method** — a method with no body. It is a promise that every
  concrete subclass will provide one, and the compiler holds you to it: forget
  `pseudoLegalMoves` in `Rook` and `Rook` does not compile.
- **`abstract` class** — a class you cannot instantiate. `new Piece(...)` is
  now a compile error, which matches the game: there is no such thing as "a
  piece" in general, only a knight, a rook, a pawn.
- **`protected`** — visible to subclasses and to the same package, not to the
  rest of the program. Only `Knight`, `Rook`, and the other subclasses can call
  this constructor, and nobody else needs to.
- **`@Override`** — asks the compiler to *check* that this method really does
  override one from the superclass. Without it, a misspelled
  `psuedoLegalMoves` in `Knight` would quietly become a *second* method, and
  the abstract one would still be unfulfilled. With it, you get an error
  instead: *"method does not override or implement a method from a
  supertype."* You will see that exact message today, on purpose, right after
  you merge M2 (section 10).

One more thing to notice. Making `Piece` abstract is a **refactor** of your M1
code: everything that worked in M1 still works, only the shape has changed.
Next Monday we do this refactor live, on your file.

---

## 3. Polymorphism: the call site does not know

Here is the code that asks a piece where it can go:

```java
Piece piece = board.pieceAt(from);                       // declared type: Piece
List<Move> moves = piece.pseudoLegalMoves(board, from);  // the object decides
```

The *variable* is declared as a `Piece`. The *object* it points at is a
`Knight`. When the second line runs, Java looks at the object, not the
variable, and runs `Knight`'s version of `pseudoLegalMoves`. This is called
**dynamic dispatch**: the decision about which method body runs is made at run
time, by the object. The caller never asks "what kind of piece are you?" It
asks the question, and the object answers for itself.

That is what the word **polymorphism** means: one call, many possible
behaviours. Compare the `switch` from section 1. There, one method body had
to know all six kinds and branch on the type. Here, no method knows more than
one kind, and nothing branches.

Now the whole of move generation, apart from king safety, is this loop:

```java
for (Position from : board.positionsOf(color)) {
    moves.addAll(board.pieceAt(from).pseudoLegalMoves(board, from));
}
```

**A question.** Suppose we add a seventh kind of piece. Which line of that
loop changes?

None of them, and `Board` does not change either. You add one
class, and the rest of the program picks it up. This property has
a name, **open for extension, closed for modification**, and we will come back
to it when we cover design principles. For today, it is enough to have seen it
happen once.

---

## 4. What goes where: base class, subclass, helper

Chess pieces move in two ways:

- **Sliders** (bishop, rook, queen) move along a line until something stops
  them: the edge of the board, or a piece. If the piece is an enemy, they can
  capture it and stop there. If it is a friend, they stop one square short.
- **Steppers** (knight, king) jump to a fixed set of squares. They can land if
  the square is empty or holds an enemy.

Let us trace both, on a board.

### A knight on b1

A knight's eight offsets are `(±1, ±2)` and `(±2, ±1)`, as `(file, rank)`
deltas. From b1, which is file 1, rank 0:

![An 8×8 board with a white knight on b1. Eight arrows leave b1. Three land on the board, on a3, c3 and d2, which are highlighted. The other five point off the board to dashed squares labelled null.](assets/knight-b1.svg)

Three offsets land on the board: a3, c3, d2. The other five fall off the edge.
This is where `Position.offsetOrNull` from M0b pays off: for each of the eight
offsets you call `from.offsetOrNull(dx, dy)`, skip it if you get `null`, and
otherwise check whether the square is empty or holds an enemy. That loop is
the same for the knight and the king; only the table of offsets differs.

### A rook on a1

Now a slider. The rook on a1 has a friendly pawn on a4 and an enemy bishop on
e1:

![An 8×8 board with a white rook on a1, a white pawn on a4 and a black bishop on e1. The rook slides up through a2 and a3 and stops before the pawn on a4, which is outlined in red. It slides right through b1, c1 and d1 and reaches e1, outlined in gold, where it captures the bishop and stops. Left and down lead straight off the board to squares labelled null.](assets/rook-a1-blocked.svg)

Going up, a2 and a3 are empty and a4 holds a friend, so the rook stops and
a4 is not a move. Going right, b1, c1 and d1 are empty and e1 holds an enemy,
so e1 is added as a capture and the rook stops there. Going left or down,
`offsetOrNull` returns `null` on the first step, so there is nothing to add.
That makes five moves in total. Again the loop is
the same for rook, bishop, and queen; only the table of directions differs.

### The two loops live on `Piece`

Rather than write the stepping loop twice and the sliding loop three times,
each family gets one helper. The helpers live on the base class, marked
`protected` so that subclasses can call them:

```java
    /** Slides outward from {@code from} along each {file, rank} direction until blocked. */
    protected List<Move> slidingMoves(Board board, Position from, int[][] directions) { ... }

    /** Steps to each {file, rank} offset that is on the board and not a friend. */
    protected List<Move> steppingMoves(Board board, Position from, int[][] offsets) { ... }
```

With the helpers in place, a subclass is a table and one line:

```java
public class Rook extends Piece {

    /** The four straight directions, as {file, rank} deltas. */
    private static final int[][] DIRECTIONS = {
            {0, 1}, {1, 0}, {0, -1}, {-1, 0}
    };

    public Rook(Color color) {
        super(color, PieceType.ROOK);
    }

    @Override
    public List<Move> pseudoLegalMoves(Board board, Position from) {
        return slidingMoves(board, from, DIRECTIONS);
    }
}
```

`Bishop` is the same with the four diagonals. `Queen` is the same with all
eight directions. `Knight` and `King` call `steppingMoves` with their own
tables.

### Why not a `SlidingPiece` class in between?

Many people's first instinct is a middle layer: `Piece` → `SlidingPiece` →
`Rook`, with the sliding loop in `SlidingPiece`. It compiles and it works. We
are not doing it, for one reason.

Java gives a class exactly one `extends`. That is one chance to say what a
thing *is*. A rook is a piece; any chess player would agree. Is a rook "a
sliding piece"? That is not a fact about chess. It is a fact about how *our
code* happens to compute the rook's moves, and it might not stay true (the
queen already strains it, since she is both a slider and, in a sense, a
stepper). A protected helper gives the same reuse without spending the one
`extends` on an implementation detail.

The test to apply: **is this a statement about chess, or about my program?**
If it is about the program, do not inherit it. Use inheritance for **is-a**.
Use a helper, or a separate object, for **is-implemented-like**.

| | |
|---|---|
| A rook **is a** piece | `extends Piece` |
| A rook **is implemented like** a bishop | shared `slidingMoves` helper |
| A rook **is a** sliding piece | a fact about the code, not the game: do not inherit it |

---

## 5. The pawn, and the one override

The pawn is the irregular piece: it moves forward only, captures diagonally,
may move two squares on its first move, and turns into another piece on the
last rank. In the hierarchy design, all of that lives in `Pawn.java`. No other
class in the engine knows that pawns are unusual. That is the payoff of
section 3 in one sentence: the irregular case costs one class, instead of a
special case in every method that touches a piece.

The pawn also introduces a second kind of method. Every piece gets asked
*"do you attack this square?"*, and for five of the six the answer is the same
as "can you move there?". So the base class provides a **default**:

```java
    /** True if this piece could capture an enemy standing on {@code target}. */
    public boolean attacks(Board board, Position from, Position target) {
        for (Move move : pseudoLegalMoves(board, from)) {
            if (move.to().equals(target)) {
                return true;
            }
        }
        return false;
    }
```

This is not `abstract`. It has a body, and five subclasses inherit it without
mentioning it. The pawn **overrides** it, because a pawn attacks the two
squares diagonally ahead whether or not anything stands there, and does *not*
attack the square directly ahead, even though it can move there. One override,
in the one class where the rule differs. The test `pawnAttacksDifferFromMoves`
pins this down.

Two words that sound alike and are not:

- **Override.** Same method signature, in a subclass, replacing the
  behaviour. `Pawn.attacks` overrides `Piece.attacks`.
- **Overload.** Same method name, different parameters, in the same class.
  `String.valueOf(int)` and `String.valueOf(char)` are two separate methods
  that happen to share a name; Java picks one by the argument type.

One caution about overriding. Anywhere a `Piece` is expected, a `Pawn` must
work. `Pawn.attacks` still answers *the same question* as `Piece.attacks`; it
just answers it correctly for a pawn. An override that changed what the
method *means* would break every caller that trusted the base class.

---

## 6. Interfaces: a promise with nothing attached

Set movement aside for a moment and take a different question the program has
to answer: how to print the board. Section 1 showed it as letters, uppercase
for white and lowercase for black. Some people would rather see figures:

```
r n b q k b n r        ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜
p p p p p p p p        ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟
. . . . . . . .        · · · · · · · ·
. . . . . . . .        · · · · · · · ·
P P P P P P P P        ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙
R N B Q K B N R        ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖
```

Whoever prints the board loops over the sixty-four squares and asks, for each
one, *what text goes here?* There are two answers, Letters and Figures, and
the printing loop should not care which one it has been handed. That is the
same shape as section 3: a caller asks a question and does not want to know
which kind of thing is answering.

**So what do Letters and Figures share?** Work it out before reading on.

Are they kinds of `Piece`? No. They are not pieces; they are two ways of
answering one question about a piece. Do they share any fields? None; neither
needs to remember anything. Do they share any code? None; one looks up a
letter, the other looks up a symbol. All they share is the question itself.

Compare `Piece`. It needed an `abstract class` because there was real state to
share (`color`, `type`), real code to share (the helpers, the `attacks`
default), and a promise (`pseudoLegalMoves`). Here there is no state and no
code. An abstract class would be a class with nothing in it but one abstract
method. Java has a lighter construct for exactly this: the **interface**, a
promise with nothing attached.

```java
public interface PieceGlyphs {
    /** The text for one square; {@code piece} is null when it is empty. */
    String glyphFor(Piece piece);
}

class Letters implements PieceGlyphs {
    public String glyphFor(Piece p) {
        return p == null ? "." : String.valueOf(p.symbol());
    }
}

class Figures implements PieceGlyphs {
    public String glyphFor(Piece p) { /* ♔ ♚ ... */ }
}

// the printing loop, written once:
out.print(glyphs.glyphFor(board.pieceAt(square)));   // never asks which
```

The loop is handed a `PieceGlyphs` and calls `glyphFor`. Which body runs is
decided by the object, exactly as in section 3, and no class hierarchy was
needed to get there. (The `PieceGlyphs` file you were given in M1 writes
Letters and Figures as two lambdas inside the interface. That is the same
thing in a shorter syntax; week 11 covers it.)

The comparison to keep:

| | `Piece` | `PieceGlyphs` |
|---|---|---|
| shared state | `color`, `type` | none |
| shared code | helpers, `attacks` | none |
| a promise | `pseudoLegalMoves` | `glyphFor` |
| | **abstract class** | **interface** |

Is-a with shared state or code: `abstract class`. A capability with nothing
shared: `interface`. One more fact about the asymmetry: a class `extends`
exactly one class but can `implements` any number of interfaces, which is
another reason to spend the one `extends` carefully.

---

## 7. `Move`: a value that remembers

Pieces answer with a `List<Move>`, so we need to say what a move is: where
from, where to, which piece moved, what it captured (or `null`), and what a
pawn promoted to (or `null`). Two moves with the same fields *are* the same
move, so `Move` is a value, and the value construct is `record`, exactly as
with `Position`:

```java
public record Move(Position from, Position to, Piece moved,
                   Piece captured, PieceType promotesTo) {

    public static Move quiet(Position from, Position to, Piece moved) { ... }
    public static Move capture(Position from, Position to, Piece moved, Piece captured) { ... }
    public static Move promotion(Position from, Position to, Piece moved,
                                 Piece captured, PieceType promotesTo) { ... }

    public boolean isCapture() { ... }
    public boolean isPromotion() { ... }

    @Override
    public String toString() { ... }     // "e2e4", "e7e8q"
}
```

Three things to notice. The move carries the **captured piece**: on Monday I
would not give `Board` a `remove` method that hands back the old piece, and
said "whoever took it remembers". The move is what remembers, and that is
what makes undo possible later. The **static factories** have names, so that
`Move.quiet(from, to, knight)` says what kind of move it is instead of making
the reader count nulls in `new Move(from, to, knight, null, null)`. And
**`toString` uses long algebraic notation** (`e2e4`, or `e7e8q` for a
promotion), which is what the console will read and print later and lets a
test check a move by comparing strings.

---

## 8. The factory: the one `switch` that is allowed

`Piece` is abstract now, so nobody can write `new Piece(...)`. **Who is
allowed to say `new Knight(Color.WHITE)`?**

Something has to turn *data* into *objects*: the letter `n` in a FEN string,
or `KNIGHT` and `WHITE` in a test, into a real `Knight`. M2 gives you that
something, already working:

```java
public final class PieceFactory {

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

    public static Piece fromSymbol(char letter) { ... }    // 'n' → black knight
}
```

Yes, that is a `switch` on `PieceType`, after a whole session arguing against
them. The two fit together like this:

> **Switch at the edges. Polymorphism in the middle.**

At the boundary where data becomes objects, *something* has to map a name to a
class. There is no way around it. What we can control is that it happens in
**exactly one place**, so that adding a seventh piece means editing one
`switch`, not hunting for six. Notice the switch has no `default` branch. Add
a seventh `PieceType` and this file stops compiling, and the compiler points
at the one line you need to write, which is exactly what you want.

This is the **Factory pattern**. We study it properly later in the course; for
now it is given. `BoardFactory.standard()` uses it to set up the starting
position, and that replaces the setup loop you wrote in `Main` for M1. Delete
the loop.

One consequence you will see when you merge. Two of your test files,
`PieceTest` and `BoardTest`, change by one line each: the helper that said
`new Piece(color, type)` now says `PieceFactory.create(type, color)`, because
`new Piece` no longer exists. From today, only `PieceFactory` says `new` for a
piece.

---

## 9. In-class exercise: add a piece

Ten minutes, in pairs. Fairy chess has an **Archbishop**: it moves like a
bishop *or* a knight, so any bishop move or any knight move is legal for it.

1. **Under the switch design of section 1:** list every method in the program
   you would have to find and edit. Include the second and third questions
   from section 1, and the view.
2. **Under the hierarchy:** what do you *write*, and what do you *edit*?
3. Would `Archbishop extends Bishop`? Say why or why not, using the test from
   section 4.
4. If the Archbishop should print as `A`, where does that letter go?

**What to look for** (discussed together afterwards):

- Under the switch: `movesFor`, `attacks`, the AI's value table, the view's
  glyph switch, and probably a `default` branch somewhere that silently
  swallows the new type until a test notices.
- Under the hierarchy: you *write* `Archbishop.java`, about fifteen lines
  (knight offsets through `steppingMoves`, diagonals through `slidingMoves`,
  one list appended to the other), and you *edit* one line each in
  `PieceType` and `PieceFactory`. The compiler reminds you about the second.
- `Archbishop extends Bishop` fails the is-a test: an archbishop is not a
  bishop. It `extends Piece`.
- The letter goes in `PieceType`, next to the other six, by Monday's rule.
- `FIGURES` *would* need a new glyph, and that is a display decision, made in
  the view, without touching a model file.

---

## 10. Your turn: M2

The [weekly loop](https://goleador.github.io/CSC413/guide.html?g=git-workflow):

```bash
git fetch upstream --tags
git merge m2
./mvnw test        # red; the failures are the assignment
```

**What the merge brings.** Seven **scaffolds** in `model`: `Move`, `Knight`,
`Bishop`, `Rook`, `Queen`, `King`, `Pawn`. Signatures, javadoc, and the
direction tables are there; every body throws
`UnsupportedOperationException("M2: implement ...")`. Two **given** classes in
a new `factory` package: `PieceFactory` and `BoardFactory`, working and
read-only. **Ten new tests** in `PieceMovementTest`, plus the one-line change
to `PieceTest` and `BoardTest` from section 8. And the handout.

**What it does not bring:** `Piece` or `Board`. Those are yours from M1, and
they stay yours; you edit them.

Right after the merge the build fails seven times with the same message:

```
Knight.java: method does not override or implement a method from a supertype
```

Your `Piece` has no `pseudoLegalMoves` for `Knight` to override yet. Fixing
that error, seven times over, is the assignment.

**Work in this order:**

1. **Refactor `Piece`**: make it `abstract`; make the constructor `protected`;
   add the abstract `pseudoLegalMoves`; add the `attacks` default; add
   `slidingMoves` and `steppingMoves`. Sections 2, 4, and 5. *(Monday Sep 21
   we do this live; start on your own if you can.)* The build now fails in
   `Main` instead: *"Piece is abstract; cannot be instantiated."*
2. **`Main`**: replace the setup loop with `BoardFactory.standard()`. The
   suite runs: `Tests run: 34, Failures: 0, Errors: 10`.
3. **`Move`**: the three factories, two predicates, `toString`. Section 7.
   This flips no test by itself, but every piece needs it.
4. **`Knight` and `King`**: one line each, calling `steppingMoves`. Now
   `Errors: 7`.
5. **`Rook`, `Bishop`, `Queen`**: one line each, calling `slidingMoves`. Now
   `Errors: 5`.
6. **`Pawn`**: `pseudoLegalMoves` and `attacks`. This is the real work of the
   milestone; the five remaining tests are its specification.

**Done looks like:**

```
./mvnw test
Tests run: 34, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Thirty-four is M0b's eleven and M1's thirteen, all still passing, plus ten new.

```bash
git add -A
git commit -m "M2: piece hierarchy"
git tag submit-m2
git push origin main --tags
```

Handout: [the full M2 handout](https://goleador.github.io/CSC413/guide.html?d=assignments/m2-piece-hierarchy/handout).

---

## 11. When it goes wrong

**"method does not override or implement a method from a supertype", ×7.**
Your `Piece` has no `pseudoLegalMoves`, or its signature differs. It must be
exactly `public abstract List<Move> pseudoLegalMoves(Board board, Position
from)`. Same for `attacks` if `Pawn` complains.

**"Piece is abstract; cannot be instantiated."** A `new Piece(...)` survives
somewhere, usually in `Main`. Use the factory.

**Merge conflict in `PieceTest` or `BoardTest`.** You edited a test file. Take
the incoming version: `git checkout --theirs <file>`, then `git add` it.

**`knightInCentre` passes, `knightInCorner` throws.** You built
`new Position(file + dx, rank + dy)`, which throws off the board, instead of
`from.offsetOrNull(dx, dy)`, which returns null. Look at the knight diagram in
section 4 again.

**`rookBlocking`: "must not slide past a capture".** Add the capture, *then*
`break`. You cannot slide through a piece you just took.

**`queenCombinesDirections` gets 14 or 13, not 27.** Only one table. The queen
needs all eight directions.

**`pawnBlocked`: the pawn jumped the blocker.** Check that the one-step square
is empty *before* considering the two-step. If one is blocked, so is two.

**`pawnPromotes` gets 1, not 4.** A move onto the last rank expands into four
moves, one per promotion piece (queen, rook, bishop, knight), via
`Move.promotion`.

**`pawnAttacksDifferFromMoves`.** `Pawn.attacks` must not call
`pseudoLegalMoves`. It is geometry: one rank forward, one file to either side.

**`e7e8q` prints as `e7e8Q`.** `Move.toString` lowercases the promotion letter.

**M1's tests now fail.** You changed `symbol()`, `place`, or `pieceAt` while
refactoring. Those are finished; revert them.

Anything else: send the **exact** error text, by email or in Monday's class.

---

## Recap

Three ideas from today, in the order you will use them:

1. **When behaviour differs by kind, and there is a lot of it, make the kinds
   classes.** A short lookup (a letter) belongs in the enum; a method body
   with a `Board` and a list of moves belongs in a subclass.
2. **The caller asks the object. It never asks what kind it is.** Declare the
   variable as `Piece`, call `pseudoLegalMoves`, and let the object decide.
   Adding a kind then means adding a class, not editing callers.
3. **Inheritance for is-a. A helper for is-implemented-like. A `switch` only
   at the edge where data becomes objects.** One `extends`, spent on what the
   thing is; one factory, in one place.

---

## Next session

Monday Sep 21 is **hands-on**. M1 is due that night. We refactor a real M1
`Piece` into the abstract base live, write `Knight` together, and spend the
second half reviewing two or three `Board` classes from M1 submissions
(anonymised) against the one-sentence test. Then Wednesday Sep 23: collections,
generics, and exceptions, and M3 opens.

Bring your M1 `Piece`. It is the file we operate on.

---

## INSTRUCTOR ONLY

**Timing (75 min):** objective 2 · §1 the knight on b1 and its four
questions, ending on the rule 10 · §2 vocabulary 10 · §3 dispatch and the
"which line changes" question 6 · §4 families, the two diagrams, the
`SlidingPiece` question 11 · §5 pawn & override 7 · §6 interfaces: the two
boards, what they share, the interface, the comparison 6 · §7 `Move` 3 · §8
factory 5 · §9 exercise 8 + discussion 4 · recap and M2 briefing 3.

**§1 is four questions, and the room answers each before you do.** (1) "Where
can the knight on b1 go?" Get a3, c3, d2 from them, then show the picture, then
ask where that rule is in their code; let the silence land before "nowhere".
(2) "Where should that code live?" Collect Board, Piece, and something-new
without judging any of them. (3) Show the switch, and write it well: the
lesson lands only if the audience believes it is a reasonable design (it is,
and engines have shipped it). "What do you think?" Wait. Then push: check
needs `attacks`, where does it go; a seventh piece; the pawn. Do not sneer at
the switch, show its cost. (4) "Who knows how a knight moves?" The knight.
"Can a knight be its own class?" That is the turn into inheritance; show the
sketch, then the rule. Ten minutes for all four; if it runs long, cut the
`PieceType` paragraph, which is in the notes.

**§2 is vocabulary; go slowly, one word per line, and ask "what does it
prevent?" each time.** Most of the room has met `extends` and `abstract`; few
can say what `protected` or `@Override` prevents. The "@Override catches a
misspelling" example is the one that sticks, and the merge is about to show
them the exact message. The "in other words" restatements are there for the
notes reader; in the room, ask a student to restate instead.

**§3 is the moment.** Write the two-line dispatch example, then the loop, then
ask: "add an Archbishop; which line here changes?" Wait for "none". Name
open/closed once and move on; the design-principles week owns SOLID.

**§4: put the two diagrams up and trace them out loud.** Knight first: walk
the eight offsets, count three, point at the five `null`s and say that is why
M0b returned null instead of throwing. Rook second: walk up to the friend and
stop, walk right to the enemy and capture, then stop. Only after both traces
show the helper signatures. A student will draw `SlidingPiece` on the board
every year; let them, then ask "is a rook a sliding piece, in chess?" The
queen argument below is for Monday's hands-on, not today.

**Moved out of the student notes, for Monday.** The queen shows why the
`SlidingPiece` axis is wrong: a queen moves like a rook *and* a bishop, and
`Queen extends Rook, Bishop` does not exist. The instinct that provokes,
"borrow `Rook.DIRECTIONS` and `Bishop.DIRECTIONS`", couples three classes,
forces two `private` tables open, and makes "which way does a queen move?" a
two-file question. Eight literal pairs in `Queen` answer it on sight.
Duplication is not free, but here it is cheaper than the coupling; DRY is a
judgement, not a reflex. The reference `Queen` javadoc has the full version
and is a good read-aloud when a student's refactor reaches the queen.

**§5: the override.** Emphasise that `attacks` has a body in `Piece` (not
abstract) and that five classes never mention it. Override vs overload
confuses people for years; `String.valueOf` is the overload example because
everyone in the room has called it. The M5 king-safety
consequence (a king may step in front of a pawn, never diagonally in front) is
worth one sentence aloud but is out of the notes to keep the forward
references down.

**§6 is a second worked example, not a definition.** Put the two boards up
and ask what the printing loop asks of each square; then "what do Letters and
Figures share?" and let the room reject `extends Piece` and find that the
answer is nothing but the question. Only then name the interface. The
comparison table with `Piece` is the takeaway; make them fill the `PieceGlyphs`
column. Do not open the given file today: it writes the two implementations
as lambdas and that syntax would swallow the point. One sentence that the
given file is the same thing in a shorter form; week 11 does interfaces and
lambdas properly.

**§8: say plainly that it is a switch.** Students will notice, and if you do
not address it they conclude the rule is arbitrary. "Switch at the edges,
polymorphism in the middle" is the one sentence to write on the board today.
Point out the missing `default` and what it buys.

**§9 protect the exercise.** If time is short, cut §7 to two sentences (the
handout covers `Move`) rather than the exercise. Take the switch-design list
from one pair and the hierarchy list from another; the contrast is the lesson.

**End on the recap, not on the M2 slide.** Read the three lines aloud and ask
whether each of the three opening abilities has been covered. Then the M2
merge instructions and the "bring your M1 `Piece`" reminder.

**Do not refactor `Piece` live today.** That is Monday's session, on a
student's actual M1 file, after M1 has been submitted by most of the room.
Today is concept; Monday is hands.

**What the m2 tag ships** (assembled by hand onto the starter's `main`, like
m1, since the release script's compile gate needs a starter with `Piece` and
`Board` in it, which ours deliberately does not have): the seven scaffolds
generated from the reference with `make-scaffold.jar` (bodies blanked, private
`Pawn.addAdvance` stripped, direction tables kept); `factory/PieceFactory.java`
and `factory/BoardFactory.java` copied unchanged; `PieceMovementTest.java`
verbatim; the M2 forms of `PieceTest.java` and `BoardTest.java` (helper via
`PieceFactory.create`); the handout as `docs/milestones/m2.md`. Staged under
`course/milestones/m2/` in the reference repo with a README of the steps.
Verified on a clone with M1 solved: after merge → seven "does not override"
errors · `Piece` abstract → `Main`: "Piece is abstract; cannot be
instantiated" · `Main` on `BoardFactory` → `Tests run: 34, Failures: 0,
Errors: 10` · + `Move` → still 10 · + `Knight`/`King` → `Errors: 7` · +
sliders → `Errors: 5` · + `Pawn` → `34, 0, 0`.

**Reference implementations stay off the projector.** These notes are
published. `slidingMoves` and `steppingMoves` appear here as signatures only,
`Pawn` not at all. The Monday session writes `steppingMoves` and `Knight`
together; `slidingMoves` and `Pawn` are the graded work.

**Check before class:** m2 tag pushed and merging cleanly onto a solved m1 ✅ ·
the switch version of `movesFor` on a slide, not typed live ✅ · the given
`PieceGlyphs` and `Queen` open in the demo clone for §4 and §6 ✅ · handout
published and linked from the week 4 page ✅ · the two board diagrams render
in light and dark mode ✅ · Monday's plan (refactor live + `Board` reviews)
needs two or three anonymised M1 `Board`s; flag it in the calendar so they get
pulled Sunday night ✅.
