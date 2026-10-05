# Session 11 — Refactoring and Code Smells

**Week 7, Monday October 5 · CSC 413 Software Development**

**Objectives advanced:** 3 (analyze maintainability, cohesion, coupling, and responsibilities), 4 (refactor poorly designed code)

**Milestone supported:** M3 — turns, moves, and `Game`, due Monday October 5 at 11:59 PM; M4 — extract `MoveGenerator`, due Monday October 12 at 11:59 PM.

The examples build on M3’s turns, move lookup, and undo behavior. M4 reorganizes move generation while preserving that behavior. M5 then adds king safety. Keeping these two changes separate makes it possible to verify the refactor before introducing a new rule.

## 1. Changing structure while preserving behavior

A working program can become harder to extend as its responsibilities grow. Refactoring provides a way to improve its organization without changing what its callers observe. **Refactoring changes the internal structure of software while preserving its observable behavior.** Fixing a bug changes behavior. Adding check detection changes behavior. Moving the existing generation loop out of `Game`, while returning the same moves, is a refactor.

“Observable” includes more than the value printed in the terminal. Callers can observe return values, exceptions, changes to the board, the side to move, and the effects of undo. A method that returns the same moves but leaves a different board behind has changed behavior.

In the chess engine, move generation provides a useful example: its current behavior can remain intact while the algorithm moves to a class that will later enforce king safety.

## 2. A smell is a question to investigate

A **code smell** is a sign that a design may be making changes harder than necessary. It is evidence to inspect, not proof that the program is incorrect.

| Smell | Question | Possible example in a chess engine |
|---|---|---|
| Duplicated logic | Can one rule drift between two copies? | A generation loop in both `Game` and `MoveGenerator` |
| Long method | Which distinct jobs are hidden in the sequence? | Generating, validating, updating state, and printing in one method |
| Mixed responsibilities | Which unrelated requests require editing this class? | Changing terminal formatting inside `Game` |
| Repeated type branches | Does an existing contract already provide the operation? | A movement caller branching on `Knight`, `Pawn`, and the other types |
| Exposed mutable state | Can a caller bypass the object's coordination? | Calling `game.board().apply(move)` instead of `game.play(move)` |
| Unclear names | What must a reader reconstruct to understand the code? | `c`, `p`, and `x` used for unrelated chess concepts |

There is no universal line limit for a method. A short method can mix responsibilities, and a longer method can express one cohesive algorithm. Similarly, a factory switch has a construction job; its existence alone does not demand a refactor.

A useful diagnosis connects the code’s structure to a concrete cost. “This class is too big” is not enough. Neither is “this method uses only two fields”: cohesive methods can use different subsets of a class’s fields. An extraction needs a responsibility that can stand on its own and a reason that separating it will help the program evolve.

## 3. From playing a turn to analyzing a position

### Starting a game and requesting a move

A new game begins with the standard starting board and White to move:

```java
Game game = new Game();
```

Suppose the requested move is `"e2e4"`: advance the White pawn from e2 to e4. Before changing the board, the program needs to determine whether that move is available. A string alone cannot establish this: `"e2e5"` also names two squares, but a pawn cannot advance three squares.

`Game.findLegalMove(String notation)` handles that lookup. It returns a matching `Move` in an `Optional`, or an empty result when the move is unavailable. The caller can then play the match:

```java
String notation = "e2e4";
Optional<Move> requestedMove = game.findLegalMove(notation);
if (requestedMove.isPresent()) {
    game.play(requestedMove.get());
} else {
    System.out.println("Move unavailable: " + notation);
}
```

The notation is supplied directly in this example. A later input interface can supply the same string from a player's entry. In either case, the lookup needs an answer to the same question: which moves are available to the current side?

Keeping that calculation in `Game.legalMoves()` separates two jobs: generating available moves and matching one requested string against them. The lookup can use the generated list without implementing each piece's movement rules itself.

Two methods divide this work. **`legalMoves()` collects moves for the current color and returns the list.** `findLegalMove(String notation)` calls it and searches the returned list for matching notation. The reference implementation expresses the search as follows:

```java
public Optional<Move> findLegalMove(String notation) {
    return legalMoves().stream()
            .filter(move -> move.toString().equalsIgnoreCase(notation))
            .findFirst();
}
```

`legalMoves()` supplies the candidates. `filter` compares each candidate's notation with the supplied string. `findFirst` returns a matching move in an `Optional`, or an empty result. The M3 scaffold leaves this method unimplemented; the code above implements its required behavior.

Obtaining the move from this list reuses the pieces’ movement rules: `"e2e4"` can match an available pawn move while `"e2e5"` cannot. The caller reuses those rules instead of implementing pawn movement again. `Game.play` separately checks membership in the current list before changing the board, turn, and history.

The search depends on the list produced by M3's **`legalMoves()` collection loop**:

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

Because `sideToMove` is White, the loop visits White's occupied squares. At e2 it asks the pawn for its moves, including `e2e3` and `e2e4`. At b1 it asks the knight, which contributes `b1a3` and `b1c3`. It combines the answers from all White pieces into a list of 20 opening moves.

The separate `findLegalMove("e2e4")` method shown above can now find the requested move in that list. `Game.play` checks the allowed set, applies the move, records it in history, and changes the turn to Black. The next call to `Game.legalMoves()` runs the same loop for Black's pieces.

The loop supplies the candidates used by `findLegalMove` for notation lookup and by `play` for validation. In M3 those moves are pseudo-legal: they follow piece movement and occupancy rules but do not check king safety.

### The next rule: king safety

This arrangement is clear enough for M3: `legalMoves()` collects the current side's moves, `findLegalMove` matches the requested notation, and `play` validates and carries out the move. The next change is a chess rule that the collection loop does not yet enforce.

M5 adds **king safety**. A king is **in check** when an opposing piece attacks its square. A legal move must leave the moving side's king out of check. This means a move must not expose a previously safe king, and a side already in check must make a move that removes the attack.

For example, consider this position, with all other squares empty:

| Square | Piece |
|---|---|
| e1 | White king |
| e2 | White rook |
| e8 | Black rook |
| a8 | Black king |

The White rook on e2 blocks the Black rook's path down the e-file to the White king. Moving the White rook to f2 follows the rook's movement and occupancy rules, so M3's loop includes `e2f2`. However, it also opens that path. After the move, the Black rook attacks the White king on e1. King safety must therefore reject `e2f2`.

Now remove the White rook from that position. The White king is already in check from the Black rook. Moving the king from e1 to e2 leaves it on the attacked file and must be rejected. Moving it from e1 to d1 takes it off that file; with the other squares empty and the Black king on a8, d1 is safe. These examples show why checking only the moving piece's geometry is insufficient.

### Checking the resulting position

> How could the program determine whether a candidate move leaves its own king safe?

The answer depends on the board **after** the candidate move. Applying a candidate temporarily makes that position available for inspection. The program can locate the moving side's king, ask whether an opponent attacks it, and then undo the candidate. It retains only candidates whose resulting position leaves the king safe.

This calculation could be added to `Game.legalMoves()`: collect candidates, try each one, check the king, restore the board, and collect the survivors.

The following alternative shows what that would look like. It assumes an `isInCheck(Board, Color)` helper that answers whether the specified king is attacked. That helper is new behavior required by M5; it is not available in M3 or implemented by this example.

```java
// Alternative design: collection and filtering stay inside Game.
public List<Move> legalMoves() {
    List<Move> candidates = new ArrayList<>();
    for (Position from : board.positionsOf(sideToMove)) {
        Piece piece = board.pieceAt(from);
        candidates.addAll(piece.pseudoLegalMoves(board, from));
    }

    List<Move> legal = new ArrayList<>();
    for (Move candidate : candidates) {
        board.apply(candidate);
        boolean leavesKingExposed = isInCheck(board, sideToMove);
        board.undo(candidate);
        if (!leavesKingExposed) {
            legal.add(candidate);
        }
    }
    return legal;
}
```

For `e2f2` in the position above, `board.apply` moves the White rook away from the e-file. `isInCheck` then returns `true` because the Black rook attacks the White king. `board.undo` restores the White rook to e2, and the candidate is excluded. A candidate that leaves the king safe is also undone before being added to the result: this method calculates available moves without playing any of them.

The three statements apply, query, and undo are the whole trial. Session 12 examines what that restoration requires: what `undo` must put back after a capture, and what happens if the query fails between `apply` and `undo`.

### Making the calculation reusable

The first loop collects piece-level candidates; the second filters them using the resulting position. Both could remain in `Game`, and the implementation would work.

> How could this calculation be used for a supplied board and color without also requiring a game object that manages turns and history?

Both loops need the board and the color being examined. They do not need the history of played moves, and they must not advance the turn. Their temporary board changes serve only to answer a question about available moves.

Making those two inputs explicit allows the calculation to stand on its own. `Game` can still supply its current board and side to move, while other callers can supply a position directly. The king-safety rule then has one implementation that these callers can share.

Session 9 reached the same boundary from the other direction, by reading which fields the loop uses: the board and a color, not the history or the turn. Reading the inputs shows that the calculation *can* be separated. The king-safety change shows *why* separating it is worth a class.

M4 establishes that separation before M5 adds the filter. It moves the existing candidate loop into `MoveGenerator`; the later milestone extends the calculation there. This keeps the structural change and the new chess rule separate, so each can be checked on its own.

### Extracting the move calculation

M4 moves the existing loop into `MoveGenerator.pseudoLegalMoves(Board board, Color color)`. The color becomes an explicit parameter instead of coming from a game's field. The public `MoveGenerator.legalMoves` method returns that helper's answer unchanged for now. `Game.legalMoves()` keeps its signature and delegates with its board and side to move. Section 4 performs the extraction step by step.

The caller requesting `"e2e4"` gets the same result as before. `findLegalMove` and `play` still ask `Game.legalMoves()`; they do not need to know where the loop moved.

In M4, `MoveGenerator.legalMoves` returns the candidates unchanged. In M5, it will filter those candidates for king safety. In the position above, `e2f2` will then disappear from the returned list, so `findLegalMove("e2f2")` will find no match and `play` will reject that move. Neither caller needs its own king-safety implementation.

Keeping the loop in `Game` was reasonable for M3. M4 introduces one class and a delegation call so M5's position-analysis algorithm has a separate home. The refactor preserves current behavior; adding the filter next milestone changes behavior.

`Board` continues to store occupied squares. Each `Piece` continues to calculate its own movement. `MoveGenerator` combines those answers, and `Game` uses the result to coordinate an actual turn. Moving piece-specific rules into the generator would undo M2's separation of responsibilities.

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

## 7. Exercises: choosing the scope of a refactor

For each proposal, identify the cost it addresses and decide whether it belongs in M4.

1. Move the generation loop to `MoveGenerator` and delegate from `Game`.
2. Copy the loop into `MoveGenerator` while keeping it in `Game`.
3. Replace each piece's movement method with a switch in the generator.
4. Filter out moves that expose the king.
5. Rewrite history storage while editing `Game.legalMoves()`.
6. Remove an import made unused by the extraction.

Then review your own diff against section 5. Explain one design property that passing tests alone would not establish.

## 8. Review: behavior and structure

Explain why a generator test can pass while M4's extraction is still unfinished. Identify the code you would inspect to decide.

The extraction establishes a boundary between calculating moves and coordinating played turns. Session 12 examines what this boundary hides from callers, how an attack query differs from a move, and what restoring the board requires when king-safety filtering is added.

**Related material:** [M3 handout](../../assignments/m3-game/handout.md), [M4 handout](../../assignments/m4-move-generator/handout.md), [session 10 notes](../session-10-solid/notes.md).
