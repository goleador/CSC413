# Session 11 — instructor-only notes

## Plan (75 min)

| Min | Segment |
|---|---|
| 0–5 | Where `Game` is tonight. The next rule. "Where does it go?" Take three answers, settle nothing. |
| 5–25 | The six questions, in pairs. Pairs write their answer to Q3 and Q5 on paper before you take answers. |
| 25–35 | Name it: refactoring, observable behavior, the smells in this story. |
| 35–45 | IntelliJ, on the follow-along repository's M2 pieces (see below). |
| 45–55 | Refactor first, then the feature. M4 is one hat, M5 the other. |
| 55–70 | Exit work: everyone opens their own `Game.legalMoves()`, lists the fields it reads, writes the signature they would want. Index card, handed in. |
| 70–75 | The `report` method on the last slide, if there is time; otherwise it is exercise 5. |

## The six questions: expected answers and the wrong turns

| Question | Steer to | Wrong turn, and the reply |
|---|---|---|
| When is a king in check? | An enemy piece could capture it next move. | "When it is attacked." Fine; ask what *attacked* means in code. |
| How do you know whether one enemy piece could? | Ask the piece: `pseudoLegalMoves` / `attacks`. | "Check its type and compute." That is the `switch` M2 removed. Say so. |
| How do you know whether *any* enemy piece could? | Walk the enemy's pieces, ask each. You wrote that walk: `legalMoves()`. | "Generate the enemy's *legal* moves." Park it: legal needs king safety, which needs this, which is circular. Do not go further; that is M5's design. |
| Can `legalMoves()` answer it for the enemy? | No: wrong colour, wrong class, wrong board. | "Flip `sideToMove`, call it, flip back." Good instinct, terrible code: a query that mutates the game. Name it. |
| What does the walk need? | A board and a colour. It reads a field instead. | "The game." Ask which part of the game. |
| Whose method is it? | A class that only answers position questions; no state; static. | "Board." M1: Board stores, it does not decide. |

Close with: "You just designed M4. The handout has the names. We are going to
practise the moves on something you finished a week ago, and then you do it
on `Game` at home."

**Do not** open `Game` on the projector; M3 is due tonight. **Do not** say
`MoveGenerator`, `pseudoLegalMoves(Board, Color)`, or `isAttacked`. The
handout says the first two; the third is M5.

## IntelliJ segment (min 35–45)

Repository: `~/Workspace/SFSU/CSC413-chess-f26-student`. Open **only**
`Rook.java` and `Piece.java`. Its `Game.java` is M3 complete; keep it closed.
Run `PieceMovementTest` once from the gutter first.

1. In `Rook.pseudoLegalMoves`, cursor on `slidingMoves`, **⌥⌘N / Ctrl+Alt+N**
   (Inline). Choose "inline this invocation only". Rook now carries its own
   loop. Tests: green. *"Nothing changed. That is a refactoring too."*
2. Select the loop, **⌥⌘M / Ctrl+Alt+M** (Extract Method), name it
   `slidingMoves`. Point at `DIRECTIONS` inside the body: *"two parameters in
   the signature, three inputs in the body."*
3. **⌘F6 / Ctrl+F6** (Change Signature): add `int[][] directions`, default
   `DIRECTIONS`; replace the field use in the body. *"Now the signature tells
   the truth. Hold that thought for `sideToMove`."*
4. **⌃T / Ctrl+Alt+Shift+T** → Pull Members Up → `Piece`, protected. Tests
   green. *"It moved. It was not copied. That sentence is M4's grading
   rubric."*
5. `git checkout -- .` and say so: the file is back where it started, which
   is the only way to know you did four refactorings and zero features.

Ten minutes. If it runs long, skip step 4 and describe it.

## Exit card (min 55–70)

What a good card says: *reads `board` and `sideToMove`; both could be
arguments; wants something like `List<Move> ...(Board board, Color color)`.*
Anyone who writes a method body has gone too far; anyone who writes "put it
on Board" gets exercise 1 back with "M1: Board stores" written on it.

## Exercise solutions

**1.** As above. The handout's two methods have exactly that shape.

**2.** (a) Refactoring: nothing observable changes; no test notices.
(b) Not a refactoring: a caller can `clear()` the game's memory; the M3
rubric names it, and any history test can be made to fail through the leak.
(c) Not a refactoring: a different list order is observable even if
`twentyMovesAtStart` still passes because it counts. Good discussion: "no
test notices" is not the same as "behavior is unchanged". (d) Refactoring,
and it is M4.

**3.** `Pawn`. It moves straight and captures diagonally, so "is `target`
among my moves" reports the square ahead as attacked and the empty diagonals
as safe. In M5 a king diagonally in front of a pawn would be called safe and
a king straight ahead would be called in check.

**4.** The generator test compares two lists; two copies of one loop agree.
Read the diff: the loop appears once and `Game.legalMoves()` is one line.

**5.** Any two of: Mysterious Name (`s`, `m`, `n`) → Rename; Duplicated Code
(the substring formatting twice) → Extract Function; the magic numbers 1, 2,
3 for the result → an enum; Primitive Obsession on the move strings → a
`Move` record; Long Function (lists moves *and* states the result) → two
extractions. String concatenation in a loop is a performance habit, not a
smell for us.
