# Session 12 — Information Hiding and Clean Code

**Week 7, Wednesday October 7 · CSC 413 Software Development**

**Objectives advanced:** 2 (encapsulation and abstraction), 3 (analyze
maintainability and responsibility assignment), 4 (refactor toward cleaner
software)

**Milestone:** M4 — `MoveGenerator`, due Monday October 12 at 11:59 PM.
Nothing here changes what M4 asks for.

**Midterm:** Monday October 12 is a review session; bring your questions and
your computer. The midterm is Wednesday October 21, in class.

Most of you learned encapsulation as *make the fields private and write getters
and setters*. That misses most of the point. After this session you should be
able to say this instead, and defend it from your own code:

> **Encapsulation is controlling what other code is allowed to know about an
> object, and what it is allowed to do to it.**

It has three goals: protect **invariants**, hide **decisions that might
change**, and reduce **coupling**. The eight points below are the whole
argument. The chess examples are code you have already written.

## The two lines that should not work

`Game.board()` returns the game's `Board`. Against an M3-complete repository
with all forty-two tests green:

```java
game.board().place(Position.parse("e8"), null);   // the black king is gone
System.out.println(game.history());                // []
```

The black king is gone. The history is empty, because no move was played. It is
still White's turn. Every test is green.

The field was private the whole time. `private` hid the *field*; it did not hide
the *object*. `board()` handed out a reference to `Game`'s own state, the
mutable `Board`, with `place`, `apply`, and `undo` still attached. Keep this in
mind; it is the example for point 4.

## 1. `private` is a mechanism, not encapsulation

This class passes the textbook test. The field is private; there is a getter
and a setter.

```java
class BankAccount {
    private double balance;

    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
}
```

It is technically encapsulated and enforces nothing. We made `balance` private
and then handed control of it straight back:

```java
account.setBalance(-1_000_000);
```

Compare a version whose public methods describe what you can *do* with an
account, rather than how it happens to store its state:

```java
class BankAccount {
    private double balance;

    public double balance() { return balance; }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException();
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount > balance) throw new IllegalStateException();
        balance -= amount;
    }
}
```

The negative balance cannot be written in the second version. That is
encapsulation; the keyword was only the mechanism.

## 2. The central idea is protecting invariants

An **invariant** is a statement about an object's state that must be true every
time anyone looks at it. It may be false for a moment inside a method, but
never when control is outside the object.

| Object | Invariant |
|---|---|
| `BankAccount` | `balance >= 0` |
| `Position` | `0 <= file < 8` and `0 <= rank < 8` |
| `Game` | the board, the history, and the turn agree |

Good encapsulation makes invalid states impossible, or at least hard, to create.
The rule that follows:

> **If an object has rules about its state, the object should control the
> operations that change that state.**

You already own the clearest example in the engine. This is your `Position`,
unchanged since M1:

```java
public record Position(int file, int rank) {

  public static final int BOARD_SIZE = 8;

  public Position {
    if (!isOnBoard(file, rank)) {
      throw new IllegalArgumentException("File or rank not on the board");
    }
  }
```

Session 3 called this the compact constructor. Once constructed, every
`Position` is valid, so no other class in the engine ever asks whether one is.
There is no private field here. The invariant is enforced at the only place a
`Position` can be created, which is a deeper form of encapsulation than any
access modifier.

`Game`'s invariants are about three fields agreeing with one another:

1. Every change to the board goes through `play` or `undoLastMove`.
2. `history` and the board agree: the board is what you get by playing the
   history from the start.
3. `sideToMove` flips exactly once per entry in the history.

`play` and `undoLastMove` are the two operations that change `Game`'s state,
and each keeps all three. The exit question asks about one of them.

## 3. Hide decisions that might change

Parnas, in 1972, argued that a module should be built around a decision that is
likely to change. The module hides that decision; its interface exposes only what
is expected to stay stable.

Your `Board` does this. It stores a `Piece[8][8]`, and the only way anyone reads
it is:

```java
  public Piece pieceAt(Position position) {
    return squares[position.file()][position.rank()];
  }
```

Session 3 weighed a single `Piece[64]` with a `0..63` index. Switch to it
tomorrow and no caller changes, because no caller ever saw the array.

This is where encapsulation meets session 9's word, coupling. The more
implementation detail you expose, the more other code can depend on it.
Encapsulation reduces the number of assumptions other code can make about your
implementation, and fewer assumptions means fewer callers break when you change
your mind.

## 4. Don't leak mutable state

This is the shape to recognise on sight: a private field, and an accessor that
returns the live object.

```java
public Board board() { return board; }          // place, apply, undo come with it
```

That is the hook. `Game` has a second accessor that gets it right:

```java
    /**
     * Returns a copy. The list {@code Game} keeps is private, and handing it
     * out would let any caller rewrite the game's past.
     */
    public List<Move> history() {
        return List.copyOf(history);
    }
```

An accessor is fine when what it returns cannot be used to change the object's
state: a copy, an immutable value such as the `Color` from `sideToMove()`, or a
read-only view. `history()` returns a copy. `board()` returns the object.

The fix for `board()` is the read-only view session 10 sketched:

```java
public interface BoardView {
    Piece pieceAt(Position position);
    boolean isEmpty(Position position);
    List<Position> positionsOf(Color color);
}
```

`Board` implements it and keeps every method it has. The fix is one word in
`Game`: `board()` is declared to return `BoardView` instead of `Board`. It still
returns the same object. What changes is the *type* the caller holds, and the
compiler only lets a caller call what that type declares. The two lines from
the start of these notes stop compiling:

```
game.board().place(Position.parse("e8"), null);
            ^
error: cannot find symbol
  symbol:   method place(Position,<null>)
  location: interface BoardView
```

`place`, `apply`, and `undo` stay off the interface, because any of them on the
view would reopen the hook. The renderer's parameter changes from `Board` to
`BoardView`, which is all it ever used.

This leaves a piece of technical debt worth naming: a method called `board()`
that returns a `BoardView`. The name promises more than the type delivers, and
the better name is `boardView()`. It keeps the old name because `board()` is
M3's required API and the tests and `Main` call it; renaming means moving those
callers first, which is its own commit after this one.

Two honest limits. The `Board` behind the view is still mutable, and whoever
holds the `Board` itself, which is only `Game`, can still change it. And Java
lets a determined caller cast the view back to `Board`. The view stops
accidents, which is what the hook was; it does not stop someone who has decided
to break the game, and no accessor design can.

**Not yet.** Do not add `BoardView` to your repository while M4 is open.
`Game.legalMoves()` is M4's edit, and an interface in the same commit mixes a
refactoring with a feature, which is what Monday argued against. It is a fine
commit for after M4 lands.

## 5. Tell objects what to do

Here is `play`, from your own `Game`:

```java
    public void play(Move move) {
        if (!legalMoves().contains(move)) {
            throw new IllegalArgumentException("Illegal move: " + move);
        }
        board.apply(move);
        history.add(move);
        sideToMove = sideToMove.opposite();
    }
```

Now a caller trying to do the same job from outside, with what `board()` gives
it:

```java
if (game.legalMoves().contains(move)) {
    game.board().apply(move);
    // history and sideToMove cannot be updated from here
}
```

The outside version can change the board but not the history or the turn,
because `Game` offers no way to set either. It leaves `Game` inconsistent.
`Game` owns the meaning of "play a move": the legality check, the board change,
the history entry, and the turn flip happen together or not at all. If the rule
changes tomorrow, say a move must also update a clock, every caller of `play`
gets it for free and no caller of `board().apply` does.

What to do instead depends on which side of the boundary you are on:

- **As a caller of `Game`:** call `play`, never `board().apply`. If `Game` does
  not offer the operation you need, that is a request to add it to `Game`, not
  a reason to reach around it.
- **As the designer of `Game`:** expose `play`, and do not expose a way around
  it. *Expose behavior, not machinery*: public methods are things a caller can
  ask the object to do, not handles on the parts it is made of.

## 6. Not about hiding everything

Students who hear all this sometimes overcorrect and make everything private.
That is not better. `Position` and `Move` are records that expose every field,
and that is right: after construction there is nothing left to protect. A
`Position` that is on the board has no further rules, so `position.file()` is
exactly as public as it should be.

The question is not "can I make this private?" It is:

> **What does another part of the program actually need to know, or be able to
> do?**

Expose the smallest useful abstraction. Every public method is a promise to
every future caller.

## 7. The same rule at every boundary

Everything so far was about one class. The same rule applies at every boundary
in a system: something is hidden behind it, there is one door to it, and
reaching around the door is the same mistake at every scale.

| Boundary | What is hidden behind it | The one door | Reaching around the door |
|---|---|---|---|
| Class: `Game` | the board, the history, the turn | `play`, `undoLastMove` | `game.board().apply(move)` |
| Package: `engine` | `Board`, the pieces, move generation | `Game` | `Main` importing `Board` to move pieces |
| Service | its database tables | its API | another service querying those tables directly |

The second row is already written in your code. The Javadoc on `Game` says
that everything outside the engine talks to `Game` and to nothing behind it,
and `Main` obeys it: it imports `Game` and the view, never `Board`. Your `Board`
keeps a boundary of its own with the comment refusing to call `PieceFactory`,
because that would make `model` depend on `factory`.

The third row is the same idea at the scale of a system. A service with an API
is encapsulating its database. If another team queries its tables directly,
every assumption about those tables is now shared by two teams, and the owner
can no longer change them without breaking someone else. That is a caller
depending on how something is built instead of what it offers, which is exactly
what `game.board().apply(move)` does to `Game`. The fix is the same: go through
the door.

## 8. Encapsulation has a cost

You can over-encapsulate. `position.rank()` is enough; nobody needs
`position.getRankThroughPositionAccessorService()`. Every abstraction is
something more to read and maintain, and a copy on every call has a runtime
cost too. Encapsulation earns its cost when it hides something callers should
not depend on. Hide that, and no more.

## The mental model

> **Encapsulation: decide what the outside world is allowed to know and do.
> Hide everything else.**

Four questions to ask of any class you design, and of every class you already
have. Ask them of `Game`:

1. **What must always be true?** The invariants.
2. **What should callers be allowed to do?** The public API.
3. **What should callers *not* be able to do?** Protect the state.
4. **What decisions might I want to change later?** Hide them.

And why a software engineer cares:

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

Encapsulation is not about privacy. It is about changing software without
breaking the code around it.

## Exit question

> Your `history()` returns a copy. Name the invariant that copy protects, and
> write the one line a caller could type to break it, if the method said
> `return history;` instead.

The copy is already a graded M3 criterion and the handout states it. The question
asks for the reason, not the code.

**Related material:** [M4 handout](../../assignments/m4-move-generator/handout.md),
[session 11 notes](../session-11-refactoring/notes.md),
[session 10 notes](../session-10-solid/notes.md) §7 on `BoardView`,
[session 9 notes](../session-09-cohesion-coupling/notes.md) §3 on coupling,
[session 3 notes](../session-03-java-review/notes.md) on the compact constructor.
