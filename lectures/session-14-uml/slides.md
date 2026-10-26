**CSC 413 · Week 10 · Monday Oct 26**

# UML: Class and Sequence Diagrams

### Drawing the engine you have built, and checking the drawing against the code

> First meeting since the midterm. M5 opens today and is due Monday November 2; it asks for two of today's diagrams.

---

## What the M4 handout said about `MoveGenerator`

- No fields, a private constructor, static methods.
- `Game.legalMoves()` calls it.
- `legalMoves` is public; `pseudoLegalMoves` is package-private.
- It takes a `Board` and keeps nothing.

> This took four paragraphs in the handout. Ask: who read all four? Next slide is the same four facts as a picture.

---

## The same facts, as a class diagram

*(diagram: `diagrams/hook.mmd`)*

*(reveal)* A diagram shows structure: classes, members, and who depends on whom. It does not record the reasons.

> Point at each handout fact on the picture: the private constructor, the underlined statics, the tilde, the dashed arrows. Then ask what the picture cannot say. Answer: why MoveGenerator exists.

---

## UML: one notation, fourteen kinds of diagram

- In depth: **class** and **sequence** diagrams.
- Once each: **package** and **state**.

*(reveal)* When a diagram and the code disagree, the diagram is wrong.

> UML is the Unified Modeling Language. Most working programmers use two of the fourteen. We draw to explain or check a design, not to generate code; the code is the design of record.

---

## The class box

*(diagram: `diagrams/box.mmd`)*

| Mark | Means |
|---|---|
| `+` | public |
| `-` | private |
| `#` | protected |
| `~` | package-private |
| *italic* | abstract |
| underlined | static |

> Name, then fields, then methods. Types only in the parentheses, return type last. Piece is italic because it is abstract, and so is pseudoLegalMoves.

---

## Which method of yours gets a `~`?

*(reveal)* `MoveGenerator.pseudoLegalMoves`: no access modifier, so it is package-private.

*(reveal)* `Game` and the tests in `engine` can call it. `Main` and `view` cannot.

> Session 5 promised we would use package-private, and M4 did. Ask for a show of hands: who has a ~ anywhere else?

---

## Six relationships

*(diagram: `diagrams/arrows.mmd`)*

| Left | Right | Relationship | Reads as |
|---|---|---|---|
| `MoveGenerator` | `Board` | dependency | uses it, keeps nothing |
| `Move` | `Position` | association | holds a reference |
| `Board` | `Piece` | aggregation | holds parts that outlive it |
| `Game` | `Board` | composition | owns a part that dies with it |
| `Rook` | `Piece` | inheritance | is a kind of |
| `Board` | `BoardView` | realization | implements |

> Every pair here is from your engine. Read each row left to right as a sentence: MoveGenerator uses Board; Rook is a kind of Piece.

---

## What decides the arrow

### If the class at the far end changes, does this one have to change? And how long does it hold on?

| Relationship | In the code | Mermaid |
|---|---|---|
| dependency | a parameter, a local, a static call | `A ..> B` |
| association | a field | `A --> B` |
| aggregation | a field holding parts that live on elsewhere | `A o-- B` |
| composition | a field holding a part only `A` uses | `A *-- B` |
| inheritance | `extends` | `B <\|-- A` |
| realization | `implements` | `B <\|.. A` |

> Dependency is the weakest: A only touches B during a call. Composition is the strongest of the four "has" arrows. Inheritance and realization are "is a" arrows; the triangle always points at the parent.

---

## `Game` and `Board`: which arrow?

*(reveal)* A field, so at least association.

*(reveal)* Composition: after construction, only `Game` changes its board.

*(reveal)* `Game(Board, Color)` accepts a board the caller could keep.

> Expect a split vote between aggregation and composition; take both. The constructor that takes a board is the honest objection: composition records the intent, and session 12's board() is where that intent leaked.

---

## `Game` and `MoveGenerator`: which arrow?

*(reveal)* Dependency. `Game` has no `MoveGenerator` field; it calls a static method.

*(reveal)* Nothing can hold a class that is never instantiated, so the only arrow to it is a dependency.

> Ask what would change the answer: a field of type MoveGenerator in Game. M4 told you not to add one.

---

## `Board` and `Piece`: why aggregation?

*(reveal)* A captured piece leaves the board and lives on in `Move.captured`.

*(reveal)* `undo` puts that same object back.

> Ask: where does the black pawn go when white captures it? Into the Move. That is why M3's undo needed no bookkeeping.

---

## Two more

`Move` and `Piece`?

*(reveal)* Association, through `moved` and `captured`: `1..2`, since `captured` may be null.

`TextBoardRenderer` and `Board`?

*(reveal)* Dependency: `render(Board)` takes it and keeps nothing.

> Multiplicity goes at the far end of the line: how many of those does one of these refer to.

---

## Your turn: the `model` package

In pairs, **8 minutes**, in [mermaid.live](https://mermaid.live) or on paper. Every class in `model`, its public methods, and every arrow.

```
classDiagram
    class Position {
        <<record>>
        +parse(String)$ Position
    }
    Move --> "2" Position
```

> Open your own repository next to the editor; the diagram is checked against your code, not mine. Walk the room at minute four and ask each pair which arrow they argued about.

---

## The `model` package

*(diagram: `diagrams/model.mmd`)*

> Build this from what the pairs call out, one arrow at a time, and check each against the source: Move's five components, Board's six methods. Keep it: it is half of the M5 class diagram.

---

## One Mermaid trap: the tilde

```
+legalMoves(Board, Color)$ List~Move~
~pseudoLegalMoves(Board, Color)$ List~Move~
```

- `List~Move~` is how Mermaid writes `List<Move>`.
- `~` at the start of a member means package-private.
- `$` at the end means static; `*` means abstract.

> If a member renders with stray angle brackets or loses its visibility, this is why.

---

## Sequence diagrams

- **Lifeline**: one object; time runs down.
- **Activation bar**: a method is running.
- **Call**: solid arrow. **Return**: dashed.
- **Fragments**: `loop`, `alt` (if/else), `opt` (if).

> A sequence diagram follows one call through the objects it touches, in order. A class diagram is true at every moment; a sequence diagram is one run of one method.

---

## `game.play(move)`

*(diagram: `diagrams/play.mmd`)*

> Every arrow is a line of play from M3. The alt fragment is the guard; the else branch is the three lines. Ask what would be wrong if apply came before the guard.

---

## Your turn: `game.legalMoves()`, as of M4

In pairs, **8 minutes**. Lifelines: caller, `Game`, `MoveGenerator`, `Board`, and one `Piece` for all of them.

```
sequenceDiagram
    caller->>Game: legalMoves()
    loop each square
    end
```

> Draw what your M4 code does today, before king safety. If your Game still has its own loop, draw that, and notice M4 asked you to move it.

---

## `game.legalMoves()` after M4

*(diagram: `diagrams/legalmoves-m4.mmd`)*

*(reveal)* M5 changes this diagram. Drawing the new one is part of M5.

> Compare with the pairs' versions. Common difference: a return arrow missing after pieceAt. Do not draw the M5 version.

---

## Diagrams go stale

Keep diagrams as Mermaid text in `docs/design.md`. GitHub draws them.

*(reveal)* A stale diagram then shows up in the diff that made it stale.

> The code changes and a drawing does not. A picture in a slide deck goes stale silently; text in the repository gets reviewed with the code.

---

## M5: the diagrams

- A **class diagram** of `engine` and `model`.
- A **sequence diagram** of `game.legalMoves()` after M5.

*(reveal)* Graded against your code, in both directions.

> Both go in docs/design.md, after the code; twenty percent of M5. An arrow the code lacks costs as much as one the diagram is missing. The model half is what you drew today.

---

## Exit card

> Draw the arrow between `Game` and `Board`, and the arrow between `MoveGenerator` and `Board`.
>
> **In one sentence, say why they are different arrows.**

---

# Next: Wednesday Oct 28

## Design patterns: Command and State

M5 is open, due Monday November 2 at 11:59 PM.

> Remind them: Wednesday Nov 11 is Veterans Day, so M5's due date is the Monday before the holiday.

---

**Appendix**

# Midterm recap

## 28 exams · 100 points

> Fifteen minutes on the midterm before UML. The numbers first, then what went well, then the five questions that cost the most points.

---

## The numbers

*(bar chart: below 50: 4 · 50s: 3 · 60s: 7 · 70s: 6 · 80s: 1 · 90+: 7)*

| Mean | 69.6 |
|---|---|
| Median | 70.8 |
| Min | 27.1 |
| Max | 96.5 |

> Half the class scored above 70, and seven of you scored 90 or more. The spread is wide: four exams are below 50. If yours is one of them, come to office hours this week and we will go through it question by question.

---

## Top 5: what the class knows

| Q | Topic | Class average |
|---|---|---|
| 3 | Equality in collections | 93% |
| 1 | Value, identity, or closed set | 85% |
| 8 | Encapsulation and invariants | 85% |
| 4 | Collections | 83% |
| 15 | Inheritance and polymorphism | 82% |

*(reveal)* Most misses inside these: the duplicate `Point` in a set, `setTotalCents`, and which `sound()` runs inside `super.describe()`.

> Equality, records, and encapsulation are solid, and the engine leans on all three. Ten of you counted the duplicate Point in the HashSet; a record's equals makes the two copies one element. Eight thought setTotalCents(0) keeps the invariant, and eight picked woof for the Puppy: super.describe() still calls Puppy's sound().

---

## Q12 · Dependencies · 44%

```java
public class OrderService {
    private final MySqlOrderDatabase database = new MySqlOrderDatabase();

    public String placeOrder(Order order) {
        database.save(order);
        return "<p>Order " + order.id() + " placed</p>";
    }
}
```

**(a)** What change lets a test run `OrderService` without MySQL?

**(b)** How does dependency injection differ from dependency inversion?

**(c)** Which concern has leaked in?

> Nine exams scored zero on this one. Take two minutes and answer all three parts again on paper before the next slide. Part (b) is the one to get right: two terms that sound alike and name different things.

---

## Q12 · Answer

```java
public interface OrderRepository {
    void save(Order order);
}

public class OrderService {
    private final OrderRepository orders;

    public OrderService(OrderRepository orders) {
        this.orders = orders;
    }

    public void placeOrder(Order order) {
        orders.save(order);
    }
}
```

*(reveal)* **Injection**: the dependency is passed in, not created inside.

*(reveal)* **Inversion**: the field's type is an interface.

*(reveal)* The HTML was presentation; it moves out.

> Injection is a technique: the constructor receives the dependency. Inversion is a principle: OrderService depends on an abstraction. Passing a MySqlOrderDatabase into the constructor is injection without inversion.

---

## Q9 · Composition or inheritance · 50%

```java
public class Stack<T> extends ArrayList<T> {
    public void push(T item) { add(item); }
    public T pop() { return remove(size() - 1); }
}
```

**(a)** Is a `Stack` an `ArrayList`? Name one method that breaks last in, first out.

**(b)** With composition, what does `Stack` have instead, and what can callers no longer do?

> One exam earned all five points here. For part (a), push and pop do not count: they are the stack's own methods. Look for a method Stack inherits without asking for it.

---

## Q9 · Answer

`stack.add(0, x)` puts an item under the top. A stack is not a list.

```java
public class Stack<T> {
    private final List<T> items = new ArrayList<>();

    public void push(T item) { items.add(item); }
    public T pop() { return items.remove(items.size() - 1); }
}
```

*(reveal)* Callers reach only `push` and `pop`, so no list method can break the order.

> Part (b) needed three things: the field, the delegation, and what callers lose. In today's terms, the inheritance arrow becomes an association.

---

## Q16 · The Archer · 54%

- Jumps exactly two squares: up, down, left, or right.
- Jumps over the square in between.
- Lands on an empty square or an enemy, never its own color.
- Write `Archer`, with imports.

```java
public abstract class Piece {
    protected Piece(Color color, PieceType type) { ... }

    public abstract List<Move> pseudoLegalMoves(Board board, Position from);

    protected List<Move> steppingMoves(Board board, Position from, int[][] offsets) { ... }
}
```

> This is the part of Piece the question gave you, without the bodies. Before the next slide, write the class header, the constructor, and the four offsets. Start with the constructor: what does Piece's constructor need from you?

---

## Q16 · Answer

```java
import java.util.List;

public class Archer extends Piece {

    private static final int[][] JUMPS =
        {{0, 2}, {0, -2}, {2, 0}, {-2, 0}};

    public Archer(Color color) {
        super(color, PieceType.ARCHER);
    }

    @Override
    public List<Move> pseudoLegalMoves(Board board, Position from) {
        return steppingMoves(board, from, JUMPS);
    }
}
```

- *(reveal)* 12 of 28 wrote no constructor.
- *(reveal)* 15 of 28 had all four jumps.
- *(reveal)* 14 of 28 reused `steppingMoves`.

> Piece has no no-argument constructor, so Archer must write one and call super with its color and its type; without it the class does not compile. A jump is a step of two, so steppingMoves already does the work, including the friendly-piece check. This is the same shape as your Knight.

---

## Q13 · Smells · 55%

```java
public double calc(List<Employee> l) {
    double t = 0;
    for (Employee e : l) {
        if (e.type().equals("MANAGER")) {
            t += e.salary() * 1.2;
        } else if (e.type().equals("ENGINEER")) {
            t += e.salary() * 1.1;
        } else {
            t += e.salary();
        }
    }
    System.out.println("Total payroll: " + t);
    return t;
}
```

**(a)** Name three distinct problems, and the change that answers each.

**(b)** What type should `"MANAGER"` be, and where should the 1.2 live?

> Part (a) asked for each problem together with its change; a problem without its change earned half. List three, each with its fix, before the next slide.

---

## Q13 · Answer

```java
public enum EmployeeType {
    MANAGER(1.2), ENGINEER(1.1), STAFF(1.0);

    private final double multiplier;

    EmployeeType(double multiplier) {
        this.multiplier = multiplier;
    }

    public double pay(double salary) {
        return salary * multiplier;
    }
}
```

| Smell | Change |
|---|---|
| `"MANAGER"`, a string | an enum |
| the `if` chain | a multiplier on the enum |
| `println` in a calculation | return; the caller prints |
| `calc`, `l`, `t` | names that say what they hold |

> The 1.2 belongs to MANAGER itself, so adding a type is one new constant and no new branch.

---

## Q7 · Checked exceptions · 73%

This does not compile. After each change, does it?

```java
public String load(Path path) {
    return Files.readString(path);    // Files.readString throws IOException
}
```

- `throws IOException` on the method
- `catch (IOException e)` around the call
- `catch (IllegalArgumentException e)` around the call

> Most of the class got the first two. Decide the third one before the next slide, and say why.

---

## Q7 · Answer

`Files.readString(path)` throws `IOException`, a checked exception.

| Change | Compiles? |
|---|---|
| `throws IOException` | yes |
| `catch (IOException e)` | yes |
| `catch (IllegalArgumentException e)` | *(reveal)* no: the `IOException` is still neither caught nor declared |

> Eleven of you said the third one compiles. A catch block handles only the exceptions it names, so the IOException still has to be declared or caught. IllegalArgumentException is unchecked, so the compiler never asks about it at all.
