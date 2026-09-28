# Session 9 — Cohesion, Coupling, Separation of Concerns
### Where does this code belong?
**Week 6, Monday Sep 28**

> Say aloud: M2 due tonight 11:59 PM; M3 due Mon Oct 5; M4 opens today, due
> Mon Oct 12. Protect §2's "what does it read from this" and §5's three
> candidates.

---

## By the end of today you can

1. Say what a class is for in one sentence, count its reasons to change, and decide whether a method belongs to it
2. Draw the arrows between your packages, say which way they may point, and what a wrong-way arrow costs
3. Move the generation loop out of `Game` into `MoveGenerator`, and say why there and not `Board`, `Piece`, or nowhere

---

## 1. You have been answering one question since week 2

| Week | Decision | Went |
|---|---|---|
| 2 | `offsetOrNull`, `pawnDirection` | with the data they depend on |
| 4 | may `Board` print, or check a capture? | no: `Board` stores |
| 4 | where does the knight's movement live? | on `Knight`, behind `Piece` |
| 5 | is this class doing one job? | one sentence, no "and" |
| 5 | `apply` vs `play` | moving is storage; deciding is not |
| 5 | `toString` vs drawing | a dump is the model's; a picture is the view's |

*(reveal)* Same question every time: **where does this belong?** Today, the words.

---

# Cohesion · Coupling · Separation of concerns

Three words for one question.

---

## 2. Cohesion: one reason to change

How much the parts of a class belong together. The test you have: **one sentence, no "and".**

*(reveal)* Sharper: **count the reasons you would open the file.** Two unrelated reasons, two jobs.

*(reveal)* `Board`: *stores which piece is on which square.* Why open it? Storage changes. **One reason.**

---

## Why would you open `Game.java`?

1. *(reveal)* **Turns or history change.** M8: the game knows it is over. M10: undo becomes Command.
2. *(reveal)* **Move generation changes.** M5: king safety. M12: castling, en passant.

*(reveal)* Nothing on one list touches the other. **Two jobs.**

> The rules committee does not care how undo is implemented.

---

## What does this method read from `this`?

```java
public List<Move> legalMoves() {
    List<Move> moves = new ArrayList<>();
    for (Position from : board.positionsOf(sideToMove)) {
        moves.addAll(board.pieceAt(from).pseudoLegalMoves(board, from));
    }
    return moves;
}
```

*(reveal)* `board` and `sideToMove`. And it only **passes them on.** Never `history`. Never flips the turn.

*(reveal)* Compare `play`: reads all three fields, writes two, cannot exist without the game.

*(reveal)* A method that only forwards its class's state is **visiting, not living there.** Its signature says where it lives: `(Board, Color) → List<Move>`.

> Wait for "board and sideToMove". Then ask what it does with them. Do not say "feature envy" — week 7.

---

## What low cohesion costs

- Every change to generation is a change to `Game`
- Every test of generation needs a `Game`. M5 wants to ask "is this king attacked?" of a board from FEN. Why play a game first?
- You open `Game` to fix undo, and forty lines of geometry are in the way

---

## 3. Coupling: who knows about whom

How much one part must know about another to work.

**Measured by one question: if this changes, what breaks?**

---

## Your repo after M3. Arrow = `import`

```
                 Main
              /   |   \
             v    v    v
  view  ─►  model  ◄─  engine  ─►  factory
                 ▲                   |
                 └───────────────────┘

  model  ─►  (nothing of yours)
```

*(reveal)* Every arrow points toward `model`. None points back. **No cycle.**

*(reveal)* You can read `Board.java` without opening another file of yours. That is not luck.

> Draw it from the room's own import lines. Someone will spot Game → factory (BoardFactory.standard()). Add it; still no cycle.

---

## Three kinds you have already met

| Kind | Where you met it | The control |
|---|---|---|
| *(reveal)* **Import coupling** | M3's promotion: `Board` calling `PieceFactory` = `model → factory → model`, a cycle | four duplicated lines instead. A judgement, with a cost either way |
| *(reveal)* **Knowing internals** | a caller that `clear()`s the history list | `List.copyOf`; `private`; `final` |
| *(reveal)* **Switch on type** | a `switch (piece.type())` knows every kind; add one, edit every switch | `pseudoLegalMoves` is abstract; the one switch lives in `factory` |

---

## Coupling cannot be zero

`Game` must know `Board`. A game with no board is not a game.

*(reveal)* **Few arrows. One direction. Pointing at what changes least.**

*(reveal)* `Piece` changes less than `Knight`. `List` less than `ArrayList`. `model` less than `view`. Point the arrows there.

---

## 4. Separation of concerns: the layers

| Concern | Package | May import |
|---|---|---|
| what things are, where they stand | `model` | nothing |
| how a game proceeds; what is legal | `engine` | `model`, `factory` |
| how a position is shown | `view` | `model` (M9: `engine`) |
| how objects are built from data | `factory` | `model` |
| wiring | `Main` | anything |

---

## Aren't the pieces' moves "rules"? Why `model`?

*(reveal)* A piece's geometry is a fact **about the piece**, like its colour. A knight moves in an L whatever else is on the board.

*(reveal)* What a piece cannot know: anything about **the rest of the board**. Is my king attacked? Whose turn? Has that rook moved?

*(reveal)* Facts about one piece: `model`. Facts about the whole position: `engine`.

> If pushed: "Could you write Knight correctly on an infinite empty board?" Yes. "Could you write isInCheck?" No.

---

## What the layers buy

- Test `Board` without a `Game`; `Game` without a screen
- Read one layer at a time
- Week 11: a Swing window without opening a file in `model` or `engine`

*(reveal)* Separation of concerns is the goal. Cohesion and coupling are how you check you reached it: **each part cohesive, coupled in one direction.**

---

## 5. The loop has to live somewhere

Session 6's three candidates, again.

- *(reveal)* **`Board`?** *Board stores.* A second sentence today; by M5, when king safety follows, the whole engine.
- *(reveal)* **`Piece`?** Needs every piece of a colour. No piece can see the others. `attacks` is the most one piece can say.
- *(reveal)* **Leave it in `Game`?** Works. Costs two reasons to change, and M5 and M12 land in the class that does undo.
- *(reveal)* **A new class.** `MoveGenerator`, in `engine`: *turns a position and a colour into the moves that colour may play.*

---

## Its shape follows from its sentence

```java
public final class MoveGenerator {

    private MoveGenerator() { }

    public static List<Move> legalMoves(Board board, Color color)
           static List<Move> pseudoLegalMoves(Board board, Color color)
}
```

*(reveal)* Nothing to remember → nothing to construct → `static`, private constructor, `final`. A namespace for functions. `Math` is one. `PieceFactory` is one.

*(reveal)* Look at the signature: **no `Game`.** The generator does not know a game exists. M5's tests build a board from FEN and ask.

> "A class can be a namespace" — once. Some of the room thinks every class must be instantiated.

---

## Why does one method have no modifier?

*(reveal)* Session 5: *"a member with no modifier is visible to its package and nowhere else. We will use that in M4."*

*(reveal)*
```
Main.java: pseudoLegalMoves(Board,Color) is not public in MoveGenerator;
           cannot be accessed from outside package
```

*(reveal)* Outside `engine`, "pseudo-legal" is not a concept anyone should build on. A view that listed them would offer moves M5 forbids. `Game.legalMoves()` is the door.

*(reveal)* Coupling control at the package level: an arrow the compiler will not let you draw.

> Show it live: type the call into Main, build, read the message, delete it. Thirty seconds.

---

## What the cut buys: next week

**This week**
```java
// Game
return MoveGenerator.legalMoves(board, sideToMove);
// MoveGenerator
return pseudoLegalMoves(board, color);
```

**M5**
```
for each candidate in pseudoLegalMoves:
    board.apply(candidate)
    keep it if the king is not attacked
    board.undo(candidate)
// + isAttacked, isInCheck, Board.kingPosition
```

*(reveal)* Forty lines, all in a class with one reason to change. `Game` does not open. Nothing that calls `Game` notices.

---

## 6. M4: your turn

```
git fetch upstream --tags
git merge m4
./mvnw test
```

**Arrives:** `engine/MoveGenerator.java`, two methods, both throwing; `MoveGeneratorTest`, six tests.
**Stays yours:** `Game`. One method changes. Nothing else is touched.

```
Tests run: 48, Failures: 0, Errors: 6
```

Your forty-two are still green. Keep them that way.

---

## Build in this order

1. `pseudoLegalMoves`: cut the loop from `Game`, paste, `sideToMove` → `color`. **Still 6 red.**
2. `legalMoves`: `return pseudoLegalMoves(board, color);` **All six green.**
3. `Game.legalMoves()`: `return MoveGenerator.legalMoves(board, sideToMove);` Delete the loop. **Still green.**
4. `git diff`. The loop exists **once**. `Main` untouched.

*(reveal)* Step 2 is green with the loop still in `Game`. Two copies of a loop agree with each other. **Green is not done.** Delegation is graded by reading your diff.

```
Tests run: 48, Failures: 0, Errors: 0   →   git tag submit-m4
```

---

## The words for what you built

| Term | Where |
|---|---|
| Cohesion | `Game` after M4: turns and history, one reason to change |
| Coupling | the `import` lines; `model` has none of yours |
| Separation of concerns | four packages and the arrows between them |
| Layer | `view → model ← engine → factory → model` |
| Static utility | `MoveGenerator`, `PieceFactory`: no fields, private constructor |
| Package-private | `pseudoLegalMoves`: visible in `engine` only |
| Refactor | M4: the same forty-two green before and after |

---

**M2 due tonight · M3 due Mon Oct 5 · M4 due Mon Oct 12**

# Next: Wednesday Sep 30

SOLID. Five principles, and you have already applied four without the names.

We read your engine through each lens, place six new features, and take a one-file chess program apart.
