# Session 7 — Hands-on: Refactoring `Piece`

**Week 5, Monday September 21** · CSC 413 Software Development
**Objectives advanced:** 1 (OO software in modern Java), 2 (encapsulation, inheritance, polymorphism, abstraction), 3 (analyze designs for responsibility assignment)
**Milestone supported:** M2 — the `Piece` hierarchy (due Monday Sep 28, 11:59 PM). M1 is due tonight.

---

## Today's objective

Session 6 explained the design. Today we build it, on a real M1 file, with
the compiler telling us what to do next. Along the way we put the standard
names on things you have already written.

**By the end of today you can:**

1. Refactor a concrete class into an abstract base class without breaking its
   callers.
2. Say *why* a field is `private` and *who* a constructor is for; explain
   packages, polymorphism, and composition versus inheritance; and point at
   the line in your repo where each one lives.
3. Read a class you did not write and say, in one sentence, what it is
   responsible for.

---

## 1. Merge m2 and read the errors

```bash
git fetch upstream --tags
git merge m2
./mvnw test
```

```
Knight.java: method does not override or implement a method from a supertype
```

Seven times, one per scaffold. Read it as a sentence: *`Knight` says it
overrides a method, and there is no such method in `Piece`.* The scaffolds
arrived expecting an abstract `Piece`; yours is still M1's concrete one.

Notice what the error is about. `Knight` here is a **class**: a description
of every knight. No knight **object** exists yet; nothing has said
`new Knight(...)`. The compiler checks classes. It never runs them.

A compiler error in a file you did not write is a specification. The seven
errors are the assignment, and the fix for all seven is in one file.

---

## 2. Refactor `Piece` live

Session 6 §2 showed the target: an abstract `Piece` with one abstract
method. Today we get there from a real M1 file, one edit at a time, letting
the compiler say what comes next.

Here is an M1 `Piece` as most of the room wrote it:

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

    public char symbol() {
        char letter = type.symbol();
        return color == Color.WHITE ? letter : Character.toLowerCase(letter);
    }

    @Override
    public String toString() { return String.valueOf(symbol()); }
}
```

Two things in this file have names we have not used yet.

**Encapsulation.** Start with a puzzle. `color` is `private`, and `color()`
hands it straight back one line below. If anyone can read it, what is
`private` hiding? Not the value. It hides the **field**: the value leaves on
`Piece`'s terms, which here are *read, never written*. That is the whole idea.
A class is a set of promises about its fields, and `private` is how it keeps
them, because a promise you cannot enforce is not one.

You have already made two such promises this semester without the word:

| Promise | Kept by |
|---|---|
| A `Position` is always on the board | the constructor checks once and throws |
| A `Board` is always 8×8 and never `null` | the array is `private`; `place` is the only writer |

Nothing else in the program checks these again. `Board.pieceAt` indexes the
array without a bounds test because a `Position` cannot be off the board.
Every method you write this semester leans on that. Make either field `public`
and every caller becomes a place where the promise can break, and the check
has to move to every reader.

*When* to encapsulate, then: whenever a field has a rule. `Position.file` has
one (0..7), `Board.squares` has one (8×8), `Piece.color` has one (it never
changes). That turns out to be every field you have written, which is why the
default is `private` and you widen only when a specific caller needs more,
to the smallest ring that reaches them. There is a second payoff, from session
5: swap `Piece[8][8]` for `Piece[64]` and no caller changes, because the
promise was about *behaviour* (`pieceAt`, `place`) and the representation
stayed yours to change.

*How*, in Java. Access has four rings:

| Modifier | Who can see it |
|---|---|
| `private` | this class |
| *(none)* | this package |
| `protected` | this package, and subclasses anywhere |
| `public` | everyone |

The recipe you have been following: `private final` fields; `public` methods
that say what callers may do with them, in the class's vocabulary; `final` so
the class cannot break its own promise by accident. `private` hides. `final`
freezes. Same slogan as before, now with the reason in front of it.

**Constructors.** `Piece(Color, PieceType)` is the only way to get a `Piece`,
and it sets both fields, so a half-built piece cannot exist. A constructor's
job is to establish the class's invariants. Session 3's `Position` threw from
its constructor for the same reason. And the four rings apply to constructors
as much as to fields: *who may build one* is a design decision, which is what
step 3 below is about.

Now the edits. Compile after each one and read the message.

| Step | Edit | Compiler says |
|---|---|---|
| 1 | Add `public abstract List<Move> pseudoLegalMoves(Board board, Position from);` | `Piece is not abstract and does not override abstract method pseudoLegalMoves` |
| 2 | `public abstract class Piece` | `Main.java: Piece is abstract; cannot be instantiated` |
| 3 | Constructor `public` → `protected` | nothing new |
| 4 | Add the default `attacks` (session 6 §5) | nothing new |
| 5 | Add `slidingMoves` and `steppingMoves`, `protected`, bodies throwing `UnsupportedOperationException` for now | nothing new; only `Main` is red |

Three observations, one per step that matters:

- **Step 2.** The compiler found the one `new Piece(...)` left in the
  program. You did not search for it. That is what a refactor with a compiler
  behind it feels like, and it is why we do the shape change first and the
  bodies later.
- **Step 3.** The compiler said "nothing new", so ask the question the room
  is not asking: `abstract` already forbids `new Piece(...)`. What does
  `protected` add? Two different statements. `abstract` says *nobody* builds
  a bare `Piece`. `protected` says *who* builds the rest of one: a subclass,
  through `super(color, KNIGHT)`, which must be the first line of `Knight`'s
  constructor. Each keyword guards one thing, and they survive separately:
  remove `abstract` next semester and `protected` still keeps `new Piece(...)`
  out of `Main`, which lives in another package. Leaving the constructor
  `public` on an abstract class is a door marked "everyone" that nobody can
  walk through; the modifier should say what you mean. The three
  constructors in the scaffold show the three answers to "who may build
  this": `public Knight(Color)` because a knight is a finished thing and
  `PieceFactory` needs to make them; `protected Piece(...)` because `Piece`
  is a starting point, not a thing; `private PieceFactory()` because the
  factory has no state and an instance of it would mean nothing. The fields
  are private to `Piece`, so `Knight` hands the values up rather than
  assigning them.
- **Step 4.** `attacks` has a body and calls `pseudoLegalMoves`, which has
  none. That is fine. Whichever subclass fills the hole, `attacks` uses its
  answer.

The file now has the shape from session 6 §2, plus the two helper signatures
from §4 there. Same fields, same accessors, same `symbol`. M1's `PieceTest`
passes unchanged once `Main` is fixed. A refactor changes the shape of the
code and nothing about what it does.

---

## 3. `Main`, and where things live

```
Main.java: Piece is abstract; cannot be instantiated
```

M1's `Main` built the starting position with a loop of `new Piece(...)`.
Delete the loop. One line replaces it:

```java
Board board = BoardFactory.standard();
```

```
Tests run: 34, Failures: 0, Errors: 10
```

Green build, red tests. The ten errors are the ten `PieceMovementTest`
cases, and they are the homework.

`BoardFactory` is in a package you did not have last week. Here is the whole
project as of today:

| Package | Holds | May import |
|---|---|---|
| `model` | `Position`, `Color`, `PieceType`, `Piece` and its six subclasses, `Move`, `Board` | nothing outside itself |
| `view` | `PieceGlyphs`, `TextBoardRenderer` | `model` |
| `factory` | `PieceFactory`, `BoardFactory` | `model` |
| `engine` | arrives Wednesday with `Game` | `model`, `factory` |

A **package** is a folder with a rule attached. The folder groups classes that
change for the same reason. The rule is the arrow: `model` knows nothing about
how it is drawn or built, so you can read `Piece` and `Board` without loading
the rest of the project into your head. `PieceFactory` is not in `model`
because construction from data (a letter, a `PieceType`) is a job at the edge
of the program, not a fact about pieces.

The `import` lines at the top of a file are where the arrows are written down.
If `Board.java` ever says `import edu.sfsu.csc413.chess.view.*`, something is
in the wrong package.

---

## 4. `Move`: a value, so a record

Session 6 §7 showed `Move` in full. One question before you write it tonight:
why is `Move` a `record` when `Piece` is a `class`?

Session 3's buckets. Two moves with the same from, to, piece, capture and
promotion are **the same move**; there is nothing else to a move. That is a
value, and a value is a record: `equals`, `hashCode`, `toString` and the
accessors come for free. Two white knights are **not** the same piece even
though every field matches; a piece has identity, so it is a class.

The record's compact form is what makes Wednesday's `history.contains(move)`
work without you writing a line.

You write `Move` tonight, from the handout. Three static factories, two
predicates, `toString`. It is first in the build order because every piece
returns one.

---

## 5. From a trace to a loop: `steppingMoves` and `Knight`

Session 6 §4 traced a knight on b1: eight offsets, three land, five fall off.
Now the same trace as code, one case per line of the picture.

For each offset in the table:

1. `from.offsetOrNull(dx, dy)`. **Null**: off the board, skip it. This is why
   M0b returned null rather than throwing: "no square there" is an ordinary
   answer inside this loop, not a bug.
2. `board.pieceAt(to)`. **Null**: empty, add `Move.quiet(from, to, this)`.
3. Otherwise a piece stands there. **Enemy** (`occupant.color() != color`):
   add `Move.capture(from, to, this, occupant)`. **Friend**: add nothing.

That is the entire method. We write it together in class. The signature:

```java
    protected List<Move> steppingMoves(Board board, Position from, int[][] offsets)
```

`this` is the moving piece. The helper lives on `Piece`, so inside it `this`
is whichever knight or king asked. It never checks which.

With the helper in place, `Knight` is the scaffold's table and one line:

```java
public class Knight extends Piece {

    private static final int[][] OFFSETS = {
            {1, 2}, {2, 1}, {2, -1}, {1, -2},
            {-1, -2}, {-2, -1}, {-2, 1}, {-1, 2}
    };

    public Knight(Color color) {
        super(color, PieceType.KNIGHT);
    }

    @Override
    public List<Move> pseudoLegalMoves(Board board, Position from) {
        return steppingMoves(board, from, OFFSETS);
    }
}
```

**Polymorphism, seen from inside.** `steppingMoves` is written once, in
`Piece`. When a `Knight` calls it, `this` is a knight and `color` is the
knight's color. When a `King` calls it, the same code runs for a king. The
`@Override` on `pseudoLegalMoves` is what lets `board.pieceAt(from)`, declared
as a `Piece`, run the knight's version. Neither the helper nor the caller ever
asks what kind of piece it has.

Run the tests:

```
knightInCentre: UnsupportedOperationException: M2: implement quiet
    at Move.quiet(Move.java)
    at Piece.steppingMoves(Piece.java)
```

Read the stack trace bottom up: `steppingMoves` called `Move.quiet`, and
`Move.quiet` is a scaffold. Your loop is correct. `Move` is where tonight
starts. `King` is the same shape as `Knight` with a different table, and it
is yours.

---

## 6. The queen question

`Rook` has four directions. `Bishop` has the other four. `Queen` has all
eight. A student always asks: can `Queen` borrow the two tables instead of
repeating them?

```java
// tempting
private static final int[][] DIRECTIONS = concat(Rook.DIRECTIONS, Bishop.DIRECTIONS);
```

It works. Here is what it costs:

- `Rook.DIRECTIONS` and `Bishop.DIRECTIONS` are `private`. Borrowing them
  means loosening both to package-private, so a detail of how a rook moves
  becomes visible to every class in `model`.
- Java arrays cannot be made immutable. Three classes now share two arrays,
  and any one of them could scribble on data the other two depend on.
- "Which way does a queen move?" is now a two-file question.

Eight literal pairs in `Queen` answer it on sight and couple `Queen` to
nothing.

**Composition versus inheritance, and its cousin DRY.** Session 6 rejected
`Queen extends Rook` because a queen is not a kind of rook. Borrowing the
tables is the same mistake in a smaller form: it ties `Queen`'s correctness
to `Rook`'s internals. The standard advice is *favor composition over
inheritance*: build a thing from parts it owns rather than from a parent it
depends on. Here `Queen` owns its table. `Piece` shares behaviour through a
helper that every subclass owns by inheritance, which is the right use of
`extends`: `Queen` **is a** piece.

DRY, "don't repeat yourself", is a judgement about which duplication costs
more than the coupling that would remove it. Here the eight pairs are cheaper.
It will not always go that way.

---

## 7. Reading a `Board`: code review

The second half of class. Two or three `Board` classes from M1 submissions,
names removed, on the projector. The room reviews; I moderate.

**The method: three questions for any class.**

1. **What is it responsible for?** One sentence, no "and". For `Board`:
   *stores which piece is on which square.* If you need "and", the class has
   two jobs.
2. **What does it hold?** Its fields. `Board` holds a `Piece[][]`. The board
   **has** sixty-four squares; it **is not** sixty-four squares. That is
   **composition**: a class built from parts it owns. (`extends Piece[][]`
   is not even legal Java, and the reason it is not sensible is the same
   reason `Rook extends SlidingPiece` was not: a board is not a kind of
   array.)
3. **Who does it talk to?** The types in its method signatures. `Board`
   talks to `Position` and `Piece`. If it talks to `TextBoardRenderer`, it
   has started drawing itself.

This is **object modeling**: the same three questions, asked of every class,
before and after it is written. Session 5 asked them of `Board` before. Today
we ask them after.

**The checklist for `Board` specifically**, from the M1 grading criteria:

- The array is `private` and no method returns it or takes one in.
  (Encapsulation.)
- No method prints, renders, or decides legality. (Responsibility.)
- The five signatures from the handout are unchanged. (M2 and M3 build on
  them.)
- `toString` counts empty runs, not squares, and only `toString` counts ranks
  downward.

**How to give feedback.** About the code, never the author. "This method
returns the array" not "you leaked the array". Say what it costs, not that it
is wrong: "a caller can now place a piece without `place`, so the board can no
longer trust its own contents."

The `Board`s we read are chosen because each shows one thing worth seeing.
Some are good. A clean `Board` with nothing to fix is also a lesson.

---

## 8. Recap and homework

Every term from the syllabus's first two topic groups, and where it is in your
repo as of tonight:

| Term | Where you can point |
|---|---|
| Class vs object | `Knight` the file; `new Knight(WHITE)` the thing |
| Encapsulation | the promise a class keeps about its fields: `Piece`'s `private final` fields and their accessors; `Board`'s private array |
| Constructors | who may build one: `protected Piece(...)`, `public Knight(...)`, `private PieceFactory()`; `Knight`'s `super(...)` |
| Packages | `model`, `view`, `factory`; the arrows between them |
| Inheritance | `Knight extends Piece` |
| Abstract class | `Piece`, with `pseudoLegalMoves` left open |
| Polymorphism | `board.pieceAt(from).pseudoLegalMoves(...)` runs the knight's version |
| Interface | `PieceGlyphs` (session 6 §6) |
| Composition | `Board` has a `Piece[][]`; `Queen` owns its table |
| Composition vs inheritance | no `SlidingPiece`; no borrowed tables |
| Object modeling | the three questions |
| Record vs class | `Move` vs `Piece` |

**Tonight:** M1 tag by 11:59 PM. Then, in order: `Move`, `King`,
`slidingMoves`, `Rook`, `Bishop`, `Queen`, `Pawn`. The handout has the test
counts at each step. `submit-m2` by Monday Sep 28.

---

## Next session

Wednesday Sep 23: collections, generics, and exceptions, taught by building
the third domain model of the semester: a `Game` that takes turns, keeps
history, and can take a move back. M3 opens.

---

## INSTRUCTOR ONLY

**Timing (75 min):** objective 3 · §1 merge and errors 5 · §2 refactor 14 ·
§3 `Main` and packages 3 · §4 `Move` 5 · §5 `steppingMoves` and `Knight` 12 ·
§6 queen 6 · §7 `Board` review 20 · §8 recap 5. Cut §6 first if behind, then
§4 to one sentence. Never cut §7.

**Whose `Piece` for §2.** Ask a volunteer Sunday, not at 8 AM, and confirm
their M1 is green. As of Sunday Sep 20, five students had pushed M1; all
five `Piece` files match the one in §2 to within cosmetics. One has
`private` fields that are not `final`; that file is the best choice, because
the room can see `final` is a choice and ask what it buys. One writes
`color.WHITE` (static via instance); worth one sentence if it comes up.
Fallback: my own clone with the §2 file typed in as a student would.

**§2 carries the encapsulation idea; give it the time.** Session 6 named
the keywords; today is the first time the *why* is said out loud, so the
encapsulation slides before the first edit are the one place in the deck to
slow down: ask "what is `private` hiding?" and wait for the room. Budget
about six minutes there, then the five steps in under eight, with the
`protected` question at step 3 as the second pause. Do not re-explain
`abstract`.

**§5: write `steppingMoves` live, and keep the body out of the published
notes.** The notes carry the trace and the three cases; the room gets the
code. After `Knight`, run the tests and show the `UnsupportedOperationException`
stack trace from `Move.quiet`. Read it bottom up with them. That is deliberate:
`Move` is theirs and the trace tells them where to start. `King` is not
written today.

**§6: read the reference `Queen` javadoc aloud.** It has the full argument.
Have it open in the demo clone.

**§7 specimens.** Pull `Board.java` from `origin/main` of each clone under
`grading/clones/` Sunday night; strip the package line and any comment with a
name; number them Board A, B, C. Pick for contrast: one clean, one that
returns or exposes the array, one with a second job (a `movePiece`, a
`canMove`, a `print`). If nothing has a defect, review two clean ones against
the checklist and say so; that is a fine outcome. Never show a file to the
room that its author would recognise as being criticised; if in doubt, ask
the author beforehand.

**Reference implementations stay off the projector** except `steppingMoves`,
written live, and `Knight`, which is the scaffold's table plus the one line
already shown for `Rook` in session 6. `slidingMoves`, `Pawn`, `Move` bodies,
and `King` are graded work.

**Check before class:** volunteer confirmed and M1 green ✅ · demo clone at
M1-solved with m2 fetched but not merged ✅ · three `Board` specimens
anonymised and in a scratch file ✅ · reference `Queen` open ✅ · session 6's
knight and rook diagrams in the deck ✅.
