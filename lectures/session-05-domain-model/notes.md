# Session 5 — OO Design: `Board` and `Piece`

**Week 4, Monday September 14** · CSC 413 Software Development
**Objectives advanced:** 1 (implement OO software in modern Java), 2 (encapsulation, abstraction, composition), 3 (analyze designs for maintainability and responsibility assignment)
**Milestone supported:** M1 — the domain model (assigned today, due Monday Sep 21, 11:59 PM)

---

## Where this sits

Last Wednesday's class was cancelled, and Monday before it was Labor Day, so
week 3 went by without a meeting. This is week 3's session, delivered on week
4's Monday. The calendar absorbs it over the next two weeks: M1 opens today
and is due next Monday; Wednesday goes straight into inheritance and M2; next
Monday is the hands-on half of that topic; and by week 6 we are back on the
syllabus. The [course calendar](https://goleador.github.io/CSC413/#calendar)
has the revised dates.

M0b is behind you. You have `Position` — a square — and `Color` — a side.
Two values, sixty lines, and everything else in the engine is built out of
them.

Today we build the two things that *hold* those values: `Board`, the 8×8 grid,
and `Piece`, the thing standing on a square. That is **M1**, and with it the
domain model is complete enough to print a starting position to the terminal.

This is also the session where the course stops being a Java review and starts
being a design course. Every question today has more than one answer that
compiles. The work is choosing between them, and being able to say why.

> **Today's rule.** Week 2's was *make invalid code impossible*. This week's
> is its partner:
>
> **Every class should have one reason to change.** When you cannot say what a
> class is responsible for in one sentence without "and", it is doing two jobs.

---

## 1. What is a `Piece`?

Start where we started with `Position`: which bucket?

```java
Piece rook = new Piece(Color.WHITE, PieceType.ROOK);
```

Is that a value or an identity? Two white rooks on a1 and h1 — are they *the
same rook written down twice*, the way `e2` and `e2` are the same square?

By the equality test, yes. A white rook is a white rook; nothing about *this*
one distinguishes it from *that* one, and the board remembers where each
stands. So by week 2's rule a piece is a value, and the value construct is
`record`.

And yet `Piece` is a `class`. The reason is the same *kind* of reason as last
time — a requirement decides it — but the requirement is two days away rather
than three months. On Wednesday we ask each piece where it can go, and a knight
answers differently from a rook. Java's way of letting different *kinds* of
thing answer the same question differently is subclasses, and a `record` is
`final`: it cannot be extended. So `Piece` is a class today, in order that
`Knight` and `Rook` can be kinds of `Piece` on Wednesday.

```java
public class Piece {
    private final Color color;
    private final PieceType type;

    public Piece(Color color, PieceType type) {
        this.color = color;
        this.type = type;
    }

    public Color color() { return color; }
    public PieceType type() { return type; }
}
```

Notice what is `final`: everything. **`class` does not mean mutable.** A rook
does not become a bishop, and a white piece does not turn black; those are
facts fixed at construction, and a class whose every field is final is as much
a value as a record — we have just written by hand the boilerplate the record
would have generated, in exchange for leaving the door to subclasses open.
Make each field as immutable as its meaning allows. Usually that is all of
them.

> **"But hasn't *this* rook moved? Castling needs to know."** It does — and
> that is a fact about the *game's history*, not about the rook. It lives where
> the history lives, which is `Game`, in M12. A `hasMoved` flag on the piece is
> the tempting version, and it is wrong the same way a printing `Board` is
> wrong: a fact stored somewhere it does not belong, and a second copy of the
> truth to keep in sync. Promotion is the same story — M12 *replaces* the pawn
> with a new piece, because which piece is on a square is the board's business.

One small decision that is now fixed for the semester: **color first, type
second**, the way you would say it — "white rook". Wednesday's subclasses call
`super(color, PieceType.KNIGHT)`, so get the order right today.

### A heads-up: models built for a database look different

Many of you built a web app with a database in CSC 317, and the classes there
were shaped the opposite way: an `id` field, getters and setters, equality by
id, nothing `final`. That was not wrong. A database row *is* an identity: the
row is the same row after its columns change, and two rows with identical
columns are still two rows.

So there are two kinds of object, and both are legitimate:

- a **value**, defined by its fields: `e2` is `e2`, `Position` is a record;
- an **entity**, defined by an identity that outlives its fields: a user whose
  email changes is the same user, a row is the same row.

This course lives mostly in the first world, because a chess engine is mostly
values. If you go on to work with an object-relational mapper (ORM) or any
database modelling, you will meet models built for the second world, and they
will make choices this course argues against: mutable fields, identity-based
equality, classes designed to be subclassed by a framework. When you see that,
recognise it for what it is rather than assuming one of us is wrong. Knowing
which kind of object you are looking at is the skill; the rest is tooling.

The value/identity split is not a Java thing. Most languages added a
value-object construct in the last decade, and they all do the same two
things a Java `record` does — generate equality from the fields and make the
fields immutable:

| Language | Value-object construct | Equality from fields | Immutable fields |
|---|---|---|---|
| **Java** | `record` | generated | yes |
| **Kotlin** | `data class` with `val` | generated | yes |
| **C#** | `record` | generated | yes (`init`) |
| **Scala** | `case class` | generated | yes |
| **Python** | `@dataclass(frozen=True)` | generated | yes |
| **Ruby** | `Data.define` | generated | yes |
| **Swift** | `struct` | synthesised on request | yes (`let`) |
| **Rust** | `struct` with `#[derive(PartialEq, Eq)]` | derived | yes, by default |
| **Go** | `struct` | built in (`==`) | no |
| **JavaScript / TypeScript** | none built in | no, `===` compares references | only by convention |

### `PieceType` is the third bucket

Six kinds of piece, fixed since the fifteenth century. A closed set — an `enum`,
for the same reason `Color` was one:

```java
public enum PieceType {
    PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING;
}
```

And by the same argument as `Color.pawnDirection()`: a question *about a piece
type* belongs *in* `PieceType`. The one M1 needs is its letter.

---

## 2. Where does the letter live?

The board prints as text — uppercase white, lowercase black, `.` empty:

```
r n b q k b n r
p p p p p p p p
. . . . . . . .
. . . . . . . .
. . . . . . . .
. . . . . . . .
P P P P P P P P
R N B Q K B N R
```

So something has to turn a piece into a character. Three places could do it,
and the choice is the whole lesson:

**In the view.** A `switch` over the six types, in whatever code prints the
board. It works — until a second view arrives (the bonus track in week 11), and
now the switch exists twice. Two copies, one of which will be wrong within a
month.

**In `Piece`.** Better, but ask *what changes*. If knights ever print as `H`,
which class did you edit? A fact about knights, sitting in the class that models
*all* pieces.

**In `PieceType`.** The letter is a property of the *type*, so it lives with the
type:

```java
public enum PieceType {
    PAWN('P'), KNIGHT('N'), BISHOP('B'), ROOK('R'), QUEEN('Q'), KING('K');

    private final char symbol;

    PieceType(char symbol) {
        this.symbol = symbol;
    }

    /** The uppercase letter for this type, as used in FEN and algebraic notation. */
    public char symbol() {
        return symbol;
    }

    /** The inverse: the type for a letter, in either case. Throws if it names no piece. */
    public static PieceType fromSymbol(char letter) { ... }
}
```

`fromSymbol` is the same fact read backwards — `'n'` and `'N'` are both the
knight, `'X'` is an `IllegalArgumentException` — and it belongs in the same
place. Three or four lines; `PieceTypeTest` pins it down. It is there because
M2's factory turns letters back into pieces on Wednesday, and M7's FEN parser
does it at scale.

Now `Piece.symbol()` is two lines and no `switch` appears anywhere in the
engine:

```java
    /** This piece's letter: uppercase for white, lowercase for black. */
    public char symbol() {
        char letter = type.symbol();
        return color == Color.WHITE ? letter : Character.toLowerCase(letter);
    }

    @Override
    public String toString() {
        return String.valueOf(symbol());
    }
```

Two methods called `symbol()`, on purpose: the *type's* is always uppercase —
it does not know about colors — and the *piece's* knows which side it is on.

`N` for knight rather than `K` is not arbitrary — the king already took `K`.
That is the standard notation, and it is what FEN reads back.

**The general move:** when you find yourself writing `switch` over an enum,
check whether the answer belongs *inside* the enum instead. Most of the time it
does. We meet the case where it genuinely does not on **Wednesday** — how a
piece moves — and there the answer is polymorphism, not a constructor argument.
Knowing which tool fits which case is most of what "design" means in this
course.

---

## 3. What is a `Board`?

A board *has* 64 squares. It **is** not 64 squares.

That distinction is the one design decision in M1 that everything else follows
from, so make it deliberately:

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

Option A is fewer lines today and costs you the semester. With a raw array,
every class that touches the board has to know which index is the file and
which the rank — and one of them will get it backwards. Nothing stops
`board[9][4]`. Nothing stops a caller from clearing the whole array. And when
M8 needs undo, or M7 needs FEN, there is no object to put those on.

Option B is **composition**: the board *has-a* array, privately, and nobody else
ever sees it. The array is an implementation detail, and the proof is that you
could swap it for a one-dimensional `Piece[64]`, or for the bitboards a
production engine uses, and no other class would change by a single character.

That is what encapsulation actually buys. Not "private is good practice" — the
ability to change your mind later without a cascade.

### The interface, decided before the implementation

Ask what callers need, not what the array offers:

```java
public class Board {
    public Board()                                      // an empty board
    public Piece pieceAt(Position position)             // what is here? null if nothing
    public boolean isEmpty(Position position)           // convenience
    public void place(Position position, Piece piece)   // put this here (null clears)
    public List<Position> positionsOf(Color color)      // where are all of white's pieces?
    @Override public String toString()                  // one-line dump, for debugging
}
```

Five things to notice, because each is a decision:

**Every method takes a `Position`, never two ints.** M0b bought you a guarantee
— if you are holding a `Position`, it is on the board — and this is where you
spend it. `pieceAt` needs no bounds check, because there is no way to call it
with a bad square. Compare `pieceAt(9, 4)`, which needs one, and which someone
will forget.

**`pieceAt` returns `null` for an empty square.** Deliberate, and consistent
with `offsetOrNull` from M0b: `null` means "no piece", and empty squares are
utterly ordinary in chess — 32 of them at the start. An exception is for things
that should not happen; an empty square is not one. *(Java's `Optional` is the
modern alternative, and a fair question to raise. We stay with `null` here
because it matches `offsetOrNull` and keeps Wednesday's move loops readable.)*

**`place` replaces, and `place(square, null)` clears.** One method that sets a
square is all a grid needs. There is deliberately no `remove` that hands back
the old piece — ask *who needs it*. Whoever took it. On Wednesday a *move*
records what it captured, so undo (M8) reads the piece off the move, and the
board never has to remember what used to be somewhere.

**There is no `startingPosition()`.** A board does not know how chess starts —
Chess960 starts differently on the same board, and every test on Wednesday
starts from a position of its own. Setting up is a *factory*'s job: M2 hands
you `BoardFactory`, and M7 studies it. For M1, `Main` sets the board up — a
loop over the files with a back-rank array.

**`positionsOf` is a query, not a rule.** "Where are white's pieces?" is a
question about what is on the board, so it passes today's one-sentence test.
Wednesday's move generation asks it first thing.

---

## 4. Which index is which?

The trap that costs everyone a debugging hour if it is not settled out loud.

The array has two indices and there are two conventions. Choose the one that
matches what you already have:

```java
    /** Indexed [file][rank], both 0-based — the same order as Position. */
    private final Piece[][] squares =
            new Piece[Position.BOARD_SIZE][Position.BOARD_SIZE];
```

`squares[position.file()][position.rank()]` reads exactly like the record it
came from, and you never have to remember which is which. The other order —
rank first — has one thing going for it: `squares[r]` names a whole rank,
which is convenient for *printing*. And printing is precisely the job we are
about to keep out of `Board`.

**Store it one way, everywhere.** Write the comment on the field and never
deviate. If you find yourself writing `squares[rank][file]` in a second method,
stop: you are about to introduce the bug where the board is right in one place
and mirrored in another.

### The one flip

There is one place in `Board` that cares about *order*, and that is
`toString()`. Its output is the placement field of FEN — the same notation the
whole chess world uses:

```
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
```

Rank 8 first, `/` between ranks, a letter per piece and a digit for each run of
empty squares. So the outer loop counts *down*:

```java
    @Override
    public String toString() {
        StringBuilder text = new StringBuilder();
        for (int rank = Position.BOARD_SIZE - 1; rank >= 0; rank--) {  // rank 8 first
            // ... this rank's squares, file a to h: a letter per piece,
            //     a digit for each run of empties
            if (rank > 0) {
                text.append('/');
            }
        }
        return text.toString();
    }
```

That descending loop is the only flip in the class. `BoardTest` pins the format
exactly — an empty board is `8/8/8/8/8/8/8/8`.

### Drawing the board is not the model's job

`toString` is a one-line dump for debuggers and test failures. It is *not* how
the game is drawn. Drawing has rank numbers down the side, a file legend along
the bottom, a choice of `.` or `·` for empty, and — the reason that matters —
an opinion about which end of the board is at the top. None of those are facts
about chess. They are decisions about a *display*, and a display that wants to
make them differently should not have to edit the model to do it.

So M1 hands you a view. Two small files arrive with the merge, in
`edu.sfsu.csc413.chess.view`, and you do not write or edit them:

- `PieceGlyphs` — how a view spells a piece. `LETTERS` gives `K`/`k`/`.`;
  `FIGURES` gives `♔`/`♚`/`·`.
- `TextBoardRenderer` — turns a `Board` into lines of text, seen from either
  side of the table.

```java
System.out.println(new TextBoardRenderer(PieceGlyphs.LETTERS).render(board));
```

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

Read `TextBoardRenderer` once tonight. It calls exactly one thing on the board
— `pieceAt` — and it can show black's point of view because `render(board,
Color.BLACK)` is a parameter of the *view*. Had drawing lived in `Board`,
flipping the screen would have meant editing the model. Week 11's MVC
milestone is the full version of this argument, and it starts here.

---

## 5. Packages: where does each class go?

You now have five classes of your own and two you were given. Left flat,
`chess/` becomes a junk drawer by November. Packages are the coarsest tool you
have for saying what belongs with what:

```
edu.sfsu.csc413.chess.model     Position, Color, PieceType, Piece, Board
edu.sfsu.csc413.chess.view      PieceGlyphs, TextBoardRenderer   (given today)
edu.sfsu.csc413.chess.factory   (M2)  PieceFactory, BoardFactory
edu.sfsu.csc413.chess.engine    (M3+) MoveGenerator, Game
edu.sfsu.csc413.chess           Main
```

Everything M1 asks you to write is in `model` — the nouns of the game, which
know *what things are* but nothing about how a game is played or displayed.
`view` depends on `model`; `model` depends on nothing. That arrow only ever
points one way, and it is why the bonus view track in week 11 can add a Swing
window without opening a single file in `model`.

A package is also an access boundary — a member with no modifier is visible to
its package and nowhere else. We will use that in M4. For now the rule is
simpler: **fields are `private`, methods that callers need are `public`, and
nothing is left at the default by accident.**

---

## 6. In-class exercise: find the responsibility bug

Ten minutes, in pairs. Here is a `Board` method that looks perfectly
reasonable. It compiles, it passes the test that was written for it, and it is
wrong:

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

Find as many distinct design problems as you can. Not style — *responsibility*.
Ask of each line: is `Board` the class that should be deciding this?

**What to look for** (discussed together after the ten minutes):

- **It enforces a rule.** Whether a pawn may capture sideways is chess
  *legality*, and `Board` is a data structure — it holds pieces. Once one rule
  lives here, all of them drift here, and by M5 `Board` is the whole engine.
  Rules go in the pieces (M2) and in `MoveGenerator` (M3).
- **It prints.** A model class writing to `System.out` cannot be used by a GUI,
  cannot be tested without capturing output, and has quietly decided the program
  has a terminal. Section 4 just spent a page keeping that out.
- **It fails silently.** `return` on an error leaves the caller believing the
  move happened. Compare M0b's constructor, which throws.
- **It forgets what it captured.** Whatever stood on `to` is gone, and nothing
  recorded it. M8's undo has nothing to work with. On Wednesday a `Move`
  carries its captured piece for exactly this reason.
- **It re-does `place`'s job with raw indices.** Two more lines that touch
  `squares` directly — the second copy of `[file][rank]` in the class, and the
  copy that gets swapped someday.
- **The name lies.** "Move piece" sounds like a chess move. It is a board
  mutation. In M3 the two become genuinely different operations, and a name that
  blurs them will cost you an afternoon.

One sentence, no "and": *`Board` stores which piece is on which square.* That
method fails the test half a dozen ways. Deleting it is the fix — `place`
already does the only part that was `Board`'s job.

---

## 7. Your turn: M1

The [weekly loop](https://goleador.github.io/CSC413/guide.html?g=git-workflow),
unchanged from last time:

```bash
git fetch upstream --tags
git merge m1
./mvnw test        # red — the failures are the assignment
```

What the merge brings: `PieceTypeTest`, `PieceTest`, and `BoardTest`; the two
`view` files from section 4, which you read but do not edit; and the handout.
Unlike M0b there are **no stubs**: `PieceType`, `Piece`, and `Board` are yours
to write from empty files. Sections 1–4 above contain the design and the pieces
of code we wrote together; the rest is specified by the tests.

Right after the merge the build fails in a file you did not write —
`PieceGlyphs.java: cannot find symbol: class Piece`. That is the given view
asking for the model it draws. Expected; write the class it names.

Work in this order, because each step makes the next one's failures readable:

1. **`PieceType`** — the six constants, the `symbol` field, the constructor,
   `symbol()`, `fromSymbol()`. Section 2 has all but the last nearly in full.
2. **`Piece`** — two final fields, the constructor (color first), `color()`,
   `type()`, `symbol()`, `toString()`. Section 1 and section 2. The build now
   complains about `TextBoardRenderer` instead: it wants `Board`.
3. **`Board`** — the private array, `pieceAt`, `isEmpty`, `place`,
   `positionsOf`. Section 3's interface, indexed as section 4 requires. Stub
   the bodies first and the suite runs: 24 tests, 7 red.
4. **`toString()`** — section 4 has the shape; the tests pin the format.
5. **`Main`** — set up the starting position with a loop and print it through
   `TextBoardRenderer`. Not tested; it is the point of the milestone.

**Done looks like:**

```
./mvnw test
Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Twenty-four: the eleven from M0b, which must all still pass, plus thirteen new.
**A milestone that breaks an earlier milestone's tests is not done** — that is
what regression means, and it is why the old tests keep running all semester.

Then, from `Main`:

```
8 r n b q k b n r
7 p p p p p p p p
6 . . . . . . . .
  ...
1 R N B Q K B N R
  a b c d e f g h
```

A chessboard, out of your own terminal, is the point of the milestone.

Submit as always:

```bash
git tag submit-m1
git push origin main --tags
```

Handout: [the full M1 handout](https://goleador.github.io/CSC413/guide.html?d=assignments/m1-domain-model/handout).

---

## 8. When it goes wrong

**`cannot find symbol: class Piece` in `PieceGlyphs.java`** (or `class Board`
in `TextBoardRenderer.java`). A file you were given is asking for a file you
have not written yet. Write the class it names, in `model`, with that exact
name.

**The board prints mirrored or upside-down.** The renderer is given and it is
right, so the flip is in *your* code: `place` or `pieceAt` has file and rank
swapped. `placeThenPieceAt` fails with a message that says so — `g1` is file
6, rank 0; `a7` is what you get with the two swapped.

**`emptyBoardToStringIsEightEights` fails.** You are appending a digit per
empty square instead of per *run*, or forgetting the digit at the end of a
rank, or writing a `/` after rank 1.

**`NullPointerException` in `toString` or `positionsOf`.** You called
`piece.symbol()` or `piece.color()` without the null check — 32 empty squares
at the start, and `null` is what an empty square is.

**`ArrayIndexOutOfBoundsException: 8`.** You built `new Piece[8][8]` but some
loop uses `<=` where it needs `<`.

**Both kings print as `K`.** `Piece.symbol()` is not lowercasing for black, or
you returned `type.symbol()` directly.

**M0b's tests now fail.** You edited `Position` or `Color` while writing
`Board`. Revert that — those signatures are fixed contracts, and later
milestones build on them.

Anything else: the **exact** error text, by email or in Wednesday's class.

---

## Next session

Wednesday Sep 16 — **inheritance and polymorphism**, and M2 opens: the `Piece`
hierarchy. Today's `Piece` holds a `PieceType` and knows nothing about how it
moves. Wednesday we ask each piece where it can go, and the answer will not be
a `switch`.

Bring today's `Piece` class, in whatever state it is in. We refactor it live,
and the fact that it is *your* code being restructured is the part that
teaches.

---

## INSTRUCTOR ONLY

**Timing (75 min):** calendar note 2 · M0b debrief 5 · §1 piece bucket 10 ·
§1 database heads-up 2 · §2 the letter 10 · §3 board interface 12 ·
§4 indexing + the given view 8 · §5 packages 2 · §6 exercise 10 + discussion 7
· M1 briefing 6 · questions 2.

**The database heads-up is one slide and two minutes.** Most of the room built
a CRUD app in CSC 317 and has the row-shaped instinct. The only goals: they know
the two kinds of object exist, and they are not thrown when a database model
does it the other way. Do not prescribe how to reconcile them, do not mention
ORM internals, and do not take questions about it now; point at the notes.

**Open with the calendar, in two sentences, then the M0b debrief.** "Last
Wednesday was cancelled; this is week 3's session. M1 is due next Monday, M2
opens Wednesday, next Monday is M2 hands-on, and by week 6 we are back on the
syllabus." Then the debrief: show of hands on green, and name the two failures
that actually recurred in the M0b grading. It is the first milestone with real
code — three minutes of "the red count was the to-do list, and it worked" buys
attention for the next seventy.

**§1 is a real debate — run it as one.** Ask for the vote on value-vs-identity
*before* giving the answer, and let someone argue for `record`, because by the
equality test they are right. Then land it on Wednesday: a record cannot be
extended, and the subclasses are two days away. The lesson is that a design
choice is justified by a requirement, not by taste. If someone raises
`hasMoved` for castling, take the bait — "whose fact is that?" — and put it
on `Game` in M12. Do not let a `hasMoved` field into `Piece`; the reference
engine has none, and a mutable piece breaks the sharing that M7's factory
relies on.

**§2 is the session's transferable idea.** "When you're writing a `switch` over
an enum, check whether the answer belongs inside the enum." Say it, write it on
the board, and flag that Wednesday shows the exception — otherwise they
over-apply it and try to put move generation in `PieceType`.

**§3: draw the has-a/is-a distinction on the board literally.** Two boxes, an
arrow labelled *has-a*. This is the first appearance of composition as a named
concept and it recurs in every remaining week. The `place(square, null)` and
no-`startingPosition` decisions will get pushback; the answers are "who needs
the old piece? whoever took it — Wednesday" and "M2 hands you a
`BoardFactory`". Both are two days away, which is the advantage of the
compressed week.

**§4: the given view is the surprise of the session.** Students expect to write
`render`. Show the renderer on the projector, scroll to the one call to
`pieceAt`, and show `render(board, Color.BLACK)` flipping the board. Fifteen
seconds that make the model/view argument concrete eight weeks before MVC.

**§6 is the graded-thinking part of the session — protect its ten minutes.**
If time is short, cut §5 (packages) to two sentences instead; students can
read that. Take answers from three different pairs before giving the list, and
write each problem on the board as it is found. The single-sentence test —
*"Board stores which piece is on which square"* — is the takeaway; say it last
and leave it up while you brief M1.

**Do not write move generation today**, however much the exercise invites it.
No `canMove`, no legality, no `switch` on type. That is Wednesday's whole
lesson and it needs the inheritance vocabulary students do not have yet.

**What the m1 tag ships** (assembled by hand onto the starter's `main`, the way
m0b was — the release script cannot gate a milestone with no scaffolds):
`PieceTypeTest`, `PieceTest`, `BoardTest` — 13 tests, no stub classes and no
starter source in `model`; `view/PieceGlyphs.java` and
`view/TextBoardRenderer.java` copied unchanged from the reference; and the
handout as `docs/milestones/m1.md`. The files are staged in the reference
repository under `course/milestones/m1/` with a README of the exact steps.
Verified checkpoints: right after merge → `PieceGlyphs.java: cannot find
symbol` (class `Piece`) · after `PieceType` + `Piece` →
`TextBoardRenderer.java: cannot find symbol` (class `Board`) · `Board`
signatures stubbed → `Tests run: 24, Failures: 1, Errors: 6` · done →
`24, 0, 0`.

**Reference implementations stay off the projector.** These notes are published;
§§1–4 contain exactly what we write together and nothing more. The bodies of
`fromSymbol`, `place`, `positionsOf`, and `toString` are the graded work and
appear nowhere here. If asked, the answer is the tests.

**Check before class:** m1 tag pushed and merging cleanly onto a submitted m0b
✅ · a demo clone with M0b green and no `Board.java` ✅ · §6's broken method on
a slide, not typed live ✅ · handout published and linked from the week 4 page
✅ · M0b grading far enough along that the debrief has real numbers ✅ · the
revised calendar live on the course site ✅.
