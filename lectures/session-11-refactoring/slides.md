**CSC 413 · Week 7 · Monday Oct 5**

# Refactoring and Code Smells

### Changing the shape of code so the next change is small

> Say aloud: M3 is due tonight at 11:59 PM, M4 Monday October 12. Today: why you reshape code before you change it, with the evidence from your own repository.

---

## You have already refactored once. Session 7.

**Session 6 showed this**

```java
// Board, one idea from session 6
public List<Move> movesFor(Position from) {
    switch (pieceAt(from).type()) {
        case KNIGHT -> { /* eight offsets */ }
        case BISHOP -> { /* slide 4 diagonals */ }
        case ROOK   -> { /* slide 4 lines */ }
        case QUEEN  -> { /* both */ }
        case KING   -> { /* one step, 8 ways */ }
        case PAWN   -> { /* forty lines */ }
    }
}
```

**Session 7 made this, live**

```java
// what you have, since session 7
abstract class Piece {
    abstract List<Move> pseudoLegalMoves(Board b, Position from);
}
class Knight extends Piece { /* eight offsets */ }
class Rook   extends Piece { /* slide 4 lines */ }
...

// the caller, anywhere:
board.pieceAt(from).pseudoLegalMoves(board, from);
```

Same moves out for the same pieces. Nothing the program did changed that day.

> We did not call it refactoring at the time. Point at both columns: the program behaved identically before and after. Only the shape changed. Hold the question "so what did it buy us" for ten seconds.

---

## One week later, M2 asked for `attacks`. What did it cost?

- *(reveal)* In the `switch` design: **a second switch**, six more cases, and the pawn's case differs from its movement case.
- *(reveal)* In yours: one default on `Piece` and **one override in `Pawn`**.

*(reveal)* **That is what the refactoring bought. You collected it a week ago. Open your `Pawn`.**

> Make them open Pawn.attacks in their own repository right now and look at it. That override is the payoff of session 7, already banked. This is the only reason refactoring exists: the next change got small.

---

## Smaller, same lesson: the slide loop. One copy, or three?

Rook, Bishop, Queen all slide until something stops them.

- *(reveal)* One helper on `Piece`, called three times: a bug in the slide rule is fixed **once**.
- *(reveal)* Three copies: fixed three times, or **twice**, and the queen stays wrong while her two siblings' tests go green.

*(reveal)* **Copies drift. Watch.**

> Show of hands: who has the loop once, who has it three times. Both pass the tests, say so. Then switch to IntelliJ for the drift demo: inline slidingMoves into Rook, break Rook's copy, rookBlocking red and queenCombinesDirections green. Ten minutes. Leave the inlined copy in place for later.

---

## That is what refactoring is for

> Change the shape of the code, without changing what it does, so that the *next change* is small.

*(reveal)* The gain is measured one way: **how small did the next change become?**

*(reveal)* Session 7: "a second switch, six cases" became "one override." The shared loop: "fix it three times" became "fix it once."

> Not because the code is ugly. Because you know what is coming and the current shape makes it expensive. Say that twice. Everything else today is this sentence applied to your Game.

---

## By the end of today you can

1. Point at a refactoring you already did and say what it bought you
2. Write the next change for `Game` both ways and say which shape makes it small
3. Do the three IntelliJ moves M4 needs, tests running after each

> Read them out. The second one is the one the room should be able to argue by minute 40.

---

**Part two · in pairs**

# The next change, written both ways

Not the code. The shape.

---

## The next rule: a move may not leave your own king in check

What checking it needs, in words:

1. *(reveal)* Try the candidate on the board.
2. *(reveal)* Ask whether any piece of the **other** color now attacks my king.
3. *(reveal)* Take it back.
4. *(reveal)* Keep the candidate only if the answer was no.

*(reveal)* Two new things: the board changes *during* a question, and the question is about the *other* color.

> Reveal the four steps one at a time and let them nod. Then the last line: both of those are things your Game was never built to do. Pairs now: write what it would take to do this inside Game as it stands.

---

## Shape one: inside `Game`, as it stands tonight

- *(reveal)* `legalMoves()` walks `sideToMove`'s pieces. The attack check walks the **other** color's. A second loop, or flip the turn to ask a question and flip it back.
- *(reveal)* Trial `apply` and `undo` inside the class whose promise is that the board changes only through `play`.
- *(reveal)* `legalMoves()`: thirty lines, two jobs. Generate, then filter.
- *(reveal)* Then checkmate (M8), perft (M11), an AI: each asks about a board and a color, and each has to live in, or fake, a `Game`.

> Take the pairs' answers first; most will land on the flip-the-turn hack. Name it: a question that mutates the game to get its answer. Then reveal the four costs. None of this is hypothetical; these are the next three milestones.

---

## Shape two: beside a walk that takes a board and a color

- *(reveal)* The walk's two real inputs are explicit: **a board, a color**.
- *(reveal)* The attack check is its sibling: the same walk over `color.opposite()`, asking each piece `attacks`.
- *(reveal)* The filter sits next to both, in a class with no turn, no history, nothing to construct.
- *(reveal)* `Game.legalMoves()` is one line. **`Game` does not change again** for M5, M8, or M11.

> The same four points, answered. Pause on the second bullet if anyone asks "so we call legalMoves for the enemy?": no, same walk, different question per piece, because a pawn's attacks are not its moves. Go no further; that is M5.

---

## The gain, readable today

|  | Inside `Game` as it stands | Beside a walk that takes a board and a color |
|---|---|---|
| Where king safety goes | into `legalMoves()`, which doubles | one filter, next to the walk |
| Asking about the other color | a second loop, or flip `sideToMove` | pass `color.opposite()` |
| Trial `apply` / `undo` | inside the class that promises the board only changes through `play` | inside a class that owns no game |
| What `Game` changes in M5, M8, M11 | every time | nothing |
| Who can ask "legal moves for Black here?" | a `Game` with Black to move | anyone with a board |

*(reveal)* **The right-hand column is M4. The rule is M5. The 42 tests prove the reshaping changed nothing.**

> Read it row by row. Then the reveal: the reshaping is M4, and the handout names the class and its two methods and the order. The list of moves does not change this week. That is what the 42 tests are for.

---

**Part three**

# Saying it precisely

---

## "Without changing what it does" has a sharp edge

> A change to the structure of a program that does not change its observable behavior. — Martin Fowler, *Refactoring*, 2nd ed.

- *(reveal)* Moving the walk out of `Game`, same list back: **refactoring**.
- *(reveal)* Filtering the list for king safety: **not refactoring**. The list gets shorter.
- *(reveal)* Fixing a bug: **not refactoring**, however small the edit.

> Ask: is fixing a bug a refactoring? Someone says yes because it is small. Small is not the criterion. Did the program's behavior change?

---

## "Observable" means everything a caller can notice

For `legalMoves()`:

- *(reveal)* the list of moves, and its order
- *(reveal)* the board after the call: untouched
- *(reveal)* whose turn it is, and the history
- *(reveal)* standing in for all of it: **the 42 tests, unchanged**

> The one they forget is the board after the call. A query that leaves the board different has changed behavior even if it returns the right list. That matters on Wednesday.

---

## The smells in the left-hand column, and what the book calls them

| What you noticed | Fowler's name | The refactoring |
|---|---|---|
| The walk reads `sideToMove`, a field, when its real input is a color | a hidden input (Feature Envy) | Parameterize Function |
| `Game` would change for two reasons: how turns work, and what "legal" means | Divergent Change | Extract Class, Move Function |
| The walk needed twice; the slide loop in three pieces | Duplicated Code | Extract Function, Pull Up Method |
| Generate, then filter, in one method | Long Function | Extract Function |
| "Is the king attacked?" as a `switch` on piece type | Repeated Switches | Ask the pieces. You did this in session 7. |

> Read the rows; reveal nothing. Divergent Change is session 9's low cohesion with Fowler's name on it. Repeated Switches is session 6, and it comes back the moment someone writes attack detection as a switch.

---

## M4 is three IntelliJ moves

| Move | What it does to the walk | macOS | Windows |
|---|---|---|---|
| Extract Method | turns the loop into a method, inputs worked out for you | ⌥⌘M | Ctrl+Alt+M |
| Change Signature | turns the hidden input, `sideToMove`, into a parameter | ⌘F6 | Ctrl+F6 |
| Move | puts the method where both callers reach it, fixes every reference | F6 | F6 |
| Rename, Inline | the cleanup after | ⇧F6, ⌥⌘N | Shift+F6, Ctrl+Alt+N |

Tests after every one. Commit after every one.

> These are the keys for the next ten minutes and for their week. The IDE finds every use when it renames and every variable flowing in and out when it extracts. Find-and-replace does neither.

---

**Part four · ten minutes**

# The way back: one loop again

`Rook` and `Piece`. Not `Game`.

> Rook still has its inlined copy from the drift demo. Extract Method on the loop (⌥⌘M); point at DIRECTIONS as the hidden input. Change Signature (⌘F6) to make it a parameter. Pull Members Up (⌃T) to Piece, replacing the old helper. Tests green. Then git checkout the file: back where it started, four refactorings, zero features.

---

## What we just did is what M4 asks of you

| On the slide loop, just now | On the generation loop, this week |
|---|---|
| the direction table, a field, became a parameter | `sideToMove`, a field, becomes a `Color` parameter |
| the loop moved from `Rook` to `Piece`, where every slider reaches it | the loop moves from `Game` to a class with no state, where `Game` and M5 both reach it |
| `Rook` became one line | `Game.legalMoves()` becomes one line |
| the movement tests, identical before and after | the 42 tests, identical before and after |

> Read it row by row. The last row is the grading rubric: moved, not copied, and the tests did not change.

---

**Part five**

# Refactor first. Then the feature.

---

## Never refactor and add behavior in the same commit

**When refactoring** Change the structure. Run the *existing* tests. They must stay green.

**When adding a feature** Write a *new* test that fails. Make it pass. Touch nothing else.

*(reveal)* Do both at once and a red test has three possible causes: the move, the new rule, or the test. **You cannot tell which.**

> Kent Beck calls these two hats; switch as often as you like, never wear both. Ask: you move the walk and add the king filter in one edit, and a test fails. What broke? Wait until they see there is no way to know.

---

## M4 is the refactoring. M5 is the feature.

|  | M4 · due Mon Oct 12 | M5 · after that |
|---|---|---|
| What changes | Where the walk lives, and its inputs | Which moves count as legal |
| The list of moves | Identical before and after | Shorter, in some positions |
| Tests | Your 42 stay green the whole time | New ones arrive that say what changed |
| If you find yourself… | writing king-safety code | moving code around |

*(reveal)* **…stop. You have both hats on.**

> Say exactly this much about M4 and no more: the walk moves, its inputs become explicit, the list does not change, the diff is a cut and a paste plus one line.

---

## Exit card: open your own `Game.legalMoves()`

1. Write down every field it reads.
2. For each: could a caller who only had a `Board` supply it as an argument?
3. Write the signature you would want. No body.

Then, and only then, read the M4 handout and compare.

> Ten minutes, laptops open, their repository. A good card says: board and sideToMove; both could be arguments; something that takes a Board and a Color and returns a List of Move. Anyone writing a method body has gone too far; stop them.

---

## If time remains: two smells here, and the refactoring for each

```java
public String report(List<String> moves, int n) {
    String s = "";
    for (int i = 0; i < moves.size(); i++) {
        String m = moves.get(i);
        if (i % 2 == 0) {
            s = s + (i / 2 + 1) + ". " + m.substring(0, 2) + "-" + m.substring(2, 4) + " ";
        } else {
            s = s + m.substring(0, 2) + "-" + m.substring(2, 4) + "\n";
        }
    }
    if (n == 1) {
        s = s + "White wins";
    } else if (n == 2) {
        s = s + "Black wins";
    } else if (n == 3) {
        s = s + "Draw";
    }
    return s;
}
```

> Otherwise it is exercise 5 in the notes. Answers: Mysterious Name (s, m, n) via Rename; Duplicated Code (the substring formatting twice) via Extract Function; magic numbers 1 2 3 via an enum; Primitive Obsession on the move strings.

---

**M3 due tonight 11:59 PM · M4 due Mon Oct 12**

# Next: Wednesday Oct 7

Information hiding. `Game.board()` hands out the real `Board`. What can a caller do with it that `Game` never finds out about?

> Exercise 1 in the notes is tonight's exit card done properly, and exercise 2 is "count your copies". On Wednesday ask who had three.
