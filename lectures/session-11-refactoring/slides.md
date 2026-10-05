**CSC 413 · Week 7 · Monday Oct 5**

# Refactoring and Code Smells

### Changing the shape of your `Game` without changing what it does

> Say aloud: M3 is due tonight at 11:59 PM, M4 Monday October 12. Today is about the change your Game is about to need, and how to make it without breaking anything.

---

## Where your `Game` is tonight

| Method | What it answers |
|---|---|
| `legalMoves()` | every pseudo-legal move of the side to move |
| `findLegalMove(String)` | which of those the player typed |
| `play(Move)` | plays one, records it, hands the turn over |
| `undoLastMove()` | takes the last one back |

`legalMoves()` is a walk: each square holding a piece of the side to move, ask the piece, collect. **42 tests green.**

> This is a good design for what it has to do. Say that. Nothing today is a criticism of M3; it is about what happens when a program meets its next requirement.

---

## The next rule: a move may not leave your own king in check. Where does it go?

- *(reveal)* In `play`, before the board changes?
- *(reveal)* Inside `legalMoves()`, as a filter?
- *(reveal)* In each piece?

*(reveal)* **Hold your answer. First: how would you even check it?**

> Take three answers from the room, then reveal the three options and settle nothing. The honest answer is that nobody can place the rule until they know what checking it requires.

---

## By the end of today you can

1. Say why king safety cannot be added to `legalMoves()` as it stands
2. Explain what refactoring is, and name the smells in this story
3. Do the three IntelliJ moves M4 needs, with the tests running after each

> Read them out. The first one is the one the room should be able to say in their own words by minute 25.

---

**Part one · in pairs**

# Work it out

Six questions. Each answer is one sentence you already know.

> Pairs. They write answers to questions 3 and 5 on paper before you take answers aloud. Walk the room.

---

## Question 1 · When is a king in check?

*(reveal)* When an enemy piece could capture it on the next move.

> Someone says "when it is attacked". Fine. Ask what attacked means in code, and you get this sentence.

---

## Question 2 · How do you know whether *one* enemy piece could capture it?

*(reveal)* Ask the piece.

*(reveal)* M2 gave every piece `pseudoLegalMoves(board, from)` and `attacks(board, from, target)`. The piece knows how it moves. Nobody else has to.

> If anyone says "check its type and compute", that is the switch M2 removed. Say so and move on.

---

## Question 3 · How do you know whether *any* enemy piece could?

*(reveal)* Walk every square holding an enemy piece and ask each one.

*(reveal)* You have written that walk already. **It is `legalMoves()`.**

> Pause after the first reveal and let them say "we have that". If someone says "generate the enemy's legal moves", park it: legal needs king safety, which needs this. Pseudo-legal is enough to ask whether a square is attacked. Go no further; that is M5.

---

## Question 4 · So can `legalMoves()` answer it for the enemy?

- *(reveal)* **No.** It walks the pieces of `sideToMove`, not the enemy's.
- *(reveal)* **No.** It is a method of `Game`, and `Game` is about a turn.
- *(reveal)* **No.** King safety needs the walk on the board *after* a trial move, not the game's board.

> Someone will suggest flipping sideToMove, calling it, and flipping back. Good instinct, terrible code: a question that mutates the game to get its answer. Name it and keep it on the board as a warning.

---

## Question 5 · What does the walk actually need?

*(reveal)* A board. A color. Nothing else.

*(reveal)* And what does it read instead? A field, `sideToMove`, that only exists because `Game` has a turn.

*(reveal)* **That is the smell: a hidden input.**

> This is the slide the session turns on. The loop's signature says it needs nothing; its body needs two things; one of them it gets from a field it happens to be near. Make them say "board and color" before you reveal it.

---

## Question 6 · If a function needs only a board and a color, whose method is it?

- *(reveal)* Not `Game`'s. `Game` has no business being asked about the enemy's moves on a hypothetical board.
- *(reveal)* Not `Board`'s. `Board` stores and decides nothing. M1.
- *(reveal)* A class whose only job is to answer questions about a position. No turn, no history, nothing to construct.

*(reveal)* **You have just designed M4. The handout has the names.**

> Say exactly this and no more: the handout names the class and its two methods and gives the order. What it could not give you is the reason, and you now have it. Do not say the class name yourself.

---

**Part two**

# What you just did has a name

---

## Refactoring changes the shape of the code, not what it does

> A change to the structure of a program that does not change its observable behavior. — Martin Fowler, *Refactoring*, 2nd ed.

- *(reveal)* Moving the walk out of `Game`, same list back: **refactoring**.
- *(reveal)* Filtering the list for king safety: **not refactoring**. The list gets shorter.
- *(reveal)* Fixing a bug: **not refactoring**, however small the edit.

> Ask: is fixing a bug a refactoring? Someone says yes because it is small. Small is not the criterion. Did the program's behavior change?

---

## "What it does" means everything a caller can notice

For `legalMoves()`:

- *(reveal)* the list of moves, and its order
- *(reveal)* the board after the call: untouched
- *(reveal)* whose turn it is, and the history
- *(reveal)* and standing in for all of it, **the 42 tests, unchanged**

> The one they forget is the board after the call. A query that leaves the board different has changed behavior even if it returns the right list. That matters on Wednesday.

---

## The smells in this story, and what the book calls them

| What you noticed | Fowler's name | The refactoring |
|---|---|---|
| The walk reads `sideToMove`, a field, when its real input is a color | a hidden input (Feature Envy) | Parameterize Function |
| `Game` would change for two reasons: how turns work, and what "legal" means | Divergent Change | Extract Class, Move Function |
| The walk is needed in two places, so it would soon exist twice | Duplicated Code | Extract Function |
| The king filter inside the existing loop: one method, two jobs | Long Function | Extract Function |
| "Is the king attacked?" as a `switch` on piece type | Repeated Switches | Ask the pieces. M2 did this already. |

> Reveal nothing here; read the rows. Divergent Change is session 9's low cohesion with Fowler's name on it. Repeated Switches is session 6, and it comes back the moment someone writes attack detection as a switch.

---

## M4 is three IntelliJ moves

| Move | What it does to the walk | macOS | Windows |
|---|---|---|---|
| Extract Method | turns the loop into a method with its inputs worked out for you | ⌥⌘M | Ctrl+Alt+M |
| Change Signature | turns the hidden input, `sideToMove`, into a parameter | ⌘F6 | Ctrl+F6 |
| Move | puts the method where both callers can reach it, and fixes every reference | F6 | F6 |
| Rename, Inline | the cleanup after | ⇧F6, ⌥⌘N | Shift+F6, Ctrl+Alt+N |

Tests after every one. Commit after every one.

> These are the keys for the next ten minutes and for their week. The IDE finds every use when it renames and every variable flowing in and out when it extracts. Find-and-replace does neither.

---

**Part three · ten minutes**

# The same moves, on code you finished last week

`Rook` and `Piece`. Not `Game`.

> Follow-along repository, Rook.java and Piece.java only. Inline slidingMoves into Rook (⌥⌘N), tests. Extract it back (⌥⌘M); point at DIRECTIONS as the hidden input. Change Signature (⌘F6) to make it a parameter. Pull Members Up (⌃T) to Piece. Tests after each. Then git checkout the file and say the file is back where it started: four refactorings, zero features.

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

**Part four**

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

> Fifteen minutes, laptops open, their repository. Walk the room. A good card says: board and sideToMove; both could be arguments; something that takes a Board and a Color and returns a List of Move. Anyone writing a method body has gone too far; stop them.

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

> Otherwise it is exercise 5 in the notes. Answers: Mysterious Name (s, m, n) via Rename; Duplicated Code (the substring formatting twice) via Extract Function; magic numbers 1 2 3 via an enum; Primitive Obsession on the move strings. String concatenation in a loop is not a smell for us.

---

**M3 due tonight 11:59 PM · M4 due Mon Oct 12**

# Next: Wednesday Oct 7

Information hiding. `Game.board()` hands out the real `Board`. What can a caller do with it that `Game` never finds out about?

> Exercise 1 in the notes is tonight's exit card done properly. On Wednesday ask who compared their signature with the handout and what differed.
