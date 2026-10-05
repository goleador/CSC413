# Session 12 — Information Hiding and Clean Code
### Two promises of a move query
**CSC 413 · Week 7 · Wednesday Oct 7**

---

## By the end of today you can

1. Draw the boundary between `Game`'s public API and the generator's internals, and say what M5 adds behind it without changing callers
2. Explain why attack detection asks `Piece.attacks` rather than the opponent's legal moves — and why a pawn attacks d3 and f3 but not e3
3. Write the apply–ask–undo trial with try/finally, and spot the fragment where a `continue` leaves the board corrupted

---

# Part one — Hiding the decision

---

## Information Hiding and Clean Code

:::: lesson-layout
::: lesson-context
A move query has two promises: return the answer and preserve the original board.

M4 is the refactor; M5 examples explain the next behavior.
:::

::: {.code-panel}
### A stable caller

```java
public List<Move> legalMoves() {
    return MoveGenerator.legalMoves(board, sideToMove);
}
```
:::
::::

::: notes
The written notes develop this example in the same order.
:::

---

## What does the boundary hide?

:::: lesson-layout
::: lesson-context
Game supplies its board and current color.

The generator owns how moves are calculated.

M5 can add filtering without adding attack analysis to Game.
:::

::: {.code-panel}
### Calculation behind the API

```java
Game.legalMoves()
    → MoveGenerator.legalMoves(board, color)
        → collect candidates
        → M5: filter for king safety
```
:::
::::

::: notes
Dependency sketch, not Java source.
:::

---

## Private fields are a start

:::: lesson-layout
::: lesson-context
`private` restricts direct field access.

`final` prevents reassigning the field.

Neither makes the returned Board immutable.
:::

::: {.code-panel}
### Game.board

```java
private final Board board;

public Board board() {
    return board;
}
```
:::
::::

::: notes
The written notes develop this example in the same order.
:::

---

## Can a caller bypass turn coordination?

:::: lesson-layout
::: lesson-context
Compare changing the board directly with playing a turn.

Which operation also updates turn and history?
:::

::: {.code-panel reveal}
### Two different effects

```java
game.board().apply(move);

// Coordinated operation:
game.play(move);
```
:::
::::

::: notes
The accessor exposes a mutable board. M4 retains this API; no BoardView implementation is required.
:::

---

## Public boundary, internal helper

:::: lesson-layout
::: lesson-context
Outside engine, callers use the public method intended to gain king safety.

Package-private visibility limits direct access to candidate generation.
:::

::: {.code-panel}
### M4 signature reference

```java
public static List<Move> legalMoves(
    Board board, Color color)

static List<Move> pseudoLegalMoves(
    Board board, Color color)
```
:::
::::

::: notes
Signatures only. Tests in engine can access the helper. Internal callers still need to choose appropriately.
:::

---

## Names expose the decision

:::: lesson-layout
::: lesson-context
A name should explain the question being answered.

What does b mean in this fragment?
:::

::: {.code-panel}
### Before

```java
game.board().apply(move);
```
:::
::::

::: notes
Variable c is the color; m is candidate. Naming change preserves behavior.
:::

---

## Make the king-safety decision visible

:::: lesson-layout
::: lesson-context
`leavesKingExposed` explains why the candidate is excluded.

Correct names support review; attack detection and undo still need correct behavior.
:::

::: {.code-panel}
### After

```java
// Harder to inspect
board.apply(m);
boolean b = isInCheck(board, c);
board.undo(m);
if (!b) {
    result.add(m);
}
```
:::
::::

::: notes
The written notes develop this example in the same order.
:::

---

## Comments explain constraints

:::: lesson-layout
::: lesson-context
A useful comment records a reason that the operation itself does not express.

A pawn’s forward movement is not an attack.
:::

::: {.code-panel}
### Why, alongside the operation

```java
// Use attack geometry: a pawn advancing
// does not attack the square ahead.
piece.attacks(board, from, target);
```
:::
::::

::: notes
The written notes develop this example in the same order.
:::

---

# Part two

---

## The filter changes the answer

:::: lesson-layout
::: lesson-context
M4 includes the rook’s geometrically available `e2f2`.

M5 must exclude it because the resulting king is exposed.
:::

::: {.code-panel}
### Same position, new rule

![Rook f2 exposes White king e1 to Black rook e8](../../assets/week-07/rook-exposes-check.svg)
:::
::::

::: notes
The written notes develop this example in the same order.
:::

---

## Which squares does the pawn attack?

:::: lesson-layout
::: lesson-context
White pawn on e2; target squares are empty.

Does it attack d3? f3? e3?
:::

::: {.code-panel}
### Red: attacks · green: movement

![Pawn e2 attacks diagonal squares d3 and f3; e3 is a forward movement square](../../assets/week-07/pawn-attacks.svg)
:::
::::

::: notes
d3 and f3 true; e3 false. Attacks differ from movement destinations.
:::

---

## Ask pieces about attacks

:::: lesson-layout
::: lesson-context
The attack query visits the attacking color’s pieces.

Each piece answers through its existing attacks contract.

Pawn keeps its distinct geometry.
:::

::: {.code-panel}
### Illustrative isAttacked

```java
public static boolean isAttacked(
        Board board, Position target, Color attacker) {
    for (Position from : board.positionsOf(attacker)) {
        Piece piece = board.pieceAt(from);
        if (piece.attacks(board, from, target)) {
            return true;
        }
    }
    return false;
}
```
:::
::::

::: notes
The written notes develop this example in the same order.
:::

---

## Why not ask for the opponent’s legal moves?

:::: lesson-layout
::: lesson-context
Legal-move filtering needs check detection.

If check detection asks for legal moves, it calls the filter again.

Attack geometry also differs from pawn movement.
:::

::: {.code-panel}
### Dependency path

legalMoves → isInCheck

isInCheck → isAttacked → Piece.attacks

Avoid: isAttacked → legalMoves
:::
::::

::: notes
A pinned piece can still attack a square. Attack detection does not run the legal-move filter.
:::

---

## Locate the king, then ask about attacks

:::: lesson-layout
::: lesson-context
`Board.kingPosition(color)` supplies the planned lookup.

Ask whether the opposite color attacks that square.

Reference partial-board tests treat an absent king as not in check.
:::

::: {.code-panel}
### Planned isInCheck body

```java
Position king = board.kingPosition(color);
return king != null &&
    isAttacked(board, king, color.opposite());
```
:::
::::

::: notes
Testing convention for partial positions, not a valid complete chess game.
:::

---

# Part three

---

## Try, inspect, restore

:::: lesson-layout
::: lesson-context
A trial computes an answer without playing a turn.

Use Board.apply and Board.undo.

Game.play validates through the generator and changes turn/history.
:::

::: {.code-panel}
### Normal-return trial

```java
board.apply(candidate);
boolean leavesKingExposed =
    isInCheck(board, color);
board.undo(candidate);
```
:::
::::

::: notes
The written notes develop this example in the same order.
:::

---

## What does a capture trial remove?

:::: lesson-layout
::: lesson-context
The White rook on e2 can geometrically capture the Black bishop on f2.

During the trial, that bishop is removed from the board.
:::

::: {.code-panel}
### Before trial

![White rook e2 and Black bishop f2 before the capture trial](../../assets/week-07/capture-before.svg)
:::
::::

::: notes
Other pieces: White king e1, Black rook e8, Black king a8. Candidate fails king safety.
:::

---

## What must undo restore?

:::: lesson-layout
::: lesson-context
The trial exposes the king. Reject the candidate.

Undo must restore both the rook on e2 and the captured bishop on f2.
:::

::: {.code-panel}
### During trial

![During trial the rook is on f2 and bishop absent; king e1 is exposed](../../assets/week-07/capture-trial.svg)
:::
::::

::: notes
Returning only the moving piece loses the bishop and corrupts subsequent candidates.
:::

---

## What if the check query throws?

:::: lesson-layout
::: lesson-context
After a successful apply, an exception can skip ordinary undo.

A finally block attempts restoration whether the check query returns or throws.
:::

::: {.code-panel}
### Protect restoration

```java
board.apply(candidate);
boolean leavesKingExposed;
try {
    leavesKingExposed = isInCheck(board, color);
} finally {
    board.undo(candidate);
}
```
:::
::::

::: notes
Does not fix partially failed apply or failed undo; their contracts remain necessary.
:::

---

## Filtering with restoration

:::: lesson-layout
::: lesson-context
After restoration, add safe candidates to the result.

A rejected candidate must also restore the board.

This is M5 behavior, not M4’s pass-through.
:::

::: {.code-panel}
### Illustrative M5 filter

```java
public static List<Move> legalMoves(Board board, Color color) {
    List<Move> legal = new ArrayList<>();
    for (Move candidate : pseudoLegalMoves(board, color)) {
        board.apply(candidate);
        boolean leavesKingExposed;
        try {
            leavesKingExposed = isInCheck(board, color);
        } finally {
            board.undo(candidate);
        }
        if (!leavesKingExposed) {
            legal.add(candidate);
        }
    }
    return legal;
}
```
:::
::::

::: notes
The written notes develop this example in the same order.
:::

---

## Results and state need different checks

:::: lesson-layout
::: lesson-context
Expected moves do not prove the board was restored.

An unchanged board does not prove the returned moves are legal.
:::

::: {.code-panel}
### Distinguishing examples

- Pinned rook: candidate excluded
- Both colors: correct input used
- Pawn diagonals: attack meaning
- Capture trial: both pieces restored
- Repeated query: same board and results
- Blocked rook: attack stops at blocker
:::
::::

::: notes
The written notes develop this example in the same order.
:::

---

## Where is the hidden side effect?

:::: lesson-layout
::: lesson-context
Trace the rejected `e2f2` candidate.

What board does the next iteration receive?

Rewrite the fragment so all paths restore the board.
:::

::: {.code-panel reveal}
### Review fragment

```java
board.apply(candidate);
if (isInCheck(board, color)) {
    continue;
}
legal.add(candidate);
board.undo(candidate);
```
:::
::::

::: notes
continue skips undo. Board stays in trial position. Ask about exception path after fixing normal paths.
:::

---

## Three questions, three responsibilities

:::: lesson-layout
::: lesson-context
Explain why Piece.attacks is needed instead of the opponent’s legalMoves.
:::

::: {.code-panel reveal}
### Review

- Piece movement: which candidates?
- Attack query: which squares threatened?
- King safety: which candidates leave the king safe?

**M4 due October 12, 11:59 PM.**
:::
::::

::: notes
Use the pawn and recursive dependency examples.
:::


---

# Next: Monday Oct 12
**M4 due Mon Oct 12, 11:59 PM**

UML: class, sequence, component and state diagrams — M6 diagrams the engine you have been building.

M5 (check detection) opens this week; today's trial loop is its core.
