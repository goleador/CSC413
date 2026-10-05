# Session 11 — instructor-only notes

## Plan (75 min)

| Min | Segment |
|---|---|
| 0–10 | Session 7 was a refactoring. The payoff arrived in M2: `attacks` was one override, not a second switch. Ask them to open their `Pawn`. |
| 10–15 | The slide loop: one copy or three? Show of hands. "We will break one in a minute." |
| 15–25 | Live: the drift demo (below). |
| 25–40 | The next change, both ways. King safety in words, then the two columns. Pairs fill the table before you reveal rows. |
| 40–50 | Definition, observable behavior, the smells named, the three IDE moves. |
| 50–60 | Live: the way back (below). The parallel table. |
| 58–62 | Refactor first, then the feature. M4 is one hat, M5 the other. |
| 62–67 | Refactoring in the real world: reasons that hold up, reasons that do not. Refactoring with AI. Three slides, read fast; the notes carry the detail. |
| 67–75 | Exit card on their own `Game.legalMoves()`. |

## Opening (min 0–10)

Session 6's `movesFor` switch slide is in `../session-06-piece-hierarchy/slides.html#6`
if you want the original on screen. The sentence to land: "Nothing the
program did changed that day. One week later M2 asked for `attacks`, and the
bill came in: one override in `Pawn`. In the switch design, six cases." Make
them open `Pawn.attacks` in their own repository and look at it.

## Live, part one: drift (min 15–25)

Repository: `~/Workspace/SFSU/CSC413-chess-f26-student`. Open **only**
`Rook.java`, `Piece.java`, `PieceMovementTest.java`. `Game.java` is M3
complete; keep it closed. Run `PieceMovementTest` once first.

1. In `Rook.pseudoLegalMoves`, cursor on `slidingMoves`, **⌥⌘N / Ctrl+Alt+N**,
   "inline this invocation only". Rook now has its own copy. Run tests: green.
   *"Still a refactoring. I just made the shape worse."*
2. In Rook's copy, change `if (occupant.color() != color())` to
   `if (occupant.color() != color() || true)` or simply delete the `break`.
   Run tests: `rookBlocking` red, `queenCombinesDirections` green.
   *"Two copies. I touched one. The queen still uses the other. If this were
   a fix instead of a break, the queen would still have the bug and the test
   would tell me everything is fine."*
3. Undo the break (⌘Z / Ctrl+Z once). Leave the inlined copy in place for
   part two.

## Live, part two: the way back (min 50–60)

4. Select Rook's loop, **⌥⌘M / Ctrl+Alt+M**, name `slidingMoves`. Point at
   `DIRECTIONS` in the body: *"two parameters in the signature, three inputs
   in the body."*
5. **⌘F6 / Ctrl+F6** on it: add `int[][] directions`, default `DIRECTIONS`;
   replace the field use in the body. *"Now the signature tells the truth.
   Hold that thought for `sideToMove`."*
6. **⌃T / Ctrl+Alt+Shift+T** → Pull Members Up → `Piece`. IntelliJ will
   report the existing `Piece.slidingMoves`; choose to replace it, or delete
   the old one by hand. Tests green.
7. `git checkout -- .` and say so: *"The file is back where it started. Four
   refactorings, zero features, and every step had a green bar."*

If short on time, do steps 1 to 3 only and describe 4 to 7 with the parallel
table on the slide.

## The two columns (min 25–40)

Do not write any king-safety code. The words on the slide are the whole
sketch. If someone asks "so do we call `legalMoves` for the enemy?", the
answer is no: same walk over the other color's squares, asking each piece
`attacks`, because a pawn's attacks are not its moves. Go no further; that
is M5's design.

**Do not** say `MoveGenerator`, `pseudoLegalMoves(Board, Color)`, or
`isAttacked`. The handout says the first two; the third is M5.

## Real world and AI (min 62–67)

Three slides. The question to ask on the first: "name the change it serves."
On the AI slide, the line to land is rule 5: a regenerated file is not a
refactoring, you cannot review it, ask again smaller. If someone asks whether
they may use an assistant for M4, the answer is the course policy plus rule
9: you must be able to explain every line, and the exit card is where that
starts.

## Exit card (min 67–75)

A good card: *reads `board` and `sideToMove`; both could be arguments; wants
something that takes a `Board` and a `Color` and returns a `List<Move>`.*
Anyone writing a method body has gone too far. Anyone writing "put it on
`Board`" gets "M1: Board stores" written back.

## Exercise solutions

**1.** As above. The handout's two methods have exactly that shape.

**2.** Nothing to grade; ask on Wednesday who had three copies.

**3.** (a) Refactoring; no test notices. (b) Not: a caller can `clear()` the
game's memory; the M3 rubric names it. (c) Not: order is observable even if
`twentyMovesAtStart` still passes because it counts. "No test notices" is
not "behavior unchanged". (d) Refactoring, and it is M4.

**4.** The generator test compares two lists; two copies of one loop agree.
Read the diff: the loop appears once and `Game.legalMoves()` is one line.

**5.** Any two of: Mysterious Name (`s`, `m`, `n`) → Rename; Duplicated Code
(the substring formatting twice) → Extract Function; magic numbers 1, 2, 3 →
an enum; Primitive Obsession on the move strings → a `Move` record; Long
Function → two extractions. String concatenation in a loop is not a smell
for us. The cleaned version is on the slide after the exercise; it keeps the
trailing space after White's move on purpose, because the exercise is
refactoring, and fixing that is a behavior change for another commit.
