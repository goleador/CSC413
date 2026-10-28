**CSC 413 · Week 10 · Wednesday Oct 28**

# Design Patterns

### Named answers to recurring design problems, and seven of them in our engine

San Francisco State University

> Two active parts: a type-along around minute 55, and a pattern hunt in pairs near the end. Laptops open, repository on main is fine. M5 is due Monday.

---

## You have already used five

| You wrote or used | Its name |
|---|---|
| `Piece.attacks` over the abstract `pseudoLegalMoves` | Template Method |
| `PieceFactory.create(type, color)` | Factory |
| `TextBoardRenderer` taking a `PieceGlyphs` | Strategy |
| `Move`, applied and undone by `Board` | Command |
| `Game`, the one class the outside talks to | Facade |

> Read the left column first and ask if anyone knows a name for any row. Reveal the names one at a time. The code worked without the names; the names are what this session adds.

---

## What a design pattern is

A named, proven answer to a design problem that keeps coming back.

*(reveal)* The name lets two programmers agree on a design in one word.

> Example: "the glyphs are a strategy" replaces a paragraph, for anyone who knows the word. That is the whole value of learning the catalog.

---

## Where the idea came from

| Year | Who | What |
|---|---|---|
| 1977 | Christopher Alexander | A Pattern Language: 253 patterns for towns and buildings |
| 1987 | Kent Beck, Ward Cunningham | patterns for object-oriented programs, at OOPSLA |
| 1994 | Gamma, Helm, Johnson, Vlissides | Design Patterns: 23 patterns, the "Gang of Four" |

> "a problem which occurs over and over again … and the core of the solution to that problem"

> Alexander designed buildings, not software. The full quote is in the notes; the key phrase is that you can use the solution a million times without doing it the same way twice. That is why a pattern is a shape, not code to paste.

---

## The books

- **Design Patterns: Elements of Reusable Object-Oriented Software**, Gamma, Helm, Johnson, Vlissides, 1994. Amazon
- **Head First Design Patterns**, 2nd ed., Freeman and Robson, 2020. Amazon
- Free: refactoring.guru/design-patterns

> The GoF book is the reference, written with C++ and Smalltalk examples, and dense. Head First uses Java and is the one to read first. Refactoring.guru is free and has a diagram for every pattern.

---

## Every pattern has four parts

| Part | What it says |
|---|---|
| **Name** | a word or two to talk about the design |
| **Problem** | when it applies |
| **Solution** | classes, roles, collaborations: a shape, not code |
| **Consequences** | what you gain, what it costs |

> Every deep dive follows this order: problem, shape, where it is in our engine, and when not to use it. The consequences are the part people skip.

---

## Patterns in Java you already use

| You write | Pattern |
|---|---|
| `for (Move m : moves)` | Iterator |
| `new BufferedReader(new InputStreamReader(System.in))` | Decorator |
| `List.of(...)`, `Optional.of(...)` | static factory method |
| `Comparator` passed to `sort` | Strategy |
| `Runnable` handed to a thread | Command |

> The standard library is built from patterns. Patterns also show up in names: a class called PieceFactory tells you its role before you open it.

---

## A pattern is an answer to a problem

*(reveal)* Applied where the problem is absent, it adds classes and solves nothing.

*(reveal)* Wait for the problem to appear in your code, then use the pattern that names it.

> Same warning as session 10's SOLID. A Factory for a class with one constructor, or a State class per turn, makes the code worse.

---

## The 23 GoF patterns

| Creational | Structural | Behavioral |
|---|---|---|
| Abstract Factory | Adapter | Chain of Responsibility |
| Builder | Bridge | **Command** |
| **Factory Method** | Composite | Interpreter · Iterator |
| Prototype | **Decorator** | Mediator · Memento |
| Singleton | **Facade** | Observer · **State** |
|  | Flyweight | **Strategy** · **Template Method** |
|  | Proxy | Visitor |

> Creational: how objects are made. Structural: how objects are put together. Behavioral: how objects share out work. The bold ones are in this course. Do not memorize the list; the notes have it.

---

## Two more names, not in the 23

**Factory**: a class whose static methods create objects. The "simple factory" idiom.

**MVC**: Reenskaug, Smalltalk, 1979. An architectural pattern for a whole program.

> PieceFactory is a simple factory, the most common thing people mean by the word. MVC predates the book; the GoF describe it as Observer, Composite and Strategy working together.

---

## Patterns in our engine

| Pattern | Where | When |
|---|---|---|
| Template Method | `Piece.attacks` | M2 |
| Factory | `PieceFactory`, `BoardFactory`, `Move.quiet` | M2 |
| Strategy | `PieceGlyphs` | M1 |
| Command | `Move`, `Board`, `Game` | M3 |
| Facade | `Game` | M3–M4 |
| MVC | engine, view, controller | M9 |

The architecture map's concept lens highlights each one.

> Open the map and turn on the Facade lens for ten seconds, then Command. State, Factory Method and Decorator are not in the engine; for those we use the classic examples.

---

## Factory: who knows which constructor?

```java
public static Piece create(PieceType type, Color color) {
    return switch (type) {
        case PAWN -> new Pawn(color);
        case KNIGHT -> new Knight(color);
        case BISHOP -> new Bishop(color);
        case ROOK -> new Rook(color);
        case QUEEN -> new Queen(color);
        case KING -> new King(color);
    };
}

public static Piece fromSymbol(char letter) {
    Color color = Character.isUpperCase(letter) ? Color.WHITE : Color.BLACK;
    return create(PieceType.fromSymbol(letter), color);
}
```

> Given code since M2. The problem: anything that writes new Rook depends on Rook. Here one class knows the six constructors, and the rest of the engine asks for a black rook or the piece for 'r'.

---

## Factories in the engine

*(diagram: `diagrams/factory.mmd`)*

*(reveal)* Data becomes objects at the boundary: `fromFen` turns text into a `Board`.

> BoardFactory.fromFen calls fromSymbol for every letter. That is what lets every test build exactly the position it needs. When not to: new Position(4, 1) needs no factory.

---

## Static factory methods: constructors with names

```java
public record Move(Position from, Position to, Piece moved, Piece captured, PieceType promotesTo) {
    public static Move quiet(Position from, Position to, Piece moved);
    public static Move capture(Position from, Position to, Piece moved, Piece captured);
    public static Move promotion(Position from, Position to, Piece moved, Piece captured, PieceType promotesTo);
    public boolean isCapture();
    public boolean isPromotion();
    public String toString();
}
```

*(reveal)* `Move.capture(...)` says what kind of move it is; `new Move(..., null)` does not.

> Effective Java, item 1: consider static factory methods instead of constructors. List.of and Optional.of are the same idea.

---

## Factory Method: a subclass decides what to create

```java
public abstract class Dialog {

    protected abstract Button createButton();

    public String render(String message) {
        Button ok = createButton();
        return message + "\n" + ok.render("OK");
    }
}
```

*(reveal)* `render` is written once and works with whichever `Button` comes back.

> Not the same as a static factory method; the names are unfortunate. This one is about inheritance. Not in our engine, so this is the classic example.

---

## Two dialogs, two buttons

```java
@Override
protected Button createButton() {
    return new TextButton();
}
```

```java
@Override
protected Button createButton() {
    return new HtmlButton();
}
```

```
Save changes?
[ OK ]
Save changes?
<button>OK</button>
```

*(reveal)* Every for-each loop calls one: `Collection.iterator()`.

> ArrayList and HashSet each override iterator() to make their own kind of iterator, and the loop does not care which.

---

## Factory Method

*(diagram: `diagrams/factorymethod.mmd`)*

> The creator hierarchy on the left mirrors the product hierarchy on the right. One subclass per kind of product.

---

## Our renderer has the same problem

```
new TextBoardRenderer(PieceGlyphs.LETTERS)
new TextBoardRenderer(PieceGlyphs.FIGURES)
```

*(reveal)* Strategy: the varying part comes in through the constructor. No subclass.

*(reveal)* Factory Method chooses when the class is written; Strategy chooses when the object is built.

> Ask: how would TextBoardRenderer look with Factory Method? An abstract glyphs() method and two subclasses. Same trade as the midterm's stack question: composition over extending.

---

## Facade: one door into the engine

```java
public class Game {
    public Game();
    public Game(Board board, Color sideToMove);
    public Board board();
    public Color sideToMove();
    public List<Move> history();
    public List<Move> legalMoves();
    public Optional<Move> findLegalMove(String notation);
    public void play(Move move);
    public Optional<Move> undoLastMove();
}
```

> This is everything the outside of the engine needs. Behind it stand Board, MoveGenerator and BoardFactory. Game's javadoc says it: the view never applies a move to a Board.

---

## What stands behind `Game`

*(diagram: `diagrams/facade.mmd`)*

*(reveal)* M4 moved move generation into `MoveGenerator`, and no caller of `legalMoves()` changed.

> Also: play checks legality, so going around Game to Board.apply would skip the check. When not to: a facade that copies every method behind it hides nothing, and a facade full of logic is back to the two jobs M4 separated.

---

## Command: a request as an object

| Role | Its job | In our engine |
|---|---|---|
| **Command** | stands for one request | `Move` |
| **Receiver** | does the work | `Board`: `apply`, `undo` |
| **Invoker** | runs commands, keeps the history | `Game`: `play`, `undoLastMove` |
| **Client** | creates commands | each `Piece` |

> The problem: a method call happens once and is gone. As an object, a request can be stored, undone, replayed or logged. The engine column is code you wrote in M2 and M3.

---

## Command in the engine

*(diagram: `diagrams/command.mmd`)*

> Pieces create moves, Game keeps them, Board applies and reverses them. Signatures only: the bodies are M3.

---

## After `Bxf7`, what does the board forget?

*(reveal)* The pawn that stood on f7. Only `Move.captured` still has it.

*(reveal)* A command records what it destroys when it is created, because nothing else will.

> Ask before the first reveal. This is why Move has a captured field, and why undo needed no extra bookkeeping in M3.

---

## Should `Move` have `execute(Board)`?

*(reveal)* The textbook command does its own work. Ours is data; `Board` does the work.

*(reveal)* A `Move` is a value: `play` compares it with `equals`.

*(reveal)* Only `Board` changes squares during a game.

*(reveal)* Both forms are Command: a request stored as an object that can be reversed.

> Take a vote first. Most will say yes because that is the textbook form. Both are fine; the engine chose data plus receiver for these two reasons.

---

## What commands buy

- **Undo**, and **redo** with a second stack.
- **Replay:** a saved game is its move list.
- **Logging:** write each command down as it runs.
- **"What if?":** apply, look, undo.

*(reveal)* Undo by inverse records what was destroyed. Undo by snapshot copies everything.

> The M5 handout uses apply and undo for "what if". Move generation tries every move, so a 64-square copy per try adds up; that is why the engine undoes by inverse.

---

## State: a turnstile

*(diagram: `diagrams/turnstile.mmd`)*

> Not in our engine, so the classic example. Same event, different behavior: push while locked is refused, push while unlocked lets you through.

---

## The first version: a `switch` in every event

```java
private enum State { LOCKED, UNLOCKED }
private State state = State.LOCKED;

public void coin() {
    switch (state) {
        case LOCKED -> {
            System.out.println("unlocked");
            state = State.UNLOCKED;
        }
        case UNLOCKED -> System.out.println("already unlocked: coin returned");
    }
}

public void push() {
    switch (state) {
        case LOCKED -> System.out.println("locked: insert a coin");
        case UNLOCKED -> {
            System.out.println("you pass");
            state = State.LOCKED;
        }
    }
}
```

*(reveal)* A third state adds a case to every event method.

> Ask: add an out-of-order state. How many methods change? Both. A real device has many more events than two.

---

## State: one class per state

```java
public class Locked implements TurnstileState {

    @Override
    public TurnstileState coin() {
        System.out.println("unlocked");
        return new Unlocked();
    }

    @Override
    public TurnstileState push() {
        System.out.println("locked: insert a coin");
        return this;
    }
}
```

```java
public class Unlocked implements TurnstileState {

    @Override
    public TurnstileState coin() {
        System.out.println("already unlocked: coin returned");
        return this;
    }

    @Override
    public TurnstileState push() {
        System.out.println("you pass");
        return new Locked();
    }
}
```

*(reveal)* Each event returns the state to be in next.

> The interface, TurnstileState, has coin and push, each returning a TurnstileState. The body of each case from the switch moves into the matching class.

---

## The context: `Turnstile`

```java
public class Turnstile {

    private TurnstileState state = new Locked();

    public void coin() {
        state = state.coin();
    }

    public void push() {
        state = state.push();
    }
}
```

*(reveal)* No `switch`. `Turnstile` does not know how many states there are.

> Run StateDemo in both versions: the output is identical. The notes show it.

---

## State, as classes

*(diagram: `diagrams/stateclasses.mmd`)*

*(reveal)* A new state is one new class. A new event is a method in every state.

> The trade-off runs both ways. State pays off when states are added more often than events. Each return of a new state is an arrow in the state diagram.

---

## Should `WhiteToMove` and `BlackToMove` be State classes?

*(reveal)* No. Both turns do the same thing with a different `Color`.

*(reveal)* A field holds a value; State is for behavior that differs between modes.

> Monday's turn diagram. Same for how a game stands, in progress, check, checkmate, stalemate: data about the game, so an enum. State and Strategy have the same diagram; a strategy is chosen from outside, a state picks the next one itself.

---

## Decorator: the problem

A coffee shop. Every drink has a description and a price. Milk and mocha are add-ons, in any number.

| With subclasses you need |
|---|
| `Espresso`, `EspressoWithMilk`, `EspressoWithMocha` |
| `EspressoWithMilkAndMocha`, `EspressoWithDoubleMocha`, … |

*(reveal)* Every new add-on multiplies the number of classes.

> Not in our engine, so the classic example. Ask: how many classes for three add-ons, each taken or not? Eight, before anyone asks for a double.

---

## The idea: wrap the drink

*(diagram: `diagrams/wrapping.mmd`)*

```
new Mocha(new Milk(new Espresso()))
```

*(reveal)* Asked for its price, each layer asks the one inside, then adds its own: 250, +50, +75 = 375.

> This picture is the pattern. The order is one object, three layers deep. A call goes in from the outside, reaches Espresso, and each layer adds to the answer on the way back out.

---

## One layer: `Milk`

```java
public record Milk(Beverage inner) implements Beverage {

    @Override
    public String description() {
        return inner.description() + ", milk";
    }

    @Override
    public int cents() {
        return inner.cents() + 50;
    }
}
```

*(reveal)* `Milk` is a `Beverage`, and it holds a `Beverage`.

> Point at the two halves of the first line: implements Beverage is why it can be wrapped; the inner component is what it wraps. Each method does its part and passes the call to inner. Beverage itself is just description and cents.

---

## Your turn: write `Mocha`, then order

```java
public static void main(String[] args) {
    Beverage[] orders = {
        new Espresso(),
        new Milk(new Espresso()),
        new Mocha(new Mocha(new Milk(new Espresso()))),
    };
    for (Beverage order : orders) {
        System.out.printf("%-30s $%d.%02d%n",
                order.description(), order.cents() / 100, order.cents() % 100);
    }
}
```

```
espresso                       $2.50
espresso, milk                 $3.00
espresso, milk, mocha, mocha   $4.50
```

**7 minutes.** `Mocha` adds 75 cents. Then add `Whip`.

> Type Beverage, Espresso and Milk with them, then they write Mocha and Whip. Ask how many existing classes changed for Whip: none.

---

## The same shape in `java.io`

*(diagram: `diagrams/iowrap.mmd`)*

*(reveal)* `BufferedReader` is a `Reader` that holds a `Reader`, and adds `readLine`.

> Strictly, InputStreamReader is an Adapter: it changes bytes into characters. BufferedReader is the decorator. Decorator versus Strategy: a decorator has the same interface as what it wraps; a strategy is a part the object uses. When not to: long chains are hard to debug.

---

## MVC: three roles

*(diagram: `diagrams/mvc.mmd`)*

*(reveal)* The model knows nothing about the view or the controller.

> Model is Game and everything behind it. View today is TextBoardRenderer and PieceGlyphs. The controller arrives in M9. Monday is the full session; the Facade is why the view and controller only need Game.

---

## Your turn: pattern hunt

In pairs, **8 minutes**, in your own repository. For each class, name the pattern and the one line that shows it:

- `Piece`
- `TextBoardRenderer`
- `BoardFactory`
- `Game`

> Answers on the map's concept lens. Expect Piece to be the hard one: attacks is the template, pseudoLegalMoves the step.

---

## Exit card

> Name one pattern you have already written in this engine, the class it is in, and the problem it solves.
> Then name one pattern that would be the wrong choice for whose turn it is, and say why.

> Good answers for the second half: State, because both turns behave the same; or a Factory, because there is nothing to create.

---

# Next: Monday Nov 2

## Architecture and MVC

M5 is due Monday November 2 at 11:59 PM.

> All the classic example code is linked from the notes.
