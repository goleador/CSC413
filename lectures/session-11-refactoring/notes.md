# Session 11 — Refactoring and Code Smells

**Week 7, Monday October 5 · CSC 413 Software Development**

**Objectives advanced:** 3 (analyze maintainability, cohesion, coupling, and responsibilities), 4 (refactor poorly designed code)

**Milestone supported:** M3 — turns, moves, and `Game`, due tonight at 11:59 PM; M4 — extract `MoveGenerator`, due Monday October 12 at 11:59 PM.

These notes use the M3 and M4 contracts. M3 may still be in progress. Complete its required behavior before judging whether a change preserves it. King safety belongs to M5; it is not part of today's refactor.

## 1. Changing structure while preserving behavior

Last week we named responsibilities and dependencies. This week we change their arrangement. **Refactoring changes the internal structure of software while preserving its observable behavior.** Fixing a bug changes behavior. Adding check detection changes behavior. Moving the existing generation loop out of `Game`, while returning the same moves, is a refactor.

“Observable” includes more than the value printed in the terminal. Callers can observe return values, exceptions, changes to the board, the side to move, and the effects of undo. A method that returns the same moves but leaves a different board behind has changed behavior.

By the end of class, you should be able to:

1. Distinguish a refactor from a feature or bug fix.
2. Explain a code smell through a concrete cost of changing the code.
3. Extract the M3 move-generation loop without changing its callers.
4. Use tests and the diff as different kinds of evidence.

## 2. A smell is a question to investigate

A **code smell** is a sign that a design may be making changes harder than necessary. It is evidence to inspect, not proof that the program is incorrect.

| Smell | Question | Example in our project |
|---|---|---|
| Duplicated logic | Can one rule drift between two copies? | A generation loop in both `Game` and `MoveGenerator` |
| Long method | Which distinct jobs are hidden in the sequence? | Generating, validating, updating state, and printing in one method |
| Mixed responsibilities | Which unrelated requests require editing this class? | Changing terminal formatting inside `Game` |
| Repeated type branches | Does an existing contract already provide the operation? | A movement caller branching on `Knight`, `Pawn`, and the other types |
| Exposed mutable state | Can a caller bypass the object's coordination? | Calling `game.board().apply(move)` instead of `game.play(move)` |
| Unclear names | What must a reader reconstruct to understand the code? | `c`, `p`, and `x` used for unrelated chess concepts |

There is no universal line limit for a method. A short method can mix responsibilities, and a longer method can express one cohesive algorithm. Similarly, a factory switch has a construction job; its existence alone does not demand a refactor.

Give the cost before suggesting the cut. “This class is too big” is not enough. Neither is “this method uses only two fields”: a class can have cohesive methods that use different subsets of its fields. We need to explain the responsibility we are separating and the change that makes the separation useful.

## 3. Read the dependencies before choosing the destination

Here is the M3 implementation of `Game.legalMoves()`:

```java
public List<Move> legalMoves() {
    List<Move> moves = new ArrayList<>();
    for (Position from : board.positionsOf(sideToMove)) {
        Piece piece = board.pieceAt(from);
        moves.addAll(piece.pseudoLegalMoves(board, from));
    }
    return moves;
}
```

### What question does this code answer?

From a player's perspective, `Game.legalMoves()` answers “What moves are available on the current turn?” It needs the game's board and its recorded side to move.

Inside that method, the loop performs a more general calculation: “For this board, what pseudo-legal moves can pieces of this color make?” It visits the squares occupied by that color, asks each piece for its moves, and combines the answers. It does not decide whose turn it is. `Game` has already made that choice by supplying `sideToMove`.

For example, after White plays `e2e4`, the game records Black as the side to move. `game.legalMoves()` should therefore collect Black's moves. But when studying the resulting position, we can also ask what pseudo-legal moves White's pieces have. That is a question about the same board with a different color; it does not mean White gets another turn.

M4 gives those two questions separate entry points:

```java
// Game: use the current turn's color.
game.legalMoves();

// Position analysis: supply the color explicitly.
// Here board is the position being examined.
MoveGenerator.legalMoves(board, Color.WHITE);
MoveGenerator.legalMoves(board, Color.BLACK);
```

These are API usage examples after M4 is implemented. In M4, all three calls still return pseudo-legal moves for the relevant color.

### Why introduce a separate class now?

The next milestone adds king safety. A piece can follow its own movement rules yet expose its king: moving a White rook away from a file can uncover a Black rook's attack on the White king. Deciding whether to reject that move requires examining the resulting board. It does not require recording a played turn or adding to game history.

We could keep both generation and the new filter inside `Game`; that would work. M4 instead establishes `MoveGenerator` as the place for calculating moves from a position. M5 can extend that calculation while `Game` continues to coordinate playing moves, turns, and history. A later computer opponent can also examine candidate positions through the same calculation.

The tradeoff is one additional class and a delegation call. For the small M3 program, keeping the loop in `Game` is reasonable. For the planned engine, separating position analysis from game progression gives the growing rule calculation a clear home. **M4 practices that design choice before adding the new behavior; it does not repair an inherently incorrect M3 implementation.**

Reading the loop's inputs helps us see that it can be separated. The upcoming king-safety change and reuse for position analysis explain why we choose to separate it.

`Board` remains responsible for occupied squares. Each `Piece` remains responsible for its movement. The generator combines their answers. Moving every piece's rules into the generator would undo M2's responsibility assignment.

**M4 still returns pseudo-legal moves.** The name `legalMoves` is the public entry point that will later enforce king safety. During M4, it returns the same candidate set as M3.

## 4. The extraction, in small steps

Begin with a known baseline:

```bash
git status
./mvnw test
```

On completed M3, the handout expects 42 passing tests. After merging the M4 scaffold, it expects those 42 to pass and six new tests to report unimplemented-method errors. An expected scaffold error is different from a regression in working code.

### Step 1: give the loop explicit inputs

The following methods belong in the supplied `MoveGenerator` class, in package `edu.sfsu.csc413.chess.engine`. Use the model imports and Java collection imports needed by the code.

```java
static List<Move> pseudoLegalMoves(Board board, Color color) {
    List<Move> moves = new ArrayList<>();
    for (Position from : board.positionsOf(color)) {
        Piece piece = board.pieceAt(from);
        moves.addAll(piece.pseudoLegalMoves(board, from));
    }
    return moves;
}
```

The important substitution is `sideToMove` → `color`. The generator must use the parameter it receives. It has no turn of its own.

Keep the scaffold's private constructor and its lack of fields. Preserve the package-private visibility of `pseudoLegalMoves`: absence of an access modifier is intentional.

At this intermediate step, the new tests still reach the unimplemented public method and report six errors.

### Step 2: preserve the public generation boundary

```java
public static List<Move> legalMoves(Board board, Color color) {
    return pseudoLegalMoves(board, color);
}
```

The six new tests can now pass. However, if `Game` retains its original loop, there are two implementations. Tests comparing their results will accept two identical copies. That does not satisfy the extraction.

### Step 3: make Game delegate

Replace the body of `Game.legalMoves()`:

```java
public List<Move> legalMoves() {
    return MoveGenerator.legalMoves(board, sideToMove);
}
```

No caller of `Game` changes. `play`, `findLegalMove`, and undo keep their existing behavior. Remove imports only when they are unused: `ArrayList` may still be needed to initialize history.

If you have not implemented M3's loop yet, implement it in the generator and make `Game` delegate directly. You still need all M3 behavior passing before submitting M3.

## 5. Tests establish behavior; the diff shows the cut

Run the suite and read the changes:

```bash
./mvnw test
git diff
git diff --check
```

The M4 handout expects 48 passing tests. Passing tests give evidence about their tested cases; they do not establish equivalence for every possible position or certify the design.

Read the diff for the structural requirements:

- The collection loop exists once, in `MoveGenerator.pseudoLegalMoves`.
- `Game.legalMoves()` delegates with the game's board and side to move.
- No other `Game` method or model class changed.
- No new branch selects a concrete piece type.
- The scaffold's signatures, visibility, and stateless design remain intact.

For example, always passing `Color.WHITE` preserves White's opening result but breaks Black's turn. A useful behavioral check must exercise both colors. A diff review also makes that wrong argument visible.

## 6. Refactoring and feature work need different checks

Suppose you extract the loop and add a king-safety filter in the same edit. Some results now change. Is a missing move evidence of a successful filter, an extraction bug, or a bug in the attack query? You have created several explanations for the same failure.

Complete M4 under its existing rules first. Then add M5 behavior with examples that distinguish legal moves from pseudo-legal moves. The extraction makes that later change easier to locate, but it does not itself implement chess legality.

A practical cycle is: identify the boundary, make a small change, compile and test, inspect the diff, then continue. Keep unrelated cleanup out of an assignment whose scope requires other methods to remain unchanged.

## 7. Pair review: which change belongs today?

**Pairs, 10 minutes.** For each proposal, identify the cost it addresses and decide whether it belongs in M4.

1. Move the generation loop to `MoveGenerator` and delegate from `Game`.
2. Copy the loop into `MoveGenerator` while keeping it in `Game`.
3. Replace each piece's movement method with a switch in the generator.
4. Filter out moves that expose the king.
5. Rewrite history storage while editing `Game.legalMoves()`.
6. Remove an import made unused by the extraction.

Then review your own diff against section 5. Explain one design property that passing tests alone would not establish.

## 8. Exit question and next steps

Explain why a generator test can pass while M4's extraction is still unfinished. Identify the code you would inspect to decide.

M3 is due tonight; M4 is due October 12, both at 11:59 PM. Follow the submission instructions in the handouts. Wednesday connects information hiding and readable code to the next behavior change: king safety.

**Related material:** [M3 handout](../../assignments/m3-game/handout.md), [M4 handout](../../assignments/m4-move-generator/handout.md), [session 10 notes](../session-10-solid/notes.md).

---

## INSTRUCTOR ONLY — meeting plan and review answers

**75 minutes:** 10 minutes on the baseline and refactoring definition; 15 on smells and dependency reading; 20 on the extraction; 10 on tests versus diff; 10 on pair review; 10 on discussion and exit question.

Pair answers: 1 is the required refactor; 2 preserves duplicate logic; 3 centralizes piece-specific knowledge and reverses M2; 4 is M5 feature work; 5 is outside M4's scope; 6 is appropriate if the import is actually unused. Do not remove `ArrayList` merely because the local move list disappeared: history may use it.

The exit answer should name duplicate loops and point to both `Game.legalMoves` and `MoveGenerator.pseudoLegalMoves`. Test equality cannot determine which method owns the algorithm.
