# Session 9 — Cohesion, Coupling, Separation of Concerns
### What M2 taught you, named
**Week 6, Monday Sep 28**

> Hands at the door: M2 green? M3 started? legalMoves written? Say aloud: M2
> due tonight 11:59 PM; M3 due Mon Oct 5; M4 opens today, due Mon Oct 12.
> Protect §1 and §5.

---

## Where you are this morning

- **Tonight:** M2. One abstract `Piece`, six subclasses, `Move`, 34 green.
- **Since Wednesday:** a `Game` scaffold. Three fields, six methods that throw, 8 red.
- **Most of you:** have not written those bodies yet. Good.

*(reveal)* **The claim for today:** M2 already taught you this week's three words. We name them, then read the scaffold with them, and find one thing in it that does not belong.

---

## By the end of today you can

1. Say what a class is for in one sentence, count its reasons to change, and use that on `Knight`, `Board`, and `Game`
2. Draw the arrows between the packages in your repo today, and name what a wrong-way arrow costs
3. Read the `Game` scaffold method by method and find the one method that is not really about a game

---

## 1. What you did in M2

```
Piece (abstract)      pseudoLegalMoves(board, from) is abstract
├── Knight            eight offsets, one line
├── King              eight offsets, one line
├── Rook              four directions, slidingMoves
├── Bishop            four directions, slidingMoves
├── Queen             eight directions, slidingMoves
└── Pawn              the real work
```

Seven files where there was one. **Why was that better?**

> Take three answers from the room before naming anything.

---

## Three answers you already gave

*(reveal)* **Each class answers one question.** The knight's move changes: you open one file. With a `switch` on type, you open the file that also holds the other five. **Cohesion.**

*(reveal)* **`Board` never asks what kind of piece it holds.** Neither does the loop. Who in your repo names `Knight`? `PieceFactory` and the tests. **Low coupling.**

*(reveal)* **Adding a piece is adding a file.** "Add an Archbishop; which line changes?" None. *Named on Wednesday.*

*(reveal)* You applied these because the compiler and the tests pushed you there. Now the words. **That is the right order.**

---

## 2. Cohesion: one reason to change

The test you have: **one sentence, no "and".**

*(reveal)* Sharper: **count the reasons you would ever open the file.** Two unrelated reasons, two jobs.

*(reveal)*

| Class | One sentence | Why you would open it |
|---|---|---|
| `Knight` | how a knight moves | the knight's move changes. That is all. |
| `Position` | a square on the board | the board stops being 8×8. That is all. |
| `Board` | stores which piece is on which square | storage changes |

---

## `Board`, which you are editing this week

*(reveal)* M3 step 1: `apply`, `undo`. Moving a piece between squares with no opinion. **Storage. Still one sentence.**

*(reveal)* M3's promotion wrinkle: a `switch` that builds a queen. **Not storage. Construction.** And you wrote a comment saying what it costs.

*(reveal)* **That comment is a cohesion judgement.** You counted a second reason to change, priced it, and wrote it down. That is the skill.

> Praise, not apology. Both routes did the exercise: the switch priced a second reason; the factory call priced a backwards arrow.

---

## 3. Coupling: who knows about whom

**Measured by one question: if this changes, what breaks?**

```
                 Main
              /   |   \
             v    v    v
  view  ─►  model  ◄─  engine  ─►  factory
                 ▲                   |
                 └───────────────────┘

  model  ─►  (nothing of yours)
```

*(reveal)* Check it against your own `import` lines. Every arrow points at `model`. None points back. **No cycle.**

> Draw it from the room's imports. "What does Board import?" Wait. Someone finds Game → factory (BoardFactory.standard()). Add it.

---

## Three kinds you have already met

| Kind | Where, this week | The control |
|---|---|---|
| *(reveal)* **Import coupling** | M3's promotion: `Board` calling `PieceFactory` draws `model → factory`. `factory → model` exists. A cycle. | four duplicated lines, or the arrow. A judgement with a cost either way. |
| *(reveal)* **Knowing internals** | `history()` in your scaffold: hand out the real list and a caller can `clear()` it | a copy. `private`. `final`. |
| *(reveal)* **Switch on type** | M2's contract: no `switch` on piece type in `model`. A switch knows the whole list. | `pseudoLegalMoves` is abstract; the one switch lives in `factory` |

*(reveal)* Few arrows. One direction. Pointing at what changes least: `Piece` over `Knight`, `List` over `ArrayList`.

---

## 4. Separation of concerns: your four packages

| Concern | Package | In it today |
|---|---|---|
| what things are, where they stand | `model` | `Position` `Color` `PieceType` `Piece`+6 `Move` `Board` |
| how a game proceeds | `engine` | `Game`, mostly empty. Opened Wednesday. |
| how a position is shown | `view` | `PieceGlyphs`, `TextBoardRenderer` (given) |
| how objects are built from data | `factory` | `PieceFactory`, `BoardFactory` (given) |

*(reveal)* Session 5 handed you these names in week 4. Now you can say what each is for.

---

## Aren't the pieces' moves "rules"? Why `model`?

*(reveal)* A piece's geometry is a fact **about the piece**, like its colour. You could write `Knight` correctly for an infinite empty board.

*(reveal)* What a piece cannot know: anything about **the rest of the board**. Whose turn. Whether its own king is safe.

*(reveal)* Facts about one piece: `model`. Facts about the whole position: `engine`. That is why `engine` opened the week you needed "every move for White".

---

# 5. Open `engine/Game.java`

Not to write anything. To read it.

---

## Which fields does each method need?

Three fields: a `Board`, a `List<Move>`, a `Color`. Composition. Six methods that throw.

| Method | Needs | And does |
|---|---|---|
| *(reveal)* `board()` `sideToMove()` `history()` | one each | hands it out; `history()` hands out a copy |
| *(reveal)* `play(Move)` | all three | checks, changes the board, appends, flips the turn |
| *(reveal)* `undoLastMove()` | all three | pops, reverses the board, flips back |
| *(reveal)* `findLegalMove(String)` | whatever `legalMoves()` needs | walks the legal moves for a matching notation |
| *(reveal)* `legalMoves()` | `board`, `sideToMove` | **?** |

> Fill it with the room. Leave the last cell a question mark for a beat.

---

## `legalMoves()`

Its javadoc: *every pseudo-legal move of every piece belonging to `sideToMove()`.*

*(reveal)* You have both halves. `Board.positionsOf(color)` is M1. `Piece.pseudoLegalMoves(board, from)` is M2.

*(reveal)* It needs the board and a colour. Never `history`. Never flips the turn. **Hand it any board and any colour and it answers.**

*(reveal)* Compare `play`: all three fields, writes two, cannot exist without the game.

*(reveal)* A method that only forwards its class's state is **visiting, not living there.** Its real signature: `(Board, Color) → List<Move>`. A question about a position, not a game.

> Do not put the loop on the screen. "You have positionsOf and you have pseudoLegalMoves." The room finishes the sentence.

---

## Why would you ever open `Game.java`?

1. *(reveal)* **Turns or history change.** How undo works. How the game knows it has ended.
2. *(reveal)* **Move generation changes.** You know one is coming: both handouts said *king safety is M5*.

*(reveal)* Two lists with nothing in common. **Two reasons.** And the second lives entirely inside the one method that does not need a game.

*(reveal)* **You did this in M2.** Movement did not belong to `Board`, so it moved out, and `Board` did not change. Generation does not belong to `Game`, so it moves out, and `Game` will not change.

---

## 6. Where it goes

Session 6's three candidates, again.

- *(reveal)* **`Board`?** *Board stores.* A second sentence today; when king safety follows, the whole engine.
- *(reveal)* **`Piece`?** "Every move for White" needs every white piece. No piece can see the others. `attacks` is the most one piece can say.
- *(reveal)* **Leave it in `Game`?** The M3 tests pass. The cost is two reasons to change, and M5 lands in the class that does undo.
- *(reveal)* **A new class in `engine`.** `MoveGenerator`: *turns a board and a colour into the moves that colour may play.* That is M4.

---

## Its shape follows from its sentence

*(reveal)* Nothing to remember: no board of its own, no side to move, no history. Everything arrives as a parameter.

*(reveal)* Nothing to remember → nothing to construct → `static` methods, private constructor.

*(reveal)* You have one already. `PieceFactory.create(...)`, called since M2 without ever writing `new PieceFactory()`. **A class can be a namespace for functions.**

*(reveal)* Read the scaffold before writing. Two methods. One is `public`. One has **no access modifier**. Session 5: *"we will use that in M4."* Why would the engine offer one and keep the other inside? Bring an answer Wednesday.

> Do not print the three lines of M4. Leave the package-private question open. Show the compile error only if asked.

---

## M3 and M4 are open in the same week

**Not written `legalMoves()` yet?** You may write it in its final home from the start and have `Game.legalMoves()` ask `MoveGenerator`. The M3 tests call `Game`; they do not care where the loop lives.

*(reveal)* **Already written it in `Game`?** Get to 42 green. Then move it, with the tests running, and watch 42 stay green while code changes files. **That is what "refactor" means.**

*(reveal)* Either way: **M3 first.** M4 is short on a green M3 and long on a red one.

*(reveal)*
```
git fetch upstream --tags
git merge m4
./mvnw test
```

---

## The words for what you built

| Term | Where, tonight |
|---|---|
| Cohesion | `Knight`: one question, one file. `Board`: one sentence plus a switch you priced. |
| Coupling | your `import` lines; `Board` never names `Knight` |
| Separation of concerns | `model`, `engine`, `view`, `factory`, and the arrows |
| Composition | `Game`'s three fields |
| Static utility | `PieceFactory` today; `MoveGenerator` this week |
| Package-private | the method in the M4 scaffold with no modifier |
| Refactor | moving `legalMoves` with 42 tests watching |

---

**M2 due tonight · M3 due Mon Oct 5 · M4 due Mon Oct 12**

# Next: Wednesday Sep 30

SOLID. Five principles. You applied four of them in M2 and in reading the scaffold today; the fifth is what M4 does.

We decide where each piece of M3 belongs, and take a one-file chess program apart.
