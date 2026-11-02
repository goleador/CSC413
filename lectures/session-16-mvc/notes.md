# Session 16 — Model, View, Controller

**Week 11, Monday November 2 · CSC 413 Software Development · on Zoom**

**Objective advanced:** 6 (separate logic from presentation; MVC)

**Milestones:** M5 is due tonight at 11:59 PM. M6 opens today: the
controller, written by hand, and the end of the game (checkmate and
stalemate).

Since M1 your `Main` has built a `Game`, played a few moves written into
the source, and printed the board. What it cannot do yet is play against a
person. The obvious fix is a loop in `Main` that reads a move, checks it,
plays it, and prints the result. This session is about why that loop turns
into a tangle, and how to split it so it doesn't, in any program you write.

> **Ask three questions of every piece of code.** Is it a rule? Is it what
> the user sees or types? Does it take a request, run the rule, and tell
> the view? Model, view, controller. Then keep the arrows pointing one
> way: the model knows nothing about the other two.

The first half of these notes works on a small game, tic-tac-toe. The
second half applies the same ideas to the chess engine.

## 1. The problem

This is the `Main` from the M3 handout, which every one of you wrote in
some form:

```java
Game game = new Game();
TextBoardRenderer renderer = new TextBoardRenderer(PieceGlyphs.LETTERS);
System.out.println(renderer.render(game.board()));

for (String notation : List.of("e2e4", "e7e5")) {
    game.play(game.findLegalMove(notation).orElseThrow());
}
System.out.println(renderer.render(game.board()));
```

What is missing to make this a game is a player: the moves are fixed in the
source.

To see where the obvious fix leads, take a smaller game: tic-tac-toe.
Squares are numbered 1 to 9; X and O take turns; three in a row wins. Here
it is as one method that draws the board, reads a square, and applies the
rules:

```java
public static void main(String[] args) {
    Scanner in = new Scanner(System.in);
    char[] cells = ".........".toCharArray();
    char turn = 'X';
    while (true) {
        for (int row = 0; row < 3; row++) {
            System.out.println(new String(cells, row * 3, 3));
        }
        System.out.print(turn + " to move (1-9): ");
        int square = Integer.parseInt(in.nextLine().trim()) - 1;
        if (cells[square] != '.') {
            System.out.println("That square is taken.");
            continue;
        }
        cells[square] = turn;
        if (hasLine(cells, turn)) {     // three in a row? (not shown)
            System.out.println(turn + " wins!");
            return;
        }
        turn = (turn == 'X') ? 'O' : 'X';
    }
}
```

It works:

```
X..
O..
...
X to move (1-9): 4
That square is taken.
X..
O..
...
X to move (1-9): 2
XX.
O..
...
```

Nothing is wrong with the output. The trouble starts when the program has
to change:

- **To test the rules, someone has to type.** The rules are inside a
  `Scanner` loop, so no unit test can reach them.
- **A second screen means copying the rules.** A window with nine buttons
  needs the same rules, and there is no way to share them.
- **To change how the board looks, you read past the rules.** Drawing and
  logic are in the same loop.

## 2. Three questions

Ask these of any line of code:

| Ask of a line of code | If yes, it belongs to |
|---|---|
| Is it a rule, or the state the rules work on? | **Model** |
| Is it what the user sees, or how they type or click? | **View** |
| Does it take a request, run the rule, and tell the view? | **Controller** |

The model is the game itself; it would be the same behind any screen. The
view is the screen and the keyboard. The controller is the connection
between them.

Here are eight lines from the tic-tac-toe `main`:

| # | Line | Role |
|---|---|---|
| 1 | `char turn = 'X';` | M: the state |
| 2 | `System.out.println(new String(cells, row * 3, 3));` | V: reads the state |
| 3 | `System.out.print(turn + " to move (1-9): ");` | V |
| 4 | `int square = Integer.parseInt(in.nextLine().trim()) - 1;` | V: a window has clicks, not numbers |
| 5 | `if (cells[square] != '.') { System.out.println("That square is taken."); }` | M and V, mixed |
| 6 | `cells[square] = turn;` | M: the rule |
| 7 | `if (hasLine(cells, turn))` | M: the rule |
| 8 | `turn = (turn == 'X') ? 'O' : 'X';` | M: the rule |

Line 4 is view because typing a number from 1 to 9 is how *this* screen
names a square; a window would have the player click it. Line 2 reads the
model, but only to display it, which is what a view does.

**Which line is the controller?** None of them. The controller is the
*order*:
1. Get a request (square 5).
2. Run the rule: is it taken? Place the mark, check for a line, switch
   turns.
3. Tell the view: a message, then the board.

In the one-method version that order is hidden in the shape of the loop.
Pulling it out gives it a name.

**Splitting line 5.** Line 5 decides (a taken square can't be played) and
displays (the words "That square is taken."). Split it: the model decides
and returns an answer with no wording, and the view decides how that
answer looks.

```java
// in the model
public Outcome play(int square) {
    if (cells[square] != '.') {
        return Outcome.TAKEN;
    }
    ...
}

enum Outcome { PLAYED, TAKEN, WON }
```

```java
// in the view
public void report(Outcome outcome) {
    switch (outcome) {
        case TAKEN -> System.out.println("That square is taken.");
        case WON -> System.out.println("Three in a row!");
        case PLAYED -> { }
    }
}
```

Doing that for every line gives three parts.

**Model.** The state and the rules, with no input or output. It would be
the same class behind a terminal, a window, or a web page.

```java
public class TicTacToe {

    private final char[] cells = ".........".toCharArray();
    private char turn = 'X';

    public char cell(int square) { return cells[square]; }

    public char turn() { return turn; }

    public Outcome play(int square) {
        if (cells[square] != '.') {
            return Outcome.TAKEN;
        }
        cells[square] = turn;
        if (hasLine(turn)) {
            return Outcome.WON;
        }
        turn = (turn == 'X') ? 'O' : 'X';
        return Outcome.PLAYED;
    }

    private boolean hasLine(char mark) { ... }
}
```

**View.** An interface that says what every tic-tac-toe view does (draw the
board, report what happened, take input), and a console view. The console
view draws by reading the model, and takes input by turning each typed
number into a call on the controller. It never calls `game.play` itself.

```java
public interface TicTacToeView {

    void show(TicTacToe game);

    void report(Outcome outcome);

    void start(TicTacToeController controller);
}
```

```java
// in ConsoleTicTacToeView
public void show(TicTacToe game) {
    for (int row = 0; row < 3; row++) {
        System.out.println("" + game.cell(row * 3)
                + game.cell(row * 3 + 1)
                + game.cell(row * 3 + 2));
    }
}

public void start(TicTacToeController controller) {
    while (in.hasNextLine()) {
        int square = Integer.parseInt(in.nextLine().trim()) - 1;
        controller.play(square);
    }
}
```

**Controller.** One method per request. It runs the rule on the model, then
tells the view: the order from above, now with a name.

```java
public class TicTacToeController {

    private final TicTacToe game;
    private final TicTacToeView view;

    public void start() {
        view.show(game);
        view.start(this);
    }

    public void play(int square) {
        view.report(game.play(square));
        view.show(game);
    }
}
```

(The constructor, which stores `game` and `view`, is left out.) `Main`
creates a `TicTacToe`, a view, and a controller, and calls `start()`.

## 3. The dependency rule

![Class diagram. TicTacToeController holds a TicTacToe and a TicTacToeView. ConsoleTicTacToeView implements TicTacToeView and reads TicTacToe. TicTacToe has no arrows out.](diagrams/svg/tictactoe.svg)

Follow the arrows. The controller knows the model and the view interface.
The view reads the model. `TicTacToe` has no arrows out: it knows nothing
about the other two. That is the rule:

- The **model** knows nothing about the view or the controller.
- The **view** reads the model. It never changes it.
- The **controller** changes the model, and holds the view as an
  interface, not a particular class. This is dependency inversion from
  [session 10](../session-10-solid/notes.md) §8.

Why this direction? The model is the part you most want to test and reuse,
so it is the part that must not depend on a screen.

Which of these break the rule?

| In | Code | Breaks it? |
|---|---|---|
| `TicTacToe` | `System.out.println("X wins!");` | Yes: the model knows the screen |
| `ConsoleTicTacToeView` | `game.play(square);` | Yes: the view changes the model |
| `TicTacToeController` | `private final ConsoleTicTacToeView view;` | Yes: tied to one view |
| `ConsoleTicTacToeView` | `game.cell(4)` | No: reading is allowed |

## 4. Three tests

How do you know a split is right? Three tests, each one something you can
run or check in a diff.

**Test 1: the model runs with no screen.** A unit test of `TicTacToe`, with
no typing and nothing printed:

```java
@Test
void threeInARowWins() {
    TicTacToe game = new TicTacToe();
    game.play(0);  game.play(3);    // X, O
    game.play(1);  game.play(4);    // X, O
    assertEquals(Outcome.WON, game.play(2));    // X: top row
}
```

The one-method version can't be tested this way: its rules are inside a
`Scanner` loop.

**Test 2: a new view changes nothing else.** A second view draws a grid
with lines:

```java
public void show(TicTacToe game) {
    for (int row = 0; row < 3; row++) {
        System.out.println(" " + game.cell(row * 3)
                + " | " + game.cell(row * 3 + 1)
                + " | " + game.cell(row * 3 + 2));
        if (row < 2) {
            System.out.println("---+---+---");
        }
    }
}
```

```
 X | X | .
---+---+---
 O | . | .
---+---+---
 . | . | .
```

The files that change: the new view, and one line in `Main` to choose it.
`TicTacToe` and `TicTacToeController` don't change.

**Test 3: a rule changes in one place.** A new rule: O moves first.

```java
private char turn = 'O';    // in TicTacToe; was 'X'
```

One line, in the model. Both views show the change without being edited,
because they read `turn()` and `cell()` from the model.

The three tests apply to any program:

| Test | Passes when |
|---|---|
| The model runs with no screen | you can unit test the rules without typing or clicking |
| A new view changes nothing else | the diff is the new view and the line that chooses it |
| A rule changes in one place | the diff is in the model only |

If one fails, ask the three questions of the code that changed: something
is in the wrong role.

## 5. Input arrives two ways

**A loop asks.** The console view waits in `nextLine()` until the player
presses Enter, then calls the controller:

```java
while (in.hasNextLine()) {
    int square = Integer.parseInt(in.nextLine().trim()) - 1;
    controller.play(square);
}
```

Waiting is fine in a terminal: nothing else has to happen while the player
types.

**Events tell.** In a window, nothing waits. The player clicks, and the
window calls your code. A window view's `start` builds nine buttons and
returns:

```java
for (int i = 0; i < 9; i++) {
    int square = i;
    JButton button = new JButton(" ");
    button.addActionListener(event -> controller.play(square));
    panel.add(button);
}
```

Both call the same `controller.play(square)`. The controller doesn't know
which view called it.

One rule follows: **never wait for input inside a click.** Swing handles
clicks on the same thread that draws the window, so while your code waits
there the window stops responding.

## 6. The same shape elsewhere

| | Model | View | Controller |
|---|---|---|---|
| Tic-tac-toe | `TicTacToe` | console, grid, buttons | `TicTacToeController` |
| A web app | the data and its rules | the page sent back | the code that handles each request |
| A phone app | the data and its rules | the screens | the code that handles each tap |

A web request is an event, like a click: it arrives, calls your code, and
your code sends a page back. Every web framework has a place for each of
the three roles, under its own names.

**Variations you will meet.**

- **Original MVC.** Trygve Reenskaug designed it for Smalltalk in 1979
  (session 15). There the model notifies its views when it changes, which
  is the Observer pattern. In our programs the controller tells the view to
  redraw instead.
- **MVP and MVVM** (Model-View-Presenter, Model-View-ViewModel). The same
  three-way split, wired differently.
- All of them keep the same rule: the model doesn't know the view.
- **It can be overkill.** A 30-line script with one screen and no tests
  doesn't need three classes.

## 7. Chess: the same three roles

The engine you have built since M1 is the model.

| | Tic-tac-toe | Chess |
|---|---|---|
| **Model** | `TicTacToe` | `Game` and everything behind it (M1–M5) |
| **View** | `TicTacToeView`: console, grid, buttons | `BoardView`: `ConsoleView`, `EmojiView`, Swing |
| **Controller** | `TicTacToeController` | `GameController`: you write it in M6 |
| **Request** | `play(square)` | `PlayerAction`: `Move`, `Undo`, `ShowMoves`, `Quit` |

![MVC diagram. The controller changes the model and tells the view to redraw. The view reads the model, and sends the controller what the player asked for.](diagrams/svg/mvc.svg)

**`BoardView`** is given in M6:

<!-- java:ref:view/BoardView.java -->
```java
public interface BoardView {

    void render(Game game);

    void showMessage(String message);

    void start(GameController controller);

    default PlayerAction nextAction(Game game) {
        throw new UnsupportedOperationException(
                getClass().getSimpleName() + " is event-driven, so it does not"
                        + " answer nextAction(). Did it call runLoop() by mistake?");
    }

    default PieceType promotionChoice(Game game) {
        return PieceType.QUEEN;
    }

    default void close() {
    }
}
```
<!-- /java -->

`render`, `showMessage`, and `start` are `TicTacToeView`'s `show`,
`report`, and `start`. The `default` methods are there because views take
input in the two ways from section 5. A console view answers `nextAction`,
which the controller calls in a loop to ask for the next move. A window
never does, so the default throws, and a window that reaches it has a bug
you see at once.

**`PlayerAction`** is given in M6 too. Chess has more kinds of request than
tic-tac-toe (a move, undo, show moves, quit), so instead of a controller
method for each, each request is an object:

<!-- java:ref:view/PlayerAction.java -->
```java
public sealed interface PlayerAction {

    record Move(String notation) implements PlayerAction {}

    record Undo() implements PlayerAction {}

    record ShowMoves() implements PlayerAction {}

    record Quit() implements PlayerAction {}

    static PlayerAction parse(String line) {
        String text = line == null ? "" : line.trim().toLowerCase();
        return switch (text) {
            case "quit", "exit" -> new Quit();
            case "moves" -> new ShowMoves();
            case "undo" -> new Undo();
            default -> new Move(text);
        };
    }
}
```
<!-- /java -->

A typed `undo` and a clicked Undo button both become `new Undo()`, so the
controller handles them the same way. `sealed` means these four are the
only actions there are; the M6 handout explains it.

### The three questions on chess

A view highlights the squares a piece can move to. Is that a rule? It
depends on where the squares come from. This helper asks the model:

<!-- java:highlight/Destinations.java#from -->
```java
static List<Position> from(Game game, Position selected) {
    List<Position> targets = new ArrayList<>();
    for (Move move : game.legalMoves()) {
        if (move.from().equals(selected)) {
            targets.add(move.to());
        }
    }
    return targets;
}
```
<!-- /java -->

```
knight on g1 → [h3, f3]
```

That is view code: it reads `game.legalMoves()` and decides nothing. A view
that works out the knight's L-shaped jumps itself is model code in the
wrong place. Both highlight the same squares today. Then castling is added
to `Game`:

| The view… | Castling squares highlighted? |
|---|---|
| asks `game.legalMoves()` | Yes, with no change to the view. |
| works out the rule itself | No, until someone edits this view, and every other view. |

Test 3 fails for the second view: the rule no longer changes in one place.

### One engine, several views

`ConsoleView` and `EmojiView`, both given in M6, differ in one expression:

```java
new TextBoardRenderer(PieceGlyphs.LETTERS);   // ConsoleView
new TextBoardRenderer(PieceGlyphs.FIGURES);   // EmojiView
```

```
8 r n b q k b n r          8 ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜
7 p p p p p p p p          7 ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟
2 P P P P P P P P          2 ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙
1 R N B Q K B N R          1 ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖
```

The renderer takes a `PieceGlyphs`, and the view chooses which one: the
Strategy pattern from session 15.

The view written in class, `CompactView`, shows the whole position on one
line, in the notation chess programs use (FEN), with the last move and
whose turn it is:

```
rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR  last e7e5  WHITE to move, IN_PROGRESS
```

<!-- java:compact-view/CompactView.java -->
```java
public class CompactView implements BoardView {

    private final Scanner in = new Scanner(System.in);

    @Override
    public void render(Game game) {
        List<Move> history = game.history();
        String last = history.isEmpty()
                ? "-"
                : history.get(history.size() - 1).toString();
        System.out.println(placement(game.board())
                + "  last " + last
                + "  " + game.sideToMove() + " to move, " + game.status());
    }

    private String placement(Board board) {
        StringBuilder text = new StringBuilder();
        for (int rank = Position.BOARD_SIZE - 1; rank >= 0; rank--) {
            int empty = 0;
            for (int file = 0; file < Position.BOARD_SIZE; file++) {
                Piece piece = board.pieceAt(new Position(file, rank));
                if (piece == null) {
                    empty++;
                } else {
                    if (empty > 0) {
                        text.append(empty);
                        empty = 0;
                    }
                    text.append(piece.symbol());
                }
            }
            if (empty > 0) {
                text.append(empty);
            }
            if (rank > 0) {
                text.append('/');
            }
        }
        return text.toString();
    }

    @Override
    public void showMessage(String message) {
        System.out.println(message);
    }

    @Override
    public void start(GameController controller) {
        controller.runLoop();
    }

    @Override
    public PlayerAction nextAction(Game game) {
        System.out.print("> ");
        System.out.flush();
        return PlayerAction.parse(in.hasNextLine() ? in.nextLine() : "quit");
    }
}
```
<!-- /java -->

To use it, `Main` gets two lines: an import, and a `case` in the method
that chooses a view.

```java
import edu.sfsu.csc413.chess.view.CompactView;
case "compact" -> new CompactView();
```

This is test 2 again, on the real engine:

```
$ git diff --stat
 src/main/java/edu/sfsu/csc413/chess/Main.java      |  2 +
 .../edu/sfsu/csc413/chess/view/CompactView.java    | 77 +++++++++++++++
 2 files changed, 79 insertions(+)
```

`Game`, `GameController`, and every class in `model/` are unchanged.

The reference's Swing view is the same kind of change:

```
java -cp target/classes edu.sfsu.csc413.chess.Main swing
```

Click a piece, and the squares it can reach light up; they come from
`game.legalMoves()`. Click one of them, and the window calls
`controller.handle(new Move("e2e4"))`. Same `Game`, same `GameController`.

## 8. Checking an AI-generated view; M6 and M7

In M7 you generate views with an AI assistant. Check what it produces
against the rules from this session, not against our method names:

| The rule | The check |
|---|---|
| The view never changes the model | search the new view's files for `game.play(`: no matches |
| The view never works out a rule | highlights come from `game.legalMoves()` |
| A window never waits inside a click | its `start` builds the window and returns |
| A new view changes nothing else | `git diff --stat`: new view files and `Main` |

The same checks work on any generated view, in any project.

**M6** (opens today):
- Checkmate and stalemate in the model, the job M5 left open.
- `GameController`, written by hand, using the given `BoardView`,
  `PlayerAction`, and `ConsoleView`.
- A `Main` that creates a `Game`, a view, and a controller, so the game
  can be played in the console.

It is done when Fool's Mate ends the game:

```
f2f3  e7e5  g2g4  d8h4
Checkmate. BLACK wins.
```

**M7.** You generate a Swing view, and at least one other view, with an AI
assistant. The only files that change are the new view classes and `Main`.
(`GameController` lives in the `view` package too, and it must not
change.) Wednesday covers how M7 works, including working in groups of
1–3.

**A renamed interface.** Sessions 10, 12, and 14 used the name `BoardView`
for a *read-only board*: an interface with `pieceAt`, `isEmpty`, and
`positionsOf` that `Board` implements. That interface is now called
`ReadOnlyBoard`. From M6 on, `BoardView` means the view interface in
section 7. If you added the read-only interface to your repository after
M4, rename it to `ReadOnlyBoard` before merging M6 (IntelliJ: right-click
the name → Refactor → Rename).

## Exercises

1. Label each line of your own `Main` as model, view, or controller. Which
   lines will move into `GameController` in M6, and which into a view?
2. Add a draw to tic-tac-toe: the board is full and nobody has three in a
   row. Which classes change? Where does "the board is full" belong, and
   where does the word "Draw" belong?
3. Which of these break the dependency rule, and why?
   - In `Game`: `System.out.println("Check!");`
   - In a view: `game.undoLastMove();`
   - In `GameController`: `private final SwingView view;`
   - In a view: `game.sideToMove()`
4. Using `Destinations.from` from section 7, what does it return for the
   pawn on e2 in the starting position? Check by running
   `demo/highlight/Destinations.java` with `e2` instead of `g1`.
5. An AI assistant gives you a Swing view whose button listener calls
   `game.play(move)` directly, and the game seems to work. Which rule does
   it break, and what stops working?

## Exit question

> A weather app shows today's forecast on the command line and on a web
> page. Name a class for the model, the view, and the controller. Which
> one must not know about the others?

**Related material:**
[session 15 notes](../session-15-design-patterns/notes.md) §2 and §10 on
MVC,
[session 10 notes](../session-10-solid/notes.md) §8 on dependency
inversion,
[session 9 notes](../session-09-cohesion-coupling/notes.md) §4 on
separation of concerns,
[architecture map](https://goleador.github.io/CSC413/map.html) (MVC lens).
