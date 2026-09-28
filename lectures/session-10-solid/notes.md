# Session 10 — SOLID: Five Names for What You Did in M2

**Week 6, Wednesday September 30** · CSC 413 Software Development
**Objectives advanced:** 2 (SOLID design principles), 3 (analyze designs for maintainability, extensibility, and responsibility assignment)
**Milestone supported:** M3 — turns, moves, `Game` (due Monday Oct 5, 11:59 PM). M4 — `MoveGenerator` (due Monday Oct 12).

---

## Where you are this morning

M2 is in. M3 is due Monday, and by now most of you have `apply` and `undo`
on `Board` and are somewhere inside `Game`. M4 opened Monday with a
two-method scaffold, and Monday's session left you a question: why does
one of those methods have no access modifier?

Monday named three ideas you had already used. Today names five more, with
a mnemonic, and the same claim: **you have applied four of these in M2 and
in the scaffold you are filling in now.** The fifth is what M4 asks you to
do. We read your repo through each lens, then decide where every remaining
piece of M3 belongs, then take a working one-file chess program apart.

**By the end of today you can:**

1. State each SOLID principle in one sentence and point at the line in your
   repo, today, where you applied it or chose not to.
2. Take each job M3 still asks of you and say which class it belongs to and
   why, before writing it.
3. Read a class that does everything and say, cut by cut, what leaves and
   where it goes in your engine.

---

## 1. Five names

| | Principle | In one sentence | Where you did it |
|---|---|---|---|
| **S** | Single responsibility | one reason to change | M2: seven files. Monday: the scaffold. |
| **O** | Open/closed | add behaviour by adding code, not by editing working code | M2: the Archbishop question |
| **L** | Liskov substitution | a subclass must work wherever its parent is expected | M2: six classes through one `Piece` |
| **I** | Interface segregation | a caller should not depend on methods it does not use | the scaffold's `public` surface; Monday's package-private question |
| **D** | Dependency inversion | depend on abstractions, not on concrete classes | `List<Move>`; `Piece piece`; who names `Knight` |

The letters were assembled by Robert Martin around 2000; two of the ideas
carry other people's names and are older. Treat the acronym as a checklist
to run over a design, not as five laws. Each is a judgement, the way DRY
was a judgement in session 6, and for each one there is a place in your
repo where you chose not to follow it, on purpose. We will find those too.

---

## 2. S — Single responsibility

Monday's cohesion, with a name and a sharper question. Martin's phrasing
is *one reason to change*. The sharper question is **who would ask for the
change?** Reasons come from people.

| Class | One sentence | Who would ask |
|---|---|---|
| the six pieces | how one piece moves | the rules committee |
| `Board` | stores which piece is on which square | you, for a faster representation |
| `TextBoardRenderer` | draws a board as text | the player, who wants it prettier |
| `Game`, as scaffolded | plays one game's moves in turn order and remembers them, **and** generates them | you, for turns and undo; **and** the rules committee, for king safety |

One asker per class, except the last row, which has two. That is the
whole case for M4 in one table. After M4, `Game` has one asker and
`MoveGenerator` has the other.

Two ways to get this wrong. The first is the class that does everything,
which we meet in §8. The second is the opposite: a `Turn` class, a
`History` class, a `SideToMove` class, each holding one field, until the
program is a hundred files that do nothing alone. SRP does not say one
method per class. `Game`'s sentence has "and remembers them" in it, and
that is one job, because undo cannot exist without the memory. The test is
whether two parts would ever change **separately**, not whether you can
name them separately.

---

## 3. O — Open/closed

Bertrand Meyer, 1988: *open for extension, closed for modification.* You
should be able to add behaviour by adding code, without editing code that
already works.

You did this in M2 and session 6 named it once. `Piece.pseudoLegalMoves` is
abstract; every kind of piece answers it; the loop asks each piece and
never asks which kind. Add an Archbishop: one new file. `Board`, the loop,
`TextBoardRenderer`, and every existing test stay closed. You have
thirty-four green tests that prove the six pieces work; adding a seventh
cannot break them, because no file they test is edited.

Why it matters: editing working code is how working code stops working,
and tests catch that only after the fact. Code you never edit never
breaks. The mechanism is the one you used: an abstraction with
polymorphism behind it. Every place that would have needed
`switch (piece.type())` is a place that is now closed.

**The honest counterexample is in your repo.** Open `PieceFactory.create`.
It is a `switch` over `PieceType`. Add a seventh piece and you edit it. So
is `Board.createPromoted`, if you chose the switch for M3. Is that a
violation? Yes, on purpose. Somewhere, something has to know the full list
of concrete classes, because somewhere `new Knight(...)` has to be
written. The factory's job is to be that one place, at the edge where
letters become objects. The win is not zero switches. It is exactly one,
where you can find it. Week 9 is about why that one is a pattern.

**A harder case, in your hands right now.** M4's `legalMoves` returns the
pseudo-legal list unchanged. M5 will edit it. That is a modification of
working code. Does the principle forbid it? No. Open/closed says: design so
that the changes you can **predict** arrive as additions. A new piece and
a new way of drawing the board are predictable, and they are additions.
The king-safety filter is a change to what "legal" means, and you could
not usefully have closed `legalMoves` against it without writing it.
Which changes to predict is the judgement. The principle tells you what to
aim for, not which bets to place.

---

## 4. L — Liskov substitution

Barbara Liskov, 1987: if `S` is a subtype of `T`, then objects of type `T`
may be replaced with objects of type `S` without changing what the program
does. In plain words: **a subclass must keep every promise its parent
made.**

Every test in `PieceMovementTest` depends on this. Look at how those tests
get a piece: `PieceFactory.create(type, color)`, which returns a `Piece`.
The test then calls `pseudoLegalMoves` on it. It does not know, and does
not ask, which of your six classes it is holding. It works because every
one of them honours what `Piece` promised: a list of moves from `from`,
none off the board, none landing on a friendly piece, each recording the
mover. That promise is in `Piece`'s javadoc. The compiler checks the
signature. Nothing checks the promise except you and those tests.

`Pawn.attacks` overrides `Piece.attacks`. You wrote that in M2. Is it a
violation? Read the promise: *true if this piece could capture an enemy on
`target`.* The default answers by consulting the piece's own moves, which
is right for five pieces and wrong for the pawn, which advances straight
and captures diagonally. `Pawn` overrides to **keep** the promise for a
case the default gets wrong. That is what overriding is for. Overriding
to make the method mean something different would be the violation.

What a violation would look like, in your classes:

- A `Piece` whose `pseudoLegalMoves` throws `UnsupportedOperationException`
  because "this piece does not move". The loop crashes on a legal board.
- A subclass that returns `null` instead of an empty list. Every caller
  now needs a check it did not need before.
- A `Knight` whose moves include a square holding its own colour. The
  promise said none would. `Board.apply` will overwrite the friend without
  complaint, because `apply` checks nothing, and it was told it could
  trust the `Move`.

**L is what makes O safe.** Open/closed promised you could add a piece
without editing the loop. That holds only if the new piece is
substitutable. A subclass that breaks its parent's contract forces every
caller open again.

---

## 5. I — Interface segregation

*No caller should be forced to depend on methods it does not use.* Keep
the surface a caller sees as narrow as that caller's needs.

Look at the `Game` scaffold from the outside. `public`: two constructors,
`board()`, `sideToMove()`, `history()`, `legalMoves()`, `findLegalMove`,
`play`, `undoLastMove`. `private`: the three fields. A caller of `Game`
cannot reach the history list, cannot call `Board.place` through `Game`,
and after M4 cannot see `MoveGenerator` at all. If a caller could reach
`place`, one day it would, and then something outside the engine would be
editing the board behind the game's back.

Now Monday's question. The M4 scaffold has two methods. `legalMoves` is
`public`. `pseudoLegalMoves` has no modifier, so it is visible inside
`engine` and nowhere else. Why offer one and hide the other?

Because outside `engine`, "pseudo-legal" is not a concept anyone should
build on. Come M5, `legalMoves` will filter out moves that leave your king
in check, and `pseudoLegalMoves` will still return them. A caller outside
the engine that used `pseudoLegalMoves` would offer a player moves the
rules forbid. The narrow surface is `Game.legalMoves()`, and `Game`
decides what "legal" means. The access modifier is interface segregation
at the package level, and the compiler enforces it: try calling
`pseudoLegalMoves` from `Main` and javac tells you it is not public in
`MoveGenerator` and cannot be accessed from outside the package.

Smaller, in `Piece`: `pseudoLegalMoves`, `attacks`, `color`, `type`,
`symbol` are `public`. `slidingMoves` and `steppingMoves` are `protected`.
Subclasses need the helpers; nothing else does, and nothing else sees
them. Access modifiers are how Java segregates an interface inside one
class.

---

## 6. D — Dependency inversion

*Depend on abstractions, not on concrete classes.* Or, in Monday's words:
point the arrows at what changes least.

You have been doing this since session 8:

```java
List<Move> moves = new ArrayList<>();     // depends on List, not ArrayList
Piece piece = board.pieceAt(from);        // depends on Piece, not Knight
```

Now look at it as a graph. `Board` holds `Piece`s and never a subclass.
The loop, wherever you put it, asks a `Piece`. The six subclasses depend
on `Piece` too, by extending it. Every arrow points at the abstract thing
in the middle, and the concrete things at the edges never point at each
other. Run this in your repo:

```bash
grep -rl "Knight" src/main
```

`Knight.java` itself, `PieceFactory.java`, and nothing else. That is what
"inverted" means: the high-level code that moves pieces around does not
depend on the low-level knight. Both depend on `Piece`.

One more place you already did it, without noticing. The scaffold has two
constructors, and the second is `Game(Board board, Color sideToMove)`. The
tests use it to hand `Game` a board built from FEN. `Game` never asks
where its board came from. Handing a class the thing it depends on, rather
than letting it build its own, has a name too: **dependency injection**.
It is a technique for doing D, and that constructor is your first one.

---

## 7. In-class exercise: where does each piece of M3 belong?

You are in the middle of M3. Before you write any more of it, place it.
In pairs, seven minutes. For each job below, name the class it belongs to,
say in one sentence why, and name the letter you leaned on. Some of these
you have already done; check your answer against what you did.

1. Move a piece from one square to another, no questions asked.
2. Decide whether a move is allowed right now, and refuse it if not.
3. Turn the text `"e2e4"` into a `Move`, or discover there is no such move.
4. Build the queen a pawn turns into when it reaches the last rank.
5. List every move White can make in this position.
6. Show the board on the screen after each move.

Then, five minutes as a room. Number 4 is the argument, and number 5 is
Monday's session in one line.

---

## 8. Code review: a class that does everything

This program plays chess. Two people can sit at it and move pieces, it
refuses moves that break the geometry, and it fits on two screens. It uses
nothing you have not seen: an array, a `switch`, a `Scanner`, a record.
It is also every decision you made this month, undone.

```java
public class ChessGame {

    private final Piece[][] squares = new Piece[8][8];
    private boolean whiteToMove = true;
    private final Scanner in = new Scanner(System.in);

    public static void main(String[] args) {
        new ChessGame().run();
    }

    public void run() {
        setUp();
        while (true) {
            print();
            System.out.print((whiteToMove ? "White" : "Black") + "> ");
            String line = in.nextLine().trim();
            if (line.equals("quit")) return;
            if (line.length() != 4) { System.out.println("Type a move like e2e4"); continue; }

            int ff = line.charAt(0) - 'a', fr = line.charAt(1) - '1';
            int tf = line.charAt(2) - 'a', tr = line.charAt(3) - '1';
            Piece piece = squares[ff][fr];
            if (piece == null || piece.isWhite() != whiteToMove) { System.out.println("Not your piece"); continue; }
            if (!canMove(piece, ff, fr, tf, tr)) { System.out.println("Illegal"); continue; }

            squares[tf][tr] = piece;
            squares[ff][fr] = null;
            whiteToMove = !whiteToMove;
        }
    }

    private void setUp() {
        String back = "RNBQKBNR";
        for (int f = 0; f < 8; f++) {
            squares[f][0] = new Piece(back.charAt(f), true);
            squares[f][1] = new Piece('P', true);
            squares[f][6] = new Piece('P', false);
            squares[f][7] = new Piece(back.charAt(f), false);
        }
    }

    private boolean canMove(Piece piece, int ff, int fr, int tf, int tr) {
        int df = Math.abs(tf - ff), dr = Math.abs(tr - fr);
        Piece target = squares[tf][tr];
        if (target != null && target.isWhite() == piece.isWhite()) return false;
        switch (piece.letter()) {
            case 'N': return df * dr == 2;
            case 'K': return df <= 1 && dr <= 1;
            case 'R': return (df == 0 || dr == 0) && pathClear(ff, fr, tf, tr);
            case 'B': return df == dr && pathClear(ff, fr, tf, tr);
            case 'Q': return (df == 0 || dr == 0 || df == dr) && pathClear(ff, fr, tf, tr);
            case 'P':
                int dir = piece.isWhite() ? 1 : -1;
                if (df == 0 && tr - fr == dir && target == null) return true;
                return df == 1 && tr - fr == dir && target != null;
            default: return false;
        }
    }

    private boolean pathClear(int ff, int fr, int tf, int tr) {
        // step from (ff, fr) toward (tf, tr); false if any square between is occupied
        ...
    }

    private void print() {
        for (int r = 7; r >= 0; r--) {
            System.out.print((r + 1) + " ");
            for (int f = 0; f < 8; f++) {
                Piece p = squares[f][r];
                System.out.print(p == null ? ". " : p.symbol() + " ");
            }
            System.out.println();
        }
        System.out.println("  a b c d e f g h");
    }

    record Piece(char letter, boolean isWhite) {
        char symbol() { return isWhite ? letter : Character.toLowerCase(letter); }
    }
}
```

**Ask of it:** what does this class know? Who would ask for a change to it?
How many reasons does it have to open?

Then the room takes it apart. Each cut names what leaves, which class in
*your* repo it goes to, and which letter says so. There are at least six.
Start with the easiest, and do not stop until what is left is a class you
recognise.

**How to give feedback**, from session 7: about the code, never the
author. "This method both draws and decides", not "you mixed things up".
Say what it costs: "to draw the board a second way, every line of `print`
changes, and so does `run`."

---

## 9. Recap

1. **S** is Monday, named. One asker per class. The scaffold's `Game` has
   two askers, and M4 gives one of them its own class.
2. **O** and **L** are a pair, and you did both in M2: adding a piece
   without editing the loop works only because every piece keeps `Piece`'s
   promise.
3. **I** and **D** are about the arrows: narrow surfaces, pointed at the
   abstract thing in the middle. Callers see `Game`; the loop sees `Piece`;
   `pseudoLegalMoves` stays inside `engine`.
4. Every principle has a line in your repo where you chose not to follow
   it, and can say why. That is what knowing a principle means.

The words, and where they are in your repo today:

| Term | Where |
|---|---|
| SRP | six pieces; `Board`; the scaffold's `Game`, with two askers until M4 |
| OCP | `Piece.pseudoLegalMoves` abstract; the Archbishop is one new file |
| LSP | `PieceMovementTest` holds six classes to one promise; `Pawn.attacks` keeps it |
| ISP | `Game`'s public surface; the M4 method with no modifier |
| DIP | `Board` holds `Piece`, never `Knight`; `grep Knight` finds the factory; `Game(Board, Color)` |
| The one allowed switch | `PieceFactory.create`: OCP broken on purpose, once, at the edge |
| God class | §8's `ChessGame`: every principle, missing |

**This week:** M3 green by Monday night. Place each job before you write
it; §7 is the list. Then M4, and bring your diff.

---

## Next session

Monday Oct 5: refactoring and code smells. Names for what is wrong with
working code, and the safe moves that fix it. M5 opens: king safety, the
rule no single piece can enforce, and it lands in the class you made room
for this week. M3 is due that night.

---

## INSTRUCTOR ONLY

**Timing (75 min):** where you are 3 · §1 5 · §2 S 8 · §3 O 10 · §4 L 10 ·
§5 I 8 · §6 D 6 · §7 exercise 12 · §8 god class 10 · recap 3. If behind,
cut §6 to the `grep` and the constructor, and protect §7 and §8. If ahead,
let §8 run.

**Open with Monday's question.** "Why does one M4 method have no
modifier?" Take answers before §1. Most will be close. Do not resolve it
until §5, where it is the I example.

**§1: say the "you did four of these already" claim and mean it.** The
room has heard SOLID as an interview list. The frame is recognition. Every
lens ends by pointing at a file they have open this week.

**§2: the S table's last row is the whole session in one line.** Put it up
with the "and"s in bold. Let the room see that `Game` as scaffolded has two
askers, and that M4 is the fix. Then move on; Monday did the argument.

**§3: the factory switch must be called a violation out loud.** Students
who learn "no switches ever" spend week 9 confused. The line: "one switch,
on purpose, at the edge, and week 9 explains why that one is a pattern."
The M5 paragraph pre-empts "isn't tightening `legalMoves` a modification?"
which someone will ask Monday.

**§4: `Pawn.attacks` is the example to spend time on.** They wrote it;
half the room thinks overriding is a Liskov violation by definition. Land
keep-the-promise versus change-the-promise. Then the three violations,
fast. The third one connects to `apply` checking nothing, which they wrote
this week.

**§5 resolves Monday's question.** Have them say it: "because after M5,
`pseudoLegalMoves` returns moves the rules forbid, and only `Game` should
decide what legal means." Then show the compile error live if you have not
already.

**§7 answers.** These are M3's jobs, so most pairs will have done some of
them and can check.

1. `Board.apply`. Storage. S. It checks nothing because deciding is not
   storage; that is the point of the "no questions asked".
2. `Game.play`'s guard: if the move is not in `legalMoves()`, throw. S, and
   session 8's rule: a bug throws. Some pairs will say `Board`; ask them
   what `Board` would need to know to decide, and watch it grow.
3. `Game.findLegalMove`, returning `Optional`. It walks `legalMoves()`
   comparing `toString()`. Not `Position.parse`, which reads one square;
   not `Move`, which is a value and knows no board. S, and "an ordinary
   outcome returns".
4. The argument. `Board.createPromoted` (a second switch, a second reason
   to change, four duplicated lines) versus `PieceFactory.create` (a
   backwards arrow from `model` to `factory`). Both are accepted; both are
   D questions about which way the arrows point. Let the room hear both
   prices from people who chose each.
5. Today, `Game.legalMoves()`; by M4, `MoveGenerator.legalMoves(board,
   color)`, with `Game` asking. S. This is Monday in one line; say so.
6. `Main`, for now, using `TextBoardRenderer`, which was given. Not `Board`
   (the `toString` addendum), not `Game`. S. If someone asks "and later?",
   one sentence: a view, in week 11.

**§8 cuts, in the order that usually works.**

1. `print()` → `TextBoardRenderer`. Everyone sees it. S; and the cost line.
2. The `switch` in `canMove` → six `Piece` subclasses behind
   `pseudoLegalMoves`; `pathClear` → `slidingMoves`. O, and D: whatever
   loops over pieces will depend on `Piece`, not on `'N'`.
3. `squares`, `setUp`, and the two assignment lines in `run` → `Board`
   with `apply`, and `BoardFactory.standard()`. S.
4. `whiteToMove`, the flip, and "Not your piece" → `Game.sideToMove`, and
   generating moves for the side to move only. S.
5. The `Scanner`, the parsing of `"e2e4"`, the messages → `Main` for now;
   the parsing is `findLegalMove` on a notation string. I: whatever reads
   the keyboard should see only what `Game` offers.
6. `boolean isWhite` → `Color`; `char letter` → `PieceType`. Session 3's
   closed sets. D, in miniature: depend on a type, not on a character.

When it is done, what is left is `Game`: a board, a side to move, `play`.
Say that aloud. The god class was not wrong about what a chess program
needs; it was wrong about how many classes that is.

**Decisions taken in writing this session, for the record.** Rewritten
2026-09-27 from the room's state (M2 in, M3 in progress, M4 open),
replacing a draft whose examples were M5–M12 features. Every example now
points at a file the students have this week; the only forward references
are "king safety is M5", which both handouts made, and one sentence each
on week 9 (the factory as a pattern) and week 11 (a view). The §7 exercise
is M3's own job list, so it doubles as design help for the assignment
without printing any bodies. The god class is in the notes only, not in
any repo.

**Check before class:** §8's `ChessGame` printed as a handout · §7's six
jobs on the board before pairs start · M3 red-count check at the door;
anyone still on step 3 or earlier gets pointed at the handout's Common
problems and at §7.
