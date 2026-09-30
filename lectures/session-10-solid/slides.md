## SOLID: design principles in our chess project

:::: lesson-layout
::: lesson-context
**CSC 413 · Session 10 · September 30**

M2 gave each kind of piece its own movement behavior. M3 asks you to use those pieces in a game with turns and undo.

Today we will read that design through five principles and explain why its responsibilities belong where they do.

**Starting point:** M2 completed; M3 in progress.
:::

::: code-panel
### Piece and Game · method excerpts

```java
// Piece.java: completed in M2
public abstract List<Move> pseudoLegalMoves(
    Board board, Position from);

// Game.java: M3 methods to implement
public List<Move> legalMoves() { /* ... */ }
public void play(Move move) { /* ... */ }
public Optional<Move> undoLastMove() {
    /* ... */
}
```

The pieces answer movement questions. `Game` coordinates when their moves can be played.
:::
::::

> Start from completed M2. M3 is in progress; no particular method is assumed finished.
> Code panels show excerpts. Omitted method bodies are not complete implementations.

---

## Our project after M2

:::: lesson-layout
::: lesson-context
The board knows where pieces are. A piece knows its own movement rules. A `Move` describes one possible move.

The provided factories create objects, and the renderer turns a board into text.

In this example, the caller receives a `Piece` and asks it for moves. It does not need to choose a knight or pawn algorithm.
:::

::: code-panel
### M2 · board setup and movement query

```java
Board board = BoardFactory.standard();
Position from = Position.parse("b1");
Piece piece = board.pieceAt(from);

List<Move> moves =
    piece.pseudoLegalMoves(board, from);

TextBoardRenderer renderer =
    new TextBoardRenderer(PieceGlyphs.LETTERS);
System.out.println(renderer.render(board));
```

On the standard board, b1 contains a knight. The declared type is still Piece; the object supplies the movement behavior.
:::
::::

> Ask students to name one method their Knight shares with Pawn. Distinguish student implementations from provided code.

---

## The design questions in M3

:::: lesson-layout
::: lesson-context
The scaffold gives `Game` a board, a side to move, and a history list. You are implementing the methods that coordinate them.

Which method should reject a move? Which operation should only change the squares? What must undo restore?

**M3 scope:** allowed moves have the right color and geometry. King safety is outside this milestone.
:::

::: code-panel
### M3 · Game fields and methods

```java
private final Board board;
private final List<Move> history =
    new ArrayList<>();
private Color sideToMove;

public List<Move> legalMoves() { /* ... */ }
public void play(Move move) { /* ... */ }
public Optional<Move> undoLastMove() {
    /* ... */
}
```

`play` and `undoLastMove` must keep the board, turn, and history consistent.
:::
::::

> For M3, legal means pseudo-legal movement for the side to move. King safety is outside this milestone's scope.
> Do not assume any M3 methods are finished.

---

## Why SOLID?

:::: lesson-layout
::: lesson-context
Session 9 named cohesion and coupling. Cohesion asks whether work belongs together. Coupling asks what one part needs to know about another.

Both fragments at right could request movement, but the first caller must know every concrete type. The second uses one contract.

SOLID helps explain how that difference affects the effort required to change the program.
:::

::: code-panel
### Movement by type switch or polymorphism

```java
// A caller that knows concrete types:
switch (piece.type()) {
    case KNIGHT -> { /* knight rules */ }
    case ROOK   -> { /* rook rules */ }
    // Other movement cases...
}

// The M2 design:
List<Move> moves =
    piece.pseudoLegalMoves(board, from);
```

Adding a piece requires another movement case in the first design. The second caller can use a new implementation of the same contract.
:::
::::

> Connect to session 9 with a brief recap. A passing test checks behavior; design also affects how much code must change for a new requirement.

---

## Five design principles

:::: lesson-layout
::: lesson-context
- **S:** give a class a coherent responsibility.
- **O:** support extensions through stable contracts.
- **L:** make subtypes preserve those contracts.
- **I:** separate contracts for different client needs.
- **D:** make policy and details depend on abstractions.

A design principle helps explain how a code structure affects change and correctness.
:::

::: code-panel
### Piece and its caller

```java
// Shared contract
public abstract List<Move> pseudoLegalMoves(
    Board board, Position from);

// Call site
Piece piece = board.pieceAt(from);
List<Move> moves =
    piece.pseudoLegalMoves(board, from);

// Concrete implementation
class Knight extends Piece {
    // Implements the movement contract.
}
```

The caller uses one contract. Concrete pieces supply different implementations of that contract.
:::
::::

> Students should be able to explain all five, identify examples in M2, and use them to reason about M3. These are design guidelines to evaluate in context.

---

## S: responsibilities and change

:::: lesson-layout
::: lesson-context
**Single responsibility:** a class should have one reason to change, meaning a coherent responsibility.

A knight movement fix belongs with its rules. A storage change belongs in `Board`. A formatting change belongs in the renderer.

Separating these lets us change text output without editing movement code. Shared helper changes can still affect several pieces.
:::

::: code-panel
### Movement, storage, and rendering

```java
// Knight: movement behavior
public List<Move> pseudoLegalMoves(
    Board board, Position from) { /* ... */ }

// Board: square contents
public Piece pieceAt(Position p) { /* ... */ }

// TextBoardRenderer: presentation
public String render(Board board) {
    /* ... */
}
```

Changing the appearance of empty squares belongs in rendering code; movement rules can stay unchanged.
:::
::::

> A reason means a coherent responsibility, not every bug or every person who requests a change. Shared movement-helper fixes may affect several pieces.

---

## Who should reject a move in M3?

:::: lesson-layout
::: lesson-context
`Game` knows whose turn it is and which moves are currently allowed. `Board` knows the contents of squares.

The M3 handout gives the legality check to `Game.play`. After that check, the game changes the board, records the move, and changes the turn.

**Why this boundary?** Putting the turn check in `Board.apply` would make the board depend on game state it does not own.
:::

::: code-panel
### M3 · Game.play

```java
public void play(Move move) {
    if (!legalMoves().contains(move)) {
        throw new IllegalArgumentException(
            "Illegal move: " + move);
    }
    board.apply(move);
    history.add(move);
    sideToMove = sideToMove.opposite();
}
```

The guard makes the decision. `Board.apply` performs the board change and trusts the supplied `Move`.
:::
::::

> Ask students to identify the guard and the delegation call. Board does not own the side to move or game history. This describes the required responsibilities, not completed student work.

---

## How much should one class do?

:::: lesson-layout
::: lesson-context
Playing and undoing coordinate the same state: board, turn, and history. Keeping that coordination in `Game` gives it a coherent responsibility.

Undo explains why the fields belong together. Removing a history entry alone would leave the board and turn inconsistent.

**SRP does not mean one method per class.** Ask whether responsibilities need to change independently.
:::

::: code-panel
### M3 · Game.undoLastMove

```java
public Optional<Move> undoLastMove() {
    if (history.isEmpty()) {
        return Optional.empty();
    }
    Move last = history.remove(
        history.size() - 1);
    board.undo(last);
    sideToMove = sideToMove.opposite();
    return Optional.of(last);
}
```

Undo restores the squares and side to move while removing the last history entry.
:::
::::

> For M3, follow the scaffold, including Game.legalMoves. Discuss responsibilities without requiring additional classes or a later refactor.
> This is an illustrative implementation of M3 requirements, not a claim about student progress.

---

## O: one call, different pieces

:::: lesson-layout
::: lesson-context
**Open/closed:** support a chosen extension without rewriting the code that uses it.

M2 separates the request for moves from each piece's movement algorithm. Java chooses the implementation from the actual object.

A caller can therefore use another `Piece` implementation without adding a type check or another movement branch.
:::

::: code-panel
### M2 · Piece contract and call site

```java
// Piece.java
public abstract List<Move> pseudoLegalMoves(
    Board board, Position from);

// A caller; from contains a piece
Piece piece = board.pieceAt(from);
List<Move> moves =
    piece.pseudoLegalMoves(board, from);

// The object may be a Knight, Rook, or Pawn.
// The call above is the same.
```

The stable part is the caller. The varying part is the implementation of pseudoLegalMoves in each concrete piece.
:::
::::

> This is the polymorphism used in M2. Ask what a switch on piece type would require when adding another type.

---

## Adding an Archbishop

:::: lesson-layout
::: lesson-context
Recall the thought experiment from session 6: an Archbishop moves as either a bishop or a knight.

Its new subclass combines those movement families. Integration also requires a new `PieceType`, a factory case, and a display glyph if needed.

The existing movement caller can keep using `Piece`.
:::

::: code-panel
### Hypothetical extension · Archbishop

```java
@Override
public List<Move> pseudoLegalMoves(
        Board board, Position from) {
    List<Move> moves = new ArrayList<>(
        slidingMoves(board, from, DIAGONALS));
    moves.addAll(
        steppingMoves(board, from, OFFSETS));
    return moves;
}
```

DIAGONALS would contain bishop directions; OFFSETS would contain knight offsets. This new behavior fits the existing method contract.
:::
::::

> Recall the session 6 exercise. This is not an assignment change. Add tests for the new piece and run existing tests; unchanged callers can still be affected by new behavior.
> Constructor and direction tables are omitted. This is a thought experiment, not an M3 requirement.

---

## What stays open to change?

:::: lesson-layout
::: lesson-context
Construction and movement have different jobs. `PieceFactory` selects the concrete class to create. A movement caller asks an existing object for its moves.

Adding a type changes the factory's supported set. It need not change the movement caller.

OCP limits the spread of changes for a particular extension. New behavior still needs tests, and existing tests still need to run.
:::

::: code-panel
### PieceFactory and movement caller

```java
// Factory: construction knowledge
return switch (type) {
    case PAWN   -> new Pawn(color);
    case KNIGHT -> new Knight(color);
    // Remaining supported types omitted.
};

// Caller: movement knowledge
List<Move> moves =
    piece.pseudoLegalMoves(board, from);
```

`PieceFactory` names concrete classes because it constructs them. The movement caller only needs the `Piece` contract.
:::
::::

> Do not turn OCP into a rule against all switches. Construction and movement have different jobs. Avoid adding abstractions for requirements the project does not have.
> The factory switch is abbreviated; other cases are omitted.

---

## L: the shared movement contract

:::: lesson-layout
::: lesson-context
**Liskov substitution:** any subtype must preserve the expectations of callers using the base type.

A `Piece` returns moves from the requested square, records the mover, and obeys its geometry and occupancy rules. No destinations are off-board or occupied by friends.

Different pieces return different moves. A blocked piece returns an empty list, so callers can keep using ordinary list operations.
:::

::: code-panel
### Piece contract and iteration

```java
// Piece.java
public abstract List<Move> pseudoLegalMoves(
    Board board, Position from);

// Caller assumes a non-null list.
List<Move> moves =
    piece.pseudoLegalMoves(board, from);
for (Move move : moves) {
    System.out.println(move);
}
```

The compiler checks the method signature. Behavioral tests check examples of its promises; the loop relies on those promises.
:::
::::

> Liskov substitution: any subtype must preserve the expectations established by the base type. The results can differ. Java checks types and signatures; tests check examples of behavior.

---

## Pawn movement and attacks

:::: lesson-layout
::: lesson-context
A pawn advances straight ahead but captures diagonally. Looking only at its movement destinations would answer attack questions incorrectly.

M2 requires `Pawn.attacks` to recognize the forward diagonals even when empty, and reject the square directly ahead.

The override preserves the meaning of the attack query. Substitution requires that shared meaning, not identical results.
:::

::: code-panel
### M2 · Pawn attack queries

```java
// Standard board: e2 contains a white pawn.
Board board = BoardFactory.standard();
Position from = Position.parse("e2");
Piece pawn = board.pieceAt(from);

pawn.attacks(board, from,
    Position.parse("d3")); // true
pawn.attacks(board, from,
    Position.parse("f3")); // true
pawn.attacks(board, from,
    Position.parse("e3")); // false
```

All three target squares are empty. d3 and f3 are attacked; e3 is a possible movement destination but is not attacked.
:::
::::

> Ask whether a pawn attacks the empty square directly ahead. Expected: no. This example is completed M2 work. Substitution requires the same meaning, not the same implementation or result.

---

## Which implementation breaks the contract?

:::: lesson-layout
::: lesson-context
Suppose a piece is blocked. Compare the candidate results at right.

Which lets the caller continue using the shared contract? Which forces a special case? Which reports an invalid move?

For each result, explain whether the caller can still iterate the returned moves safely.
:::

::: code-panel
### Three possible results from pseudoLegalMoves

```java
// A: no moves available
return List.of();

// B: no result list
return null;

// C: assume friend occupies a nearby square
return List.of(
    Move.quiet(from, friend, this));

```

The caller on the previous slide iterates the result. Decide what happens to that caller for A, B, and C.
:::
::::

> Expected: A preserves the contract. B makes ordinary iteration fail with a null result. C includes a friendly destination. Connect L to O: callers can accept new implementations when they preserve the contract.
> The code panel contains three alternative returns, not a single method.

---

## I: different clients need different operations

:::: lesson-layout
::: lesson-context
A client is code that uses an object's API. The renderer and game logic are two clients of board operations, with different needs.

Rendering reads square contents. Playing and undoing change them.

**Interface segregation:** clients should not be forced to depend on operations they do not need. This asks us to consider separate contracts for these roles.
:::

::: code-panel
### Board operations used by different clients

```java
// Rendering needs board-reading operations.
Piece piece = board.pieceAt(position);

// M3 game logic needs board mutation.
board.apply(move);
board.undo(move);

// Board currently exposes both kinds.
// Could rendering use a smaller contract?
```

Reading and mutation serve different clients, even when the operations belong to the same board object.
:::
::::

> Client means code that uses another object's API. An interface here means a contract; Java's interface keyword is one way to express it. Hiding fields is encapsulation and does not by itself establish ISP.

---

## A smaller contract for a renderer

:::: lesson-layout
::: lesson-context
In this hypothetical design, the renderer accepts `BoardView`. That contract declares only the reading operation it needs.

`Board` can implement the view while also offering mutation operations to game logic. Changes to those mutation operations need not change the renderer's contract.

**Hypothetical design.** M3 retains its existing `Board` API.
:::

::: code-panel
### Hypothetical design · BoardView

```java
public interface BoardView {
    Piece pieceAt(Position position);
}

public class Board implements BoardView {
    public Piece pieceAt(Position p) { /* ... */ }
    public void apply(Move move) { /* ... */ }
    public void undo(Move move) { /* ... */ }
}

// A renderer's proposed parameter type:
public String render(BoardView board) { /* ... */ }
```

Separate types expose different contracts for the same object. BoardView does not make the underlying board immutable.
:::
::::

> Show the client relationship: the renderer depends on BoardView, and Board implements BoardView. BoardView would not declare mutation methods. Its purpose is to separate client dependencies, not to freeze the underlying board.

---

## Access control and ISP

:::: lesson-layout
::: lesson-context
`private` hides a field, but a public accessor can return the object stored in it.

In M3, `Game.board()` exposes a mutable `Board`. A caller can invoke its public methods and bypass the turn and history updates in `Game.play`.

Access control and ISP address different questions. A narrower reading contract would limit the operations available through that declared type.
:::

::: code-panel
### Accessing the board through Game

```java
// Game's field can be private...
private final Board board;

// ...while its accessor exposes the object.
public Board board() { return board; }

// Outside Game, with a supplied Move:
game.board().apply(move); // bypasses Game.play

// Intended way to play a turn:
game.play(move);
```

`game.board().apply(move)` changes the squares without updating the turn or history. `game.play(move)` coordinates all three.
:::
::::

> Keep the existing M3 API. A narrower view is a discussion example, not a new requirement. Protected helpers are also accessible within their package; do not describe them as visible only to subclasses.

---

## D: the M3 move-collection loop

:::: lesson-layout
::: lesson-context
M2 answers “where can this piece move?” M3's `legalMoves()` must gather answers for every piece of the side to move.

The board supplies the positions. Each piece supplies its own movement behavior. The loop combines the results.

Read the loop at right: what information does it need about `Knight` or `Pawn` specifically?
:::

::: code-panel
### M3 · Game.legalMoves

```java
List<Move> moves = new ArrayList<>();
for (Position from :
        board.positionsOf(sideToMove)) {
    Piece piece = board.pieceAt(from);
    List<Move> pieceMoves =
        piece.pseudoLegalMoves(board, from);
    moves.addAll(pieceMoves);
}
return moves;
```

The result contains pseudo-legal moves for the side to move. King safety is outside M3’s scope.
:::
::::

> Students may be reading or implementing this loop. It gathers pseudo-legal moves for the side to move. No completed Game implementation is assumed.

---

## Policy depends on the Piece contract

:::: lesson-layout
::: lesson-context
The collection policy is “ask each piece of the side to move.” The details are knight offsets, sliding directions, and pawn rules.

The loop uses `Piece`, and the concrete movement classes implement `Piece`. The caller therefore avoids depending directly on those details.

**Dependency inversion:** policy and implementation details depend on abstractions. The abstraction should not depend on its concrete implementations.
:::

::: code-panel
### Policy, abstraction, and implementations

```java
// Policy calls the abstraction:
Piece piece = board.pieceAt(from);
piece.pseudoLegalMoves(board, from);

// Abstraction declares the operation:
public abstract List<Move> pseudoLegalMoves(
    Board board, Position from);

// Details implement that abstraction:
class Knight extends Piece { /* ... */ }
class Pawn extends Piece { /* ... */ }
```

Follow the declared types: both the caller and concrete classes refer to Piece. The caller has no branch naming Knight or Pawn.
:::
::::

> The loop calls Piece; Knight and Pawn extend Piece. No branch in the loop needs to identify either subclass. Source: Robert Martin, The Dependency Inversion Principle, https://objectmentor.com/resources/articles/dip.pdf.

---

## Related techniques, different questions

:::: lesson-layout
::: lesson-context
`List<Move>` describes the operations callers use. `new ArrayList<>()` still chooses a concrete list implementation.

The provided `Game` constructor receives a board from its caller. Passing in a dependency is dependency injection and makes it easy to supply a particular test position.

Injection alone does not establish DIP: this constructor still depends on the concrete `Board` type.
:::

::: code-panel
### List declaration and Game constructor

```java
// Abstract variable type, concrete creation
List<Move> moves = new ArrayList<>();

// Constructor injection in the M3 scaffold
public Game(Board board, Color sideToMove) {
    this.board = board;
    this.sideToMove = sideToMove;
}

Game game = new Game(
    BoardFactory.standard(), Color.WHITE);
```

The caller chooses the starting board and side. The constructor stores those dependencies in the game.
:::
::::

> The constructor is provided in the scaffold. Do not call it something students implemented. Keep DIP focused on the dependency structure demonstrated by Piece.
> The history field has its own initializer. This constructor is supplied in the scaffold.

---

## M3 responsibility exercise

:::: lesson-layout
::: lesson-context
**Pairs: 7 minutes.** Use the scaffold and handout. For each job, name the responsible class and explain the boundary.

1. Apply a move to the squares
2. Reject a move outside the allowed set
3. Find a move matching `"e2e4"`
4. Collect the side's moves
5. Display the board

Connect a SOLID principle where it helps your explanation.
:::

::: code-panel
### M3 · method reference

```java
// Board
void apply(Move move)
void undo(Move move)

// Game
List<Move> legalMoves()
Optional<Move> findLegalMove(String notation)
void play(Move move)

// TextBoardRenderer
String render(Board board)
```

Use each method’s responsibility to explain why it belongs to its class.
:::
::::

> Discuss for five minutes. Explain the responsibility first, then connect a principle where useful. No need to force a different SOLID letter onto every answer. Promotion is an optional extension in the notes.
> The panel is a signature reference rather than complete Java declarations.

---

## M3 responsibilities in context

:::: lesson-layout
::: lesson-context
`Main` chooses when to display output. `TextBoardRenderer` formats the board.

`Game.findLegalMove` matches notation against the current moves. `Game.play` validates and coordinates the turn, then delegates square changes to `Board.apply`.

`Game.legalMoves` obtains movement answers through the M2 `Piece` contract. Each boundary keeps a particular responsibility in one place.
:::

::: code-panel
### M3 · Main calls Game and the renderer

```java
Game game = new Game();
TextBoardRenderer renderer =
    new TextBoardRenderer(PieceGlyphs.LETTERS);

Optional<Move> move =
    game.findLegalMove("e2e4");
if (move.isPresent()) {
    game.play(move.get());
}
System.out.println(
    renderer.render(game.board()));
```

`findLegalMove` returns an empty `Optional` when no available move matches the notation. Output remains the caller’s responsibility.
:::
::::

> Discuss after pairs finish. In this milestone, the available moves are pseudo-legal moves for the side to move. Game.legalMoves uses the M2 Piece contract.
> This usage example shows the intended behavior once the required M3 methods are implemented.

---

## Code review: mixed responsibilities

:::: lesson-layout
::: lesson-context
Consider this proposed code inside `Game.play`, after the legality check.

The method changes the game state and displays the resulting board in the terminal.

Suppose the caller needs to play several moves before displaying the board. Which line creates a problem? Where should that responsibility live?
:::

::: code-panel
### Game.play after the legality check

```java
board.apply(move);
history.add(move);
sideToMove = sideToMove.opposite();

System.out.println(renderer.render(board));

```

Which statements must stay together to keep the game state consistent? Which can the caller perform separately?
:::
::::

> This deliberately incomplete fragment omits the legality guard. It is not a replacement implementation. Rendering and printing belong in the caller using TextBoardRenderer. Changing terminal output should not require editing turn coordination. Ask for the concrete cost before naming SRP.
> Optional exercise if time permits. Assume a renderer is available. Expected: output belongs in Main using TextBoardRenderer, so changes in display timing do not affect turn coordination.

---

## Looking ahead: SOLID with AI

:::: lesson-layout
::: lesson-context
You are implementing M3 yourselves. Later in the semester, we will use AI to generate code. The design judgment you are practicing now will help you guide and evaluate that code.

- **Before generation:** specify responsibilities, contracts, and the task’s scope.
- **Before accepting:** inspect the diff for broken contracts and unnecessary dependencies, then test behavior.
- **When changing code:** use SOLID to locate the change and protect its callers.

Generated code still needs a design you can explain and maintain.
:::

::: code-panel
### Future review example using familiar chess code

```java
// Within the loop over the side's pieces:
Piece piece = board.pieceAt(from);

// Imagine AI later suggests this:
if (piece instanceof Knight knight) {
    moves.addAll(
        knight.pseudoLegalMoves(board, from));
}

// Review: use the existing Piece contract
moves.addAll(
    piece.pseudoLegalMoves(board, from));
```

These are alternative implementations. The first ignores other piece types. The revision uses every piece through `Piece`, supporting OCP and DIP. Tests must still check the results.
:::
::::

> Spend four minutes connecting the principles to reviewing generated code. The suggestion is hypothetical, not output from a measured AI experiment. Assume moves is initialized and from comes from board.positionsOf(sideToMove). The suggested and revised fragments are alternatives, not a sequence to run together.
> Ask what would happen on a board containing only pawns. Expected: the suggestion collects no moves even when moves exist. Ask why adding five more type branches is less useful than using the existing Piece contract. Do not infer that a SOLID design alone guarantees correctness.
> Frame this as preparation for AI code generation later in the semester. Students are not using AI for M3. Reuse familiar chess code to demonstrate future review skills without assuming later features or assignments are complete.

---

## Five questions for a design review

:::: lesson-layout
::: lesson-context
- **S:** which responsibilities change together?
- **O:** which caller stays unchanged for an extension?
- **L:** what does that caller expect every piece to return?
- **I:** which operations does a renderer need?
- **D:** which abstraction separates policy from details?

Use the example at right to explain O, L, or D. The same code can illustrate more than one principle.
:::

::: code-panel
### Game.legalMoves and the Piece contract

```java
List<Move> moves = new ArrayList<>();
for (Position from :
        board.positionsOf(sideToMove)) {
    Piece piece = board.pieceAt(from);
    List<Move> pieceMoves =
        piece.pseudoLegalMoves(board, from);
    moves.addAll(pieceMoves);
}

// O: same caller, another implementation
// L: each implementation keeps the contract
// D: caller depends on Piece
```

The loop combines each piece’s answer without selecting an algorithm by concrete type.
:::
::::

> Use these questions to explain a design choice. Not every principle needs a new class or interface in the assignment.

---

## Exit question

:::: lesson-layout
::: lesson-context
Choose either example at right. Name a relevant SOLID principle and explain one concrete problem that the design avoids.

Be specific: identify the class, method, or dependency in your explanation. Several answers may be justified.

**M3 due Monday, October 5.** Continue using its required signatures and scope.
:::

::: code-panel
### A: Piece contract · B: turn coordination

```java
// A: using a piece through its contract
Piece piece = board.pieceAt(from);
List<Move> moves =
    piece.pseudoLegalMoves(board, from);

// B: coordinating a validated move in Game
board.apply(move);
history.add(move);
sideToMove = sideToMove.opposite();
```

A separates the movement caller from individual piece rules. B coordinates the state changes needed for a turn.
:::
::::

> Accept a clear explanation supported by the project. For example: collecting moves through Piece avoids a branch for every concrete type. Next session covers refactoring and code smells.
> Example A assumes from contains a piece. Example B follows a successful legality guard.
