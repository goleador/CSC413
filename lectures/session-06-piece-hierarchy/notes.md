# Session 6 — Inheritance & Polymorphism: the `Piece` Hierarchy

**Week 4, Wednesday September 16** · CSC 413 Software Development
**Objectives advanced:** 2 (inheritance, polymorphism, abstraction, interfaces), 3 (analyze designs for extensibility and responsibility assignment), 5 (a first look at the Factory pattern)
**Milestone supported:** M2 — the `Piece` hierarchy (assigned today, due Monday Sep 28, 11:59 PM)

---

## Where this sits

M1 is in progress and due Monday. You have — or are about to have — a `Piece`
that knows *what it is*: a color and a type. It does not know how it moves.

Today we ask it. "Where can this piece go?" is the question the entire engine
is built to answer, and *where the answer lives* is the design decision of the
semester. On Monday I said `Piece` is a class rather than a record because of a
requirement two days away. This is the requirement.

This session is the concept and its chess motivation. Next Monday is the
hands-on half: we refactor your M1 `Piece` live, write `Knight` together, and
review some M1 `Board`s. M2 is due the Monday after that.

> **Today's rule.** Monday's was *one reason to change*. Today's is the one
> that makes object-oriented programming different from programming with
> structs:
>
> **Ask the object. Don't ask what it is.** The moment you write
> `if (piece.type() == KNIGHT)` — or `instanceof` — stop. Whatever you were
> about to do belongs inside `Knight`.

---

## 1. The question, and the obvious answer

Here is the design that occurs to everyone first, and it is worth writing out
because real engines have shipped it:

```java
public List<Move> movesFor(Board board, Position from) {
    Piece piece = board.pieceAt(from);
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

It works. Now ask what happens next.

**Every question about a piece becomes another switch.** M5 asks "does this
piece *attack* that square?" — and for pawns the answer differs from "can it
move there", so that is a second six-way switch. The bonus AI asks "what is
this piece worth?" — a third. FEN parsing asks "which letter?" — Monday's
rule already moved that one into the enum, but it is the same shape. Six types
times however many questions, and every time a type is added, someone has to
find every switch and edit it. Miss one and the compiler says nothing; the bug
shows up as a queen that cannot capture.

**The pawn's forty lines sit in the middle of a method about all pieces.** The
pawn is the only piece that moves in one direction, the only one whose capture
differs from its move, the only one with a special first move, and the only one
that turns into something else. In the switch version, all of that irregularity
is in a method every other piece also lives in.

**Monday's rule does not rescue it.** "Put the answer inside the enum" works
for a letter. Here each arm needs the `Board`, the `Position`, and a list of
`Move`s; `PieceType` would import half the model and grow to two hundred lines
of six unrelated bodies. This is the exception I flagged on Monday: when the
*behaviour* differs by kind, and it is substantial, the kinds should be
**classes**.

---

## 2. Inheritance: a kind of `Piece`

Here is what `Piece` becomes today, and what a `Knight` is:

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
        ...   // the eight offsets — section 4
    }
}
```

Six new words, one line each:

- **`extends`** — `Knight` *is-a* `Piece`. Everything `Piece` has, `Knight`
  has: `color()`, `type()`, `symbol()`. Written once, inherited six times.
- **`super(...)`** — a subclass constructor sets up its superclass part first.
  Notice the *type* is not a parameter any more: `new Knight(Color.WHITE)`,
  never `new Knight(WHITE, KNIGHT)`. A knight's type is a fact about the
  class, so the class supplies it.
- **`abstract` method** — a promise, with no body: *every concrete subclass
  will answer this.* The compiler enforces it. Forget `pseudoLegalMoves` in
  `Rook` and `Rook` does not compile.
- **`abstract` class** — cannot be instantiated. `new Piece(...)` is now a
  compile error, and that is the point: there is no such thing as "a piece".
  There is a knight, a rook, a pawn.
- **`protected`** — visible to subclasses and the package, not to the world.
  Nobody outside the hierarchy needs the constructor anyway, since nobody can
  `new` an abstract class.
- **`@Override`** — asks the compiler to *check* that you are overriding.
  Misspell `pseudoLegalMoves` in `Knight` and, without the annotation, you
  would silently add a second method and the abstract one would still be
  unfulfilled. With it: *"method does not override or implement a method from
  a supertype."* You will see that exact message today, seven times, on
  purpose — section 10.

Making `Piece` abstract is a **refactor** of your M1 code: same behaviour for
everything that already worked, new shape. Next Monday we do it live, on your
file.

---

## 3. Polymorphism: the call site does not know

```java
Piece piece = board.pieceAt(from);                       // declared type: Piece
List<Move> moves = piece.pseudoLegalMoves(board, from);  // the object decides
```

The *variable* is a `Piece`. The *object* is a `Knight`. Java looks at the
object, not the variable — **dynamic dispatch** — and runs `Knight`'s version.
The caller never asks "what kind are you?" It asks the question and the object
answers for itself.

That is polymorphism: one call, many forms. Compare the switch. There the
caller had to know all six kinds. Here it knows zero. This is the whole of
M3's move generation, minus king safety:

```java
for (Position from : board.positionsOf(color)) {
    moves.addAll(board.pieceAt(from).pseudoLegalMoves(board, from));
}
```

Add a seventh kind of piece and this loop does not change. `Board` does not
change. The renderer does not change. You add a class. That property has a
name — **open for extension, closed for modification**, the O in SOLID — and
week 6 does all five letters. Today you only need to see it happen once.

---

## 4. What goes where: base class, subclass, helper

Chess pieces fall into two movement families:

- **Sliders** — bishop, rook, queen. Glide along a direction until the edge
  of the board or a piece. An enemy piece can be captured; a friendly one
  blocks without being captured.
- **Steppers** — knight, king. Jump to a fixed set of offsets. Land if the
  square is empty or holds an enemy.

Rather than write those two loops five times, the families share one helper
each. The helpers live on the **base class**, `protected`:

```java
    /** Slides outward from {@code from} along each {file, rank} direction until blocked. */
    protected List<Move> slidingMoves(Board board, Position from, int[][] directions) { ... }

    /** Steps to each {file, rank} offset that is on the board and not a friend. */
    protected List<Move> steppingMoves(Board board, Position from, int[][] offsets) { ... }
```

Then a subclass is a table and one line:

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

Notice `offsetOrNull` is about to earn its keep: a slider walks
`to = to.offsetOrNull(dx, dy)` until it gets `null`. That is why M0b returned
null rather than throwing — this loop reads cleanly, and a `try/catch` around
it would not.

### Why not a `SlidingPiece` class in between?

It is the first design most people reach for: `Piece` → `SlidingPiece` → `Rook`. Two
reasons it is the wrong move here.

**Java has single inheritance.** A class gets exactly one `extends`, one
*is-a*. Spend it on what the thing *is*. A rook is a piece — a chess player
would agree. A rook is a "sliding piece" only in the sense that its
implementation shares a loop with the bishop's; that is a fact about your code,
not about chess. A protected helper gives you the same reuse without spending
the one slot.

**The queen tells you it is the wrong axis.** A queen moves like a rook *and*
a bishop. Java will not let you write `Queen extends Rook, Bishop`, and the
instinct that provokes — "then let me borrow `Rook.DIRECTIONS` and
`Bishop.DIRECTIONS`" — is the wrong one. It couples three classes, forces two
`private` tables open, and makes "which way does a queen move?" a two-file
question. Eight literal pairs in `Queen` answer it on sight. **Duplication is
not free, but it is cheaper here than the coupling** — which is the judgement
call the DRY principle actually asks you to make, rather than the reflex it is
often mistaken for.

The test to apply: *"a Rook is a SlidingPiece"* — is that a statement about
chess, or about your program? If it is about your program, do not inherit it.
Use inheritance for **is-a**. Use a helper, or composition, for **is
implemented like**.

---

## 5. The pawn — and the one override

The pawn breaks every rule the others follow, and every one of its
irregularities lives in `Pawn.java`. Nothing else in the engine knows pawns
are strange. That containment is the payoff of polymorphism: the irregular
case costs one class, not a special case in every method that touches a piece.

The pawn also shows you a second kind of method. Every piece gets asked a
second question — *does it attack this square?* — and for five of the six the
answer is exactly "can it move there?". So the base class provides a
**default**:

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

Not `abstract` — it has a body, and five subclasses inherit it unchanged. The
pawn **overrides** it: a pawn attacks the two squares diagonally ahead whether
or not anything stands there, and does *not* attack the square in front of it,
even though it can move there. One override, in the one class where the rule
differs.

The difference matters enormously in M5: a king may step onto the square in
front of an enemy pawn; it may not step onto a square diagonally in front of
one. `PieceMovementTest` pins it down as its last test.

Two more words:

- **Override** vs **overload.** Override: same signature, the subclass
  *replaces* the behaviour — `Pawn.attacks`. Overload: same name, different
  parameters, in the same class — the renderer you were given has
  `render(Board)` and `render(Board, Color)`. Unrelated mechanisms that happen
  to share the word "over".
- **Substitutability.** Anywhere a `Piece` is expected, a `Pawn` must work.
  `Pawn.attacks` still answers *the same question* — it just answers it
  correctly for a pawn. An override that changed the *meaning* of the method
  would break every caller that trusted the base class. That is the L in
  SOLID; again, week 6.

---

## 6. Interfaces: a contract with no state

An abstract class bundles three things: shared **state** (`color`, `type`),
shared **code** (the helpers, `attacks`), and a **promise**
(`pseudoLegalMoves`). Sometimes all you have is the promise — no fields, no
shared code, just "anything that can do X". Java has a lighter tool for that,
and you already own one. Open the `PieceGlyphs` you were given on Monday:

```java
@FunctionalInterface
public interface PieceGlyphs {

    /** The text for one square; {@code piece} is null when it is empty. */
    String glyphFor(Piece piece);

    PieceGlyphs LETTERS = piece ->
            piece == null ? "." : String.valueOf(piece.symbol());

    PieceGlyphs FIGURES = piece -> { ... };    // ♔ ♚ ·
}
```

One method. Two implementations, written as lambdas because a one-method
interface can be. `TextBoardRenderer` takes a `PieceGlyphs` and never knows
which one it has — the same call-site blindness as section 3, without a class
hierarchy.

The rule of thumb:

- **is-a, with shared state or code** → `abstract class`. `Piece`.
- **can-do — a capability, a contract** → `interface`. `PieceGlyphs`; week
  11's `BoardView`, which a Swing window and a console both implement while
  sharing not one line of code.

A class `extends` exactly one class and `implements` any number of interfaces.
That asymmetry is why the one `extends` should be spent on meaning.

---

## 7. `Move` — a value that remembers

Pieces answer with a `List<Move>`, so we need to say what a move is: where
from, where to, which piece moved, what it captured (or `null`), and what a
pawn promoted to (or `null`). Two identical moves *are* the same move — a
value — so it is a `record`, like `Position`:

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

Three decisions:

**`captured` travels with the move.** Monday I refused to give `Board` a
`remove` that hands back the old piece, and said "whoever took it remembers".
This is who. Once a move has been applied, the board no longer knows what used
to stand on `to`; the move does, and M8's undo reads it from there.

**Named static factories.** `Move.quiet(from, to, knight)` says what it is.
`new Move(from, to, knight, null, null)` makes the reader count nulls. Same
idea as Monday's "no `startingPosition()` on `Board`" — construction with a
name — and the next section is that idea grown up.

**`toString` is long algebraic notation** — `e2e4`, `e7e8q` — because that is
what the console will read from the player and print back in M9. A value that
knows how to write itself down is a value that can be tested by string
comparison, which `pawnPromotes` does.

---

## 8. The factory: the one `switch` that is allowed

`Piece` is abstract now, so who says `new Knight(Color.WHITE)`? Something has
to turn *data* — the letter `n` in a FEN string, or `KNIGHT` and `WHITE` from a
test — into an object. M2 hands you that something, working:

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

A `switch` on `PieceType`, after two lectures against it. The rule is:
**switch at the edges, polymorphism in the middle.** At the boundary where
data becomes objects, *something* must map a name to a class — and it should
happen in exactly one place, so that it is the only place to update. Note the
switch has no `default`: add a seventh `PieceType` and this file stops
compiling, which is the compiler pointing at the one line you need to write.
That is a feature.

This is the **Factory pattern**, and week 9 studies it properly. Today it is
given, and `BoardFactory.standard()` uses it to set up a game — which is what
replaces the setup loop you wrote in `Main` for M1. Delete the loop; that is
what factories are for.

One more consequence, and it is worth seeing happen. The merge **rewrites two
of your test files**: `PieceTest` and `BoardTest` change by one line each,
the helper that said `new Piece(color, type)` now says
`PieceFactory.create(type, color)`. Because there is no such thing as
`new Piece` any more. That is the cost an abstract class imposes on its
callers, and it is exactly why the factory exists: after today, only
`PieceFactory` says `new` for a piece.

---

## 9. In-class exercise: add a piece

Ten minutes, in pairs. Fairy chess has an **Archbishop**: it moves like a
bishop *or* a knight — any bishop move, or any knight move.

1. **Under the switch design of section 1:** list every method in the program
   you would have to find and edit. Include the second and third questions
   from section 1, and the view.
2. **Under the hierarchy:** what do you *write*, and what do you *edit*?
3. Would `Archbishop extends Bishop`? Say why or why not, using the test from
   section 4.
4. If the Archbishop should print as `A`, where does that letter go?

**What to look for** (discussed together afterwards):

- Under the switch: `movesFor`, `attacks`, the AI's value table, the view's
  glyph switch — and a `default` branch somewhere that silently swallows the
  new type until a test notices. Every one found by hand.
- Under the hierarchy: **write** `Archbishop.java`, about fifteen lines —
  `steppingMoves` with the knight offsets, `slidingMoves` with the diagonals,
  one list appended to the other. **Edit** `PieceType` (one constant) and
  `PieceFactory` (one case, and the compiler *tells* you). Nothing in
  `Board`, nothing in move generation, nothing in the text renderer —
  `LETTERS` works automatically because it asks the piece.
- `Archbishop extends Bishop` fails the is-a test — an archbishop is not a
  bishop, and it would inherit nothing it does not already get from the
  helpers. `extends Piece`.
- The letter goes in `PieceType`, with the other five. Monday's rule, applied
  the day after.
- `FIGURES` *would* need a new glyph — and notice that is a decision about a
  display, made in the view, without opening a model file. Monday's other
  lesson.

---

## 10. Your turn: M2

The [weekly loop](https://goleador.github.io/CSC413/guide.html?g=git-workflow):

```bash
git fetch upstream --tags
git merge m2
./mvnw test        # red — the failures are the assignment
```

**What the merge brings.** Seven **scaffolds**, in `model`: `Move`, `Knight`,
`Bishop`, `Rook`, `Queen`, `King`, `Pawn`. Signatures, javadoc, and the
direction tables are there; every body throws
`UnsupportedOperationException("M2: implement ...")`. Two **given** classes,
in a new `factory` package: `PieceFactory` and `BoardFactory`, working,
read-only. **Ten new tests** in `PieceMovementTest`, and the one-line change to
`PieceTest` and `BoardTest` from section 8. And the handout.

**What it does not bring:** `Piece` or `Board`. Those are yours from M1, and
they stay yours; you edit them.

Right after the merge the build fails seven times with the same message:

```
Knight.java: method does not override or implement a method from a supertype
```

Your `Piece` has no `pseudoLegalMoves` for `Knight` to override. That error is
the assignment.

**Work in this order:**

1. **Refactor `Piece`** — `abstract`; constructor `protected`; the abstract
   `pseudoLegalMoves`; the `attacks` default; `slidingMoves` and
   `steppingMoves`. Sections 2, 4, and 5. *(Monday Sep 21 we do this live —
   start on your own if you can.)* The build now fails in `Main` instead:
   *"Piece is abstract; cannot be instantiated."*
2. **`Main`** — replace the setup loop with `BoardFactory.standard()`. The
   suite runs: `Tests run: 34, Failures: 0, Errors: 10`.
3. **`Move`** — the three factories, two predicates, `toString`. Section 7.
   Flips nothing by itself; every piece needs it.
4. **`Knight` and `King`** — one line each, on `steppingMoves`. → `Errors: 7`.
5. **`Rook`, `Bishop`, `Queen`** — one line each, on `slidingMoves`. → `Errors: 5`.
6. **`Pawn`** — `pseudoLegalMoves` and `attacks`. The real work of the
   milestone; the five remaining tests are its specification.

**Done looks like:**

```
./mvnw test
Tests run: 34, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Thirty-four: M0b's eleven and M1's thirteen, all still passing, plus ten.

```bash
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
somewhere — `Main`, usually. Use the factory.

**Merge conflict in `PieceTest` or `BoardTest`.** You edited a test file. Take
the incoming version: `git checkout --theirs <file>`, then `git add` it.

**`knightInCentre` passes, `knightInCorner` throws.** You built
`new Position(file + dx, rank + dy)` — which throws off the board — instead of
`from.offsetOrNull(dx, dy)`, which returns null.

**`rookBlocking`: "must not slide past a capture".** Add the capture, *then*
`break`. Blocked either way — you cannot slide through a piece you just took.

**`queenCombinesDirections` gets 14 or 13, not 27.** Only one table. The queen
has eight directions of her own.

**`pawnBlocked`: the pawn jumped the blocker.** Check the one-step square is
empty *before* considering the two-step. If one is blocked, so is two.

**`pawnPromotes` gets 1, not 4.** A move onto the last rank expands into four
moves — queen, rook, bishop, knight — via `Move.promotion`.

**`pawnAttacksDifferFromMoves`.** `Pawn.attacks` must not consult
`pseudoLegalMoves`. It is geometry: one rank forward, one file to either side.

**`e7e8q` prints as `e7e8Q`.** `Move.toString` lowercases the promotion letter.

**M1's tests now fail.** You changed `symbol()`, `place`, or `pieceAt` while
refactoring. Those are fixed; revert.

Anything else: the **exact** error text, by email or in Monday's class.

---

## Next session

Monday Sep 21 — **hands-on.** M1 is due that night. We refactor a real M1
`Piece` into the abstract base live, write `Knight` together, and spend the
second half reviewing two or three `Board` classes from M1 submissions
(anonymised) against the one-sentence test. Then Wednesday Sep 23: collections,
generics, and exceptions — and M3 opens.

Bring your M1 `Piece`. It is the file we operate on.

---

## INSTRUCTOR ONLY

**Timing (75 min):** where-this-sits 3 · §1 the switch 8 · §2 vocabulary 12 ·
§3 dispatch 6 · §4 families & the intermediate-class trap 10 · §5 pawn &
override 8 · §6 interfaces 5 · §7 `Move` 4 · §8 factory 5 · §9 exercise 8 +
discussion 4 · M2 briefing 2.

**Write the switch on the projector first, and write it well.** The lesson
lands only if the audience believes the switch is a reasonable design — it
is, and engines have shipped it. Then ask "M5 needs `attacks`; where does it
go?" and let the room discover the second switch. Do not sneer at the switch;
show its cost.

**§2 is vocabulary — go slowly, one word per line.** Most of the room has met
`extends` and `abstract`; few can say what `protected` or `@Override`
*prevents*. The "@Override catches a misspelling" example is the one that
sticks, and the merge is about to show them the exact message.

**§3 is the moment.** Write the two-line dispatch example, then the M3 loop,
then ask: "add an Archbishop — which line here changes?" Silence, then "none",
is the whole point. Name open/closed once and move on; week 6 owns SOLID.

**§4: the `SlidingPiece` trap gets drawn on the board by a student every
year.** Let it be drawn, then apply the is-a test out loud — "is a rook a
sliding piece, in chess?" — and bring in the queen. The reference `Queen`
javadoc has the full argument about borrowing sibling direction tables; it is
a good read aloud if there is time.

**§5: the override.** Emphasise that `attacks` has a body in `Piece` — not
abstract — and that five classes never mention it. Override vs overload
confuses people for years; the renderer's two `render` methods are the
overload example because they already have the file open.

**§6 uses the given `PieceGlyphs`.** Open the real file. The lambda syntax will
be new to some; one sentence — "a one-method interface can be written as an
arrow" — is enough today. Interfaces get their own session in week 11.

**§8: say plainly that it is a switch.** Students will notice, and if you do
not address it they conclude the rule is arbitrary. "Switch at the edges,
polymorphism in the middle" is the sentence to write on the board. Point out
the missing `default` and what it buys.

**§9 protect the exercise.** If time is short, cut §7 to two sentences (the
handout covers `Move`) rather than the exercise. Take the switch-design list
from one pair and the hierarchy list from another; the contrast is the lesson.

**Do not refactor `Piece` live today.** That is Monday's session, on a
student's actual M1 file, after M1 has been submitted by most of the room.
Today is concept; Monday is hands.

**What the m2 tag ships** (assembled by hand onto the starter's `main`, like
m1 — the release script's compile gate needs a starter with `Piece` and
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
published and linked from the week 4 page ✅ · Monday's plan (refactor live +
`Board` reviews) needs two or three anonymised M1 `Board`s — flag it in the
calendar so they get pulled Sunday night ✅.
