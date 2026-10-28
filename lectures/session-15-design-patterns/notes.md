# Session 15 — Design Patterns

**Week 10, Wednesday October 28 · CSC 413 Software Development**

**Objective advanced:** 5 (apply common design patterns to recurring
problems)

**Milestone:** M5 — king safety, check, and two diagrams of your engine.
Due Monday November 2 at 11:59 PM.
[Read the M5 handout](../../assignments/m5-check/handout.md).

You have already written or used five design patterns in this engine:

| You wrote or used | Its name |
|---|---|
| `Piece.attacks` written once, over the abstract `pseudoLegalMoves` | Template Method |
| `PieceFactory.create(type, color)` | Factory |
| `TextBoardRenderer` taking a `PieceGlyphs` | Strategy |
| `Move`, applied and undone by `Board`, kept by `Game` | Command |
| `Game` as the one class the outside talks to | Facade |

Nobody used those names at the time, and the code works without them. What
the names add is speed: "the glyphs are a strategy" says in four words what
takes a paragraph otherwise, to anyone who knows the word.

> **A design pattern is a named, proven answer to a design problem that
> keeps coming back.** The name is the useful part: it lets two programmers
> agree on a design in one word.

## 1. What a design pattern is

### Where the idea came from

The idea started in architecture, not software. In *A Pattern Language*
(1977), Christopher Alexander and his colleagues described 253 patterns for
towns and buildings, each one a problem that recurs and the core of a
solution to it. Alexander's definition is the one the software world kept:

> "Each pattern describes a problem which occurs over and over again in our
> environment, and then describes the core of the solution to that problem,
> in such a way that you can use this solution a million times over, without
> ever doing it the same way twice."

In 1987 Kent Beck and Ward Cunningham applied the idea to object-oriented
programs at the OOPSLA conference. In 1994 four authors, Erich Gamma,
Richard Helm, Ralph Johnson, and John Vlissides, published the catalog that
made patterns standard vocabulary:

- **Design Patterns: Elements of Reusable Object-Oriented Software**
  (Addison-Wesley, 1994). The authors are known as the **Gang of Four**, and
  the 23 patterns in it as the **GoF patterns**.
  [On Amazon](https://www.amazon.com/dp/0201633612).
- A friendlier introduction with Java examples: **Head First Design
  Patterns**, 2nd edition, by Eric Freeman and Elisabeth Robson (O'Reilly,
  2020). [On Amazon](https://www.amazon.com/dp/149207800X).
- Free, with diagrams and code in several languages:
  [refactoring.guru/design-patterns](https://refactoring.guru/design-patterns).

### The four parts of a pattern

The GoF book describes every pattern with the same four parts:

| Part | What it says |
|---|---|
| **Name** | a word or two to talk about the design |
| **Problem** | when to apply it, and the situation that calls for it |
| **Solution** | the classes, their roles, and how they collaborate: a shape, not code to copy |
| **Consequences** | what you gain and what it costs |

The solution is a shape because every use is different. The command in this
engine is a record called `Move`; in a text editor it is an edit; in a web
server it is a request. The roles are the same each time.

### How patterns are used

- **As vocabulary.** In design discussions and code reviews: "make the
  glyphs a strategy", "`Game` is the facade, so the view should not call
  `MoveGenerator`".
- **In names.** A class called `PieceFactory` or `BoardView` tells a reader
  what role it plays before they open it.
- **Inside the libraries you already use.** Java's standard library is
  built from them:

| In Java | Pattern |
|---|---|
| `for (Move m : moves)` calls `moves.iterator()` | Iterator; `iterator()` itself is a Factory Method |
| `new BufferedReader(new InputStreamReader(System.in))` | Decorator |
| `Collections.unmodifiableList(list)` | Decorator (also called a Proxy) |
| `List.of(...)`, `Optional.of(...)` | static factory method |
| `Runnable`, a task handed to a thread | Command |
| `Comparator` passed to `list.sort(...)` | Strategy |

### A caution

A pattern is an answer to a problem. Applied where the problem is absent,
it adds classes and indirection and solves nothing. Session 10's warnings
about SOLID apply here too: wait until the problem shows up in your code,
then reach for the pattern whose name describes it.

## 2. The catalog

The 23 GoF patterns fall into three groups. The ones in **bold** are in this
course.

| Creational: how objects are made | Structural: how objects are put together | Behavioral: how objects share out work |
|---|---|---|
| Abstract Factory | Adapter | Chain of Responsibility |
| Builder | Bridge | **Command** |
| **Factory Method** | Composite | Interpreter |
| Prototype | **Decorator** | Iterator |
| Singleton | **Facade** | Mediator |
| | Flyweight | Memento |
| | Proxy | Observer |
| | | **State** |
| | | **Strategy** |
| | | **Template Method** |
| | | Visitor |

Two names in this course are not in that table:

- **Factory**, as in `PieceFactory`, is the "simple factory" idiom: a class
  whose static methods create objects. It is not one of the 23, but it is
  the most common factory you will meet, and it is what people usually mean
  by the word.
- **MVC** (Model-View-Controller) is older than the book. Trygve Reenskaug
  designed it for Smalltalk at Xerox PARC in 1978–79. It is an
  **architectural pattern**: it arranges a whole program rather than a few
  classes. The GoF book describes it as a combination of Observer,
  Composite, and Strategy.

## 3. Patterns in our engine

The [architecture map](https://goleador.github.io/CSC413/map.html) has a
concept lens that includes each pattern: pick one and the map dims every
class that does not take part in it.

| Pattern | In the engine | Arrives in |
|---|---|---|
| Template Method | `Piece.attacks` over the abstract `pseudoLegalMoves` | M2 |
| Factory | `PieceFactory`, `BoardFactory`; static factories on `Move` | M2 |
| Strategy | `PieceGlyphs` in `TextBoardRenderer` | M1 (given) |
| Command | `Move`, applied by `Board`, kept by `Game` | M3 |
| Facade | `Game` in front of `Board`, `MoveGenerator`, `BoardFactory` | M3–M4 |
| MVC | the engine, the view, and a controller between them | M9 |
| Observer | absent on purpose; the map shows where it would go | M9 |
| State, Factory Method, Decorator | not in the engine; classic examples below | — |

The rest of these notes takes seven patterns one at a time. Each one gets
the problem, the shape of the solution, where it is in our engine (or a
classic example where it is not), and when not to use it.

## 4. Factories

**The problem.** Code that writes `new Rook(color)` depends on the `Rook`
class. Code that turns a FEN letter into a piece has to know all six
subclasses and which letter means which. Without a factory, every place
that builds a piece repeats that knowledge.

**In our engine.** `PieceFactory` is given code; you have had it since M2:

<!-- java:starter:factory/PieceFactory.java#create,fromSymbol -->
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
<!-- /java -->

`BoardFactory` builds whole boards. `fromFen` calls
`PieceFactory.fromSymbol` for every letter in a FEN string, and the two
shortcuts are one line each:

<!-- java:starter:factory/BoardFactory.java#standard,empty -->
```java
public static Board standard() {
    return fromFen(START_FEN);
}

public static Board empty() {
    return new Board();
}
```
<!-- /java -->

![Class diagram. BoardFactory depends on PieceFactory through fromSymbol. PieceFactory creates Pieces; Pawn, Knight, Bishop, Rook, Queen and King inherit from the abstract Piece.](diagrams/svg/factory.svg)

What a factory buys:

- **One place knows which constructor to call.** `MoveGenerator`, `Game`,
  and the tests ask for "a black rook" or "the piece for `'r'`" and never
  name a subclass.
- **Data becomes objects at the boundary.** FEN is text; the engine wants
  objects. The factory is where one turns into the other.
- **Tests can build any position** with `BoardFactory.fromFen`, which is
  what makes a rule testable at all.

**Static factory methods** are the same idea at the scale of one class.
`Move` has three:

<!-- java:starter:model/Move.java#api -->
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
<!-- /java -->

`Move.capture(from, to, moved, captured)` says what kind of move it is;
`new Move(from, to, moved, captured, null)` does not. *Effective Java*
makes this its first item: consider static factory methods instead of
constructors, because they have names.

**When not to.** A class with one constructor and one obvious way to build
it does not need a factory. `new Position(4, 1)` is fine.

## 5. Factory Method

The name is confusing, because "static factory method" (above) is a
different thing. The GoF **Factory Method** pattern is about inheritance:

> A superclass method creates an object, and **subclasses override it to
> decide which class** gets created. The rest of the superclass works with
> whatever comes back.

Our engine does not use it. Here is the classic example: a dialog that
draws an OK button, where each kind of dialog needs a different kind of
button.

<!-- java:factory-method/Dialog.java -->
```java
public abstract class Dialog {

    protected abstract Button createButton();

    public String render(String message) {
        Button ok = createButton();
        return message + "\n" + ok.render("OK");
    }
}
```
<!-- /java -->

<!-- java:factory-method/TextDialog.java -->
```java
public class TextDialog extends Dialog {

    @Override
    protected Button createButton() {
        return new TextButton();
    }
}
```
<!-- /java -->

<!-- java:factory-method/HtmlDialog.java -->
```java
public class HtmlDialog extends Dialog {

    @Override
    protected Button createButton() {
        return new HtmlButton();
    }
}
```
<!-- /java -->

`render` is written once, in `Dialog`, and calls `createButton()` without
knowing which button it gets. Each subclass answers with its own:

```
Save changes?
[ OK ]
Save changes?
<button>OK</button>
```

![Class diagram. The abstract Dialog has an abstract createButton returning Button, and render. TextDialog and HtmlDialog extend Dialog and override createButton, returning a TextButton and an HtmlButton. Both implement the Button interface.](diagrams/svg/factorymethod.svg)

You call a factory method every time you write a for-each loop:
`Collection.iterator()` is one. `ArrayList` and `HashSet` each override it to
return their own kind of iterator, and the loop works with whichever it
gets.

**Factory Method versus Strategy.** Our `TextBoardRenderer` has the same
problem as `Dialog`: one rendering algorithm with one part that varies
(the glyphs). It solves it differently, by taking the part through its
constructor:

```java
new TextBoardRenderer(PieceGlyphs.LETTERS)
new TextBoardRenderer(PieceGlyphs.FIGURES)
```

That is Strategy: composition instead of inheritance. Factory Method needs
a subclass for every variation and fixes the choice when the class is
written; Strategy needs no subclass and makes the choice when the object is
built. It is the same trade as the midterm's question 9, where a stack
built around a private list beat a stack that extends `ArrayList`.

**When to use Factory Method.** When you already have a class hierarchy,
and each subclass naturally knows which object it needs. Frameworks use it
heavily: the framework's base class runs the algorithm, and your subclass
supplies the objects.

## 6. Facade

**The problem.** A subsystem has many parts, and code outside it should
not have to know them, or the order to call them in.

**In our engine.** `Game` is the facade for the whole engine. Its public
methods are everything the outside needs:

<!-- java:starter:engine/Game.java#api -->
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
<!-- /java -->

Behind it stand `Board`, `MoveGenerator`, and `BoardFactory`. The rule in
`Game`'s own javadoc: everything outside the engine talks to this class and
to nothing behind it. A view never applies a move to a `Board`; it asks
`Game` to play the move.

![Class diagram. Callers outside the engine, the view, the tests and Main, depend on Game. Inside a dashed boundary labelled engine, Game owns a Board and depends on MoveGenerator and BoardFactory.](diagrams/svg/facade.svg)

What the facade buys:

- **Callers depend on one class**, not four. When M4 moved move generation
  out of `Game` into `MoveGenerator`, no caller of `legalMoves()` changed.
- **The rules stay in one place.** `play` checks that a move is legal
  before applying it; a caller that went around `Game` to `Board.apply`
  would skip that check.
- **It is what makes a new user interface cheap**, which is the subject of
  M9.

**When not to.** A facade that copies every method of everything behind it
hides nothing; it is one more class to change. And a facade is a door, not
a place to put logic: if `Game` started generating moves itself again, it
would be back to the two jobs M4 separated.

## 7. Command

**The problem.** A request (play this move, change this square) happens
once and is gone. You want to store it, take it back, run it again, or
write it down.

**The pattern.** Make the request an object. The object holds everything
needed to carry it out and to reverse it. There are four roles:

| Role | Its job | In our engine |
|---|---|---|
| **Command** | stands for one request | `Move` |
| **Receiver** | does the actual work | `Board`: `apply(Move)`, `undo(Move)` |
| **Invoker** | runs commands and keeps the history | `Game`: `play`, `undoLastMove`, `history` |
| **Client** | creates commands | each `Piece`, in `pseudoLegalMoves` |

![Class diagram with roles. Game, the invoker, owns a Board and keeps a history of any number of Moves. Move, the command, is a record of from, to, moved, captured and promotesTo. Board, the receiver, has apply and undo, which take a Move. Piece, the client, creates Moves in pseudoLegalMoves.](diagrams/svg/command.svg)

**The field that makes undo possible.** After white plays `Bxf7`, the board
shows a bishop on f7. The black pawn that stood there is gone from the
board; the only object that still knows about it is the `Move`, in
`captured`. A command must record what it destroys, at the moment it is
created, because afterwards nothing else does. The M3 handout gives
`Board.undo` exactly this job: put `moved` back on `from`, and `captured`
(or `null`) back on `to`.

**Command data, or a command that does the work?** The textbook form gives
the command an `execute()` method. Our `Move` has none: it is data, and
`Board` does the work. Both are the Command pattern; in each, the request is
an object that can be stored and reversed. The engine keeps `Move` as data
for two reasons. A `Move` is a value: `play` checks that a move is in
`legalMoves()`, which compares with `equals`. And `Board` stays the one
class that changes squares during a game.

**What commands buy:**

- **Undo**, as above, and **redo**: keep the undone commands on a second
  stack and apply them again.
- **Replay.** A saved chess game is its move list: start from the opening
  position and apply each move.
- **Logging.** Each command can be written down as it runs.
- **"What if?"** Apply a command, look at the result, undo it. The M5
  handout uses `Board.apply` and `Board.undo` this way.

There are two ways to undo. **Undo by inverse** runs the command backwards,
and needs the command to record what it destroyed. **Undo by snapshot**
copies the whole state before each change and restores the copy; it needs
no bookkeeping but costs a full copy per change. The engine undoes by
inverse, because move generation tries every move and copying 64 squares
each time adds up.

**When not to.** If nothing ever needs to be stored, undone, or replayed, a
method call is simpler than a command object.

## 8. State

**The problem.** An object behaves differently depending on its mode, and
the first version of the code puts a `switch` on the mode in every method.

Our engine does not use the State pattern. Here is the classic example: a
subway turnstile. It is **locked** or **unlocked**. A coin unlocks it; a
push lets one person through and locks it again. A push while locked is
refused, and a coin while unlocked is returned.

![State diagram. A filled circle leads to Locked. coin, unlock leads from Locked to Unlocked; push, let through leads from Unlocked back to Locked. Locked has a self-transition push, refuse; Unlocked has a self-transition coin, return it.](diagrams/svg/turnstile.svg)

**With an enum and a switch:**

<!-- java:state-switch/Turnstile.java -->
```java
public class Turnstile {

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
}
```
<!-- /java -->

Every event method has a `switch` on `state`. Add a third state, say
*out of order*, and every one of those methods gets a new case. With two
events that is two methods; a real device has many more.

**With the State pattern:** each state becomes a class behind one
interface. Each event method returns the state to be in next.

<!-- java:state/TurnstileState.java -->
```java
public interface TurnstileState {

    TurnstileState coin();

    TurnstileState push();
}
```
<!-- /java -->

<!-- java:state/Locked.java -->
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
<!-- /java -->

<!-- java:state/Unlocked.java -->
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
<!-- /java -->

<!-- java:state/Turnstile.java -->
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
<!-- /java -->

![Class diagram. Turnstile holds one TurnstileState, called state, and has coin and push. TurnstileState is an interface with coin and push, each returning a TurnstileState. Locked and Unlocked implement it.](diagrams/svg/stateclasses.svg)

Both versions print the same thing for push, coin, coin, push, push:

```
locked: insert a coin
unlocked
already unlocked: coin returned
you pass
locked: insert a coin
```

What changed:

- **`Turnstile` has no `switch`**, and does not know how many states there
  are. In the pattern's vocabulary it is the **context**.
- **Each transition is a `return`.** `return new Unlocked()` in `Locked.coin`
  is the *coin* arrow in the state diagram. Reading the classes gives you
  the diagram.
- **A new state is a new class.** The only existing code that changes is
  the state that leads to it.
- **The trade-off.** A new *event* now costs a method in every state class,
  where the `switch` version needed one new method. State pays off when
  states are added more often than events.

**When not to.** Session 14 drew a `Game` as a state machine: white to move
and black to move. Those should not become `WhiteToMove` and `BlackToMove`
classes. Both turns do the same thing with a different `Color`; a field
holds a value, and State is for behavior that differs between modes. The
same goes for how a game stands (in progress, check, checkmate,
stalemate): each value is data about the game, and an enum describes it.

| Option | Use it when |
|---|---|
| a `switch` on an enum | two modes, and one or two methods depend on them |
| enum constants with their own values or method bodies | behavior differs by mode, but no mode has data of its own that changes |
| State classes | modes have their own data, or the transitions are part of the behavior |

**State and Strategy** have the same class diagram: a context holding an
interface with several implementations. The difference is who changes it.
A strategy is chosen from outside and stays put: the `PieceGlyphs` a
`TextBoardRenderer` is built with. A state picks the next state itself, as
`Locked.coin` does.

## 9. Decorator

**The problem.** You want to add to what an object does, in combinations,
without writing a subclass for every combination.

Our engine does not use it. Here is the classic example: a coffee shop.
Every drink has a description and a price. Milk and mocha are add-ons, and
a customer can have any number of them in any order. Subclasses would need
`EspressoWithMilk`, `EspressoWithMochaAndMilk`, and so on without end:
every new add-on multiplies the number of classes.

**The idea: wrap the drink.** Instead of a class per combination, an
add-on is an object that wraps a drink. A mocha with milk is a `Mocha`
wrapped around a `Milk` wrapped around an `Espresso`:

```java
new Mocha(new Milk(new Espresso()))
```

![Three nested boxes. Mocha, which adds 75 cents and the word mocha, wraps Milk, which adds 50 cents and the word milk, which wraps Espresso, 250 cents.](diagrams/svg/wrapping.svg)

Ask the outer object for its price and the call travels inward. `Mocha`
asks `Milk`, `Milk` asks `Espresso`, `Espresso` answers 250, and each layer
adds its part on the way back out: 250, then 300, then 375. The caller
holds one `Beverage` and never knows how many layers it has.

**The code.** Every drink and every add-on implements one interface:

<!-- java:decorator/Beverage.java -->
```java
public interface Beverage {

    String description();

    int cents();
}
```
<!-- /java -->

<!-- java:decorator/Espresso.java -->
```java
public record Espresso() implements Beverage {

    @Override
    public String description() {
        return "espresso";
    }

    @Override
    public int cents() {
        return 250;
    }
}
```
<!-- /java -->

<!-- java:decorator/Milk.java -->
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
<!-- /java -->

`Mocha` is the same as `Milk` with its own name and price. A decorator
**is** a `Beverage` and **holds** a `Beverage`. It does its part and passes
the call on to the one it wraps. Because it is a `Beverage`, it can be
wrapped in turn:

<!-- java:decorator/DecoratorDemo.java#main -->
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
<!-- /java -->

```
espresso                       $2.50
espresso, milk                 $3.00
espresso, milk, mocha, mocha   $4.50
```

![Class diagram. Beverage is an interface with description and cents. Espresso, Milk and Mocha are records that implement it. Milk and Mocha each hold a Beverage called inner.](diagrams/svg/decorator.svg)

**In Java.** `java.io` is built this way:

```java
new BufferedReader(new InputStreamReader(System.in))
```

![Three nested boxes. BufferedReader, which adds readLine, wraps InputStreamReader, which turns bytes into characters, which wraps System.in, which reads bytes.](diagrams/svg/iowrap.svg)

`System.in` reads bytes. `InputStreamReader` turns bytes into characters;
strictly, that layer is an Adapter, because it changes one interface into
another. `BufferedReader` is the decorator: it is a `Reader`, it holds a
`Reader`, and it adds reading a line at a time. `Collections.unmodifiableList`
is a decorator too: it wraps a list and refuses every change.

**Decorator versus Strategy.** A strategy is a part the object uses; it
need not look like the object at all (`PieceGlyphs` is not a renderer). A
decorator implements the same interface as the thing it wraps, so callers
cannot tell one from the other.

**When not to.** Long chains of wrappers are hard to debug: a stack trace
goes through every layer. If there are only two or three fixed
combinations, plain classes are easier to read.

## 10. MVC

MVC splits an interactive program into three roles:

| Role | Owns | In our engine |
|---|---|---|
| **Model** | the data and the rules | `Game`, and everything behind it |
| **View** | what the user sees | `TextBoardRenderer` and `PieceGlyphs` as of M5; a `BoardView` interface in M9 |
| **Controller** | the conversation between them: takes what the user asked for, changes the model, tells the view to redraw | M9 |

![MVC diagram. The controller changes the model and tells the view to redraw. The view reads the model, and sends the controller what the player asked for.](diagrams/svg/mvc.svg)

The rule that makes it work is the direction of the arrows. The model
knows nothing about the view or the controller: `Game` has no idea whether
it is drawn as letters, figures, or a window. That is why M9 can add a
second user interface without changing a line of the rules, and why the
Facade above matters: the view and the controller reach the model only
through `Game`.

Monday's session covers MVC in full, with layered architecture, and M9
builds it.

## Exercises

1. Find the Template Method in your own `Piece`. Which method is the
   template, and which is the step each subclass fills in?
2. Add a `Whip` decorator to the coffee shop. How many existing classes
   change?
3. Add an *out of order* state to the turnstile: every coin is returned and
   every push refused, until an attendant calls `repair()`. Count the
   classes that change in the `switch` version and in the State version.
   Why does `repair()` cost more than the new state?
4. `Board.undo(move)` needs `move.captured()`. What would undo by snapshot
   need instead, and why does move generation make it expensive?
5. `PieceFactory.create` uses a `switch` on `PieceType`, with no `default`.
   What happens at compile time if a seventh piece type is added? Is that a
   reason to keep the `switch`?
6. Name the pattern: (a) `Comparator.comparing(Move::toString)` passed to
   `sort`; (b) `Optional.empty()`; (c) a `LoggingList` that implements
   `List` and prints every `add` before passing it to the list it holds.

## Exit question

> Name one pattern you have already written in this engine, the class it
> is in, and the problem it solves. Then name one pattern that would be the
> wrong choice for whose turn it is, and say why.

**Related material:**
[architecture map](https://goleador.github.io/CSC413/map.html) (concept
lens), [session 9 notes](../session-09-cohesion-coupling/notes.md) on why
`MoveGenerator` exists, [session 10 notes](../session-10-solid/notes.md) on
SOLID, [session 14 notes](../session-14-uml/notes.md) §6 on state diagrams
and the appendix on the midterm's question 9, the
[M3 handout](../../assignments/m3-game/handout.md) on `Move` and undo. All
the classic example code is in
[`demo/`](https://github.com/goleador/CSC413/tree/main/lectures/session-15-design-patterns/demo).
