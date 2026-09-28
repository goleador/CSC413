# Session 9 — Cohesion, Coupling, and Separation of Concerns: What M2 Taught You, Named

**Week 6, Monday September 28** · CSC 413 Software Development
**Objectives advanced:** 2 (SOLID design principles, begun), 3 (analyze designs for cohesion, coupling, and responsibility assignment)
**Milestone supported:** M3 — turns, moves, `Game` (in progress, due Monday Oct 5, 11:59 PM). M4 — `MoveGenerator` (assigned today, due Monday Oct 12). M2 is due tonight.

---

## Where you are this morning

Tonight you hand in M2: one abstract `Piece`, six subclasses, a `Move`
record, and thirty-four green tests. Last Wednesday you merged m3 and got a
`Game` scaffold with three fields, seven methods that throw, and eight red
tests. Some of you have started filling it in. Most of you have not, and
that is fine, because today is about deciding where its code should go
before you write it.

Here is the claim for today: **M2 already taught you this week's three
words.** You took one class apart into seven, and it worked, and you can say
why it worked. We are going to say why in the words engineers use, then
read the `Game` scaffold with those words and see one thing in it that does
not belong.

**By the end of today you can:**

1. Say what a class is responsible for in one sentence, count its reasons
   to change, and use that on `Knight`, `Board`, and `Game`.
2. Draw the arrows between the packages in your repo today, say which way
   they point, and name what it costs when one points the wrong way.
3. Read the `Game` scaffold method by method, say which fields each one
   needs, and find the one method that is not really about a game.

---

## 1. What you did in M2, and why it worked

Before M2 you had one `Piece` class with a colour and a type. After M2 you
have this:

```
Piece (abstract)        pseudoLegalMoves(board, from) is abstract
├── Knight              a table of eight offsets, one line
├── King                a table of eight offsets, one line
├── Rook                three directions... four, and slidingMoves
├── Bishop              four directions and slidingMoves
├── Queen               eight directions and slidingMoves
└── Pawn                the real work
```

Seven files where there was one. Ask the obvious question: *why was that
better?* You gave three answers in sessions 6 and 7 without naming them.

**Each class answers exactly one question.** `Knight` answers "how does a
knight move?" and nothing else. If the rules committee changed the knight's
move tomorrow, you would open one file. If you had written one big
`Piece.pseudoLegalMoves` with a `switch` on type, you would open the file
that also holds the rook, the bishop, the queen, the pawn, and the king,
and hope you did not break them. That property has a name: **cohesion**.

**`Board` never asks what kind of piece it is holding.** It stores a
`Piece[][]`. The loop in session 6 §3 asks each piece for its moves and
never looks at `type()`. So `Board` does not know that `Knight` exists.
`TextBoardRenderer` does not either; it asks for a `symbol()`. Who in your
repo names `Knight` at all? Open it and look. `PieceFactory`, which you
were given, and the tests. That property is called **low coupling**.

**Adding a piece is adding a file.** Session 6 asked "add an Archbishop;
which line changes?" and the answer was none. That one gets its name on
Wednesday.

You did not learn these words and then apply them. You applied them,
because the compiler and the tests pushed you there, and now we are
attaching the words. That is the right order.

---

## 2. Cohesion: one reason to change

**Cohesion** is how much the parts of a class belong together. The test you
already have, from session 7's code review: *say what the class does in one
sentence, with no "and".*

A sharper form: **count the reasons you would ever open the file.** Not
bug fixes; changes in what the class is for. If two of the reasons have
nothing to do with each other, the class has two jobs.

Run it on what you have.

| Class | One sentence | Why you would open it |
|---|---|---|
| `Knight` | how a knight moves | the knight's move changes. That is all. |
| `Position` | a square on the board | the board stops being 8×8. That is all. |
| `Board` | stores which piece is on which square | storage changes: the array becomes a map |
| `Piece` | what every piece has in common | a new thing all pieces share |

`Board` deserves a second look, because you are editing it this week. M3
step 1 adds `apply` and `undo`. Are those storage? Moving a piece from one
square to another, with no opinion about whether it should move: yes. Still
one sentence. M3's promotion wrinkle adds a `switch` that builds a queen,
if you chose that route. Is that storage? No. It is construction, and you
wrote a comment saying what it costs. **That comment is a cohesion
judgement.** You counted a second reason to change, decided it was cheaper
than the alternative, and wrote it down. That is exactly the skill.

Now hold that question for `Game`. We come back to it in §5, with the
scaffold open.

---

## 3. Coupling: who knows about whom

**Coupling** is how much one part of the program must know about another
to do its job. It is measured by a question you can ask of any line: **if
this changes, what breaks?**

Draw your repo this morning. An arrow means "imports":

```
                 Main
              /   |   \
             v    v    v
  view  ─►  model  ◄─  engine  ─►  factory
                 ▲                   |
                 └───────────────────┘

  model  ─►  (nothing of yours)
```

Check it against your own `import` lines. `Board` imports `java.util` and
nothing else of yours. `TextBoardRenderer` imports `model`. The `Game`
scaffold imports `model` and `BoardFactory`, because `new Game()` asks the
factory for the opening position. `PieceFactory` imports `model`. Every
arrow points toward `model` and none points back. **There is no cycle**,
and that is why you can read `Board.java` without opening a second file.

You have met three kinds of coupling already, whether or not you noticed.

**Import coupling**, the visible kind. This is the M3 promotion decision
you are making this week. `Board.apply` has to build the piece a pawn
becomes. The one `switch` over `PieceType` is in `PieceFactory`. Call it
from `Board` and you draw `model → factory`. But `factory → model` already
exists. Follow the arrows and you are back where you started: a cycle. The
handout offered you four duplicated lines instead. Both cost something:
four lines to keep in step with the factory, or a `model` package that can
no longer be read alone. Session 6 said DRY is a judgement. This is the
judgement.

**Knowing internals**, the hidden kind. Look at `history()` in your
scaffold. The javadoc says it returns a copy, and session 8 said why: hand
out the real list and any caller can `clear()` it. That caller would be
coupled to a detail `Game` never meant to share. You cannot see this
coupling in an `import`; it hides in a method call. `private` fields,
copies from getters, `final` where nothing should change: encapsulation is
coupling control.

**Switch-on-type coupling.** M2's design contract said: no `switch` or
`instanceof` on piece type anywhere in `model`. Now you can say why. A
`switch (piece.type())` knows the full list of kinds. Add one, and every
switch is a place to edit and a place to forget. `pseudoLegalMoves` being
abstract is what lets `Board` and the loop stay ignorant of the list. The
one switch that must exist, because someone has to write `new Knight(...)`,
lives in `factory`, at the edge where text becomes objects.

Coupling cannot be zero. `Game` must know `Board`; a game with no board is
not a game. The goal is **few arrows, one direction, pointing at things
that change rarely.** `Piece` changes less often than `Knight`. `List`
changes less often than `ArrayList`. `model` changes less often than
`view`. Point the arrows at those.

---

## 4. Separation of concerns: your four packages

Cohesion is about one class. Coupling is about pairs. **Separation of
concerns** is the whole picture: the program is cut into parts, each part
is about one kind of thing, and the parts depend on each other in one
direction only.

You have four parts. You did not choose them; session 5 handed you the
package names in week 4. Now you can say what each one is for.

| Concern | Package | What is in it today |
|---|---|---|
| what things are, and where they stand | `model` | `Position`, `Color`, `PieceType`, `Piece` and six, `Move`, `Board` |
| how a game proceeds | `engine` | `Game`, mostly empty. Opened last Wednesday. |
| how a position is shown | `view` | `PieceGlyphs`, `TextBoardRenderer`, both given |
| how objects are built from data | `factory` | `PieceFactory`, `BoardFactory`, both given |

The row people argue about is the first. Your pieces know how they move.
Isn't that a rule, and don't rules belong in `engine`? Here is the line. A
piece's geometry is a fact **about the piece**, the way its colour is. A
knight moves in an L whatever else is on the board; you could write
`Knight` correctly for an infinite empty board. What a piece cannot know
is anything about **the rest of the board**: whose turn it is, whether
some other piece is in the way of something, whether its own king is
safe. Facts about one piece are `model`. Facts about the whole position
are `engine`. That is why `engine` opened the week you needed to ask
"every move for White", a question no single piece can answer.

What the layers buy you, today, not later: `PieceMovementTest` tests a
`Knight` with a `Board` and nothing else. `BoardTest` never mentions a
`Game`. When `GameTest` goes green this week, it will do so without a
screen. Each layer can be tested, read, and changed on its own.

---

## 5. Reading the `Game` scaffold with these words

Open `engine/Game.java`. Not to write anything yet. To read it.

**The fields.** Three: a `Board`, a `List<Move>`, a `Color`. `Game` is
built from parts it owns, and nothing else holds them. That is composition,
from session 7, and it is why `Game` has no `extends`.

**The methods.** Seven of them throw. Go through them with one question:
*which of the three fields does this method need, and what does it do with
them?* Fill in the table before you read the answers.

| Method | Needs | And does |
|---|---|---|
| `board()`, `sideToMove()`, `history()` | one field each | hands it out. `history()` hands out a copy. |
| `play(Move)` | all three | checks the move is allowed, changes the board, appends to history, flips the turn |
| `undoLastMove()` | all three | pops history, reverses the board, flips the turn back |
| `findLegalMove(String)` | whatever `legalMoves()` needs | walks the legal moves looking for a matching notation |
| `legalMoves()` | `board`, `sideToMove` | ? |

Look at the last row. Its javadoc says: *every pseudo-legal move of every
piece belonging to `sideToMove()`*. You have both halves of that already.
`Board.positionsOf(color)` is M1. `Piece.pseudoLegalMoves(board, from)` is
M2. Put them together and you have the method; the handout has the exact
shape and I am not going to repeat it here.

What matters today is the second column. `legalMoves()` needs the board
and a colour. It does not touch `history`. It does not flip the turn. It
does not care that a game is in progress. **Hand it any board and any
colour and it answers.** Compare `play`, which needs all three fields,
writes two of them, and could not exist without the game around it.

Now ask §2's question of `Game`: why would you ever open this file?

1. Because something about **turns or history** changes: how undo works,
   how the game knows it has ended.
2. Because something about **how moves are generated** changes. You know
   one such change is coming, because both the M2 and M3 handouts told you:
   *king safety is M5*, the rule that you may not leave your own king
   attacked.

Those two lists have nothing to do with each other. Two reasons. And the
second one lives entirely inside the method whose signature does not need
a game. A method that uses its class's state only to forward it is
visiting, not living there. Its real signature is `(Board, Color) →
List<Move>`. That is a question about a **position**, not about a
**game**.

**You did this exact thing in M2.** Movement did not belong to `Board`, so
it moved out to the pieces, and `Board` did not have to change. Generation
does not belong to `Game`, so it moves out, and `Game` will not have to
change. Same move, one week apart.

---

## 6. Where it goes: M4

The generation loop has to live somewhere. Session 6 offered three homes
for the knight's movement; the same three come up now, and the answer is
different.

**On `Board`?** *`Board` stores.* Generation reads the board and decides
nothing about storage. Put it there and `Board` has a second sentence
today, and when king safety arrives it follows the loop there, and then
`Board` is the whole engine. Session 5's `movePiece` exercise was the
warning.

**On `Piece`?** Each piece already answers for itself; that is M2. But
"every move for White" needs every white piece, and no piece can see the
others. The most a single piece can say is `attacks(board, from, target)`:
"could I hit that square?" Anything that needs the whole side is not a
piece's question.

**Leave it in `Game`?** It works, and the M3 tests will pass. The cost is
§5's: two reasons to change, and everything M5 adds lands in the class
that also does turns and undo.

**A new class in `engine`.** `MoveGenerator`, with one sentence: *turns a
board and a colour into the moves that colour may play.* That is M4, and
its scaffold is in the m4 tag today.

**Its shape follows from its sentence.** It has nothing to remember: no
board of its own, no side to move, no history. Everything arrives as a
parameter. A class with no state has nothing to construct, so its methods
are `static` and its constructor is `private`. You have one of these
already: `PieceFactory`, which you have been calling as
`PieceFactory.create(...)` since M2 without ever writing `new
PieceFactory()`. A class can be a namespace for functions.

**Read the scaffold before you write anything.** Two methods. One is
`public`. The other has no access modifier at all, and that is not a
mistake. Session 5 promised: *a member with no modifier is visible to its
package and nowhere else; we will use that in M4.* This is the use. Ask
yourself, before Wednesday, why the engine would want to offer one of
these methods to the rest of the program and keep the other inside
`engine`. The answer is in §3.

**What to do about M3 and M4 together.** Both are open this week, and
they touch the same method.

- If you have **not** written `legalMoves()` yet: you may write it in its
  final home from the start, and have `Game.legalMoves()` ask
  `MoveGenerator`. The M3 tests do not care where the loop lives; they
  call `Game`.
- If you **have** written it in `Game`: leave it until your forty-two are
  green, then move it, with the tests running. You will watch forty-two
  tests stay green while code changes files. That is what "refactor"
  means, and having done it once you will trust the word.

Either way, finish M3 first. M4 is a short piece of work on top of a green
M3 and a long one on top of a red one.

```bash
git fetch upstream --tags
git merge m4
./mvnw test
```

Right after the merge the build compiles; the new tests error until
`MoveGenerator` has bodies. The handout tells you what counts to expect
after each step. What it will not tell you, and what is graded by reading,
is whether the loop ended up in exactly one place.

---

## Recap

1. **Cohesion:** one sentence, one reason to change. `Knight` has one.
   `Board` has one and a promotion switch you accounted for. The `Game`
   scaffold has two, and one of them is leaving.
2. **Coupling:** ask what breaks when this changes. Your arrows all point
   at `model`, and the M3 promotion wrinkle is you deciding not to draw one
   backwards.
3. **Separation of concerns:** four packages. Facts about one piece are
   `model`. Facts about the whole position are `engine`, which is why
   `engine` had to exist before you could ask for all of White's moves.

The words, and where each one is in your repo tonight:

| Term | Where |
|---|---|
| Cohesion | `Knight`: one question, one file. `Board`: one sentence plus a switch you priced. |
| Coupling | your `import` lines; `Board` never names `Knight` |
| Separation of concerns | `model`, `engine`, `view`, `factory`, and the arrows between them |
| Composition | `Game`'s three fields |
| Static utility | `PieceFactory` today; `MoveGenerator` this week |
| Package-private | the method in the M4 scaffold with no modifier |
| Refactor | moving `legalMoves` with forty-two tests watching |

---

## Next session

Wednesday Sep 30: SOLID. Five principles with a mnemonic. You have applied
four of them in M2 and in reading the scaffold today, and the fifth is
what M4 does. We read your engine through each lens, decide where each
piece of M3 belongs, and take a working one-file chess program apart.

---

## INSTRUCTOR ONLY

**Timing (75 min):** where you are 4 · §1 M2 named 10 · §2 cohesion 10 ·
§3 coupling 14 · §4 packages 8 · §5 reading the scaffold 16 · §6 M4 10 ·
recap 3. If behind, cut §4 to the table and the "infinite empty board"
line; never cut §1 or §5. If ahead, §5's table with the room takes all the
time you give it.

**Know the room's state at the door.** Ask for hands: M2 green? M3 started?
`legalMoves` written? Expect most on the first, half on the second, few on
the third. The session is written for that split. If more than half have
`legalMoves` written, spend the §6 "M3 and M4 together" paragraph on the
"move it with tests running" branch and demo it.

**§1 is the frame.** The claim "M2 already taught you this" has to land
early. Put the seven-file tree up and ask "why was that better?" Take
three answers from the room before naming anything. The three names go on
the board only after the room has said the ideas in its own words.

**§2: the promotion switch is the teaching moment**, not a wrinkle to
apologise for. Students who chose the switch counted a second reason to
change and priced it. Say that to them as praise. Students who chose the
factory call drew a backwards arrow and priced that. Both did the exercise.

**§3: draw the graph from the room's own imports**, not from the slide.
Ask "what does `Board` import?" and wait. Someone will notice
`Game → factory`; confirm and add it.

**§5 is the section that replaces "here is the loop."** Do not put the
loop on the screen. Put the scaffold on the screen, fill the table with the
room, and let the last row's second column stay a question mark for a
beat. Then say only: "you have `positionsOf` and you have
`pseudoLegalMoves`." The room finishes the sentence. That is them
designing M3's hardest method rather than copying it, and it is the one
place this session hands them assignment help.

**§6: do not print the three lines of M4.** The scaffold and the handout
are enough. What the room needs from you is the reasoning for the class and
the reading of its two access modifiers. Leave "why is one method
package-private?" as the question they take to Wednesday. Show the compile
error only if asked.

**Decisions taken in writing this session, for the record.** Rewritten
2026-09-27 from the room's actual state (M2 due tonight, M3 in progress,
`Game` mostly unwritten), replacing a first draft that argued from the
finished reference `Game`. No forward references beyond "king safety is
M5", which both handouts already made. M4 is a pure extraction:
`MoveGenerator.legalMoves` (public) returns package-private
`pseudoLegalMoves` unchanged until M5; measured 48 tests, 6 errors after
the merge, green after step 2. Handout:
`assignments/m4-move-generator/handout.md`.

**Check before class:** m3 and m4 tags on the starter (verified live) ·
M4 handout linked from week 6 · a demo clone at M2-green with the m3
scaffold merged and nothing written, for §5 · the seven-file tree and the
import graph on paper in case the projector dies.
