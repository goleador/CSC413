# Midterm Coding Bank

**CSC 413 Software Development · Fall 2026**

Question 16 on the midterm asks you to write one of the classes or functions
below, from memory, so that it compiles and runs. Every entry is code you
have already seen in a session. Learn all of them: be able to write each one
on paper, and explain the concept it shows.

When an entry uses another type, such as `Color` or `Move`, the exam gives
you that type's public methods. Write imports and semicolons: code that
does not compile loses points.

---

## Classes

### C1. `Position`: a value as a record (sessions 3, 4, 12)

**Concept.** A square is a *value*: two squares with the same file and rank
are the same square. A `record` gives a value its constructor, accessors,
`equals`, `hashCode`, and `toString` for free. The *compact constructor*
validates the fields, so an invalid `Position` cannot exist and no other
class ever has to check one. `isOnBoard` is `static` because it is asked
before there is a `Position` to ask.

```java
public record Position(int file, int rank) {

    /** Files and ranks both run 0..7. */
    public static final int BOARD_SIZE = 8;

    public Position {
        if (!isOnBoard(file, rank)) {
            throw new IllegalArgumentException(
                    "Position off board: file=" + file + ", rank=" + rank);
        }
    }

    /** True when these raw coordinates name a real square. */
    public static boolean isOnBoard(int file, int rank) {
        return file >= 0 && file < BOARD_SIZE && rank >= 0 && rank < BOARD_SIZE;
    }

    /** This square in algebraic notation, e.g. {@code "e4"}. */
    @Override
    public String toString() {
        return "" + (char) ('a' + file) + (char) ('1' + rank);
    }
}
```

### C2. `Position` by hand: what the record writes for you (session 3)

**Concept.** Before records, a value class needed `private final` fields,
accessors, and an `equals` and `hashCode` written by hand. They travel
together: `HashSet` and `HashMap` find an object by `hashCode` first and then
confirm with `equals`, so two equal objects must have equal hash codes.
`equals` takes an `Object`; a version that takes a `Position` is an overload,
and collections never call it. Session 3 showed this class with the bodies
left out; these are the standard bodies.

```java
import java.util.Objects;

public final class Position {

    private final int file;
    private final int rank;

    public Position(int file, int rank) {
        this.file = file;
        this.rank = rank;
    }

    public int file() { return file; }
    public int rank() { return rank; }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Position)) {
            return false;
        }
        Position other = (Position) o;
        return file == other.file && rank == other.rank;
    }

    @Override
    public int hashCode() {
        return Objects.hash(file, rank);
    }

    @Override
    public String toString() {
        return "" + (char) ('a' + file) + (char) ('1' + rank);
    }
}
```

### C3. `Color` and `PieceType`: closed sets as enums (sessions 3, 5)

**Concept.** When the possible values are fixed and known, an `enum` makes
every other value impossible to write: no `"white"` versus `"White"`, no
`int color = 2`. An enum can carry data and behavior. Each constant passes
its letter to a private constructor, and stores it in a `private final`
field. A short fixed fact per kind belongs in the enum.

```java
public enum Color {
    WHITE,
    BLACK;

    /**
     * The direction pawns of this color advance, measured in ranks.
     * White moves up the board (+1), black moves down (-1).
     */
    public int pawnDirection() {
        return this == WHITE ? 1 : -1;
    }
}
```

```java
public enum PieceType {
    PAWN('P'), KNIGHT('N'), BISHOP('B'), ROOK('R'), QUEEN('Q'), KING('K');

    private final char symbol;

    PieceType(char symbol) {
        this.symbol = symbol;
    }

    /** The uppercase letter for this type, as used in FEN and algebraic notation. */
    public char symbol() {
        return symbol;
    }
}
```

### C4. `Piece`: identity and composition (sessions 5, 7)

**Concept.** A piece has *identity*: two white rooks are two pieces, even
though they look the same, so `Piece` is a `class` and does not override
`equals`. It is built by *composition*: it has a `Color` and a `PieceType`,
both `private final`, set once by the constructor. Callers read them through
accessors and cannot change them. `toString` is overridden so that printing a
piece shows its letter.

```java
public class Piece {
    private final Color color;
    private final PieceType type;

    public Piece(Color color, PieceType type) {
        this.color = color;
        this.type = type;
    }

    public Color color() { return color; }
    public PieceType type() { return type; }

    /** This piece's letter: uppercase for white, lowercase for black. */
    public char symbol() {
        char letter = type.symbol();
        return color == Color.WHITE ? letter : Character.toLowerCase(letter);
    }

    @Override
    public String toString() { return String.valueOf(symbol()); }
}
```

### C5. Abstract `Piece` and one subclass (sessions 6, 7, 11)

**Concept.** "Where can a piece go?" has no answer for a piece in general,
only for a knight or a rook. So `Piece` is `abstract` (nobody can create a
bare one), declares the question as an `abstract` method, and each subclass
answers it with `@Override`. The constructor is `protected`: only subclasses
call it, through `super(...)`, as the first line of their own constructor.
`attacks` is a concrete method in the parent that calls the abstract one, so
every subclass inherits it and dynamic dispatch picks the right
`pseudoLegalMoves` at run time. Callers ask the piece; they never ask what
kind it is.

```java
import java.util.List;

public abstract class Piece {

    private final Color color;
    private final PieceType type;

    protected Piece(Color color, PieceType type) {
        this.color = color;
        this.type = type;
    }

    public Color color() { return color; }
    public PieceType type() { return type; }

    /**
     * Every move this piece could make from {@code from}, ignoring whether
     * it would leave its own king in check.
     */
    public abstract List<Move> pseudoLegalMoves(Board board, Position from);

    /** True if this piece could capture an enemy standing on {@code target}. */
    public boolean attacks(Board board, Position from, Position target) {
        for (Move move : pseudoLegalMoves(board, from)) {
            if (move.to().equals(target)) {
                return true;
            }
        }
        return false;
    }
}
```

```java
import java.util.List;

public class Knight extends Piece {

    private static final int[][] OFFSETS = {
            {1, 2}, {2, 1}, {2, -1}, {1, -2},
            {-1, -2}, {-2, -1}, {-2, 1}, {-1, 2}
    };

    public Knight(Color color) {
        super(color, PieceType.KNIGHT);
    }

    @Override
    public List<Move> pseudoLegalMoves(Board board, Position from) {
        return steppingMoves(board, from, OFFSETS);
    }
}
```

On the exam, `steppingMoves` is given as a `protected` method of `Piece`; you
write the subclass that calls it.

### C6. `PieceGlyphs`: an interface and an implementation (sessions 6, 12)

**Concept.** An interface names a question and shares nothing else: no
fields, no code. Any class that `implements` it promises an answer, and the
caller holds the interface type, so it never asks which implementation it
has. Choose an interface when the implementations share no state or code;
choose an abstract class when they do. A narrow interface, such as
`BoardView`, also limits what a caller can do: it applies interface
segregation.

```java
public interface PieceGlyphs {
    /** The text for one square; {@code piece} is null when it is empty. */
    String glyphFor(Piece piece);
}
```

```java
public class Letters implements PieceGlyphs {
    @Override
    public String glyphFor(Piece p) {
        return p == null ? "." : String.valueOf(p.symbol());
    }
}
```

```java
import java.util.List;

public interface BoardView {
    Piece pieceAt(Position position);
    boolean isEmpty(Position position);
    List<Position> positionsOf(Color color);
}
```

### C7. `PieceFactory`: switch at the edges (session 6)

**Concept.** Somewhere, a `PieceType` must turn into the right subclass.
That `switch` is allowed in exactly one place, at the boundary where data
becomes objects; everywhere else, polymorphism. The class is `final` with a
`private` constructor because it holds only `static` methods. The switch has
no `default`, so a seventh `PieceType` breaks the build here instead of
failing at run time.

```java
public final class PieceFactory {

    private PieceFactory() {
    }

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
}
```

### C8. `BankAccount`: protecting an invariant (session 12)

**Concept.** `private` alone is not encapsulation. With a public setter,
any caller can set any balance, and the class cannot keep its rule that a
balance never goes below zero. Remove the setter and expose *operations*
(tell, don't ask): each one checks its own rule and throws when the caller
asks for something invalid. `IllegalArgumentException` means the argument is
wrong; `IllegalStateException` means the object is in the wrong state for the
request.

```java
// before: private, but not encapsulated
public class BankAccount {
    private double balance;

    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
}
```

```java
// after: the class keeps its own invariant
public class BankAccount {
    private double balance;

    public double balance() { return balance; }

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit must be positive: " + amount);
        }
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            throw new IllegalStateException("Insufficient funds: " + amount);
        }
        balance -= amount;
    }
}
```

### C9. `Game`: composition, copies, guards, `Optional` (sessions 8, 10, 12)

**Concept.** `Game` *has* a board, a history, and a side to move, all
private. It keeps three facts in agreement, its invariants: the board, the
moves in the history, and whose turn it is. Every change goes through its
methods. `history()` returns a copy, so no caller can rewrite the past.
`play` checks first and throws for an illegal move, which is the caller's
bug. `undoLastMove` returns an `Optional`, because "nothing to undo" is an
ordinary answer.

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class Game {
    private final Board board;
    private final List<Move> history = new ArrayList<>();
    private Color sideToMove;

    public Game(Board board, Color sideToMove) {
        this.board = board;
        this.sideToMove = sideToMove;
    }

    public Color sideToMove() {
        return sideToMove;
    }

    /** A copy: the list Game keeps is private. */
    public List<Move> history() {
        return List.copyOf(history);
    }

    public void play(Move move) {
        if (!legalMoves().contains(move)) {
            throw new IllegalArgumentException("Illegal move: " + move);
        }
        board.apply(move);
        history.add(move);
        sideToMove = sideToMove.opposite();
    }

    public Optional<Move> undoLastMove() {
        if (history.isEmpty()) {
            return Optional.empty();
        }
        Move last = history.remove(history.size() - 1);
        board.undo(last);
        sideToMove = sideToMove.opposite();
        return Optional.of(last);
    }

    public List<Move> legalMoves() { ... }   // given on the exam
}
```

On the exam, `legalMoves()`, `Board.apply`, `Board.undo`, and
`Color.opposite()` are given.

---

## Functions

Each of these is a method from one of the classes above, or one more small
method from the sessions. On the exam you may be asked for one on its own,
with the surrounding class given.

### F1. A static helper: `isOnBoard` (session 3)

**Concept.** A method that needs no object is `static`. It answers a
question about raw numbers before a `Position` exists. See C1.

### F2. Validation in a compact constructor (sessions 3, 4)

**Concept.** Throw `IllegalArgumentException` from the constructor, so an
invalid object never exists. The message names the bad values. See C1.

### F3. Overriding `toString` (sessions 3, 5)

**Concept.** `toString` is inherited from `Object`; overriding it controls
what printing shows. `@Override` makes the compiler check the signature.
See C1 and C4.

### F4. `equals` and `hashCode` (session 3)

**Concept.** `equals(Object)`, not `equals(Position)`; check the type, cast,
compare fields. `hashCode` from the same fields. See C2.

### F5. An enum with a field (session 5)

**Concept.** The constants pass data to a private constructor, stored in a
`private final` field and read by an accessor. See C3.

### F6. A method that decides by a field: `symbol()` (session 5)

**Concept.** Ask your own fields; use the conditional operator for a
two-way choice. See C4.

### F7. A concrete method that calls an abstract one: `attacks` (sessions 6, 11)

**Concept.** The parent writes the loop once; each subclass supplies the
moves. The loop returns as soon as it finds the answer. See C5.

### F8. The one `switch`: `PieceFactory.create` (session 6)

**Concept.** A `switch` expression with `->` arms that returns a value, one
arm per enum constant, no `default`. See C7.

### F9. Return a copy: `history()` (sessions 8, 12)

**Concept.** A getter that returns a private mutable list hands out the list
itself. `List.copyOf` returns an unmodifiable snapshot. See C9.

### F10. A guard that throws: `play` (sessions 8, 10)

**Concept.** Check first, then act. A bug in the caller throws; nothing is
changed when it does. See C9.

### F11. Saying no with `Optional`: `undoLastMove` (session 8)

**Concept.** `Optional.empty()` for an ordinary "nothing here";
`Optional.of(value)` otherwise. The caller is made to handle both. See C9.

### F12. Operations instead of setters: `deposit` and `withdraw` (session 12)

**Concept.** Each operation checks its own rule before it changes state.
See C8.

### F13. Removing from a list safely (session 8)

**Concept.** Removing from a list inside a for-each loop over that same list
throws `ConcurrentModificationException`. Use `removeIf`, or build a new list
of what to keep.

```java
import java.util.ArrayList;
import java.util.List;

public static List<Move> withoutCaptures(List<Move> moves) {
    List<Move> kept = new ArrayList<>();
    for (Move move : moves) {
        if (!move.isCapture()) {
            kept.add(move);
        }
    }
    return kept;
}

// or, changing the list in place:
moves.removeIf(Move::isCapture);
```

### F14. A refactored method: `report` (session 11)

**Concept.** Same output, better structure. Mysterious names renamed;
duplicated formatting extracted into `formatMove`; the magic numbers 1, 2,
3 replaced by an enum, with a `switch` that turns each constant into text.

```java
import java.util.List;

enum Result { WHITE_WINS, BLACK_WINS, DRAW }

public String report(List<String> moves, Result result) {
    StringBuilder text = new StringBuilder();
    for (int i = 0; i < moves.size(); i++) {
        boolean whitesMove = i % 2 == 0;
        if (whitesMove) {
            text.append(i / 2 + 1).append(". ").append(formatMove(moves.get(i))).append(' ');
        } else {
            text.append(formatMove(moves.get(i))).append('\n');
        }
    }
    return text.append(describe(result)).toString();
}

private static String formatMove(String move) {
    return move.substring(0, 2) + "-" + move.substring(2, 4);
}

private static String describe(Result result) {
    return switch (result) {
        case WHITE_WINS -> "White wins";
        case BLACK_WINS -> "Black wins";
        case DRAW -> "Draw";
    };
}
```
