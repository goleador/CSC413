# Session 7 — Hands-on
### Refactoring `Piece`
**Week 5, Monday Sep 21**

> Hands on today. The projector shows IntelliJ; these slides are checkpoints.
> Say aloud: M1 due tonight 11:59 PM; M2 due Mon Sep 28.

---

## By the end of today you can

1. Refactor a concrete class into an abstract base without breaking its callers
2. Name encapsulation, constructors, packages, polymorphism, composition vs inheritance, and point at each in your repo
3. Read a class you did not write and say in one sentence what it does

---

## 1. Merge m2

```bash
git fetch upstream --tags
git merge m2
./mvnw test
```

```
Knight.java: method does not override or implement a method from a supertype
```

× 7

> Read it as a sentence with them: Knight says it overrides; Piece has no such method.

---

## Class or object?

`Knight` here is a **class**: the description of every knight.

*(reveal)* No knight **object** exists yet. Nothing has said `new Knight(...)`.

*(reveal)* The compiler checks classes. It never runs them.

---

## 2. An M1 `Piece`

```java
public class Piece {
    private final Color color;
    private final PieceType type;

    public Piece(Color color, PieceType type) { ... }

    public Color color() { ... }
    public PieceType type() { ... }
    public char symbol() { ... }
    @Override public String toString() { ... }
}
```

Before we change it: two names for what is already here.

> A volunteer's real file is on the projector; this is its shape.

---

## Encapsulation

`private`: nothing outside `Piece` reads or writes the fields.

`final`: nothing inside `Piece` changes them after construction.

Access goes through `color()` and `type()`.

**`private` hides. `final` freezes.**

> You have done this since Position. Now it has a name.

---

## Constructors

`Piece(Color, PieceType)` is the only way to get a `Piece`.

It sets both fields. A half-built piece cannot exist.

**A constructor establishes the invariants.** `Position` threw from its constructor for the same reason.

---

## Five edits. Compile after each.

| Step | Edit | Compiler says |
|---|---|---|
| 1 | add `abstract pseudoLegalMoves(...)` | `Piece is not abstract and does not override…` |
| 2 | `abstract class Piece` | `Main.java: Piece is abstract; cannot be instantiated` |
| 3 | constructor → `protected` | nothing new |
| 4 | add default `attacks` | nothing new |
| 5 | add helper signatures, bodies throw | only `Main` is red |

> One row per reveal, live in IntelliJ. Do not re-explain abstract; session 6 did.

---

## Step 2: the compiler found `Main`

You did not search for the last `new Piece(...)`.

**Shape first, bodies later.** The compiler lists what the shape change broke.

---

## Step 3: `protected` constructor

```java
    public Knight(Color color) {
        super(color, PieceType.KNIGHT);   // first line, always
    }
```

Only subclasses construct a `Piece` now. Same instinct as `private` fields: expose exactly what is meant to be used.

`Knight` cannot assign `color`; it hands the value up.

---

## 3. `Main`

```java
Board board = BoardFactory.standard();   // replaces the M1 loop
```

```
Tests run: 34, Failures: 0, Errors: 10
```

**Green build. Red tests. The red is the homework.**

---

## Packages: a folder with a rule

| Package | Holds | May import |
|---|---|---|
| `model` | `Position` `Color` `PieceType` `Piece`+6 `Move` `Board` | nothing |
| `view` | `PieceGlyphs` `TextBoardRenderer` | `model` |
| `factory` | `PieceFactory` `BoardFactory` | `model` |
| `engine` | Wednesday: `Game` | `model` `factory` |

*(reveal)* The `import` lines are where the arrows are written down.

*(reveal)* `import ...view.*` in `Board.java` means something is in the wrong package.

---

## 4. Why is `Move` a record and `Piece` a class?

*(reveal)* Two moves with the same fields are **the same move**. Value → record.

*(reveal)* Two white knights with the same fields are **not the same piece**. Identity → class.

*(reveal)* The record's `equals` is what makes Wednesday's `history.contains(move)` work.

**You write `Move` tonight. It is first in the build order.**

---

## 5. The knight on b1, as code

*(the knight diagram: `assets/knight-b1.svg`)*

For each offset:

1. `from.offsetOrNull(dx, dy)` → **null**: skip
2. `board.pieceAt(to)` → **null**: `Move.quiet`
3. **enemy**: `Move.capture` · **friend**: nothing

> Write steppingMoves live from these three lines. Body is not in the notes.

---

## `Knight`: a table and one line

```java
    @Override
    public List<Move> pseudoLegalMoves(Board board, Position from) {
        return steppingMoves(board, from, OFFSETS);
    }
```

**Polymorphism from inside:** `steppingMoves` is written once. Called by a knight, `this` is the knight. Called by a king, the same code runs for the king. Nobody asks which.

---

## Run the tests

```
knightInCentre: UnsupportedOperationException: M2: implement quiet
    at Move.quiet(Move.java)
    at Piece.steppingMoves(Piece.java)
```

*(reveal)* Read it bottom up. Your loop is right. `Move.quiet` is a scaffold.

*(reveal)* **`Move` is where tonight starts.** `King` is the same shape as `Knight`.

---

## 6. The queen has eight directions

```java
// tempting
DIRECTIONS = concat(Rook.DIRECTIONS, Bishop.DIRECTIONS);
```

*(reveal)* Two `private` tables become package-visible

*(reveal)* Arrays cannot be immutable; three classes share two arrays

*(reveal)* "Which way does a queen move?" becomes a two-file question

---

## Composition over inheritance

| | |
|---|---|
| `Queen extends Rook` | a queen is not a kind of rook (session 6) |
| borrow `Rook.DIRECTIONS` | `Queen`'s correctness now depends on `Rook`'s internals |
| eight literal pairs in `Queen` | `Queen` **owns** its parts. Coupled to nothing |

**DRY is a judgement, not a reflex.** Here the duplication is cheaper than the coupling.

> Read the reference Queen javadoc aloud.

---

**20 minutes**

# 7. Reading a `Board`

Three `Board`s from M1, names removed. You review. I moderate.

---

## Three questions for any class

1. **What is it responsible for?** One sentence, no "and"
2. **What does it hold?** Its fields
3. **Who does it talk to?** The types in its signatures

*(reveal)* This is **object modeling**. Session 5 asked them before writing `Board`. Today, after.

---

## `Board` holds a `Piece[][]`

The board **has** sixty-four squares.

It **is not** sixty-four squares.

**Composition:** a class built from parts it owns.

---

## The checklist

- Array `private`; no method returns it or takes one in
- No method prints, renders, or decides legality
- The five handout signatures unchanged
- `toString` counts runs, and only `toString` counts ranks downward

**Feedback is about the code.** "This method returns the array," and what that costs.

---

## Board A

*(specimen on the projector)*

> Then B, then C. One thing worth seeing in each. A clean one is a lesson too.

---

## The words for what you built

| Term | Where |
|---|---|
| Encapsulation | `Piece`'s `private final` fields; `Board`'s private array |
| Constructors | `protected Piece(...)`; `super(...)` in `Knight` |
| Packages | `model` `view` `factory`, and the arrows |
| Abstract class · polymorphism | `Piece`; `pieceAt(from).pseudoLegalMoves(...)` |
| Composition | `Board` has a `Piece[][]`; `Queen` owns its table |
| Composition vs inheritance | no `SlidingPiece`; no borrowed tables |
| Object modeling | the three questions |
| Record vs class | `Move` vs `Piece` |

---

**M1 tonight 11:59 PM · M2 Mon Sep 28**

# Tonight, in order

`Move` → `King` → `slidingMoves` → `Rook` `Bishop` `Queen` → `Pawn`

```
Tests run: 34, Failures: 0, Errors: 0   →   git tag submit-m2
```

> Wed Sep 23: collections, generics, exceptions. A Game that takes turns. M3 opens.
