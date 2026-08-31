# Session 3 — Designing `Position`
### A Java review, aimed at one class
**Week 2, Monday Aug 31**

> Speaker notes point back to `notes.md` sections. Every section opens with a
> question — ask it, take predictions, then resolve.

---

## This week's goal

Take **one concept** from the game — **a square on the board** — and model it
properly, end to end.

- **Today:** decide — the Java review
- **Wednesday:** write it, empty file → green tests
- **M0b** = `Position` + `Color`, due **Wed Sep 9**

---

## The plan: eight questions

1. Is `Position` a class?
2. How should two positions compare?
3. What tool does Java give us?
4. How do we keep invalid squares out?
5. What happens at the edge of the board?
6. How should a position print?
7. How do we represent the two sides?
8. What do `file` and `rank` actually store?

---

## One rule, all semester

**Make invalid code impossible.**

*The best error message is the one the compiler gives. The best bug is the one
that cannot be written.*

> Say it aloud each time it recurs. By §7 they finish the sentence for you.

---

# Question 1 — Is `Position` a class?

---

## Sort these into three buckets

```
Student     BankAccount   Game       Board
Money       Temperature   LocalDate  Position
Direction   Month         Suit       Color
```

> §1. Sorting exercise, not a definition — room buckets them first.

---

## Three buckets, three constructs

| Bucket | "The same" means | Construct | Here |
|---|---|---|---|
| **identity** | same object | `class` | `Piece`, `Board`, `Game` |
| **value** | same contents | `record` | `Position`, `Move` |
| **closed set** | same constant | `enum` | `Color`, `PieceType` |

**Position is a value** — two positions at (4,3) are the same square written twice.

---

# Question 2 — How should two positions compare?

---

## A prediction

```java
Position a = new Position(4, 1);   // e2
Position b = new Position(4, 1);   // e2

a.equals(b);      // true or false?
```

> §2. Take votes. Half the room is confidently wrong — the split is the lesson.
> "It depends" — on how Position is declared.

---

## The obvious first draft

```java
// first draft — not what we ship
class Position {
    int file, rank;
    Position(int file, int rank) { this.file = file; this.rank = rank; }
}
```

Says nothing about `equals` → inherits the default: *is this literally the same
object?*

**The same square, twice — and Java says `false`.**

> Label it out loud every time: "first draft — not what we ship." One example
> all lecture: Position, from failing draft to shipped record.

---

## What that does to collections

```java
Set<Position> attacked = new HashSet<>();
attacked.add(new Position(4, 1));
attacked.contains(new Position(4, 1));    // false

Map<Position, String> board = new HashMap<>();
board.put(new Position(4, 1), "white pawn");
board.get(new Position(4, 1));            // null
```

You put the pawn *on e2* — and the board cannot find it.

> Demo live, scratch file: draft class, Set, then Map. The board.get null is
> the shock — they trust maps.

---

## Why the engine cares

```java
if (move.to().equals(target)) { ... }   // week 7
```

- Every check-detection question bottoms out in a comparison
- Get it wrong: nothing throws — **the king is reported safe when he is not**

> `equals` and `hashCode` travel together.

---

# Question 3 — What tool does Java give us?

---

## Before Java 16 — fixing it by hand

~40 lines of boilerplate per value type: fields, constructor, accessors,
`equals`, `hashCode`, `toString`.

## After

```java
public record Position(int file, int rank) { }
```

One line — **exactly how the real class is declared**.

Rerun §2: `equals` → **true** · `contains` → **true** · `get` → **"white pawn"**

*The pawn is back on e2.*

> Delete the draft's body, change the declaration, rerun everything live.

---

## What that one line generates

`private final` fields, constructor, `file()`/`rank()`, `equals`, `hashCode`,
`toString`.

- Accessors have **no `get` prefix**
- Final fields → a `Position` **cannot change**
- Think **"new value"**, not "new object" — nobody fears a second `3`

---

# Question 4 — How do we keep invalid squares out?

---

## `new Position(99, -4)` — now what?

1. **Store it and hope** — failure surfaces three classes away
2. **Refuse to construct it** — exists and valid, or never existed

Take the second. **Make the invalid `Position` impossible.**

---

## The compact constructor

```java
public Position {
    if (!isOnBoard(file, rank)) {
        throw new IllegalArgumentException(
                "Position off board: file=" + file + ", rank=" + rank);
    }
}
```

- Runs *before* field assignments — cannot be bypassed
- Message carries the values
- If you hold one, it is valid

> IAE unchecked: a bug, not a recoverable condition — one sentence. isOnBoard
> and parse are static: they answer before any instance exists.

---

# Question 5 — What happens at the edge of the board?

---

## A knight on a1 looks two files left

```java
/** The position offset by the given deltas,
    or null if that lands off the board. */
public Position offsetOrNull(int fileDelta, int rankDelta)
```

Body: **yours, in M0b** — three lines, built from `isOnBoard`.

- `new Position(8, 3)` **asserts** — wrong assertion = bug = **throw**
- `offsetOrNull(2, 1)` **asks** — "no" is legitimate = **null**

> The name carries the contract: `offsetOrNull`, not `offset`.

---

# Question 6 — How should a position print?

---

## `System.out.println(somePosition)`

Generated: `Position[file=4, rank=1]` — accurate, useless on a board.

```java
@Override
public String toString() {
    return "" + (char) ('a' + file) + (char) ('1' + rank);
}
```

A chess player says **e2** — so that is what it says.

> Taken apart line by line Wednesday. Don't linger.

---

# Question 7 — How do we represent the two sides?

---

## The options that compile

```java
boolean isWhite;          // what does false mean?
int color;                // 0? 1? -1?
String color = "white";   // "White"? "WHITE"?
```

All admit meaningless values. Two sides, forever:

```java
public enum Color { WHITE, BLACK }
```

**Color.PURPLE no longer compiles.**

---

## Which way do this side's pawns move?

```java
// without — repeated wherever pawns appear:
int direction = (color == Color.WHITE) ? 1 : -1;

// with:
Position ahead = from.offsetOrNull(0, color.pawnDirection());
```

### Which one reads like English?

The four method bodies: **yours, in M0b**.

> The question is about a color → the answer lives IN Color. Behaviour belongs
> with the data it depends on — week 6, at its smallest.

---

# Question 8 — What do `file` and `rank` actually store?

---

## Five candidates — thumbs up or down?

| Candidate | What it is |
|---|---|
| `"e4"` | a `String` |
| `28` | one index, 0–63 |
| `(4, 3)` | two ints, file then rank, 0-based |
| `(3, 4)` | two ints, rank then file, 0-based |
| `(5, 4)` | two ints, file then rank, 1-based |

Must support: compare · collect · offset · print

> §8, collaborative. Thumbs per candidate, pros/cons on the board first. The
> 0–63 index is the productive one — until a4 − 1 == h3. Protect the 12 minutes.

---

## The result

*(the coordinate diagram — `assets/board-coordinates.svg`)*

> Rank 8 at the TOP holds index 7. The board prints in the opposite order to the
> array — that reversal is where the off-by-ones come from.

---

## e2 = `new Position(4, 1)`

- **Two ints** — offsets are addition, edges are a bounds check
- **0-based** — the board is an array
- **File first** — `e2` is letter-first; match the domain

> Neither convention is "correct." One choice, whole codebase, written down.

---

## The vocabulary you leave with

value · identity · immutable · closed set · validate at construction ·
illegal state · behaviour belongs with data

---

## Today you learned

- when to reach for `class`, `record`, `enum`
- identity versus value
- why records generate `equals`/`hashCode` — and what breaks without them
- why immutable values are easier to reason about
- constructor validation: invalid objects never exist
- why `Position` is a record and `Color` is an enum

---

## Where this goes

```
Week 2   Position, Color        ← you are here
Week 3   Board
Week 4   the Piece hierarchy
Week 5   Move generation
Week 7   check detection
```

---

## Next session

**Wednesday Sep 2** — we write it: `Position` and `Color`, empty files → green tests.

**Before then:** confirm M0 is green — `./mvnw test`, three zeros.
