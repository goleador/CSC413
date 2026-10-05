# Session 12 — Information Hiding and Clean Code

**Week 7, Wednesday October 7 · CSC 413 Software Development**

**Objectives advanced:** 2 (encapsulation and abstraction), 3 (analyze maintainability and responsibility assignment), 4 (refactor toward cleaner software)

**Milestone supported:** M4 — `MoveGenerator`, due Monday October 12 at 11:59 PM; preparation for M5 — king safety and check detection.

M4 is still in progress. M5 examples below explain the next design step; they are not an M4 requirement or a substitute for an M5 handout. No M5 release date, deadline, or test count is specified here.

## 1. What a boundary should let a caller ignore

After the M4 extraction, `Game` asks:

```java
public List<Move> legalMoves() {
    return MoveGenerator.legalMoves(board, sideToMove);
}
```

`Game` chooses the color from its current turn. `MoveGenerator` calculates moves for that color on the supplied board. This separates game progression—playing a move, recording it, and changing the turn—from position analysis—working out which moves a position permits.

M4's generator only combines each piece's pseudo-legal moves. M5 will add a filter that rejects candidates exposing that color's king. The call above can stay the same across that change: `Game` still supplies the current position and turn, while the generator owns the calculation. Keeping the calculation inside `Game` would also work; the course separates it because that calculation is about to grow and will later be useful for examining positions outside the current turn.

**Information hiding means placing changeable design decisions behind a stable boundary.** The generator owns how it computes the answer. The piece hierarchy owns movement details. The board owns square storage.

By the end of class, you should be able to explain what decision an API hides, identify a mutable-state escape, and review a state-changing algorithm for both readability and restoration.

## 2. Private fields are a start

Suppose `Game` holds a private board and provides this accessor, as in the current project:

```java
private final Board board;

public Board board() {
    return board;
}
```

`private` prevents outside code from accessing the field directly. `final` prevents reassigning that field after construction. Neither makes the returned `Board` immutable.

An outside caller can still write:

```java
game.board().apply(move);
```

That changes the squares without recording a played move or changing the side to move. The intended game operation is `game.play(move)`, which coordinates all three.

This is an API tradeoff worth recognizing. Keep the existing assignment API. Session 10's hypothetical `BoardView` showed one way to offer a narrower reading contract, but adding it is not part of M4.

Information hiding asks what clients must know and what operations they can perform. Merely changing a field's access modifier does not settle those questions.

## 3. Hide the collection algorithm, preserve the contract

M4 exposes `MoveGenerator.legalMoves(Board, Color)` publicly and keeps `pseudoLegalMoves(Board, Color)` package-private. The helper is available inside `engine`, including to tests in that package. It is unavailable to callers in other packages.

That keeps outside callers on the boundary intended to gain king-safety behavior. It does not make every internal caller safe: code in `engine` can still choose the helper incorrectly. Visibility supports a design; reviewers must still check its use.

The contract also includes effects. A move query should return an answer without leaving the board changed. That expectation becomes especially important when computing the answer requires temporary mutation.

## 4. Clean code makes a decision easier to inspect

Readable code exposes its inputs, decisions, and effects. It uses names that let a reader explain the algorithm without translating every variable.

Compare these illustrative fragments inside a candidate-filtering loop:

```java
// Harder to inspect
board.apply(m);
boolean b = isInCheck(board, c);
board.undo(m);
if (!b) {
    result.add(m);
}
```

```java
// Names express the question being answered
board.apply(candidate);
boolean leavesKingExposed = isInCheck(board, color);
board.undo(candidate);
if (!leavesKingExposed) {
    legal.add(candidate);
}
```

The second fragment still needs a correct attack query and a correct undo. Naming improves review; it does not prove the algorithm works.

Useful comments explain a constraint or a reason: “Use attack geometry here; a pawn's forward move is not an attack.” A comment saying “undo the move” above `board.undo(candidate)` adds little. Prefer code that states the operation and comments that explain why it belongs there.

## 5. The next behavior change: a pinned piece

Consider a partial position with these pieces and all other squares empty:

| Square | Piece |
|---|---|
| e1 | White king |
| e2 | White rook |
| e8 | Black rook |
| a8 | Black king |

The White rook currently blocks the Black rook's file toward e1. The move `e2f2` follows the White rook's movement and occupancy rules. It is pseudo-legal. After the move, the e-file is open and the White king is attacked. The move must therefore be excluded from White's legal moves once king safety is implemented.

The White rook's geometry did not change. What changed is the resulting king's exposure, which depends on other pieces on the board. We place that check in `MoveGenerator` so one calculation combines piece-level movement with position-level king safety. `Game` can use the result when validating a played move without also implementing the attack analysis.

This is a feature change: the returned list becomes smaller in this position. Existing M4 equivalence expectations cannot be carried forward blindly to positions where the new rule applies.

## 6. Attacks are different from legal moves

The existing `Piece.attacks(board, from, target)` contract answers an attack question. `Pawn` overrides it because a pawn attacks its forward diagonals and advances straight ahead.

For a White pawn on e2:

- d3 and f3 are attacked even when empty.
- e3 is not attacked, even when a forward move to it is available.

For king safety, ask whether an opponent's piece attacks the king's square. Do not generate the opponent's legal moves to answer that question. Besides mishandling the pawn distinction, that approach can create recursion: legal moves require check detection, which would then require legal moves again.

An illustrative attack query uses the contract already available from M2:

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

Sliding attacks must respect blocking pieces. Kings attack adjacent squares. A piece can attack a square even when moving there would expose its own king; attack detection does not perform the legal-move filter.

`isInCheck(board, color)` can locate that color's king and ask whether the opposite color attacks its square. The planned `Board.kingPosition(Color)` supplies the lookup. A partial board with no king needs an explicit policy; the reference engine treats it as not in check to support partial test positions. That is a testing convention, not a valid complete chess position. Follow the eventual M5 contract.

## 7. Try, inspect, restore

The filtering algorithm has four jobs in order:

1. Generate pseudo-legal candidates for the requested color.
2. Apply one candidate temporarily.
3. Ask whether that same color's king is now attacked.
4. Restore the board, then retain the candidate if the king was safe.

Do not use `Game.play` for the trial. It checks legality through the generator and also changes turn and history. A trial asks a question about a board, so it uses `Board.apply` and `Board.undo` directly.

Here is an illustrative filter with restoration in `finally`:

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

This example requires the planned check methods. It is not the M4 implementation. The `finally` block ensures an undo attempt if the check query throws after a successful apply. It does not recover from a partially failed apply or a failed undo; those operations need their own correct contracts.

Undo must restore captured pieces as well as the moving piece. Restoring only the origin square can corrupt later candidates and make their results depend on iteration order. After the query finishes, callers should see the original board.

## 8. Review examples that distinguish the claims

Choose checks that could reveal a specific mistake:

| Claim | Distinguishing example |
|---|---|
| King safety filters candidates | `e2f2` is pseudo-legal but excluded in the pinned-rook position |
| The requested color is used | Query a position for Black as well as White |
| Pawn attacks use the right geometry | White pawn e2 attacks d3 and f3, but not e3 |
| Temporary captures are undone | Query a position with a capture candidate; compare occupied squares before and after |
| Queries preserve state | Compare every square before and after generation; repeat the query and compare results |
| Attack paths respect blockers | Place a blocker between a rook and the target, then remove it |

State equality and result equality check different properties. A query could return the expected list while accidentally removing a captured piece. Conversely, a restored board does not establish that the returned moves are legal.

These are design examples for M5, not additional tests or requirements for M4. Checkmate, stalemate, castling, and en passant remain outside this week's implementation discussion.

## 9. In-class review: find the hidden side effect

**Pairs, 10 minutes.** This proposed fragment follows a successful apply:

```java
board.apply(candidate);
if (isInCheck(board, color)) {
    continue;
}
legal.add(candidate);
board.undo(candidate);
```

Trace `e2f2` in the pinned-rook position. What board does the next iteration receive? Rewrite the fragment so both accepted and rejected candidates restore the board. Then explain what happens if the attack query throws.

Finally, name two different decisions hidden behind two current APIs. For each one, name a caller that benefits from being able to ignore that decision.

## 10. Exit question and preparation

Why should the generator ask `Piece.attacks` instead of the opponent's `legalMoves`? Give one chess example and one dependency consequence.

Finish M4 under its handout's unchanged-behavior rule. Its due date is October 12 at 11:59 PM. Before beginning M5, you should be able to explain the separation between piece geometry, attack queries, and whole-board king safety.

**Related material:** [M4 handout](../../assignments/m4-move-generator/handout.md), [session 11 notes](../session-11-refactoring/notes.md), [session 6 notes](../session-06-piece-hierarchy/notes.md), [session 10 notes](../session-10-solid/notes.md).

---

## INSTRUCTOR ONLY — meeting plan and review answers

**75 minutes:** 15 minutes on information hiding and mutable access; 10 on naming and comments; 15 on the pinned-rook position and attack semantics; 15 on restoration; 10 on pair review; 10 on discussion and exit question.

The rejected candidate reaches `continue` before undo, leaving the White rook on f2. The next trial starts from the wrong position. Restore before branching, or use `try/finally` around the query. Ask students to trace both paths rather than simply identify a missing line.

API examples: `Board.pieceAt` hides square-storage representation; `Piece.pseudoLegalMoves` hides concrete movement algorithms; `MoveGenerator.legalMoves` hides collection and filtering. Private storage with a mutable accessor does not fully protect the game's turn/history invariant.

Exit answer: pawn forward movement and diagonal attacks differ; querying legal moves from check detection can recursively call the filter. The attack relation must also include attacks by pinned pieces. Keep M5 examples separate from M4's required pass-through method.
