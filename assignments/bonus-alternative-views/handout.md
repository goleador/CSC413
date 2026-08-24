# Bonus: Add a New View

**Course:** CSC 413 Software Development
**Type:** Optional / extra credit
**Objectives advanced:** 2 (abstraction, interfaces), 6 (MVC, separating logic from presentation)
**Prerequisite:** the chess engine playing a complete game in the console

---

## The idea

The chess engine draws the board with letters. Your job is to make it draw the
board some *other* way — and to do it without touching the rules.

There is exactly one rule for this assignment, and it is the whole assessment:

> **You may not change anything in `model/`, `engine/`, or `factory/`.**
> You may not change `GameController` either.

If you find yourself wanting to, stop and re-read the interface. Needing to edit
the model in order to change how something *looks* is the exact problem this
architecture exists to prevent, and noticing that pressure is most of the lesson.

Everything you write goes in `view/`, plus one line in `Main`.

---

## What you have to work with

`BoardView` is the seam. A view has to answer three questions:

```java
void render(Game game);                      // draw the position
void showMessage(String message);            // say something to the player
void start(GameController controller);       // run the game your way
```

and may optionally answer three more, which have sensible defaults:

```java
default PlayerAction nextAction(Game game);  // what does the player want to do?
default PieceType promotionChoice(Game game);// what should this pawn become?
default void close();                        // clean up
```

Two helpers already exist so you do not have to rewrite the board layout:

- **`TextBoardRenderer`** — turns a `Board` into lines of text. Give it a glyph
  set and, optionally, which side of the table to draw from.
- **`PieceGlyphs`** — decides what a single square looks like. `LETTERS` and
  `FIGURES` are provided; a new one is a lambda.

Read `EmojiView` before you start. It is about thirty lines, and it is the whole
pattern.

---

## Pick one

### Tier 1 — A new glyph set (easiest)

Write a `PieceGlyphs` and a view that uses it. Ideas: colour the pieces with ANSI
escape codes, use letters but mark the last move, shade the dark squares.

⚠️ **Alignment gotcha.** The provided `FIGURES` uses Unicode *chess symbols*
(U+2654–U+265F: ♔♕♖♗♘♙♚♛♜♝♞♟). Those occupy one terminal column each. True emoji
(🏰, 🐴) are **double-width** and will shear every column out of line. If your
board looks like a staircase, this is why.

### Tier 2 — A bordered board

Draw the board inside box-drawing characters, one cell per square:

```
  ┌───┬───┬───┬───┬───┬───┬───┬───┐
8 │ ♜ │ ♞ │ ♝ │ ♛ │ ♚ │ ♝ │ ♞ │ ♜ │
  ├───┼───┼───┼───┼───┼───┼───┼───┤
7 │ ♟ │ ♟ │ ♟ │ ♟ │ ♟ │ ♟ │ ♟ │ ♟ │
```

`TextBoardRenderer` does not do borders, so you will write your own layout loop.
Iterate `board.pieceAt(new Position(file, rank))` — that is all the model access
you need.

### Tier 3 — A window (Swing)

⚠️ **A reference `SwingView` now ships with the project**, so this tier is no
longer open-ended: read `view/swing/SwingView.java` first, then either extend it
(drag-and-drop, captured-piece tray, move list, animation) or write your own from
scratch without looking. Say which you did in your README.

A real graphical board: an 8×8 grid of buttons, click a piece then click a
destination. `javax.swing` ships with the JDK, so there is **nothing to install
and no dependency to add**.

Three things you will need to know:

1. **Your `start()` returns immediately.** Do not call `controller.runLoop()` —
   that method is for views that can sit and wait for someone to type. Show your
   window and return. The game then runs on clicks.
2. **Your click handler calls `controller.handle(...)` directly.** Two clicks
   make a move:
   ```java
   controller.handle(new PlayerAction.Move(fromSquare + toSquare));
   ```
   An Undo button calls `controller.handle(new PlayerAction.Undo())`. Notice it
   builds the action — it does **not** spell out the word "undo" as text.
3. **Never implement `nextAction`.** If you do, and something calls it, your
   window will freeze solid. The default throws a clear exception on purpose so
   you find out immediately instead of staring at a hung program.

You will probably also want to override `promotionChoice` with a `JOptionPane`,
so the player can underpromote.

### Tier 4 — Something else

A web board over a local HTTP server, a 3D board, a view that speaks the moves
aloud. Talk to me first so we can scope it.

---

## Wiring it up

One line in `Main.chooseView`:

```java
case "mine" -> new MyView();
```

Then `java -jar target/chess-1.0-SNAPSHOT.jar mine`.

---

## What you submit

1. Your view class (or classes) in `view/`.
2. The one-line change in `Main`.
3. **A short README (half a page)** answering:
   - Which `BoardView` methods did you implement, and which defaults did you take?
   - Did you ever *want* to change something in `model/` or `engine/`? What, and
     how did you avoid it?
   - What would break if `Board.toString()` were still doing the drawing?

The README carries real weight. Being able to explain the design decision is the
skill being assessed — a working view with no explanation is worth less than a
rough view you can justify.

---

## How it is graded

| | |
|---|---|
| Plays a complete game through the new view | 40% |
| `model/`, `engine/`, `factory/`, `GameController` untouched | 30% |
| README explains the design honestly | 20% |
| Code quality — names, small methods, comments on the *why* | 10% |

That second row is checked mechanically:

```bash
git diff --stat main -- src/main/java/edu/sfsu/csc413/chess/model/ \
                        src/main/java/edu/sfsu/csc413/chess/engine/ \
                        src/main/java/edu/sfsu/csc413/chess/factory/
```

Empty output, and you used the seam. **All existing tests must still pass** —
if they do not, you changed something you should not have.

---

## A hint you will want later

If your board looks upside-down, remember that flipping it means inverting
**both** ranks and files. Flipping only the ranks is the classic mistake, and it
shows up as the king and queen appearing to have swapped squares.
