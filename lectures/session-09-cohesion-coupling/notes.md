# Session 9 — Cohesion, Coupling, and Separation of Concerns: Where Does This Code Belong?

**Week 6, Monday September 28** · CSC 413 Software Development
**Objectives advanced:** 2 (SOLID design principles, begun), 3 (analyze designs for cohesion, coupling, and responsibility assignment), 4 (refactor toward cleaner software)
**Milestone supported:** M4 — `MoveGenerator` (assigned today, due Monday Oct 12, 11:59 PM). M2 is due tonight. M3 is due Monday Oct 5.

---

## Today's objective

You have been deciding where code belongs since week 2, and getting it
right. Today you get the three words engineers use to argue about those
decisions, and you make one more cut in your own engine: the generation
loop leaves `Game`.

**By the end of today you can:**

1. Say what a class is responsible for in one sentence, count its reasons
   to change, and use that to decide whether a method belongs to it.
2. Draw the dependency arrows between your packages, say which direction
   they may point, and name what it costs when one points the wrong way.
3. Move the generation loop out of `Game` into `MoveGenerator`, and say why
   it goes there and not into `Board`, `Piece`, or nowhere.

---

## 1. The question you have been answering since week 2

Every design decision so far has been the same question asked of a
different line: *where does this belong?*

| Week | The decision | Where it went |
|---|---|---|
| 2 | `offsetOrNull` and `pawnDirection` | on `Position` and `Color`: *behaviour with the data it depends on* (session 3) |
| 4 | may `Board` print, or check a pawn capture? | no: `Board` stores (session 5 §6, the `movePiece` exercise) |
| 4 | where does the knight's movement live? | on `Knight`, behind `Piece.pseudoLegalMoves` (session 6 §3) |
| 5 | is a class doing one job? | the one-sentence test, no "and" (session 7 §7) |
| 5 | `apply` on `Board`, `play` on `Game` | moving is storage; deciding is not (session 8 §6) |
| 5 | `Board.toString` versus drawing | a debug dump is the model's; a picture is the view's (the addendum) |

You made each of those calls with a reason, and the reasons were right.
They were also all the same three reasons. Today we name them: **cohesion**,
**coupling**, and **separation of concerns**. Then we use them on `Game`.

---

## 2. Cohesion: one reason to change

**Cohesion** is how much the parts of a class belong together. A cohesive
class is one where every field and every method serves the same sentence.
You already have the test for it: session 7's *one sentence, no "and"*.

A sharper form of the same test: **count the reasons the class would have to
change.** List the things that could happen in the world that would send
you into the file. If two of them have nothing to do with each other, the
class has two jobs.

Run it on `Board`. *`Board` stores which piece is on which square.* Why would
you open `Board.java`? To change how squares are stored: the array becomes a
map, or a bitboard, in some future where speed matters. That is one reason.
A rule of chess changes? Not `Board`'s file. The board should look different
on screen? Not `Board`'s file. One reason. High cohesion.

Now `Game`, as you are building it for M3. Its sentence from session 8:
*plays the moves of one game in turn order and remembers them.* Why would
you open `Game.java`?

1. Something about **turns or history** changes. M8 adds the endings: the
   game must know when it is over. M10 turns undo into the Command pattern.
2. Something about **how moves are generated** changes. M5 adds king
   safety. M12 adds castling and en passant.

Two lists, and nothing on one has anything to do with the other. The rules
committee does not care how undo is implemented. Two reasons to change. Two
jobs.

Look at the second job. This is `legalMoves()` as M3 asks you to write it:

```java
public List<Move> legalMoves() {
    List<Move> moves = new ArrayList<>();
    for (Position from : board.positionsOf(sideToMove)) {
        moves.addAll(board.pieceAt(from).pseudoLegalMoves(board, from));
    }
    return moves;
}
```

**What does this method read from `this`?** Two fields, `board` and
`sideToMove`, and it does nothing with either except pass them on. It never
touches `history`. It never flips the turn. It does not care that a game is
in progress; hand it any board and any colour and it answers. Compare
`play`, which reads all three fields, calls `legalMoves()`, writes to two of
them, and could not exist without the game around it.

A method that uses its class's state only to forward it is a method
visiting, not living there. Its signature is telling you where it lives:
`(Board, Color) → List<Move>`. That is a question about a **position**, not
about a **game**.

**What low cohesion costs.** Every change to move generation is a change to
`Game`, and every test of generation needs a `Game`. When M5 wants to check
whether a king is attacked on a board built from FEN, it should not have to
construct a game to ask. And when you open `Game.java` to fix undo, forty
lines of geometry are in the way.

---

## 3. Coupling: who knows about whom

**Coupling** is how much one part of the program must know about another
in order to work. It is measured by a question: **if this changes, what
breaks?**

Draw your repo after M3. An arrow means "imports":

```
                 Main
              /   |   \
             v    v    v
  view  ─►  model  ◄─  engine  ─►  factory
                 ▲                   |
                 └───────────────────┘

  model  ─►  (nothing but java.util)
```

`view` imports `model`. `engine` imports `model`, and `factory` too, because
`new Game()` asks `BoardFactory.standard()` for the opening position.
`factory` imports `model`. `model` imports nothing of yours. Every arrow
points toward `model`, and no arrow points back. **There is no cycle.** You
can read `Board.java` and understand it without opening another file of
yours, and that is not luck.

Three kinds of coupling you have already met, from most to least visible:

**1. Import coupling.** The `import` lines. This one you can see, and it is
the one M3's promotion wrinkle was about. `Board.apply` has to build the
piece a pawn promotes into. The only `switch` over `PieceType` is
`PieceFactory.create`; calling it from `Board` adds
`model → factory`, and `factory → model` already exists. A cycle. The
handout let you choose: four duplicated lines in `Board`, or that arrow.
Both cost something. Four lines that must be kept in step with the factory,
or a `model` that can no longer be read alone. Session 6 said DRY is a
judgement; this is the judgement, and the reference chooses the four lines.

**2. Knowing internals.** A caller that knows `history` is an `ArrayList`
and calls `clear()` on it. You cannot see this coupling in an `import`; it
hides in a method call. `history()` returns `List.copyOf(history)` so that no
caller can couple to the list itself. `private` fields, copies from
getters, `final` where nothing should change: encapsulation is coupling
control, one class at a time.

**3. Switch-on-type coupling.** A `switch (piece.type())` anywhere in the
engine knows the full list of piece kinds. Add a kind, and every such
switch is a place to edit and a place to forget. That is why `model` has no
switch, why `pseudoLegalMoves` is abstract, and why session 6's loop does
not change when an Archbishop arrives. The one switch that must exist lives
in `factory`, at the edge, where data becomes objects.

Coupling cannot be zero. `Game` must know `Board`; a game with no board is
not a game. The goal is **few arrows, one direction, pointing at things that
rarely change.** `Piece` changes less often than `Knight`. `List` changes
less often than `ArrayList`. `model` changes less often than `view`. Point
the arrows at those.

---

## 4. Separation of concerns: the layers

Cohesion is about one class. Coupling is about pairs. **Separation of
concerns** is the whole picture: the program is divided into parts, each
part is about one kind of thing, and the parts depend on each other in one
direction.

Your engine's concerns, and where each one lives tonight:

| Concern | Package | Classes | May import |
|---|---|---|---|
| what things are, and where they stand | `model` | `Position`, `Color`, `PieceType`, `Piece` and six, `Move`, `Board` | nothing |
| how a game proceeds, and what is legal | `engine` | `Game`, and from today `MoveGenerator` | `model`, `factory` |
| how a position is shown | `view` | `PieceGlyphs`, `TextBoardRenderer` | `model` (and `engine`, from M9) |
| how objects are built from data | `factory` | `PieceFactory`, `BoardFactory` | `model` |
| wiring | the root | `Main` | anything |

The row people argue about is the first. The pieces know how they move.
Isn't that a rule, and don't rules belong in `engine`? The line is this: a
piece's geometry is a fact **about the piece**, the way its colour is. A
knight moves in an L whatever else is on the board. What a piece cannot
know is anything about the **rest of the board**: whether its king is
attacked, whose turn it is, whether a rook has moved. Facts about one piece
are `model`. Facts about the whole position are `engine`.

**What the layers buy you.** You can test `Board` without a `Game`, and
`Game` without a screen. You can read one layer at a time. And in week 11
the bonus track adds a Swing window without opening a file in `model` or
`engine`, because nothing in those layers knows a window exists. That is
not a feature you will add later. It is a consequence of the arrows you are
drawing now.

The three words fit together. Separation of concerns is the goal. Cohesion
and coupling are how you check whether you reached it: each part cohesive,
the parts coupled in one direction.

---

## 5. Applying it: extracting `MoveGenerator`

Back to the loop in §2. It has to live somewhere. Session 6 gave the same
three candidates for the knight's movement, and the answer then was "a
fourth: on each piece". The candidates are the same today, and the answer
is different.

**On `Board`?** *`Board` stores.* The loop reads the board and decides
nothing about storage. Put it there and `Board` has a second sentence
today, and by M5, when king safety follows it, `Board` is the whole engine.
Session 5 warned about exactly this drift.

**On `Piece`?** A piece answers for itself, and the loop needs every piece
of a colour. No piece can see the others. `Piece.attacks` is the most a
single piece can say: "could I hit that square?" The rule that arrives in
M5, *you may not leave your own king attacked*, needs every enemy piece at
once. It cannot be a piece's method.

**Leave it in `Game`?** It is there now and it works. The cost is §2's:
two reasons to change, and everything M5 and M12 add lands in the class
that also does turns and undo.

**A new class.** `MoveGenerator`, in `engine`, with one sentence: *turns a
position and a colour into the moves that colour may play.* That is M4.

**Its shape follows from its sentence.** `MoveGenerator` has nothing to
remember. It holds no board, no side to move, no history; every call brings
its own. A class with no state has nothing to construct, so its methods are
`static`, its constructor is `private`, and the class is `final`. It is a
namespace for functions. `Math` is one. `PieceFactory`, which you were
given in M2, is one. Not every class is a blueprint for objects.

```java
public final class MoveGenerator {

    private MoveGenerator() { }

    public static List<Move> legalMoves(Board board, Color color)
           static List<Move> pseudoLegalMoves(Board board, Color color)
}
```

**Look at the signature.** `legalMoves(Board, Color)`. No `Game`. The
generator does not know a game exists. Next week's tests build a `Board`
from FEN and ask it directly, and nothing has to be played first. That is
low coupling made visible: the arrow goes `Game → MoveGenerator → model`,
and never back.

**One method has no access modifier.** Session 5 promised this: *a member
with no modifier is visible to its package and nowhere else; we will use
that in M4.* `pseudoLegalMoves` is **package-private**. `Game` may call it,
and the tests may, because both live in `engine`. `Main` cannot:

```
Main.java: pseudoLegalMoves(Board,Color) is not public in MoveGenerator;
           cannot be accessed from outside package
```

Why hide it? Because outside `engine`, "pseudo-legal" should not be a
concept anyone builds on. A view that listed pseudo-legal moves would offer
the player moves M5 forbids. `Game.legalMoves()` is the door, and `Game`
decides what "legal" means. The access modifier is coupling control at the
package level: it makes a dependency arrow impossible to draw, and the
compiler enforces it.

`legalMoves` is `public` because M5's tests, and later an AI, will want to
ask about a board without a game.

**After M4**, `Game.legalMoves()` is one line:

```java
public List<Move> legalMoves() {
    return MoveGenerator.legalMoves(board, sideToMove);
}
```

and `MoveGenerator.legalMoves` is one line too, `return
pseudoLegalMoves(board, color)`, because this week the two lists are the
same. **Here is what the cut buys.** Next week `legalMoves` becomes:

```java
for each candidate in pseudoLegalMoves(board, color):
    board.apply(candidate)
    if the king is not attacked: keep it
    board.undo(candidate)
```

plus `isAttacked` and `isInCheck`, plus `Board.kingPosition`. Forty lines,
all in `MoveGenerator`, in a class with one reason to change. `Game` does
not open. Nothing that calls `Game` notices. That is the whole argument for
today, and you will watch it happen.

---

## 6. M4 opens

```bash
git fetch upstream --tags
git merge m4
./mvnw test
```

**What arrives:** the scaffold `engine/MoveGenerator.java`, two methods,
both throwing; `MoveGeneratorTest` with six tests, none about king safety.
**What stays yours:** `Game`, in which you change one method, and everything
else, which you do not touch. The merge compiles:
`Tests run: 48, Failures: 0, Errors: 6`. Your forty-two are still green.
Keep them that way.

**Build in this order.**

1. `MoveGenerator.pseudoLegalMoves`: cut the loop out of `Game`, paste it
   here, `sideToMove` becomes the `color` parameter. **Still 6 red**: every
   test reaches `legalMoves` first.
2. `MoveGenerator.legalMoves`: `return pseudoLegalMoves(board, color);`.
   **All six green.** Even `gameAgreesWithTheGenerator`, because two copies
   of a loop agree with each other. Not done.
3. `Game.legalMoves()`: `return MoveGenerator.legalMoves(board, sideToMove);`
   Delete the loop and the imports it needed. **Still green.** A refactor
   that changed a test result was not a refactor.
4. `git diff`. The loop appears once, in `MoveGenerator`. `Game` is shorter.
   `Main` is untouched.

```
Tests run: 48, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

```bash
git add -A
git commit -m "M4: MoveGenerator"
git tag submit-m4
git push origin main --tags
```

**Graded by reading:** `Game.legalMoves()` is a single delegation and the
loop exists once; `MoveGenerator` has no fields and a private constructor;
`pseudoLegalMoves` is still package-private; no other method of `Game`
changed. The tests cannot tell a move from a copy. Your diff can.

If M3 is not finished, finish it first; M4 is fifteen minutes on top of a
green M3 and an afternoon on top of a red one.

---

## Recap

1. **Cohesion:** one sentence, one reason to change. Count the reasons; two
   unrelated lists means two classes.
2. **Coupling:** ask what breaks when this changes. Few arrows, one
   direction, pointing at what changes least.
3. **Separation of concerns:** the layers, each cohesive, coupled downward.
   Facts about one piece are `model`; facts about the whole position are
   `engine`; pictures are `view`.

The words, and where they are in your repo after M4:

| Term | Where |
|---|---|
| Cohesion | `Game` after M4: turns and history, one reason to change |
| Coupling | the `import` lines; `model` has none of yours |
| Separation of concerns | four packages, and the arrows between them |
| Layer | `view → model ← engine → factory → model` |
| Static utility | `MoveGenerator`, `PieceFactory`: no fields, private constructor |
| Package-private | `pseudoLegalMoves`: visible in `engine` only |
| Refactor | M4: the same forty-two green before and after |

---

## Next session

Wednesday Sep 30: SOLID. Five principles with a mnemonic, and you have
already applied four of them without the names. We read your engine through
each lens, place six new features in the class they belong to, and take a
one-file chess program apart. M3 is due the Monday after.

---

## INSTRUCTOR ONLY

**Timing (75 min):** objective 3 · §1 table 7 · §2 cohesion 13 · §3
coupling 14 · §4 layers 10 · §5 extraction 15 · §6 M4 briefing 8 · recap 5.
If behind, cut §1 to two rows read aloud and §4's table to the first two
rows; never cut §2's "what does it read from `this`" or §5's three
candidates. If ahead, spend it drawing §3's graph from the room's own
`import` lines.

**§2 is the moment.** Put M3's `legalMoves()` on the projector and ask
what it reads from `this`. Wait for "board and sideToMove". Then ask what
it *does* with them. "Passes them on." Then put `play` beside it and ask
the same. The contrast is the lesson; the words "cohesion" and "reason to
change" go on the board after, not before. Do not say "feature envy"; that
name arrives in week 7 with the other smells.

**§3: draw the graph live**, from the room. Ask for `Board`'s imports
(only `java.util`), `Game`'s (`model` and `factory`), `TextBoardRenderer`'s
(`model`). Someone will notice `Game → factory`; confirm it, add the arrow,
and show there is still no cycle. Then the promotion wrinkle: ask who chose
the switch and who chose the factory call. Both stand this milestone; the
point is that each student can say what theirs costs.

**§4: the "are pieces rules?" question will come.** The answer to give is
the one in the notes: a piece's geometry is a fact about the piece, like its
colour; what it cannot know is what the rest of the board is doing. If
pushed: "could you write `Knight` correctly on an infinite empty board?"
Yes. "Could you write `isInCheck`?" No.

**§5: static utilities.** Some of the room believes every class must be
instantiated. `Math.max` is the example they know; `PieceFactory` is the one
already in their repo. Say "a class can be a namespace for functions", once.
Show the package-private compile error live: type
`MoveGenerator.pseudoLegalMoves(...)` into `Main`, build, read the message
aloud, delete it. Thirty seconds, and it makes the modifier real.

**§6: the "two copies agree" point matters.** Step 2 turns everything green
with the loop still in `Game`. Say aloud that green is not done, and that
the delegation criterion is graded by reading the diff. Otherwise a third
of the room submits two loops.

**Decisions taken in writing this session, for the record.** M4 is a pure
refactor: no `isAttacked`, no `kingPosition`, no king safety; all of that is
M5, so that M4 stays light while M3 is still open. `pseudoLegalMoves` is
package-private in the scaffold, honouring session 5's promise; the
reference's copy is public, and since M5 does not re-ship `MoveGenerator`,
the student's modifier stands. Six tests, one of which
(`legalIsPseudoLegalUntilM5`) is true only this week and is replaced when
M5 re-ships `MoveGeneratorTest`. Measured 2026-09-27 on an M3-solved clone:
48 tests, 6 errors after the merge, 6 after step 1, 0 after step 2, 0 after
step 3. Handout: `assignments/m4-move-generator/handout.md`; recipe and
shipped files in the reference repo under `course/milestones/m4/`.

**Check before class:** m3 *and* m4 tags on the starter (`git ls-remote
--tags upstream` from any student clone shows both) · M4 handout published
and linked from the week 6 page · demo clone at M3-solved for §2 and §5,
with `Main` ready for the compile-error demo · the dependency graph drawn
on paper in case the projector dies.
