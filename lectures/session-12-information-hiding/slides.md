**CSC 413 · Week 7 · Wednesday Oct 7**

# Information Hiding and Clean Code

### Encapsulation: deciding what the outside world is allowed to know — and do

> M4 is due Monday October 12 at 11:59 PM. Nothing today adds to it.

---

## Two lines. Forty-two green tests.

```java
// the black king is gone
game.board().place(Position.parse("e8"), null);
System.out.println(game.history());   // []
```

```
e8 after       : null
history()      : []
sideToMove()   : WHITE
```

> Type these live. Run it, let them read the output, then ask the question on the next slide.

---

## Whose fault is this?

### The field was `private` the whole time.

*(reveal)* `private` hid the **field**. It did not hide the **object**.

*(reveal)* `board()` handed out `Game`'s own state, mutators and all.

> Someone will say "make it private" — point out that it is. Then move on; the Board comes back once, as the example for point 4.

---

## Encapsulation

*What you arrived with:* **"Make the fields private. Write getters and setters."**

*(reveal)* *What to leave with:* **Controlling what other code is allowed to know about an object, and do to it.**

*(reveal)* Three goals: **protect invariants · hide decisions that might change · reduce coupling**

> Say the definition twice. The next eight slides are one point each.

---

## 1 · `private` is a mechanism, not encapsulation

### ❌ Private, then handed straight back

```java
private double balance;
public void setBalance(double balance) { this.balance = balance; }
```

### ✅ The API says what you can do with an account

```java
public void deposit(double amount) {
    if (amount <= 0) throw new IllegalArgumentException();
    balance += amount;
}
public void withdraw(double amount) {
    if (amount > balance) throw new IllegalStateException();
    balance -= amount;
}
```

*(reveal)* `account.setBalance(-1_000_000)` compiles in the first. It cannot be written in the second.

---

## 2 · The central idea is protecting invariants

An **invariant** is a statement about an object's state that must be true every time anyone looks at it.

| Object | What must always be true |
|---|---|
| `BankAccount` | `balance >= 0` |
| `Position` | `0 <= file < 8`, `0 <= rank < 8` |
| `Game` | board, history, and turn agree |

**If an object has rules about its state, the object controls the operations that change that state.**

---

## ✅ Your `Position`: an invalid one cannot exist

```java
public record Position(int file, int rank) {

  public static final int BOARD_SIZE = 8;

  public Position {
    if (!isOnBoard(file, rank)) {
      throw new IllegalArgumentException("File or rank not on the board");
    }
  }
```

No private field. The rule is enforced at the only place a `Position` is created.

> Live: new Position(8, 0) throws. Ask which class checks positions elsewhere. None.

---

## Your `Game`: three invariants, two operations

1. Every change to the board goes through `play` or `undoLastMove`.
2. `history` and the board agree.
3. `sideToMove` flips once per history entry.

*(reveal)* `play` and `undoLastMove` keep all three. The exit question asks about one of them.

---

## 3 · Hide decisions that might change

```java
  public Piece pieceAt(Position position) {
    return squares[position.file()][position.rank()];
  }
```

`Board` stores a `Piece[8][8]`. No caller has seen it. Swap in `Piece[64]`: **no caller changes.**

*(reveal)* **The more implementation you expose, the more other code can depend on it.** Encapsulation reduces the assumptions other code can make about yours.

> Parnas 1972, session 9's coupling. One slide; do not linger.

---

## 4 · Don't leak mutable state

### ❌ Returns the object itself

```java
// place, apply, undo come with it
public Board board() { return board; }
```

### ✅ Returns something the caller cannot use to change `Game`

```java
public List<Move> history() { return List.copyOf(history); }
```

*(reveal)* An accessor is fine when what it returns cannot change the object's state. A copy, an immutable value, or a read-only view.

---

## The fix for `board()`: a read-only view

```java
public interface BoardView {
    Piece pieceAt(Position position);
    boolean isEmpty(Position position);
    List<Position> positionsOf(Color color);
}
```

```java
// same object, declared type changes
public BoardView board() { return board; }
```

*(reveal)* Technical debt: a method named `board()` that returns a `BoardView`. The better name is `boardView()`, but `board()` is M3's required API and its callers have to move first.

> Live, follow-along repo: Extract Interface on Board, read methods only. Game stays closed; revert; say why.

---

## Why it works: the caller's type has no `place`

The two lines from the start no longer compile.

```
game.board().place(Position.parse("e8"), null);
            ^
error: cannot find symbol
  symbol:   method place(Position,<null>)
  location: interface BoardView
```

*(reveal)* The renderer takes a `BoardView` too, which is all it ever used.

*(reveal)* **Not yet:** a commit for after M4, not during it.

> Live, follow-along repo: Extract Interface on Board, read methods only. Game stays closed; revert; say why.

---

## 5 · Tell objects what to do

### ❌ Manipulating the game from outside

```java
if (game.legalMoves().contains(move)) {
    game.board().apply(move);
    // history and sideToMove cannot be updated from here
}
```

### ✅ Telling the game what to do

```java
game.play(move);
```

*(reveal)* As a caller: **call `play`.** As the designer: **expose `play`, and no way around it.** Expose behavior, not machinery.

---

## 6 · Not about hiding everything

`Position` and `Move` are records. **Every field is public**, and that is right: nothing is left to protect after construction.

The question is not *"can I make this private?"*

*(reveal)* It is *"what does another part of the program actually **need** to know or do?"* Expose the smallest useful abstraction.

---

## 7 · The same rule at every boundary

| Boundary | What is hidden behind it | The one door | ❌ Reaching around the door |
|---|---|---|---|
| Class: `Game` | the board, the history, the turn | `play`, `undoLastMove` | `game.board().apply(move)` |
| Package: `engine` | `Board`, the pieces, move generation | `Game` | `Main` importing `Board` to move pieces |
| Service | its database tables | its API | another service querying those tables directly |

*(reveal)* Each row is the same mistake: **a caller depends on how something is built instead of what it offers.** Each fix is the same: go through the door.

> Row 2 is their own Game Javadoc: everything outside the engine talks to Game and nothing behind it. Row 3 is one sentence; do not explain microservices.

---

## 8 · Encapsulation has a cost

`position.rank()` is enough. Nobody needs `position.getRankThroughPositionAccessorService()`.

Every abstraction adds something to read and maintain.

*(reveal)* **Hide what callers should not depend on. No more.**

---

## The mental model

### Decide what the outside world is allowed to know and do. Hide everything else.

1. **What must always be true?** → invariants
2. **What should callers be allowed to do?** → public API
3. **What should callers *not* be able to do?** → protect state
4. **What might I want to change later?** → hide it

> Ask the four of Game out loud. board() fails question 3.

---

## Why an engineer cares

```
ENCAPSULATION
      │
      ├── protects invariants
      ├── hides implementation decisions
      ├── creates clear boundaries
      └── reduces coupling
                 │
                 ▼
         easier to change
```

*(reveal)* **Encapsulation is not about privacy. It is about changing software without breaking the code around it.**

---

## Exit card

> Your `history()` returns a copy.
>
> **Name the invariant that copy protects**, and write the one line a caller could type to break it, if the method said `return history;` instead.

---

# Next: Monday Oct 12

### Midterm review — bring questions, bring your computer

M4 due 11:59 PM that night. The midterm is Wednesday Oct 21, in class.

> If anyone asks about adding BoardView: after M4, as its own commit.
