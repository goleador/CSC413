**CSC 413 · Week 11 · Monday Nov 2 · on Zoom**

# Model, View, Controller

### Where each piece of code belongs, in any program, and then in ours

San Francisco State University

> Answer questions in the Zoom chat. M5 is due tonight at 11:59.

---

## Your `Main`, from M3

```java
Game game = new Game();
TextBoardRenderer renderer = new TextBoardRenderer(PieceGlyphs.LETTERS);
System.out.println(renderer.render(game.board()));

for (String notation : List.of("e2e4", "e7e5")) {
    game.play(game.findLegalMove(notation).orElseThrow());
}
System.out.println(renderer.render(game.board()));
```

What is missing to make this a game?

*(reveal)* A player. The moves are fixed in the source.

> Ask in the chat, then reveal. The obvious fix is a loop in Main that reads a move, checks it, plays it, and prints. Let's see where that leads on a smaller program.

---

## A smaller program: tic-tac-toe, in one method

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

> Squares are numbered 1 to 9. Everything is in main: the rules, the board drawing, and the typing.

---

## It works

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
- *(reveal)* To test the rules, someone has to type.
- *(reveal)* A second screen, say a window with nine buttons, means copying the rules.
- *(reveal)* To change how the board looks, you read past the rules.

> Nothing is wrong with the output. The trouble is in changing it, which is what MVC is for.

---

# Three questions

## Ask them of any line of code

> These work on every program you will write, not only this one.

---

## Three questions, three roles
| Ask of a line of code | If yes, it belongs to |

|---|---|
| Is it a rule, or the state the rules work on? | **Model** |
| Is it what the user sees, or how they type or click? | **View** |
| Does it take a request, run the rule, and tell the view? | **Controller** |

> Model: the game itself, which would be the same with any screen. View: the screen and the keyboard. Controller: the connection between them.

---

## Label each line: M, V, or C?
| # | Line from the tic-tac-toe main | Role |

|---|---|---|
| 1 | `char turn = 'X';` | *(reveal)* M: the state |
| 2 | `System.out.println(new String(cells, row * 3, 3));` | *(reveal)* V: reads the state |
| 3 | `System.out.print(turn + " to move (1-9): ");` | *(reveal)* V |
| 4 | `int square = Integer.parseInt(in.nextLine().trim()) - 1;` | *(reveal)* V: a window has clicks, not numbers |
| 5 | `if (cells[square] != '.') { System.out.println("That square is taken."); }` | *(reveal)* M and V, mixed |
| 6 | `cells[square] = turn;` | *(reveal)* M: the rule |
| 7 | `if (hasLine(cells, turn))` | *(reveal)* M: the rule |
| 8 | `turn = (turn == 'X') ? 'O' : 'X';` | *(reveal)* M: the rule |

> Answer in the chat as a string, like M V V V ? M M M. Line 5 is the interesting one.

---

## Which line is the controller?

*(reveal)* None of them. The controller is the **order**:
- *(reveal)* get a request (square 5)
- *(reveal)* run the rule (taken? place the mark, check for a line, switch turns)
- *(reveal)* tell the view (a message, then the board)

> In the one-method version the order is hidden in the shape of the loop. Pulling it out gives it a name.

---

## Splitting line 5

### Model: decides, returns an answer

```java
public Outcome play(int square) {
    if (cells[square] != '.') {
        return Outcome.TAKEN;
    }
    ...
}

enum Outcome { PLAYED, TAKEN, WON }
```

### View: decides the wording

```java
public void report(Outcome outcome) {
    switch (outcome) {
        case TAKEN -> System.out.println("That square is taken.");
        case WON -> System.out.println("Three in a row!");
        case PLAYED -> { }
    }
}
```

*(reveal)* The model says what happened. The view says how it looks.

> The model returns TAKEN and never prints. Another view could show the same answer as a red square.

---

## Model: `TicTacToe`, no input or output

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

> The state and the rules, nothing else. It would be the same class behind a terminal, a window, or a web page.

---

## View: an interface, and a console view

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

> Every view draws the board, reports what happened, and takes input. The console reads a number and calls controller.play; it never calls game.play itself.

---

## Controller: one method per request

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

> Run the rule on the model, then tell the view: the order from a few slides ago, now with a name. The constructor is left out.

---

## Who knows about whom

![tictactoe](diagrams/svg/tictactoe.svg)

`TicTacToe` has no arrows out. It knows nothing about the other two.

> Follow the arrows: the controller knows the model and the view interface; the view reads the model; the model knows no one.

---

## The dependency rule
- The **model** knows nothing about the view or the controller.
- *(reveal)* The **view** reads the model. It never changes it.
- *(reveal)* The **controller** changes the model and holds the view as an interface (dependency inversion, session 10).

> The model is the part you most want to test and reuse, so it is the part that must not depend on a screen.

---

## Which of these break the rule?
| In | Code | Breaks it? |

|---|---|---|
| `TicTacToe` | `System.out.println("X wins!");` | *(reveal)* Yes: the model knows the screen |
| `ConsoleTicTacToeView` | `game.play(square);` | *(reveal)* Yes: the view changes the model |
| `TicTacToeController` | `private final ConsoleTicTacToeView view;` | *(reveal)* Yes: tied to one view |
| `ConsoleTicTacToeView` | `game.cell(4)` | *(reveal)* No: reading is allowed |

> Answer in the chat: yes or no for each. Then reveal one at a time.

---

# Three tests

## How you know the split is right

> Each test is something you can run or check in a diff, on any project.

---

## Test 1: the model runs with no screen

```java
@Test
void threeInARowWins() {
    TicTacToe game = new TicTacToe();
    game.play(0);  game.play(3);    // X, O
    game.play(1);  game.play(4);    // X, O
    assertEquals(Outcome.WON, game.play(2));    // X: top row
}
```

*(reveal)* No typing, no screen. The one-method version can't be tested this way.

> Its rules were inside a Scanner loop, so the only way to test them was to type.

---

## Test 2: a new view changes nothing else

```java
// a second view: a grid with lines
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

Which files change? The new view, and one line in `Main` to choose it.

> Ask the chat to predict before revealing. TicTacToe and TicTacToeController: unchanged.

---

## Test 3: a rule changes in one place

New rule: O moves first.

```java
private char turn = 'O';    // in TicTacToe; was 'X'
```

*(reveal)* One line, in the model. Both views show it with no change: they read `turn()` and `cell()` from the model.

> In the one-method version the same rule is one line too, but you would have to read through the drawing and the typing to find it.

---

## Three tests, for any program
| Test | Passes when |

|---|---|
| The model runs with no screen | you can unit test the rules without typing or clicking |
| A new view changes nothing else | the diff is the new view and the line that chooses it |
| A rule changes in one place | the diff is in the model only |

> If one fails, ask the three questions of the code that changed: something is in the wrong role.

---

## Input arrives two ways

### A loop asks: the console

```java
while (in.hasNextLine()) {
    int square = Integer.parseInt(in.nextLine().trim()) - 1;
    controller.play(square);
}
```

Waits for Enter. Fine: a terminal has nothing else to do.

### Events tell: a window

```java
for (int i = 0; i < 9; i++) {
    int square = i;
    JButton button = new JButton(" ");
    button.addActionListener(event -> controller.play(square));
    panel.add(button);
}
```

A click calls your code. Nothing waits.

*(reveal)* Both call the same `controller.play(square)`. The controller doesn't know which view called.

> A window's start builds the buttons and returns. Never wait for input inside a click: Swing handles clicks on the thread that draws the window, so the window stops responding.

---

## The same shape, in other programs
|  | Model | View | Controller |

|---|---|---|---|
| Tic-tac-toe | `TicTacToe` | console, grid, buttons | `TicTacToeController` |
| A web app | *(reveal)* the data and its rules | *(reveal)* the page sent back | *(reveal)* the code that handles each request |
| A phone app | *(reveal)* the data and its rules | *(reveal)* the screens | *(reveal)* the code that handles each tap |

*(reveal)* A web request is an event: it calls your code, like a click.

> Every web framework has a place for each of these three, under different names.

---

## Variations you will meet
- **Original MVC** (Smalltalk, 1979): the model notifies its views when it changes (Observer). Ours: the controller tells the view.
- *(reveal)* **MVP, MVVM**: the same three-way split, wired differently.
- *(reveal)* All of them: the model doesn't know the view.
- *(reveal)* **Overkill** for a 30-line script with one screen and no tests.

> The names change from framework to framework. The questions and the dependency rule do not.

---

# Chess: the same three roles

## The engine you built is the model

> Everything from tic-tac-toe applies; only the names change.

---

## Tic-tac-toe and chess, side by side
|  | Tic-tac-toe | Chess |

|---|---|---|
| **Model** | `TicTacToe` | `Game` and everything behind it (M1–M5) |
| **View** | `TicTacToeView`: console, grid, buttons | `BoardView`: `ConsoleView`, `EmojiView`, Swing |
| **Controller** | `TicTacToeController` | `GameController`: you write it in M6 |
| **Request** | `play(square)` | `PlayerAction`: `Move`, `Undo`, `ShowMoves`, `Quit` |

> BoardView, PlayerAction, ConsoleView, and EmojiView are given in M6. You write GameController.

---

## `BoardView` (given in M6)

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

> render, showMessage, and start are TicTacToeView's show, report, and start. The defaults are there because a console answers nextAction and a window does not.

---

## `PlayerAction` (given in M6)

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

Typed `undo` and a clicked Undo button both become `new Undo()`.

> Chess has more kinds of request than tic-tac-toe (a move, undo, show moves, quit), so each is an object instead of a separate controller method. sealed means these four are all there are; the M6 handout explains it.

---

## Highlighting where a piece can go: M, V, or C?

### ✔ The view asks `Game`

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

```
knight on g1 → [h3, f3]
```

### ✘ The view works out the rule

```java
if (piece.type() == PieceType.KNIGHT) {
    // eight L-shaped jumps,
    // worked out in the view
}
if (piece.type() == PieceType.BISHOP) {
    // ...
}
```

*(reveal)* Asking the model is view. Working out a rule in the view is model code in the wrong place.

> Both highlight the same squares today. The next slide shows why only the left one stays correct.

---

## Later, castling is added to `Game`
| The view… | Castling squares highlighted? |

|---|---|
| asks `game.legalMoves()` | *(reveal)* Yes, with no change to the view. |
| works out the rule itself | *(reveal)* No, until someone edits this view, and every other view. |

*(reveal)* Test 3 fails: the rule no longer changes in one place.

> Ask the chat to fill in the right column before revealing.

---

# Live: one engine, several views

## Same `Game`, same controller

> Switch to IntelliJ on the reference engine.

---

## `ConsoleView` and `EmojiView`: one expression different

```java
new TextBoardRenderer(PieceGlyphs.LETTERS);   // ConsoleView
new TextBoardRenderer(PieceGlyphs.FIGURES);   // EmojiView
```

```
8 r n b q k b n r
7 p p p p p p p p
2 P P P P P P P P
1 R N B Q K B N R
```

```
8 ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜
7 ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟
2 ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙
1 ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖
```

> Run Main with no argument, then with emoji. The renderer takes a PieceGlyphs and the view chooses: Strategy, from session 15.

---

## A new view, live: `CompactView`

```java
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
```

```
rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR  last e7e5  WHITE to move, IN_PROGRESS
```

`showMessage`, `start`, and `nextAction`: the same as `ConsoleView`'s.

> Type it live: implements BoardView, let IntelliJ generate the methods. Paste the placement helper, which writes the board as one line of FEN.

---

## Test 2 again, on the real engine

```java
import edu.sfsu.csc413.chess.view.CompactView;   // added to Main
case "compact" -> new CompactView();               // added to Main
```

*(reveal)*

```
$ git diff --stat
 src/main/java/edu/sfsu/csc413/chess/Main.java      |  2 +
 .../edu/sfsu/csc413/chess/view/CompactView.java    | 77 +++++++++++++++
 2 files changed, 79 insertions(+)
```

*(reveal)* `Game`, `GameController`, and `model/`: unchanged.

> Ask the chat to predict before running it. Use git add -N on the new file first so it appears in the stat.

---

## The same engine, in a window

```
java -cp target/classes edu.sfsu.csc413.chess.Main swing
```
- Click a piece: its squares light up, from `game.legalMoves()`.
- Click a square: the window calls `controller.handle(new Move("e2e4"))`.

In M7 you generate a view like this with AI.

> Run the reference's SwingView and play a few moves. Do not open its code.

---

## Checking an AI-generated view
| The rule | The check |

|---|---|
| The view never changes the model | search the new view's files for `game.play(`: no matches |
| The view never works out a rule | highlights come from `game.legalMoves()` |
| A window never waits inside a click | its `start` builds the window and returns |
| A new view changes nothing else | `git diff --stat`: new view files and `Main` |

> Each check comes from today's rules, and works on any generated view, in any project.

---

## M6 opens today
- Checkmate and stalemate in the model.
- `GameController`, written by hand, using the given `BoardView`, `PlayerAction`, and `ConsoleView`.
- A `Main` that starts a game you can play.

Done when this works in your console:

```
f2f3  e7e5  g2g4  d8h4
Checkmate. BLACK wins.
```

> You write the controller yourselves because in M7 it is what you check generated views against. M7 is Wednesday's topic.

---

## A renamed interface

```java
// sessions 10, 12, 14
public interface BoardView {
    Piece pieceAt(Position position);
    ...
}
```

```java
// from today
public interface ReadOnlyBoard {
    Piece pieceAt(Position position);
    ...
}
```

`BoardView` now means the view interface. If you added the read-only one, rename it before merging M6: Refactor → Rename.

> Most of you never added it. IntelliJ renames every use in one step.

---

## Exit question

> A weather app shows today's forecast on the command line and on a web page. Name a class for the model, the view, and the controller. Which one must not know about the others?

> Answer in the chat. Any names work if the model holds the forecast and knows nothing about either screen.

---

# Next: Wednesday Nov 4

## Generating views with AI: how M7 works

M5 is due tonight at 11:59 PM. M6 is open.

> Wednesday is also on Zoom.
