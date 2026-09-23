# Session 8 — Collections, Generics, and Exceptions: Building `Game`

**Week 5, Wednesday September 23** · CSC 413 Software Development
**Objectives advanced:** 1 (OO software in modern Java), 3 (analyze designs for responsibility assignment), 4 (a first look at defensive design and failure handling)
**Milestone supported:** M3 — turns, moves, `Game` (assigned today, due Monday Oct 5, 11:59 PM). M2 is due Monday Sep 28.

---

## Today's objective

Your engine can say where one piece may go. Today it learns to list every
move for a side, play one, take one back, and refuse a bad one. Building that
is the third domain model of the semester, and it needs three parts of Java we
have used without naming: collections, generics, and exceptions.

**By the end of today you can:**

1. Build a domain model from a one-paragraph description: nouns, then
   buckets, then one responsibility per class.
2. Choose between `List`, `Set` and `Map` by the question the code will ask,
   and read a generic type like `Optional<Move>` as a sentence.
3. Choose between returning null, a boolean, an `Optional`, or throwing, by
   asking whether the "no" is a bug or an ordinary outcome.

---

## 1. The modeling process, named

Here is the whole of M3 in one paragraph:

> A game of chess is played between two sides, who take turns. On each turn
> the side to move plays one of its legal moves. The game remembers the moves
> played, so that the last one can be taken back.

Three steps, the same three you did for `Position` in week 2 and `Board` in
week 4. This time we say what they are called.

**Step 1: find the nouns.** Game, side, turn, move, board, history.

**Step 2: sort each into a bucket.** Session 3's three: value, identity, or
closed set.

| Noun | Bucket | Java | Already have it? |
|---|---|---|---|
| side | closed set: exactly two | `enum Color` | yes, M0b |
| move | value: same fields, same move | `record Move` | yes, M2 |
| board | identity: *the* board of this game, and it changes | `class Board` | yes, M1 |
| turn | a fact about the game: whose go it is | a `Color` field | new |
| history | many moves, in order | a **collection** of `Move` | new |
| game | identity: this game, not that one | `class Game` | new |

**Step 3: one sentence per class.** *`Game` plays the moves of one game in
turn order and remembers them.* No "and" joining two jobs: remembering is part
of playing, because undo needs it.

Three of the six nouns were already classes. That is what it means for a
model to compound: this week's class is built from last week's. `Game` goes in
a new package, `engine`, because it is neither a fact about pieces (`model`)
nor a way of drawing them (`view`).

This is **object modeling**, and it is the same three questions as Monday's
code review, asked before the code exists.

---

## 2. Twenty moves

White has twenty legal moves at the start: sixteen pawn moves and four knight
moves. Session 6 §3 showed the loop that finds them:

```java
List<Move> moves = new ArrayList<>();
for (Position from : board.positionsOf(color)) {
    moves.addAll(board.pieceAt(from).pseudoLegalMoves(board, from));
}
```

That is all of move generation for a side. Look at the first line.

`List<Move>` on the left is an **interface**: a promise of what the thing can
do (`add`, `get`, `size`, `contains`, iterate). `ArrayList<>` on the right is
an **implementation**: one particular way of keeping that promise, backed by an
array that grows.

You have seen this shape before. `Piece piece = board.pieceAt(from)` declares
a `Piece` and holds a `Knight`. The variable's type says what the code may
ask; the object's type says how it answers. Declare the interface, construct
the implementation, and the rest of the method never cares which
implementation it got.

The **Java Collections Framework** is a set of such interfaces, `List`, `Set`,
`Map`, `Queue`, each with several implementations. You choose the interface
by the question your code asks. You choose the implementation almost always
by default: `ArrayList`, `HashSet`, `HashMap`.

---

## 3. Collections, chosen by question

| The code asks | Interface | Because |
|---|---|---|
| "Every move, in the order found. Is this one among them?" | `List<Move>` | order matters; duplicates allowed; `contains` |
| "The moves played so far. What was the last one?" | `List<Move>` used as a stack | order is the whole point; `remove(size - 1)` |
| "Is square X attacked?" (M5) | `Set<Position>` | membership only; no order; no duplicates |
| "What stands on each square?" | `Map<Position, Piece>` | a lookup by key |

The last row is the board you did not build. `Map<Position, Piece>` is a
legitimate model of a chessboard: a square either maps to a piece or it does
not. We used `Piece[][]` because the board is exactly sixty-four squares and
`Position` already is an index. Both are composition: `Board` has-a map, or
has-a array. The choice is inside `Board` and no caller can tell.

**Why `contains` works.** `legalMoves().contains(move)` walks the list calling
`equals`. `Move` is a record, so `equals` compares every field. Had `Move`
been a hand-written class with no `equals`, `contains` would compare
identities and say false for a move that is plainly in the list. `HashSet` and
`HashMap` also need `hashCode`, and the record supplies it. This was decided in
week 2, for `Position`, before there was anything to put in a set. It pays off
now.

**Hand out a copy, not your field.** `Game` keeps its history in a private
`List<Move>`. If `history()` returns that list, a caller can `clear()` it and
the game forgets it was ever played. Encapsulation is not just `private` on
the field; it is also not leaking the field through a getter.

```java
public List<Move> history() {
    return List.copyOf(history);     // an unmodifiable snapshot
}
```

`List.copyOf` returns a list that throws if anyone tries to change it. The
caller can read; only `Game` can write.

**Do not remove while iterating.**

```java
for (Move move : moves) {
    if (leavesKingInCheck(move)) moves.remove(move);   // ConcurrentModificationException
}
```

A for-each loop iterates a snapshot of the structure; changing the structure
under it is detected and thrown. Build a new list of the moves you want to
keep, or use `moves.removeIf(...)`. M5's king-safety filter is exactly this
loop, so remember it.

---

## 4. Generics: reading the angle brackets

Read each of these as a sentence.

| Type | Read as |
|---|---|
| `List<Move>` | a list, every element of which is a `Move` |
| `Optional<Move>` | a box that holds a `Move` or holds nothing |
| `Map<Position, Piece>` | a lookup from `Position` to `Piece` |
| `List<Position>` | `positionsOf` returns one |

The part in angle brackets is a **type parameter**. `List` by itself is a
recipe for a list of *something*; `List<Move>` fills in the something. The
compiler then enforces it both ways: `moves.add("e2e4")` is a compile error,
and `Move first = moves.get(0)` needs no cast.

Before generics, Java had only the raw `List`, which held `Object`. You could
add a `String` to a list of moves, and find out at runtime with a
`ClassCastException` three classes away. Generics move that mistake to compile
time. It is week 2's rule again: make invalid code impossible.

Two details you will see in every file:

- `new ArrayList<>()` with empty brackets is the **diamond**. The compiler
  fills in `<Move>` from the left-hand side. Write it that way.
- A raw `List` with no brackets still compiles, with a warning. Treat the
  warning as an error.

You will also meet `List<? extends Piece>` and `<T>` in method signatures.
Those are wildcards and generic methods. Know they exist; we write them when
we need them.

---

## 5. Exceptions: four ways to say no

Every method that can fail has to tell its caller. Your code already uses
three ways, and today adds a fourth.

| Method | When it cannot answer | It says | Because |
|---|---|---|---|
| `Position.offsetOrNull(dx, dy)` | off the board | returns `null` | called in a hot loop where "no square" is expected on every edge; a null check reads better than a catch |
| `Board.isEmpty(pos)` | never fails | returns `boolean` | the question *is* the yes or no |
| `Game.findLegalMove("e2e5")` | no such legal move | returns `Optional.empty()` | the player typed something unplayable; ordinary, and the caller must handle it |
| `new Position(9, 0)` | off the board | **throws** `IllegalArgumentException` | a `Position` that does not exist must not exist; whoever built it has a bug |
| `Game.play(move)` | move is not legal | **throws** `IllegalArgumentException` | callers are supposed to choose from `legalMoves()`; a move from anywhere else is a programming error |

The rule underneath the table:

> **A bug throws. An ordinary outcome returns.**

Ask who is at fault. If the caller did something the API said not to do,
throw, and the stack trace points at them. If the caller asked a fair question
and the honest answer is "no", return that answer in the type: a null where
null is local and expected, a boolean where the question is yes/no, an
`Optional` where the caller must be made to handle absence.

`Game.play` throwing surprises people. "Illegal move" sounds ordinary. But
`play` is not where the player's typing arrives; `findLegalMove` is, and it
returns `Optional`. By the time a `Move` reaches `play`, it should have come
from `legalMoves()`. Anything else is the program lying to itself.

**Checked and unchecked.** Every exception in your engine so far extends
`RuntimeException`: `IllegalArgumentException`, `UnsupportedOperationException`,
`ConcurrentModificationException`. These are **unchecked**: the compiler does
not force anyone to catch them, because they signal bugs, and you do not
recover from a bug, you fix it. **Checked** exceptions, `IOException` above
all, must be caught or declared with `throws`, because they signal things that
go wrong in the world: a file is missing, a socket closed. You have none yet.
They arrive when the engine reads a FEN from a file (M7) or talks to a
terminal (M9).

**Catch at the edge.** When the console view arrives, the player will type
`e9`. `Position.parse("e9")` throws. Where is the `try`?

```java
// in the view, where the typing arrives
try {
    Position from = Position.parse(input.substring(0, 2));
    ...
} catch (IllegalArgumentException e) {
    System.out.println(e.getMessage());     // "Not a square: e9"
    // loop and ask again
}
```

Not in `Position`, which is right to throw. Not in `Game`, which never sees
text. In the one place that has a person to report to. A `catch` in the middle
of the engine hides a bug from the person who could fix it; a `catch` at the
edge turns it into a message for the person who caused it.

Two habits: the message carries the values (`"Illegal move: e2e5"`, not
`"illegal move"`), and an empty `catch` block is never right.

---

## 6. `Game`: turns, history, undo

Now the class, from the model in §1.

```java
public class Game {
    private final Board board;                          // has-a
    private final List<Move> history = new ArrayList<>(); // has-a
    private Color sideToMove;                           // has-a, and changes

    public Game()                                  // standard position, white to move
    public Game(Board board, Color sideToMove)     // any position; tests use this

    public Board board()
    public Color sideToMove()
    public List<Move> history()                    // a copy

    public List<Move> legalMoves()                 // §2's loop, for sideToMove
    public Optional<Move> findLegalMove(String notation)
    public void play(Move move)                    // throws if not in legalMoves()
    public Optional<Move> undoLastMove()
}
```

**Composition.** `Game` is built from a `Board`, a list, and a `Color`. It
owns them; nothing else holds them. That is what has-a means, and it is why
`Game` needs no `extends`.

**Turns.** `sideToMove` starts `WHITE`. After each move,
`sideToMove = sideToMove.opposite()`. `opposite()` is M0b's, on the enum. The
question "who moves next?" is about a color, so the answer lives in `Color`.
An enum is a class with a fixed set of instances, and it can carry methods
like any class.

**History as a stack.** `play` appends to the list. `undoLastMove` removes
from the end: `history.remove(history.size() - 1)`. A `List` is a perfectly
good stack when only one end moves.

**Undo is two lines because `Move` remembers.** `Board` gains two methods
this milestone:

```java
public void apply(Move move)    // lift from `from`, set down on `to`; promotion swaps the piece
public void undo(Move move)     // put `moved` back on `from`; put `captured` (or null) back on `to`
```

`undo` needs no bookkeeping because the `Move` carries the piece it captured.
Session 6 §7 promised that; here it pays.

Does `apply` belong on `Board`? Say the sentence: *`Board` stores which piece
is on which square.* Moving a piece from one square to another is storage.
`apply` does no checking; it trusts the `Move` it is given. Deciding whether
the move is *allowed* is not storage, and that stays out of `Board`, in
`Game`.

**`play`, in words.** If the move is not in `legalMoves()`, throw with the
move in the message. Otherwise `board.apply(move)`, append to history, flip
the side. Three lines and a guard.

**What "legal" means this week.** Right color, right geometry. King safety is
M5, and it will tighten `legalMoves()` without changing its name or its
callers. That is open/closed again, and it is why the method is called what it
will eventually mean.

---

## 7. In-class exercise: which way to say no?

In pairs, five minutes. For each, choose null, boolean, `Optional`, or throw,
and say in one sentence who is at fault when the answer is "no".

1. `board.pieceAt(pos)` and the square is empty.
2. `game.undoLastMove()` on a game with no moves played.
3. `game.findLegalMove("Nf3")`: the player used short notation, which the
   engine does not read.
4. `Position.parse("e9")`.
5. `Move.promotion(from, to, pawn, null, PieceType.KING)`: a promotion to a
   king.

Then, three minutes as a room: which of the five would you have answered
differently before today, and why?

---

## 8. Your turn: M3

```bash
git fetch upstream --tags
git merge m3
./mvnw test
```

**What arrives:** a scaffold `engine/Game.java` with the signatures from §6,
the constructors working and every other body throwing; `GameTest` with
eight tests. **What stays yours:** `Board`, which gains `apply` and `undo`;
and everything from M1 and M2. Unlike M1 and M2, the merge compiles:
`Tests run: 42, Failures: 0, Errors: 8`.

**Build in this order.** Each step turns the next test's failure into
something readable.

1. `Board.apply` and `Board.undo`. Two lines each.
2. The three accessors. `history()` returns a copy.
3. `legalMoves()`: §2's loop over `board.positionsOf(sideToMove)`.
   **`twentyMovesAtStart` and `startFromFen` green: 6 red.**
4. `findLegalMove(String)`: walk `legalMoves()`, compare `toString` ignoring
   case, wrap in `Optional`. Before `play`, because the tests play every
   move through it. **`rejectsIllegalMove` now fails instead of erroring:
   it reaches `play` and gets the wrong exception.**
5. `play(Move)`: the guard, `apply`, append, flip. **`turnsAlternate`,
   `playMovesThePiece`, `rejectsIllegalMove` green: 3 red.**
6. `undoLastMove()`: empty history means `Optional.empty()`; otherwise pop,
   `board.undo`, flip, return the move. **The three undo tests green.**

```
Tests run: 42, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Forty-two: M2's thirty-four, still passing, plus eight in `GameTest`.

Then `Main`: build a `Game`, print the board, play `e2e4` and `e7e5` by
`findLegalMove`, print again, undo one, print again. Not tested; it is the
point.

```bash
git add -A
git commit -m "M3: Game, Move history"
git tag submit-m3
git push origin main --tags
```

**Graded by reading:** `history()` returns a copy; `Board.apply` checks
nothing; `play` throws for a move not in `legalMoves()`; no `switch` on piece
type appears anywhere new.

---

## Recap

1. **Model in three steps:** nouns, buckets, one sentence each. Most of this
   week's nouns were already classes; that is compounding.
2. **Choose the collection by the question.** Declare the interface,
   construct the implementation, and let `equals` and `hashCode` do their
   job because you used a record.
3. **A bug throws. An ordinary outcome returns**, in a type that makes the
   caller handle it. Catch at the edge, where there is someone to tell.

The remaining syllabus terms, and where they are in your repo tonight:

| Term | Where |
|---|---|
| Collections | `List<Move>` in `Game`; `positionsOf` returns a `List` |
| Generics | every angle bracket in `Game`; `Optional<Move>` |
| Enums | `Color.opposite()` flips the turn; `PieceType` |
| Records | `Move`, and why `contains` works |
| Exception handling | `play` throws; `findLegalMove` returns `Optional`; `offsetOrNull` returns null |
| Domain model | `Game` has-a `Board`, has-a history, has-a side to move |

---

## Next session

Monday Sep 28: cohesion, coupling, separation of concerns, and SOLID. M2 is
due that night. M4 opens and does to `Game` what M2 did to `Piece`: the
generation loop moves out into its own class, `MoveGenerator`, and we will
have the vocabulary to say why.

---

## INSTRUCTOR ONLY

**Timing (75 min):** objective 3 · §1 modeling 8 · §2 twenty moves 6 · §3
collections 10 · §4 generics 7 · §5 exceptions 14 · §6 `Game` 10 · §7
exercise 7 · §8 M3 briefing 7 · recap 3. This is the lighter session the
syllabus revision promised. If ahead, spend it on §7's discussion. If behind,
cut §4 to the reading table and one sentence on raw types; never cut §5 or §7.

**§1: do the table with the room.** Read the paragraph, ask for nouns, write
them on the board, then bucket each one by asking "if I have two of these
with the same fields, are they the same thing?" Three of six are already
classes; make that observation aloud. The sentence for `Game` is the last
thing on the board before §2.

**§2: the interface/implementation line is the one idea.** Write
`List<Move> moves = new ArrayList<>()` and under it
`Piece piece = new Knight(WHITE)`. Ask what the two lines have in common.
Wait.

**§3: the `Map<Position, Piece>` board is worth a minute.** It is the design
half the room considered in M1. Say it would have worked, and that the
choice is invisible outside `Board`.

**§5 is the section to protect.** The table is the content; the rule under it
("a bug throws, an ordinary outcome returns") is the takeaway. Spend the most
time on the `play` row, because it is the one that surprises. The
checked/unchecked paragraph is one slide; do not go deeper until I/O
exists.

**§6: signatures only on the slides.** `apply`, `undo`, `play`, `undoLastMove`
are described in words and are the homework. The generation loop was already
shown in session 6 §3 and is repeated in §2 here; that is fine.

**§7 answers.** (1) null: local, the caller is right there, and "empty" is a
value of the board, not a failure. (2) `Optional`: ordinary, and the caller
(a view with an undo command) must handle it. (3) `Optional`: ordinary; the
player typed something the engine cannot read, and `findLegalMove` already
handles it by finding nothing. Some pairs will say throw; the argument for
`Optional` is that the caller is the view, and the view's job is to reprompt.
(4) throw: an off-board square must never exist, and whoever passed "e9"
without validating has the bug. But note: the *view* should catch it, or
validate first; the throw is right, the place to catch is at the edge.
(5) throw, from `Move.promotion` or from `Board.apply`'s promotion switch: a
promotion to a king is a malformed `Move`, and only a bug builds one. The
reference throws from `Board.createPromoted`.

**Decisions taken in writing this session, for the record.** M3's `Game`
owns the board, the side to move, the history, and the generation loop; M4
extracts `MoveGenerator`; M5 adds king safety. The generation method is
named `legalMoves()` from M3 on, with the javadoc saying M5 tightens it, so
callers never change. `findLegalMove` returns `Optional`, `undoLastMove`
returns `Optional`, `play` throws `IllegalArgumentException`.

**The m3 tag is assembled by hand like m1 and m2**; the recipe and the two
shipped files are in the reference repo under `course/milestones/m3/`. It
ships a scaffold `engine/Game.java` (bodies blanked, constructors kept,
`status()` and `isGameOver()` removed, `legalMoves()` javadoc saying
pseudo-legal plus side to move until M5) and `engine/GameTest.java` with
eight tests: the reference's minus `gameOverOnCheckmate` and the `status()`
assertion in `startFromFen`, plus `twentyMovesAtStart`. `Board` is not
shipped; students add `apply` and `undo` from the handout. Verified
2026-09-23 on a clone with M2 solved: 42 tests, 8 errors after the merge,
and the step counts in §8 are the measured ones. Two corrections came out
of that run: `findLegalMove` must come before `play`, because the test
helper plays through it, and `startFromFen` goes green with `legalMoves`,
not with `findLegalMove`. §8, the slides, and the handout all say so now.
Handout: `assignments/m3-game/handout.md`.

**Check before class:** m3 tag pushed to the starter (`git ls-remote --tags
upstream` from any student clone shows it) ✅ · handout published and linked
from the week 5 page ✅ · demo clone at M2-solved for the §2 loop and the §5
`try`/`catch` sketch ✅ · the `Map<Position, Piece>` alternative ready as one
slide, not a tangent ✅.
