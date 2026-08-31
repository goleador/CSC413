# Session 3 — Java Review: Designing `Position`

**Week 2, Monday August 31** · CSC 413 Software Development
**Objectives advanced:** 1 (design and implement OO software in modern Java), 2 (encapsulation, abstraction)
**Milestone supported:** M0b — board coordinates (assigned Wed Sep 2, due Wed Sep 9)

---

## Today's objective

**By the end of today you can choose between `class`, `record`, and `enum` —
and you will have used that skill to design the `Position` class you build on
Wednesday.**

The plan: we design `Position` — a square on the chessboard — by answering
eight questions, one per section. Each question is answered by one Java concept
you already met in CSC 220, now sharpened into a *decision*:

1. Is `Position` a class?
2. How should two positions compare?
3. What tool does Java give us for that?
4. How do we keep invalid squares out?
5. What happens at the edge of the board?
6. How should a position print?
7. How do we represent the two sides?
8. What do `file` and `rank` actually store?

One rule runs through all eight, and through the next twelve weeks:

> **Make invalid code impossible.** The best error message is the one the
> compiler gives, and the best bug is the one that cannot be written.

**M0b** — `Position` plus `Color`, written Wednesday in class — is due
Wednesday, September 9.

---

## 1. Is `Position` a class?

Sort these types into three buckets:

```
Student     BankAccount   Game       Board
Money       Temperature   LocalDate  Position
Direction   Month         Suit      Color
```

The first row have **identity**. Two students named Kim are still two students;
closing one bank account does not close the other. They usually change over
time, and "the same" means *the same object*.

The second row are **values**. $5 is $5. March 3rd is March 3rd. Two positions
at file 4, rank 3 are not two squares — they are the same square written down
twice. "The same" means *the same contents*, and a value never changes: 3 does
not become 4, `e2` does not become `e4`.

The third row are **closed sets**: a fixed handful of named values, known
completely in advance. There will never be a fifth suit or a thirteenth month.

Java has a construct for each bucket:

| Bucket | Construct | In this project |
|---|---|---|
| identity | `class` | `Piece`, `Board`, `Game` |
| value | `record` | `Position`, `Move` |
| closed set | `enum` | `Color`, `PieceType` |

So: `Position` is a value → a `record`. But to see what that actually buys,
watch what goes wrong without it.

---

## 2. How should two positions compare?

A prediction, before anything else. Here is the square `e2`, twice:

```java
Position a = new Position(4, 1);   // e2
Position b = new Position(4, 1);   // e2
a.equals(b);      // true or false?
```

**It depends** — on how `Position` is declared. Suppose we write it the obvious
way, the way CSC 220 taught you. This is a first draft, and we are about to
reject it:

```java
// first draft — not what we ship
class Position {
    int file, rank;
    Position(int file, int rank) { this.file = file; this.rank = rank; }
}
```

The draft says nothing about `equals`, so it inherits the default from
`Object`, which compares *references*: is this literally the same object? `a`
and `b` are not. **`false`** — the same square, written down twice, and Java
says they are different.

Watch what that does the moment squares meet collections:

```java
Set<Position> attacked = new HashSet<>();
attacked.add(new Position(4, 1));
attacked.contains(new Position(4, 1));    // false

Map<Position, String> board = new HashMap<>();
board.put(new Position(4, 1), "white pawn");
board.get(new Position(4, 1));            // null
```

You put the pawn *on e2* and the board cannot find it. The map is behaving
correctly — it was told, by the draft's `equals`, that these keys are different
squares.

One headline to keep: **`equals` and `hashCode` travel together.** Collections
use both, so overriding one without the other produces a type that agrees it is
equal and still cannot be found.

Why a chess engine cares: comparing squares is most of what it does. Here is a
line you will write in week 7, asking whether a piece attacks a square —

```java
if (move.to().equals(target)) { ... }
```

— and every check-detection question bottoms out in a comparison like it. Get
equality wrong and nothing throws; the engine simply reports the king is safe
when it is not.

---

## 3. What tool does Java give us? Records.

Before Java 16, fixing the draft meant writing all of this by hand, for every
value type, every time:

```java
class Position {
    private final int file;
    private final int rank;
    Position(int file, int rank) { ... }
    int file() { ... }
    int rank() { ... }
    @Override public boolean equals(Object o) { ... }
    @Override public int hashCode() { ... }
    @Override public String toString() { ... }
}
```

About forty lines, none of them interesting, any of them a place to slip. The
language designers watched developers write this boilerplate thousands of times
and added a way to say "this type is just a value":

```java
public record Position(int file, int rank) { }
```

One line — and it is exactly how the real class is declared. Rerun everything
from §2: `a.equals(b)` → `true`, `contains` → `true`, `get` → `"white pawn"`.
The pawn is back on `e2`.

The compiler generates the fields (`private final`), the constructor, accessors
`file()` and `rank()` — note: no `get` prefix — and `equals`, `hashCode`,
`toString` that treat it as a value.

And because the fields are final, a `Position` cannot change — you do not move
one, you make a new one. Think "new value", not "new object": nobody worries
about the cost of a second `3`. What immutability buys: a `Position` you hand
to another method **cannot come back changed**, and the §2 bug where a key
mutates inside a map cannot be written.

*(Our rule, twice over: wrong equality — impossible. Corrupted coordinates —
impossible.)*

---

## 4. How do we keep invalid squares out?

**What should `new Position(99, -4)` do?** There is no such square. Options:

1. **Store it and hope.** The bad value travels; the failure surfaces three
   classes away from the cause.
2. **Refuse to construct it.** The object either exists and is valid, or it
   never existed.

Take the second. A record lets you write the check as a **compact
constructor** — no parameter list, no assignments; it runs before the
compiler's field assignments, so it cannot be bypassed:

```java
public record Position(int file, int rank) {

    /** Files and ranks both run 0..7. */
    public static final int BOARD_SIZE = 8;

    public Position {
        if (!isOnBoard(file, rank)) {
            throw new IllegalArgumentException(
                    "Position off board: file=" + file + ", rank=" + rank);
        }
    }

    /** True when these raw coordinates name a real square. */
    public static boolean isOnBoard(int file, int rank) {
        return file >= 0 && file < BOARD_SIZE && rank >= 0 && rank < BOARD_SIZE;
    }
}
```

The payoff: no other class in the engine ever asks "is this position valid?" If
you are holding one, it is. *(The rule again: an invalid `Position` is
impossible.)*

Two small notes. `IllegalArgumentException` is unchecked because this signals a
bug in the caller, not a condition to recover from. And the message carries the
values — `file=8, rank=3` points at the off-by-one; a bare `"off board"` points
at nothing.

`isOnBoard` is `static` because it must answer *before* any `Position` exists —
the constructor is about to call it. Same story for `Position.parse("e4")`,
which turns text into a position: it cannot be an instance method of the object
it creates. That is the rule for static: **needs the instance's fields →
instance method; does not → static.**

---

## 5. What happens at the edge of the board?

**A knight on `a1` looks two files left. What should that return?**

Not an exception. Move generation walks eight offsets from every square, and
near an edge most of them leave the board — a completely normal outcome of
asking about a neighbour. So `Position` carries a method with this contract:

```java
    /**
     * Returns the position offset by the given deltas, or {@code null} if that
     * lands off the board.
     */
    public Position offsetOrNull(int fileDelta, int rankDelta)
```

The body is **yours to write in M0b** — it is three lines, and every tool it
needs is already on this page.

So the constructor *throws* for off-board coordinates and this method *returns
null* for them. Different questions, not an inconsistency:

- `new Position(8, 3)` **asserts** *this is a square*. It is not. Bug.
- `here.offsetOrNull(2, 1)` **asks** *is there a square over there?* Sometimes
  the honest answer is no.

**Throw when the caller made a mistake; return an empty answer when "nothing"
is legitimate.** And the name carries the contract — `offsetOrNull`, not
`offset` — so no caller can miss that a check is required.

---

## 6. How should a position print?

**What does `System.out.println(somePosition)` print?**

The record's generated version prints `Position[file=4, rank=1]` — accurate,
and useless in a board dump or a failing test. A chess player says `e2`, so
that is what `toString` should say:

```java
    /** This square in algebraic notation, e.g. {@code "e4"}. */
    @Override
    public String toString() {
        return "" + (char) ('a' + file) + (char) ('1' + rank);
    }
```

File 4 → `'a' + 4` → `'e'`; rank 1 → `'1' + 1` → `'2'`. We take this apart
line by line on Wednesday when you write it.

---

## 7. How do we represent the two sides?

**How do you store which side a piece is on?**

```java
boolean isWhite;          // what does false mean, and whose turn is it?
int color;                // 0? 1? -1?
String color = "white";   // "White"? "WHITE"? " white"?
```

All three compile; all three admit meaningless values. Chess has exactly two
sides, forever — a closed set, our third bucket:

```java
public enum Color { WHITE, BLACK }
```

`Color.PURPLE` no longer compiles. *(The rule: an invalid color is
impossible.)*

### Now ask: which way do this side's pawns move?

That is a question *about a color*, so the answer belongs *in* `Color`. Here is
one of its four methods in full, and the other three as contracts — their
bodies are **yours to write in M0b**, all the same shape as the first:

```java
public enum Color {
    WHITE,
    BLACK;

    /**
     * The direction pawns of this color advance, measured in ranks.
     * White moves up the board (+1), black moves down (-1).
     */
    public int pawnDirection() {
        return this == WHITE ? 1 : -1;
    }

    /** The side whose turn it is after this one moves. */
    public Color opposite() { ... }

    /** The rank pawns of this color start on (0-based). */
    public int pawnStartRank() { ... }

    /** The rank a pawn of this color must reach to promote (0-based). */
    public int promotionRank() { ... }
}
```

For the two rank methods, work out the 0-based constants yourself from the
board diagram in §8 — deriving them is exactly the off-by-one thinking this
class exists to hold in one place.

Compare the two ways the rest of the engine could read:

```java
// without the methods — repeated wherever pawns appear:
int direction = (color == Color.WHITE) ? 1 : -1;

// with them:
Position ahead = from.offsetOrNull(0, color.pawnDirection());
```

**Which one reads like English?** Each fact now lives in one place, and a
ternary that someone eventually writes backwards is gone. The principle —
*behaviour belongs with the data it depends on* — gets a whole week later
(week 6); this is it at its smallest.

---

## 8. The last question: what do `file` and `rank` actually store?

All lecture we have written `Position(int file, int rank)` as if that were
obvious. It was not — it was a design decision, and now you can defend it.
**Work through the alternatives before reading on.**

Humans name squares `e4`, `a1`, `h8` — a letter for the **file** (column), a
digit for the **rank** (row). Whatever we store must support four operations:
**compare**, **collect** in sets and maps, **offset**, **print**.

| Candidate | What it is |
|---|---|
| `"e4"` | a `String` |
| `28` | one index, 0–63 |
| `(4, 3)` | two ints, file then rank, 0-based |
| `(3, 4)` | two ints, rank then file, 0-based |
| `(5, 4)` | two ints, file then rank, 1-based |

**A `String`.** Comparison and printing are free. But every offset means
parsing characters into numbers and back — and `"e9"`, `"z4"`, `"hello"` are
all constructible. The type does not constrain the values.

**A single 0–63 index.** Compact, and real engines use it. But "one square up"
is `+8`, "one left" is `-1`, and the edges vanish: moving left from `a4`
silently lands on `h3` instead of off the board. The bug is invisible in the
arithmetic.

**Two ints.** Offsets are addition per axis; edges are a bounds check per axis;
both stay readable. Two sub-questions remain:

**0-based or 1-based?** The board will be an 8×8 array, and arrays are 0-based.
Ranks running 1–8 put a `- 1` on every array access, and eventually one goes
missing. **0-based.**

**File first or rank first?** `e2` is file `e`, rank `2` — letter first.
Matching that order means `new Position(4, 1)` and `"e2"` carry their parts in
the same order. **File first**, matching the domain rather than the array.

### The result

![An 8×8 board labelled with both numbering systems. Files a–h run along the bottom above the indices 0–7; ranks 8 down to 1 run down the left beside the indices 7 down to 0. The square e2 is highlighted, and equals file 4, rank 1.](assets/board-coordinates.svg)

Two 0-based ints, file first: `e2` is `new Position(4, 1)`.

Read the left-hand column carefully: rank 8 is at the *top* holding index 7;
rank 1 at the *bottom* holding index 0. **The board prints in the opposite
order to the one the array stores it in** — that reversal is where off-by-one
errors come from.

> **Neither convention is *correct* in the abstract.** What matters is that the
> whole codebase makes one choice and writes it down. Half the methods taking
> `(file, rank)` and half `(rank, file)` produces bugs that are hard to spot,
> because both orderings compile and central squares look plausible either way.

---

## The vocabulary you leave with

Seven ideas, reused for the next twelve weeks:

| Term | Meaning here |
|---|---|
| **value** | defined by its contents; `Position`, `Move` |
| **identity** | the same object, not the same contents; `Piece`, `Game` |
| **immutable** | cannot change after construction; make a new one instead |
| **closed set** | all values known in advance; `Color`, `PieceType` |
| **validate at construction** | an invalid object never exists |
| **illegal state** | a value the type permits but the domain forbids — design them away |
| **behaviour with data** | the method lives on the type that owns the answer |

## Today you learned

- when to reach for `class`, `record`, and `enum`
- the difference between identity and value
- why records generate `equals` and `hashCode` — and what breaks without them
- why immutable values are easier to reason about
- how constructor validation makes invalid objects impossible
- why `Position` is a record and `Color` is an enum

## Where this goes

```
Week 2   Position, Color        ← you are here
Week 3   Board
Week 4   the Piece hierarchy
Week 5   Move generation
Week 7   check detection
```

Every move in the engine starts from a `Position`. Design it well today and
everything above it gets easier.

---

## Before Wednesday

1. **Confirm M0 is green.** `./mvnw test` must show three zeros — M0b merges on
   top of it. Bring the exact error text if not.
2. **Skim the [git workflow guide](https://goleador.github.io/CSC413/guide.html?g=git-workflow)** —
   you run the fetch-merge-test loop for real on Wednesday.
3. **Answer for yourself:** what does `new Position(4, 3).toString()` return,
   and what is that square called in a chess book?

---

## Next session

Wednesday Sep 2 — we read the failing tests together, then write `Position` and
`Color` from empty files to green. That is M0b, due Wednesday Sep 9.

---

## INSTRUCTOR ONLY

**Timing (75 min):** objective + the rule 3 · §1 buckets 7 · §2 equality 10 ·
§3 records 10 · §4 validation 7 · §5 edge 6 · §6 toString 4 · §7 Color 9 ·
§8 exercise 12 · vocab/learned/roadmap 4 · slack 3.

**Every section opens with its question — actually ask it.** Question on
screen, two or three predictions out loud, then resolve. The §2 `a.equals(b)`
opener is the model: half the room is confidently wrong, and the split is the
lesson.

**§1 is a sorting exercise, not a definition.** Put the twelve example types up
unsorted and have the room bucket them before naming the buckets. Definitions
land after examples, not before.

**§2 — demo both failures live** in a scratch file: the draft `class Position`,
then `Set`, then `Map`. The `board.get(...) == null` is the one that shocks —
they trust maps. Then, in §3, delete the draft's body and change the declaration
to `public record Position(int file, int rank) { }` — rerun everything, watch
`false`/`null` become `true`/`"white pawn"`.

**Label the draft every time it is on screen.** Say "first draft — not what we
ship" out loud and keep the comment line visible. The lecture uses one example
from start to finish — `Position`, from failing draft to shipped record — so
never let the class version stand unlabeled, or it reads as the real thing.
End any live editing at exactly the reference declaration.

**§8 is collaborative.** For each candidate: thumbs up or down, then defend.
List pros and cons on the board before you evaluate anything. The single-index
option is the productive one — someone always likes it, and discovering that
`a4 - 1 == h3` is the moment the exercise pays off. Protect the full 12
minutes; this is their first real design problem.

**The recurring rule.** Say "make invalid code impossible" out loud each time
it recurs — PURPLE, the compact constructor, immutability. By §7 they should be
finishing the sentence for you.

**Code discipline: every `Position` and `Color` snippet is verbatim from the
reference implementation.** If you edit live, end at exactly the reference text
— Wednesday's tests are written against it.

**Do not** get pulled into sealed interfaces, pattern matching for `switch`,
`Optional`, the full `equals`/`hashCode` contract, or the `Piece` hierarchy
(weeks 5 and 4). Park questions with "week N" and move on.

**If running long,** compress §5 and §6 to their headline rules. Never shorten
§2 or §8.

**Check before class:** m0b tag pushed and merging cleanly onto m0 ✅ · scratch
project with the draft-class demo ready ✅ · reference `Position.java` open in a
second window, *not* on the projector ✅.
