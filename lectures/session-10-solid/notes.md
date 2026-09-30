# Session 10 — SOLID

### Design principles in our chess project

**Week 6, Wednesday September 30 · CSC 413 Software Development**

**Objectives advanced:** 2 (SOLID design principles), 3 (analyze designs for maintainability, extensibility, and responsibility assignment)

**Milestone supported:** M3, turns, moves, and `Game`, due Monday October 5 at 11:59 PM.

These notes start from completed M2 work. M3 is in progress. You can work through the examples with the M3 handout and scaffold, regardless of which methods you have implemented.

## 1. Our project after M2

M2 gave each kind of chess piece responsibility for its movement. The abstract class `Piece` declares `pseudoLegalMoves(Board, Position)`, and the six concrete subclasses implement it. Sliding and stepping helpers share the common movement algorithms. `Pawn` handles its distinct movement and attack behavior.

The rest of the project supplies the context for those pieces:

- `Board` stores which piece occupies each square.
- `Move` records a move, including the moving piece and any captured piece.
- The provided `PieceFactory` and `BoardFactory` construct objects and starting positions.
- The provided `TextBoardRenderer` produces the text representation of a board.

A piece's pseudo-legal moves obey its movement rules, board boundaries, and occupancy constraints. They ignore whether moving would leave its own king in check.

## 2. The design questions in M3

M3 asks you to coordinate those objects into a game with turns and undo. The `Game` scaffold holds a board, a side to move, and a history list. You are implementing its methods and adding `apply` and `undo` to `Board`.

That introduces design questions. Which class should reject a move? Which class should change the squares? How can the game collect moves without knowing the movement rules of all six pieces?

The M3 handout supplies the required responsibilities and signatures. In this session we explain why those choices are useful. No example assumes that `apply`, `undo`, or any `Game` method is already finished.

**Scope matters:** in M3, `legalMoves()` gathers pseudo-legal moves for the side to move. It does not check king safety. When these notes refer to an allowed move, they mean allowed under that milestone's rules.

## 3. Why SOLID?

Session 9 introduced cohesion, coupling, and separation of concerns. Cohesion asks how closely the responsibilities inside a class belong together. Coupling asks what one part of the program must know about another, and how changes can affect its dependents. Separation of concerns helps organize different kinds of work.

SOLID gives more specific questions for reviewing that organization:

| Principle | Design question |
|---|---|
| Single responsibility | Which responsibilities change together? |
| Open/closed | Which callers can stay unchanged for a particular extension? |
| Liskov substitution | Can every subtype preserve the caller's expectations? |
| Interface segregation | What operations does this client need? |
| Dependency inversion | Does policy depend on a contract or on concrete implementation details? |

Passing tests gives evidence that code behaves as expected in the tested cases. Design also affects the effort and risk involved in changing that code. SOLID helps us discuss those consequences with specific examples.

By the end of the session, you should be able to explain each principle, recognize relevant examples in M2, and justify responsibility assignments in M3. Some principles have direct examples in the current project. ISP will use an explicitly hypothetical design so we can explore the idea without changing the assignment.

## 4. S: Single responsibility

**A class should have one reason to change.** Think of a reason as a coherent responsibility. Different requests can belong to the same responsibility, and a single person can request changes to several unrelated responsibilities.

Consider three changes to the existing project:

| Change | Responsible class |
|---|---|
| Correct a knight's movement | `Knight` |
| Change how the board stores pieces | `Board` |
| Change text-board formatting | `TextBoardRenderer` |

Separating these responsibilities lets us work on formatting without editing movement rules. A shared movement-helper bug may still require a change to `Piece` and affect several subclasses. SRP does not promise that every change touches exactly one file.

### Who should reject a move in M3?

The M3 design separates applying a move from deciding whether to play it:

- `Board.apply(move)` changes the occupied squares. It trusts the supplied move.
- `Game.play(move)` checks membership in the current allowed moves, applies the move, records it in history, and changes the side to move.

If `Board.apply` also decided whether it was White's turn, the board would need information that belongs to `Game`. The two classes could then disagree about the rules. Keeping the check in `Game.play` gives that decision a clear owner.

The slide shows the handout's required behavior:

```java
public void play(Move move) {
    if (!legalMoves().contains(move)) {
        throw new IllegalArgumentException("Illegal move: " + move);
    }
    board.apply(move);
    history.add(move);
    sideToMove = sideToMove.opposite();
}
```

The guard makes the decision. The call to `Board.apply` delegates the square changes, and the remaining statements update the game state.

This explains the required design even before either method is implemented. Follow the M3 handout's signatures and behavior.

### How much should one class do?

Playing and undoing a move coordinate the board, turn, and history. Keeping that coordination in `Game` is useful. SRP does not prescribe one field or one method per class, and the word “and” in a responsibility description does not automatically indicate a problem.

The slide's illustrative undo implementation coordinates those same fields:

```java
public Optional<Move> undoLastMove() {
    if (history.isEmpty()) {
        return Optional.empty();
    }
    Move last = history.remove(history.size() - 1);
    board.undo(last);
    sideToMove = sideToMove.opposite();
    return Optional.of(last);
}
```

This is a possible implementation of the required M3 behavior, not an assumption about students' current progress.

Ask whether parts of the class have independent reasons to change. Extracting a class has a cost too: more interfaces, more navigation, and more coordination. For M3, use the existing scaffold, including `Game.legalMoves()`.

## 5. O: Open/closed

**Software should be open for extension and closed for modification.** In practice, identify a kind of variation and provide a stable contract through which callers can use its implementations.

M2 provides a familiar example:

```java
Piece piece = board.pieceAt(from);
List<Move> moves = piece.pseudoLegalMoves(board, from);
```

This fragment assumes that `from` contains a piece. The caller asks that piece for its moves. It does not select a movement algorithm by switching on `PieceType`. A knight and a pawn answer the same operation with different behavior.

### Adding an Archbishop

As a thought experiment, recall the session 6 Archbishop: a piece that can move as a bishop or a knight. It would need a new movement subclass. Integrating it into our project would also require updating `PieceType` and `PieceFactory`, and providing a glyph if the selected display mode needs one.

The slide shows a method excerpt combining `slidingMoves` with `steppingMoves`. Its hypothetical `DIAGONALS` and `OFFSETS` tables would contain bishop directions and knight offsets respectively. The constructor and tables are omitted. Collecting both sets into a new list produces the Archbishop's movement behavior through the existing signature.

The movement caller above can remain unchanged because it already works through `Piece`. This is the useful boundary: changes to the set of movement implementations do not require another branch in that caller.

This thought experiment is not an instruction to add a piece to M3 or edit its given factory files.

### What stays open to change?

The factory knows how to construct concrete piece types. Its switch changes when the supported set changes. The movement caller only needs the shared contract. These are different responsibilities with different dependencies.

OCP is relative to a particular extension. It does not mean that every file remains untouched or that every switch is wrong. It also does not guarantee that unchanged code cannot fail. New behavior may reveal an assumption in a caller, and changes to shared code can affect many users. Add tests for new behavior and run existing tests.

Choose abstractions that support a useful variation. Additional abstraction has a cost, so a hypothetical feature does not automatically justify restructuring the project.

## 6. L: Liskov substitution

**A subtype must preserve the contract that callers rely on.** A caller using `Piece` should be able to work with any supported concrete piece without additional checks to repair that piece's behavior.

This does not require all pieces to return the same moves. Their behavior differs within a shared set of expectations. For `pseudoLegalMoves(board, from)`, those expectations include:

- moves originate at `from` and identify the moving piece;
- destinations stay on the board and do not contain a friendly piece;
- moves obey that piece's movement rules;
- no available moves means an empty list.

The compiler checks types and method signatures. The implementation must also satisfy the behavioral contract. M2's tests check examples of that behavior, including blocked movement and board boundaries.

### Pawn movement and attacks

A pawn advances straight ahead but captures diagonally. Its attack squares therefore differ from its movement destinations. In M2, `Pawn.attacks` reports a square one rank forward and one file to either side, even when that square is empty. The pawn does not attack the empty square directly ahead.

The slide makes this concrete on the standard starting board:

```java
Board board = BoardFactory.standard();
Position from = Position.parse("e2");
Piece pawn = board.pieceAt(from);
pawn.attacks(board, from, Position.parse("d3")); // true
pawn.attacks(board, from, Position.parse("f3")); // true
pawn.attacks(board, from, Position.parse("e3")); // false
```

All three target squares are empty. The declared type is `Piece`, but Java dispatches the query to the pawn's override.

The override keeps the meaning of an attack query appropriate for a pawn. Overriding a method is compatible with substitution when the override preserves the contract. What matters is the meaning available to the caller, rather than whether subclasses reuse the same method body.

### A quick contract check

Suppose a blocked piece returns one of these results from `pseudoLegalMoves`:

1. An empty list
2. `null`
3. A move onto a friendly piece

Only the first meets the stated contract. A caller can iterate an empty list normally. A null result introduces an unexpected special case, and a friendly destination violates the movement rules.

This connects LSP to OCP. Extending a hierarchy is useful when existing callers can trust the new implementation. Breaking that contract may force callers to add exceptions for particular subtypes.

## 7. I: Interface segregation

**Clients should not be forced to depend on operations they do not need.** A client is code that uses another object's API. Here, “interface” means the contract presented to that client. Java's `interface` keyword is one way to express such a contract.

Consider two roles already familiar from the project. Rendering reads pieces from the board. Game logic needs operations that change the board. A single broad API exposes both kinds of operations to both clients, even though they have different needs.

### A hypothetical smaller contract

The following is a design example for discussion. It is not part of the M3 scaffold and requires no assignment changes.

```java
interface BoardView {
    Piece pieceAt(Position position);
}
```

A renderer could accept `BoardView`. A mutable `Board` could implement that interface while continuing to offer `apply` and `undo` to clients that need mutation. The renderer's declared dependency would then describe only the reading operation it needs.

Why separate the contracts? Changes to mutation operations would not require changing the reading contract. The renderer would also express its needs more clearly. The same board object could serve both roles through different declared types.

For this design sketch, assume `BoardView` and its implementation are accessible to the relevant packages. No complete implementation or new renderer is required for the exercise.

### Access control and ISP

Making a field private hides implementation details. Separating interfaces according to their clients' needs addresses a different question: which contracts should each client depend on? Access modifiers can support the design, but a private field or package-private method does not by itself demonstrate ISP.

The contrast is visible in these call sites:

```java
game.board().apply(move); // bypasses turn and history coordination
game.play(move);          // intended route for playing a turn
```

These are alternative calls, not a sequence to execute for the same move. The first demonstrates a limitation and should not be used to play a game turn.

The existing M3 API also illustrates a limit of encapsulation: `Game.board()` exposes a `Board`, whose public mutation methods remain accessible. The intended route for playing a turn is `Game.play`, but this accessor does not enforce that route. Keep the required M3 API as given.

A `BoardView` reference would offer only the declared reading operation. It would not make the underlying object immutable, create a snapshot, or prevent another reference from changing the board. Similarly, `history()` returning a copy protects the history collection; it does not protect every object reachable through `Game`.

## 8. D: Dependency inversion

**Higher-level policy and implementation details should depend on abstractions. Abstractions should not depend on concrete details.**

Use the M3 handout's collection loop as an example. This is code for the `Game.legalMoves()` method students are currently implementing:

```java
List<Move> moves = new ArrayList<>();
for (Position from : board.positionsOf(sideToMove)) {
    Piece piece = board.pieceAt(from);
    moves.addAll(piece.pseudoLegalMoves(board, from));
}
return moves;
```

The loop expresses a general policy: ask the pieces belonging to the side to move and collect their answers. Knight offsets and pawn movement are implementation details supplied by concrete pieces.

The loop calls the abstract `Piece` contract. `Knight`, `Pawn`, and the other concrete classes extend `Piece` and implement that contract. The loop does not need to name those concrete classes. The abstraction lets the caller use their behavior without depending on their individual implementations.

That is the dependency relationship to notice. Replacing a switch with inheritance is not automatically a complete application of DIP throughout a program. Here we can identify a specific policy, the varying details, and the abstraction between them.

### Related techniques, different questions

Declaring `List<Move>` uses an abstraction for list operations. The expression `new ArrayList<>()` still chooses a concrete implementation. This is a useful illustration of programming to an interface, but the local declaration alone does not establish the dependency structure of the whole program.

The provided constructor `Game(Board board, Color sideToMove)` receives a board from its caller. Passing a dependency into an object is dependency injection. It allows tests to supply a board for a particular position without making that constructor build one itself.

Dependency injection and dependency inversion are related, but distinct. Receiving an object through a constructor does not by itself invert dependencies: this constructor still names the concrete `Board` type. Use the `Piece` relationship above to explain DIP.

Enums such as `Color` and `PieceType` give domain values meaningful types. They are useful modeling choices, but replacing a character with an enum is not itself dependency inversion.

## 9. M3 responsibility exercise

Work in pairs for seven minutes, then discuss as a class. Use the handout or scaffold; finished method bodies are unnecessary.

For each job, name the responsible class and explain why. Connect a SOLID principle where it helps explain your choice.

1. Apply a move to the occupied squares.
2. Reject a move outside the current allowed set.
3. Find an available move matching `"e2e4"`.
4. Collect moves for the side to move.
5. Display the board after a move.

Use M3's definition of allowed movement: pseudo-legal moves for the side to move. Do not add king-safety checks or change the required API.

### Responsibilities in context

| Job | Where it belongs | Reason |
|---|---|---|
| Change squares | `Board.apply` | The board manages square contents. |
| Validate and coordinate a turn | `Game.play` | The game owns the turn and history. |
| Match notation to a move | `Game.findLegalMove` | Matching requires the currently available moves. |
| Collect the side's moves | `Game.legalMoves` | M3 gathers each relevant piece's answer through `Piece`. |
| Display the board | `Main` calls `TextBoardRenderer` | Output stays separate from turn coordination. |

Responsibility assignment makes SRP especially relevant. The movement collection also gives us a place to discuss OCP, LSP, and DIP. Several principles can help explain one choice, and there is no need to assign a different letter to every row.

### Optional extension: promotion

When a pawn promotes, `Board.apply` needs a piece of the selected promotion type. M3 accepts either calling `PieceFactory.create` or using a private construction switch in `Board`, with a comment explaining the cost.

Compare those costs using the handout. Calling the factory introduces a dependency from `model` to `factory`, which already depends on `model`. A private switch duplicates construction knowledge. Both are accepted for this milestone. Discuss the tradeoff without treating either choice as an instruction to redesign the assignment.

## 10. Optional review: mixed responsibilities

Consider this deliberately incomplete teaching fragment inside a proposed `Game.play`:

```java
board.apply(move);
history.add(move);
sideToMove = sideToMove.opposite();
System.out.println(renderer.render(board));
```

The fragment omits the legality guard and assumes a renderer is available. It is not a replacement implementation.

Which line gives the method another reason to change? The first three lines coordinate game state. The last line also commits the method to producing terminal output. A change in when or where output appears would now require editing turn coordination.

The caller can ask `TextBoardRenderer` to render the board after playing a move. That keeps the output decision outside `Game.play`. Give feedback by naming the responsibility and consequence: “This method updates the game and prints output, so changing output also requires editing this method.”

This fragment supports a focused SRP discussion. It does not demonstrate a violation of every SOLID principle.

## 11. Looking ahead: SOLID with AI

You are implementing M3 yourselves, without AI. Later in the semester, we will use AI to generate code. This section looks ahead to that workflow, using familiar chess code to show how today’s design skills will remain useful.

When AI supplies an implementation, you will still need to decide whether it fits the system, check its behavior, and maintain it as requirements change. A generated method has the same callers, contracts, and dependencies as a manually written method. Learning to make these decisions yourself now gives you a basis for evaluating generated code later.

SOLID helps make that evaluation concrete. Instead of asking only whether code looks plausible, ask which responsibility it implements, what callers may assume, and how a change would affect other classes. These questions also make feedback to an AI assistant more precise. “Keep move collection dependent on `Piece`” specifies a useful boundary; “make it SOLID” leaves the design decisions unstated.

### Before generation: describe the design constraints

In a future AI-assisted task, describe what the relevant classes own, which contracts must stay stable, and which behavior is in scope. Our current design provides a familiar example: `Game` coordinates turns and history, `Board.apply` changes squares without checking legality, and each `Piece` supplies its pseudo-legal moves. These boundaries would help you evaluate a generated proposal against the intended design.

Provide the relevant method signatures and requirements for the task at that time. A generated response that adds unrequested features or changes an established API may create extra work even when the added code looks useful.

For a future review exercise using this familiar design, a focused request could be:

> Review this proposed move-collection code. For this example, it must collect every pseudo-legal move for `sideToMove`, using the existing `Piece` abstraction. Identify concrete-type checks, omitted piece types, or changes to unrelated responsibilities. Explain any issue before proposing a revision.

### Before accepting: review the diff and test the behavior

Imagine a future AI-generated proposal contains the following fragment. It uses the collection problem you are studying now; it is not an instruction to generate your M3 implementation:

```java
Piece piece = board.pieceAt(from);
if (piece instanceof Knight knight) {
    moves.addAll(knight.pseudoLegalMoves(board, from));
}
```

Assume `moves` is initialized and `from` comes from `board.positionsOf(sideToMove)`. This code collects only knight moves. It would ignore a pawn with an available move. Testing only a knight position could miss that defect.

Adding five more type branches would duplicate knowledge of the concrete piece classes. The existing M2 contract already supports the required operation:

```java
moves.addAll(piece.pseudoLegalMoves(board, from));
```

Replace the type-specific block with this call; do not execute both alternatives. OCP explains why the caller can work with implementations through a stable operation. DIP explains why collection policy depends on `Piece` instead of each concrete class. LSP explains the requirement on those implementations: each must preserve the movement contract.

The abstraction does not prove that the returned moves are correct. Inspect the actual diff, check the requested behavior, and run the relevant tests. For this loop, check that it includes other piece types, selects only the side to move, and handles a piece with no moves. Tests of individual pieces remain relevant when generated code combines their behavior. A design review and behavioral tests answer different questions, so you will need both.

### Where each principle helps in generated-code review

| Principle | Future review question using familiar project roles |
|---|---|
| SRP | Does a proposed `Game.play` also print the board or take over piece movement rules? |
| OCP | Does move collection use the existing movement contract, or add a branch for each concrete type? |
| LSP | Does every piece return a valid list, including an empty list when blocked, and preserve the attack-query meaning? |
| ISP | Does a proposed interface expose unrelated operations to its clients? The hypothetical `BoardView` illustrates a contract limited to reading. |
| DIP | Does general game logic call `Piece`, or depend on concrete classes such as `Knight`? |

### When requirements change: choose the right place to edit

If text formatting changes, look at rendering. If turn coordination changes, look at `Game`. If movement behavior changes, examine the responsible piece and any shared helpers. Use SOLID to explain why a change belongs there and which contracts its callers still need.

This is also when to question a generated refactor. A small behavior fix does not automatically justify new interfaces, class hierarchies, or changes throughout the project. Prefer an abstraction when it separates a real responsibility or supports a concrete variation. In the familiar collection example, the existing `Piece` abstraction already solves the problem.

SOLID addresses design structure. It does not replace checking requirements, testing behavior, or understanding the code you accept. Practicing those judgments while implementing M3 yourself prepares you to guide and review AI-generated implementations later in the semester.

## 12. Recap and exit question

Use the five questions from section 3 to review a design. A useful explanation identifies the responsibility or dependency, names the relevant principle, and states the practical consequence.

**Exit question:** choose one M2 design decision or one M3 responsibility. Name a relevant SOLID principle and explain one concrete problem that the design avoids.

For example, collecting moves through `Piece` avoids adding a branch for every concrete piece type. The benefit relies on each subtype preserving the movement contract.

M3 is due Monday, October 5. Continue using its required signatures and scope. The next session introduces refactoring and code smells.

## Further reading

These original explanations support the definitions used here:

- Robert C. Martin, [The Single Responsibility Principle](https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html)
- Robert C. Martin, [The Interface Segregation Principle](https://objectmentor.com/resources/articles/isp.pdf)
- Robert C. Martin, [The Dependency Inversion Principle](https://objectmentor.com/resources/articles/dip.pdf)

---

## INSTRUCTOR ONLY

### Timing and emphasis

**75 minutes:** context and goals 8, SRP 10, OCP 10, LSP 10, ISP 10, DIP 8, paired exercise and discussion 12, SOLID and AI 4, recap and exit question 3.

Use the optional mixed-responsibility review and promotion extension only if time remains. Preserve the context setup, all five definitions, and the M3 exercise. Use the exit response to check reasoning rather than acronym recall.

### Starting point

Assume completed M2 and M3 in progress. Ask students to name a method shared by `Knight` and `Pawn`, then explain what M3 adds. Avoid polling that implies `apply`, `undo`, or `legalMoves` should already be finished. Students can use the scaffold and handout throughout.

The lesson requires no M4 or later implementation. If a student raises later work, acknowledge it briefly and return to M3's current responsibilities. Do not direct students to move `legalMoves` out of `Game` during this exercise.

### Discussion prompts

- **SRP:** “What extra information would Board need to decide whose turn it is?” Expected: game state that belongs to `Game`.
- **OCP:** “Which caller stays unchanged when a new piece implements the contract?” Expected: the movement caller. Ask separately about enum, construction, and display integration.
- **LSP:** “Does a pawn attack the empty square directly ahead?” Expected: no. Its forward diagonals are attack squares, including when empty. Distinguish different results from a changed contract.
- **ISP:** “Which operations does a renderer need?” Expected: board reading. The hypothetical `BoardView` separates that dependency. Reiterate that students should not add it to M3.
- **DIP:** “Where does the collection loop name Knight?” Expected: nowhere. Identify the loop's policy, the concrete movement details, and `Piece` as their shared abstraction.

### Exercise discussion

Show the follow-up slide with the Main call sequence only after pairs have worked. Use the responsibilities table in these notes as the answer reference. Ask for the reason before the principle name.

For item 2, the required `Game.play` guard checks membership in `legalMoves()` and throws `IllegalArgumentException` when the supplied move is outside it. For item 3, `findLegalMove` searches that list by notation and returns an `Optional`; it is more than parsing two coordinates. For item 4, accept `Game.legalMoves()` as specified in M3. For item 5, distinguish the renderer's formatting from `Main`'s decision to print.

The promotion extension has two accepted answers, with the costs stated in section 9. Do not turn that tradeoff into a ban on all switches or an exercise requiring new architecture.

### Speaker notes and handout

Visible slides address students directly. Keep delivery instructions, assumptions about student progress, and editorial caveats in the hidden speaker notes. Retain student-facing questions, code explanations, and labels identifying hypothetical designs.

The slide order follows these sections. On each slide, first establish the situation in the left column, then trace the code in the right panel, and connect the annotation beneath it to the principle. Slide speaker notes contain short prompts and expected answers. These written notes supply the explanations a student needs without having attended class. Keep this instructor-only section separable from the student handout.
