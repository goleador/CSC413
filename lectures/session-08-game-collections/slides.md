# Session 8 — Collections, Generics, Exceptions
### Building `Game`
**Week 5, Wednesday Sep 23**

> Lighter session by design. Protect §5 (exceptions) and §7 (exercise). Say
> aloud: M2 due Mon Sep 28; M3 opens today, due Mon Oct 5.

---

## By the end of today you can

1. Build a domain model from a paragraph: nouns → buckets → one sentence per class
2. Choose `List`, `Set`, or `Map` by the question asked, and read `Optional<Move>` as a sentence
3. Choose null, boolean, `Optional`, or throw by asking: bug, or ordinary outcome?

---

## 1. All of M3, in a paragraph

> A game of chess is played between two sides, who take turns. On each turn
> the side to move plays one of its legal moves. The game remembers the moves
> played, so that the last one can be taken back.

**Find the nouns.**

> Ask the room. Write them on the board: game, side, turn, move, board, history.

---

## Bucket each one

| Noun | Bucket | Java | Have it? |
|---|---|---|---|
| side | closed set | `enum Color` | M0b |
| move | value | `record Move` | M2 |
| board | identity, changes | `class Board` | M1 |
| turn | a fact about the game | a `Color` field | new |
| history | many moves, in order | a **collection** | new |
| game | identity | `class Game` | new |

*(reveal)* Three of six already exist. **That is compounding.**

> The bucket question: "two of these with the same fields; same thing?"

---

## One sentence

**`Game` plays the moves of one game in turn order and remembers them.**

No "and" joining two jobs: undo needs the memory.

New package: `engine`. Not a fact about pieces; not a way of drawing them.

*(reveal)* Nouns → buckets → sentence. **Object modeling.** Monday's three questions, asked before the code exists.

---

## 2. Twenty moves

```java
List<Move> moves = new ArrayList<>();
for (Position from : board.positionsOf(color)) {
    moves.addAll(board.pieceAt(from).pseudoLegalMoves(board, from));
}
```

All of move generation for a side. **Look at the first line.**

---

## Interface on the left, implementation on the right

```java
List<Move>  moves = new ArrayList<>();
Piece       piece = new Knight(WHITE);
```

*(reveal)* What do these two lines have in common?

*(reveal)* The variable's type says what you may **ask**. The object's type says how it **answers**.

*(reveal)* **Collections Framework:** `List` `Set` `Map` `Queue` are interfaces. `ArrayList` `HashSet` `HashMap` are the defaults.

> Wait for an answer before the second reveal.

---

## 3. Choose the collection by the question

| The code asks | Use |
|---|---|
| "Every move, in order. Is this one among them?" | `List<Move>` |
| "The moves played. What was the last one?" | `List<Move>` as a stack |
| "Is square X attacked?" (M5) | `Set<Position>` |
| "What stands on each square?" | `Map<Position, Piece>` |

*(reveal)* The last row is the board you did not build. It would have worked. Nobody outside `Board` could tell.

---

## Why `contains` works

```java
legalMoves().contains(move)      // walks the list calling equals
```

`Move` is a record → `equals` compares every field.

A hand-written class with no `equals` → identity → **false for a move plainly in the list.**

*(reveal)* Decided in week 2, for `Position`, before there was anything to put in a set.

---

## Hand out a copy, not your field

```java
public List<Move> history() {
    return List.copyOf(history);     // unmodifiable snapshot
}
```

Return the field itself and a caller can `clear()` it.

**Encapsulation is not just `private`. It is not leaking the field through a getter.**

---

## Do not remove while iterating

```java
for (Move move : moves) {
    if (leavesKingInCheck(move)) moves.remove(move);
}
// ConcurrentModificationException
```

Build a new list of what you keep, or `moves.removeIf(...)`.

*(reveal)* M5's king-safety filter is exactly this loop. Remember it.

---

## 4. Read the angle brackets as sentences

| Type | Read as |
|---|---|
| `List<Move>` | a list, every element a `Move` |
| `Optional<Move>` | a box holding a `Move`, or nothing |
| `Map<Position, Piece>` | a lookup from `Position` to `Piece` |

*(reveal)* `moves.add("e2e4")` → compile error. `Move m = moves.get(0)` → no cast.

*(reveal)* Raw `List` held `Object`: the mistake surfaced at runtime, three classes away. **Make invalid code impossible**, again.

---

## Two details in every file

- `new ArrayList<>()`: the **diamond**. The compiler fills in `<Move>` from the left.
- A raw `List` still compiles, with a warning. **Treat the warning as an error.**

`List<? extends Piece>` and `<T>`: wildcards and generic methods. Know they exist; we write them when we need them.

---

## 5. Four ways to say no

| Method | Says | Because |
|---|---|---|
| *(reveal)* `offsetOrNull` | `null` | hot loop; "no square" is expected at every edge |
| *(reveal)* `isEmpty` | `boolean` | the question *is* the yes/no |
| *(reveal)* `findLegalMove("e2e5")` | `Optional.empty()` | the player typed it; ordinary; caller must handle |
| *(reveal)* `new Position(9, 0)` | **throws** | must never exist; whoever built it has a bug |
| *(reveal)* `play(move)` | **throws** | callers choose from `legalMoves()`; anything else is a bug |

---

# A bug throws. An ordinary outcome returns.

Ask **who is at fault** when the answer is no.

> The one sentence to write on the board today.

---

## Why does `play` throw? "Illegal move" sounds ordinary

*(reveal)* The player's typing arrives at `findLegalMove`, which returns `Optional`.

*(reveal)* A `Move` that reaches `play` should have come from `legalMoves()`.

*(reveal)* Anything else is **the program lying to itself.** That is a bug.

---

## Checked and unchecked

Every exception in your engine extends `RuntimeException`: **unchecked**. Nobody is forced to catch a bug; you fix it.

**Checked** (`IOException`): the compiler forces `catch` or `throws`, because the world went wrong: a missing file, a closed socket.

*(reveal)* You have none yet. They arrive with a FEN file (M7) and a terminal (M9).

---

## Catch at the edge

```java
// in the view, where the typing arrives
try {
    Position from = Position.parse(input.substring(0, 2));
    ...
} catch (IllegalArgumentException e) {
    System.out.println(e.getMessage());     // "Not a square: e9"
}
```

Not in `Position`: right to throw. Not in `Game`: never sees text. **Where there is a person to tell.**

*(reveal)* Message carries the values. An empty `catch` is never right.

---

## 6. `Game`

```java
public class Game {
    private final Board board;                            // has-a
    private final List<Move> history = new ArrayList<>(); // has-a
    private Color sideToMove;                             // has-a, changes

    public List<Move>     legalMoves()
    public Optional<Move> findLegalMove(String notation)
    public void           play(Move move)        // throws if not legal
    public Optional<Move> undoLastMove()
}
```

**Composition.** Built from parts it owns. No `extends` needed.

---

## Turns, history, undo

- **Turn:** `sideToMove = sideToMove.opposite()`. The question is about a color; the answer lives in `Color`. Enums carry methods.
- **History:** `add` at the end; `remove(size - 1)`. A `List` is a stack when one end moves.
- **Undo:** two lines, because `Move` carries what it captured.

```java
public void apply(Move move)   // Board: lift, set down; promotion swaps the piece
public void undo(Move move)    // Board: put moved back; put captured back
```

---

## Does `apply` belong on `Board`?

*"`Board` stores which piece is on which square."*

*(reveal)* Moving a piece between squares is storage. **Yes.** `apply` checks nothing.

*(reveal)* Deciding whether the move is *allowed* is not storage. **That stays in `Game`.**

*(reveal)* "Legal" this week: right color, right geometry. M5 tightens `legalMoves()` without renaming it. Callers never change.

---

**5 minutes · in pairs**

# 7. Which way to say no?

null · boolean · `Optional` · throw — and who is at fault?

1. `board.pieceAt(pos)`, empty square
2. `game.undoLastMove()`, nothing played
3. `game.findLegalMove("Nf3")`, short notation
4. `Position.parse("e9")`
5. `Move.promotion(..., PieceType.KING)`

> Answers in the notes. Spend the discussion on 3 and 4.

---

## 8. M3: your turn

```bash
git fetch upstream --tags
git merge m3
./mvnw test
```

**Arrives:** `engine/Game.java` scaffold; `GameTest`, eight tests.
**Stays yours:** `Board` gains `apply` and `undo`.

---

## Build in this order

1. `Board.apply`, `Board.undo`
2. `Game` constructors, accessors; `history()` returns a copy
3. `legalMoves()` **twentyMovesAtStart · startFromFen**
4. `findLegalMove` — the tests play through it
5. `play` **turnsAlternate · playMovesThePiece · rejectsIllegalMove**
6. `undoLastMove` **the three undo tests**

```
Tests run: 42, Failures: 0, Errors: 0   →   git tag submit-m3
```

---

## The words for what you built

| Term | Where |
|---|---|
| Collections | `List<Move>` in `Game`; `positionsOf` |
| Generics | every angle bracket; `Optional<Move>` |
| Enums | `Color.opposite()` flips the turn |
| Records | `Move`, and why `contains` works |
| Exception handling | `play` throws; `findLegalMove` returns `Optional`; `offsetOrNull` returns null |
| Domain model | `Game` has-a `Board`, history, side to move |

---

**M2 due Mon Sep 28 · M3 due Mon Oct 5**

# Next: Monday Sep 28

Cohesion, coupling, separation of concerns, SOLID.

M4 does to `Game` what M2 did to `Piece`: the generation loop moves out into `MoveGenerator`, and you will have the words to say why.
