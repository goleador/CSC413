# Session 4 — Live coding: `Position` & `Color`
### Empty files → green tests
**Week 2, Wednesday Sep 2**

> Everyone follows along — laptops open, repository open. Run the tests after
> every step; six red-to-green transitions is the pedagogy.

---

## Where this sits

- Monday settled the design: **two 0-based ints, file first** — `e2` is `new Position(4, 1)`
- Today: half written **together** — half is **yours alone** (~35 lines)
- That is **M0b**, due **Wed Sep 9, 11:59 PM**

> **Labor Day:** no class Mon Sep 7 — the next meeting is the day this is due.
> Questions go to email, early. Flag now AND at the end.

---

## The weekly loop — same five steps to December

```bash
git fetch upstream --tags     # 1. see what I published
git merge m0b                 # 2. bring it into your repository
./mvnw test                   # 3. RED — the failures are the assignment
# ... write code until green ...
git tag submit-m0b            # 4. mark your submission
git push origin main --tags   # 5. send it
```

---

## Three facts about the loop

- **The merge brings tests, not code.** `PositionTest`, `ColorTest`, and a stubbed `Color.java` — the bodies are the assignment.
- **A milestone arriving red is normal.** Red *before* the merge = setup wrong.
  Red *after* = it arrived.
- **The tag is the submission.** Nothing is uploaded; the push timestamps it.

---

## Do it now

```bash
cd ~/Workspace/CSC413
git fetch upstream --tags
git merge m0b
./mvnw test
```

```
[ERROR] cannot find symbol
  symbol:   class Position
```

**That error is the assignment.**

> Merge conflict = hand up, stop.

---

## Read the tests before writing code

```java
@Test
void parsesAlgebraic() {
    Position e2 = Position.parse("e2");
    assertEquals(4, e2.file());
    assertEquals(1, e2.rank());
}
```

One test pins down: the class, its package, a **static** `parse`, accessors
with no `get`, and **0-based, file first**.

> §2. Read all five before typing. Tests are the specification.

---

## The other four

| Test | Pins down |
|---|---|
| `roundTrips` | `toString()` → `"a1"`, `"h8"`, `"e4"` |
| `valueEquality` | `new Position(4,3)` **equals** `parse("e4")` |
| `rejectsOffBoard` | constructor and `parse` throw |
| `offsetOffBoardIsNull` | null off-board, a `Position` on-board |

`valueEquality` is Monday's map demo, encoded as a requirement.

---

# Five steps together — then it is yours

> Reference implementation, verbatim, for what we write together. The suite
> stays red all session — every Position test calls parse. Ending class red is
> the design; say so up front.

---

## Step 1 — the record header

```java
package edu.sfsu.csc413.chess.model;

public record Position(int file, int rank) {
}
```

Four lines — and the suite **still does not compile**: the tests call `parse`
and `offsetOrNull`.

---

## Step 2 — make it compile: stub what is yours

```java
public static Position parse(String algebraic) {
    throw new UnsupportedOperationException("M0b: your turn");
}

public Position offsetOrNull(int fileDelta, int rankDelta) {
    throw new UnsupportedOperationException("M0b: your turn");
}
```

```
Tests run: 11, Failures: 1, Errors: 7
```

Eleven running, **eight red** — that number is your to-do list.

> Signatures = fixed contract; bodies = the graded work. "First make it
> compile, then make it pass."

---

## Step 3 — the bounds check

```java
public static final int BOARD_SIZE = 8;

public static boolean isOnBoard(int file, int rank) {
    return file >= 0 && file < BOARD_SIZE && rank >= 0 && rank < BOARD_SIZE;
}
```

**static**: it must answer before any `Position` exists.

---

## Step 4 — the compact constructor

```java
public Position {
    if (!isOnBoard(file, rank)) {
        throw new IllegalArgumentException(
                "Position off board: file=" + file + ", rank=" + rank);
    }
}
```

From here on, no other class ever validates a position. (`rejectsOffBoard` stays red — it also exercises `parse`; yours flips it.)

---

## Step 5 — `toString`

```java
@Override
public String toString() {
    return "" + (char) ('a' + file) + (char) ('1' + rank);
}
```

- File 4 → `'e'`; rank 1 → `'2'`. So `"e2"`.
- Drop the leading `""` → **151** — int arithmetic, `101 + 50`

> Write it wrong first, run it, ask what happened.

---

## Your turn ① — `parse`

Flips **four tests at once**. The tests pin down: `parse("e2")` → file 4,
rank 1 · round-trips through `toString` · `"j9"` and bad shapes →
`IllegalArgumentException`.

Hints: check the input's *shape* before indexing into it · `char`s are numbers
— Step 5 in reverse · decide what `"E4"` does · name what the user typed.

> Body appears nowhere in the published notes. Do NOT type it on the projector.

---

## Your turn ② — `offsetOrNull`

Monday's §5 gave the contract: **the offset position, or null off the board**.

- Three lines, built from `isOnBoard`
- The constructor **asserts**; this method **asks**
- Flips `offsetOffBoardIsNull`

---

## Your turn ③ — `Color`

Replace the four stub bodies in the `Color.java` the merge delivered.

- `pawnDirection` was Monday's worked example — the other three are **the same shape**
- Derive the 0-based rank constants from the board diagram — or read them out
  of `ColorTest`
- Flips the last three tests

> Reading expected values out of a test IS the intended path. Nothing uses
> these until M3's pawn moves.

---

## What done looks like

```
Tests run: 11, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Eleven: three toolchain + five `Position` + three `Color`.

---

## Submitting

```bash
./mvnw test                     # green first. always.
git add src/main/java/edu/sfsu/csc413/chess/model/
git commit -m "M0b: Position and Color"
git tag submit-m0b
git push origin main --tags
```

**`--tags` is not optional.** Verify on GitHub: your repo → Tags → `submit-m0b`.

---

## When it goes wrong

- `cannot find symbol` — file path and package must agree, exactly
- `e2` prints as `151` — the missing `""`
- `valueEquality` fails — you wrote `class`, not `record`
- `git push` rejected — `origin` still points at my repo

Anything else: copy the **exact** error text, email early.

---

## Next session

**M0b due Wed Sep 9, 11:59 PM · no class Mon Sep 7**

**Wednesday Sep 9** — OO design principles, and **M1 opens:** `Board` and `Piece`.

Position is what they are both built out of.
