# Session 11 live demo — instructor only

Ten refactoring steps from `before/` to `after/`, about 25 minutes, tests after
every step. The same nine characterization tests pass unchanged at every step.

## Before class

```bash
./build-demo-repo.sh ~/Desktop/refactoring-demo
cd ~/Desktop/refactoring-demo
git checkout step-00          # the smelly version
git checkout -b live          # the branch you refactor on
./mvnw test                   # Tests run: 9, Failures: 0, Errors: 0
```

Open the folder in IntelliJ. Pin `TurnHandler.java` and `TurnHandlerTest.java`.
Set the font to at least 18 pt. Run the test class once from the gutter so
the run configuration exists, then the shortcut below reruns it.

**If a step goes wrong:** `git reset --hard step-NN` puts the `live` branch at
the state *after* step NN. Continue from the next step. The tags are:

| Tag | State |
|---|---|
| `step-00` | before: smelly `handleTurn`, tests green |
| `step-01` … `step-10` | after that step |
| `main` | identical to `step-10` and to `after/` |

Each step's exact diff is in `steps/00NN-*.patch` if you need to read it on the
projector.

## Shortcuts used

| Action | macOS | Windows / Linux |
|---|---|---|
| Rename | ⇧F6 | Shift+F6 |
| Extract Method | ⌥⌘M | Ctrl+Alt+M |
| Extract Variable | ⌥⌘V | Ctrl+Alt+V |
| Inline | ⌥⌘N | Ctrl+Alt+N |
| Change Signature | ⌘F6 | Ctrl+F6 |
| Move | F6 | F6 |
| Refactor This (menu of everything else) | ⌃T | Ctrl+Alt+Shift+T |
| Rerun tests | ⌃R | Shift+F10 |
| Local history (your safety net) | Right-click file → Local History | same |

## The steps

Before each step, ask the room **"what next?"** and take two answers before
you say which one you are doing. The order below is one reasonable order,
not the only one. If the room picks a step you have planned later, take it;
the tags still work because every state is green.

---

### Step 1 — Rename every cryptic name (2 min)

**Smell:** Mysterious Name. `p`, `x`, `y`, `x2`, `y2`, `tmp`, `flag`, `chk`,
`a b c d`, `sx sy f r`.
**Refactoring:** Rename Variable, Change Function Declaration.
**IntelliJ:** cursor on each name, **⇧F6 / Shift+F6**, type the new name, Enter.

| Old | New |
|---|---|
| `x`, `y`, `x2`, `y2` | `fromFile`, `fromRank`, `toFile`, `toRank` |
| `p` | `piece` |
| `tmp` | `target` |
| `dx`, `dy` | `fileDelta`, `rankDelta` |
| `flag` | `movementAllowed` |
| `dir`, `start` | `direction`, `startRank` |
| `chk(a, b, c, d)` | `isPathClear(fromFile, fromRank, toFile, toRank)` |
| in the print loop: `r`, `f`, `q`, `sb` | `rank`, `file`, `occupant`, `line` |
| in `symbolAt`: `x`, `y`, `p` | `file`, `rank`, `piece` |

Say while renaming: *"I have not understood this method yet. Renaming is how I
read it. Every rename is a small claim about what the thing is, and the
compiler checks that I renamed every use."* Do not rename all of them live;
six or seven is enough, then paste the rest from the patch or skip ahead
with `git reset --hard step-01`.

**Run tests now — expect 9 green.** `git commit -am "Step 1: rename"`

---

### Step 2 — Extract Method `isOffBoard` (2 min)

**Smell:** Duplicated Code. The bounds check appears twice, once for each
square.
**Refactoring:** Extract Function.
**IntelliJ:** select the expression
`fromFile < 0 || fromFile > 7 || fromRank < 0 || fromRank > 7`, **⌥⌘M /
Ctrl+Alt+M**, name it `isOffBoard`, parameters `file`, `rank`. IntelliJ
finds the second copy and asks *"Process duplicates?"* — **Yes**. Make it
`static` (it uses no fields; IntelliJ offers this).

Say: *"The IDE found the duplicate for me. If the two copies had drifted, it
would not have, and that is the point: duplicates drift."*

**Run tests now — expect 9 green.** `git commit -am "Step 2: isOffBoard"`

---

### Step 3 — Introduce `Square`, extract `parseSquare` (3 min)

**Smell:** Primitive Obsession, Data Clumps (`file, rank` always travel
together), Magic Number (`- 'a'`, `- '1'`, the `0`/`2` offsets).
**Refactoring:** Replace Primitive with Object, Extract Function.
**IntelliJ:**
1. New Java file `Square`: a record `Square(int file, int rank)`. Type it;
   it is three lines. Give it `isOnBoard()`; **Move** (F6) the body of
   `isOffBoard` into it and invert the condition, or just type it.
2. In `handleTurn`, select the two lines that compute `fromFile` and
   `fromRank` and type the replacement `Square from = parseSquare(input, 0);`
   then write `parseSquare` as a `private static Square` below. Do the same
   for `to` with offset `2`. Use **⌥⌘M** on the expression
   `new Square(text.charAt(offset) - 'a', text.charAt(offset + 1) - '1')` if
   you want the IDE to do the method.
3. `symbolAt` now calls `parseSquare(square, 0)`: the third copy of the
   parse disappears.
4. `Board.get`/`Board.set` take a `Square`. Use **Change Signature (⌘F6 /
   Ctrl+F6)** on `get` to see the dialog, then replace the two `int`
   parameters with one `Square square` and fix the body and the callers.
   `isPathClear` takes two `Square`s.

Say: *"Two ints that always travel together are one thing with no name. Once
it has a name, the bounds check has a home."*

**Run tests now — expect 9 green.** `git commit -am "Step 3: Square"`

---

### Step 4 — Extract `MoveParser` and a `Move` record (3 min)

**Smell:** Primitive Obsession (the move is a `String` for 40 lines), Long
Function. Three `Cannot read move` branches say the same thing.
**Refactoring:** Extract Function, Move Function, Replace Primitive with
Object, Consolidate Conditional Expression.
**IntelliJ:**
1. New record `Move(Square from, Square to, String notation)`.
2. New class `MoveParser` with `static Optional<Move> parse(String input)`:
   the length check, both `parseSquare` calls, both `isOnBoard` checks,
   `Optional.empty()` on any failure. **Move** (F6) `parseSquare` from
   `TurnHandler` to `MoveParser` and make it `public`.
3. `handleTurn` opens with
   `Optional<Move> parsed = MoveParser.parse(input);` and one
   `Cannot read move` branch.
4. `history.add(move.notation())`.

Ask before you start: *"Which of these forty lines would you want to test
without a board?"* The parse. *"Then it wants to be its own thing."*

**Run tests now — expect 9 green.** `git commit -am "Step 4: MoveParser"`

---

### Step 5 — Extract `printBoard`, move it to `BoardPrinter` (2 min)

**Smell:** Divergent Change. Changing how the board looks means editing the
method that decides whether a move is legal.
**Refactoring:** Extract Function, then Move Function into a new class
(Extract Class).
**IntelliJ:** select from `for (int rank = 7 ...` through the
`"   a b c d e f g h"` line, **⌥⌘M**, name `printBoard`. Then cursor on
`printBoard`, **F6**, target: a new class `BoardPrinter`, method name
`print`, parameter `board`. Add `private final BoardPrinter printer = new
BoardPrinter();` to `TurnHandler`.

Say: *"The output test is the one that would catch me here. Watch it."*

**Run tests now — expect 9 green.** `git commit -am "Step 5: BoardPrinter"`

---

### Step 6 — Extract Method `isValidMovement` (2 min)

**Smell:** Long Function. This is the preparation for step 7; on its own it
only names the switch.
**Refactoring:** Extract Function.
**IntelliJ:** select from `int fileDelta = ...` through the closing brace
of the `else if (piece.type == 'P')` block, **⌥⌘M**, name
`isValidMovement`. IntelliJ sees that `movementAllowed` is the only value
flowing out and makes the method return `boolean`. Parameters: `piece`,
`from`, `to`, `target`.

Ask: *"Now that it has a name, who should own it?"* Wait for *"the piece."*

**Run tests now — expect 9 green.** `git commit -am "Step 6: isValidMovement"`

---

### Step 7 — Replace Conditional with Polymorphism (5 min)

**Smell:** Repeated Switches. Session 6 made this argument on the real
engine; today they watch it happen.
**Refactoring:** Replace Conditional with Polymorphism, Encapsulate Variable
(`piece.white` → `piece.isWhite()`), Move Function (`isPathClear` → `Board`).
**IntelliJ:**
1. `Piece`: **Refactor This (⌃T / Ctrl+Alt+Shift+T) → Encapsulate Fields** on
   `white`; delete the getter for `type` and rename the field `letter`.
   Add `public abstract boolean canMoveTo(Board board, Square from, Square
   to);` and make the class and constructor `abstract` / `protected`.
2. Create `Knight`, `King`, `Rook`, `Bishop`, `Queen`, `Pawn`. Each
   constructor is `super('N', white)`; each `canMoveTo` body is the matching
   branch of `isValidMovement`, with `fileDelta`/`rankDelta` computed from
   `from` and `to`. Type two of them live (`Knight`, `Rook`); paste the rest
   from `steps/0007-*.patch`, or `git reset --hard step-07` and show the result.
3. **F6** `isPathClear` to `Board` (it only reads the board). The sliding
   pieces call `board.isPathClear(from, to)`.
4. `Board.initial()` builds subclasses. The `switch` on the letter moves
   into one private `create` method: *this* switch is construction and
   stays. Compare with `PieceFactory.create` in the engine.
5. `isValidMovement` is now one line, `return piece.canMoveTo(board, from,
   to);`. Cursor on it, **⌥⌘N / Ctrl+Alt+N** to inline it.

Say: *"The switch asked the piece what it was and then did its job for it.
Now nobody asks."*

**Run tests now — expect 9 green.** `git commit -am "Step 7: Piece hierarchy"`

---

### Step 8 — Decompose Conditional in `Pawn` (2 min)

**Smell:** the three-line boolean in `Pawn.canMoveTo`. Fowler files it under
Long Function and Comments; the test is whether you can read it aloud.
**Refactoring:** Decompose Conditional (three Extract Functions), Extract
Variable (`stepAhead`), Extract Function for `forward()` and `startRank()`.
**IntelliJ:** select the first parenthesised clause, **⌥⌘M**, name
`isSingleStep`. Second clause, `isDoubleStepFromStart`. Third,
`isDiagonalCapture`. Then `canMoveTo` reads as three questions joined by `||`.

Ask the room to read the result aloud. That is the test.

**Run tests now — expect 9 green.** `git commit -am "Step 8: pawn conditions"`

---

### Step 9 — Extract `play` and `announce` (2 min)

**Smell:** Divergent Change again. The last six lines of `handleTurn` change
the board, the history, the turn, and the screen.
**Refactoring:** Extract Function twice.
**IntelliJ:** select the four lines from `board.set(to, piece)` through
`whiteToMove = !whiteToMove;`, **⌥⌘M**, name `play`, parameter `move`
(replace `piece` inside with `board.get(move.from())`). Select the two
output lines, **⌥⌘M**, name `announce`, parameters `mover`, `move`.

Say: *"Now there is a method that changes state and never prints, and one
that prints and never changes state. Wednesday is about why that matters."*

**Run tests now — expect 9 green.** `git commit -am "Step 9: play/announce"`

---

### Step 10 — Extract `isLegal`, inline the leftovers (2 min)

**Smell:** three `Illegal move` branches that each print the same line.
**Refactoring:** Consolidate Conditional Expression, Extract Function,
Inline Variable.
**IntelliJ:** select from `Piece piece = board.get(from);` through the
`canMoveTo` check, **⌥⌘M**, name `isLegal`, parameter `move`. Make each
branch `return false` and the last line `return piece.canMoveTo(...)`. In
`handleTurn`, inline `from` and `to` (**⌥⌘N**) now that only `isLegal`
uses them.

Read the finished `handleTurn` aloud: *parse it; if it is not legal, say so;
otherwise play it and announce it.* Four sentences, four lines.

**Run tests now — expect 9 green.** `git commit -am "Step 10: isLegal"`

---

## After the demo

```bash
git diff step-00 live --stat
git diff step-00 live -- src/test
```

The second diff is empty. Say so out loud; it is the whole argument.

## If you are short on time

Do steps 1, 2, 5, 6, 7 live (about 13 minutes) and `git reset --hard
step-10` for the rest, then walk the finished `handleTurn` on the slide.
Step 7 is the one they must see happen.
