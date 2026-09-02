# Session 4 — Live Coding: `Position` and `Color`

**Week 2, Wednesday September 2** · CSC 413 Software Development
**Objectives advanced:** 1 (implement OO software in modern Java), 7 (test and debug), 8 (professional tools)
**Milestone supported:** M0b — board coordinates (assigned today, due Wed Sep 9, 11:59 PM)

---

## Where this sits

This week's goal is to take one concept from the game — a square on the board —
and model it properly in Java, end to end. Monday supplied the language features
that make those decisions well, and the modelling exercise that settled the
convention: two 0-based ints, file first, so `e2` is `new Position(4, 1)`.

Today we start it together. Half of `Position` — the record header, the bounds
check, the constructor, `toString` — is written live in class. The other half is
M0b's graded work, and it is **yours alone**: `parse`, `offsetOrNull`, and the
four `Color` bodies, about 35 lines the notes deliberately do not contain. You
leave class red and go green on your own. That is the design, and it is what M1
builds `Board` and `Piece` on next week.

This is also the first time you run the weekly milestone loop for real. Learn the
loop today, because you repeat it eleven more times this semester and it never
changes.

---

## 1. The loop

Every milestone from here to December has the same five steps:

```bash
git fetch upstream --tags     # 1. see what I published
git merge m0b                 # 2. bring it into your repository
./mvnw test                   # 3. RED — the failures are the assignment
# ... write code until green ...
git tag submit-m0b            # 4. mark your submission
git push origin main --tags   # 5. send it
```

Three things about this loop are worth stating explicitly.

**The merge brings tests, not code.** What arrives in `git merge m0b` is
`PositionTest`, `ColorTest`, and a stubbed `Color.java` whose method bodies
throw until you replace them. The implementations are yours. That is the
assignment.

**A milestone arriving red is normal.** Right after the merge, `./mvnw test`
fails, and it fails loudly — it will not even compile, because the tests
reference a class you have not written. Red *before* you merge means something in
your setup is wrong; red *after* means the assignment arrived.

**The tag is the submission.** Nothing is uploaded anywhere. `git tag submit-m0b`
followed by a push timestamps your work, and that timestamp is what I grade
against the deadline.

### Doing it now, live

```bash
cd ~/Workspace/CSC413
git fetch upstream --tags
git merge m0b
```

If that merge reports a conflict, stop and put your hand up. It should not, and
if it does, the cause is nearly always that M0 was committed differently than the
guide describes — a two-minute fix in person.

Now:

```bash
./mvnw test
```

```
[ERROR] COMPILATION ERROR
[ERROR] .../PositionTest.java:[16,9] cannot find symbol
  symbol:   class Position
```

**That error is the assignment.** It is telling you, precisely, the next thing to
write.

---

## 2. Read the tests before you write the code

Open `src/test/java/edu/sfsu/csc413/chess/model/PositionTest.java` and read all
five tests before typing anything. They are the specification — more precise than
any prose I could write, and they are what your grade is computed from.

```java
@Test
@DisplayName("parses algebraic notation into 0-based coordinates")
void parsesAlgebraic() {
    Position e2 = Position.parse("e2");
    assertEquals(4, e2.file());
    assertEquals(1, e2.rank());
}
```

Read what that tells you, line by line, without writing any code yet:

- there is a class `Position` in package `...chess.model`
- it has a **static** method `parse` taking a `String`
- instances answer `file()` and `rank()` — accessor names with no `get`, which is
  what a record generates
- `"e2"` is file **4**, rank **1** — 0-based, file first, exactly as Monday

That is most of the class signature, recovered from one test. Do this for all
five before you start. Reading tests as specification is a skill, and it is worth
practising deliberately now while they are short.

The other four say, in order:

| Test | What it pins down |
|---|---|
| `roundTrips` | `toString()` returns `"a1"`, `"h8"`, `"e4"` — algebraic, not the record default |
| `valueEquality` | `new Position(4, 3)` **equals** `Position.parse("e4")` |
| `rejectsOffBoard` | the constructor throws `IllegalArgumentException`; so does `parse("j9")` |
| `offsetOffBoardIsNull` | `offsetOrNull` returns null off-board, a `Position` on-board |

Notice `valueEquality` in particular. It is one line, and it is the test that
forces `Position` to be a record rather than a plain class. That single
`assertEquals` is Monday's `HashSet` demo, encoded as a requirement.

---

## 3. Writing `Position`

We write the first half together — follow along in your own repository, because
this is the code you are submitting. Fair warning about the scoreboard: the
suite stays red for the whole session, since every `Position` test calls
`parse`, and `parse` is yours. What class buys you is a compiling skeleton and
the three methods that carry Monday's ideas.

> **On the code below.** What we write together is the course's reference
> implementation, and the shipped tests are written against these exact
> signatures — keep the names and parameter types as they appear. The methods we
> do *not* write together — `parse`, `offsetOrNull`, and `Color`'s bodies —
> appear nowhere in these notes on purpose: the tests specify them, and writing
> them is the graded work.

### Step 1 — the record header

`src/main/java/edu/sfsu/csc413/chess/model/Position.java`:

```java
package edu.sfsu.csc413.chess.model;

public record Position(int file, int rank) {
}
```

Four lines, and the compiler has generated the constructor, both accessors,
`equals`, and `hashCode`. But run `./mvnw test` and it *still does not compile*:

```
[ERROR] cannot find symbol
  symbol:   method parse(java.lang.String)
```

The tests call two methods we have not declared. Fixing that is the next step.

### Step 2 — make it compile: stub what is yours

```java
    public static Position parse(String algebraic) {
        throw new UnsupportedOperationException("M0b: your turn");
    }

    public Position offsetOrNull(int fileDelta, int rankDelta) {
        throw new UnsupportedOperationException("M0b: your turn");
    }
```

The signatures are the fixed contract — later milestones build against them.
The bodies are the assignment. *First make it compile, then make it pass* is a
real practice, not a classroom trick. Now the suite runs:

```
Tests run: 11, Failures: 1, Errors: 7
```

Eleven tests running, eight red. That number — **eight** — is your to-do list
for the week.

### Step 3 — the bounds check, and the constant

```java
public record Position(int file, int rank) {

    /** Files and ranks both run 0..7. */
    public static final int BOARD_SIZE = 8;

    /** True when these raw coordinates name a real square. */
    public static boolean isOnBoard(int file, int rank) {
        return file >= 0 && file < BOARD_SIZE && rank >= 0 && rank < BOARD_SIZE;
    }
}
```

`isOnBoard` is **static** and takes raw ints on purpose: it has to answer the
question *before* a `Position` exists, because the constructor is about to call
it, and because `offsetOrNull` needs to check coordinates it has not built an
object for yet.

`BOARD_SIZE` rather than a literal `8` scattered around: one named place, and the
name says what the number means.

### Step 4 — the compact constructor

```java
    public Position {
        if (!isOnBoard(file, rank)) {
            throw new IllegalArgumentException(
                    "Position off board: file=" + file + ", rank=" + rank);
        }
    }
```

No parameter list, no assignments — the compiler adds those after your check
runs. `rejectsOffBoard` stays red for now — it also exercises `parse` — but the
constructor half of it is done, and you will see the whole test flip when your
`parse` lands.

From this line onward, **no other class in the engine ever validates a
position.** If you are holding one, it is on the board. That guarantee is worth
more than the four lines cost.

### Step 5 — `toString`

```java
    @Override
    public String toString() {
        return "" + (char) ('a' + file) + (char) ('1' + rank);
    }
```

File 4 → `'a' + 4` → `'e'`. Rank 1 → `'1' + 1` → `'2'`. So `"e2"`.

The leading `""` forces string concatenation. Without it, `'a' + file` and
`'1' + rank` stay `int`, and `e2` prints as `151` — `101 + 50`. Get it wrong once
deliberately so you recognise the symptom later.

Overriding `toString` on a record is allowed and, here, necessary: the generated
one prints `Position[file=4, rank=1]`, which is unreadable in a board dump or a
test failure message.

Run the suite once more before the bell:

```
Tests run: 11, Failures: 1, Errors: 7
```

The same eight reds as after Step 2 — nothing we wrote together flips a whole
test, because every `Position` test routes through `parse`. The class ends red
on purpose. Green is yours.

---

## 4. Your turn: `parse`, `offsetOrNull`, and `Color`

About 35 lines, fully specified by the tests you read in §2. Do them in this
order — it pays off fastest.

### 1. `parse` — flips four tests at once

What the tests pin down: `parse("e2")` is file 4, rank 1 · parsed squares
round-trip through `toString` · `parse("j9")`, and anything that is not a
two-character square, throws `IllegalArgumentException`.

Hints, not solutions:

- Check the *shape* of the input — could it be null? too short? — **before**
  indexing into it, or the caller gets the wrong exception.
- A file letter is a `char`, and `char`s are numbers: Step 5's `toString` did
  this trick in one direction; `parse` is the same trick in the other.
- Decide what `parse("E4")` should do, and make the code say so.
- Error messages should name what the user actually typed.

```
Tests run: 11, Failures: 0, Errors: 4
```

### 2. `offsetOrNull` — flips one

Monday's §5 gave you the contract: the offset position, or null when it lands
off the board. Three lines, built from `isOnBoard`.

```
Tests run: 11, Failures: 0, Errors: 3
```

### 3. `Color` — flips the last three

Open the stubbed `Color.java` the merge delivered and replace its four bodies.
`pawnDirection` was Monday's worked example (§7); the other three are the same
shape. For the two rank methods, derive the 0-based constants from the board
diagram — or read them out of `ColorTest`, which is exactly what tests are for
(§2: reading tests as specification is a skill).

They are facts about a color, stored where every future rule will look for
them — nothing uses them until M3's pawn moves arrive.

### What done looks like

```
./mvnw test
Tests run: 11, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Eleven: three from `ToolchainTest`, five from `PositionTest`, three from
`ColorTest`.

---

## 5. Submitting

```bash
./mvnw test                     # green first. always.
git add src/main/java/edu/sfsu/csc413/chess/model/
git commit -m "M0b: Position and Color"
git tag submit-m0b
git push origin main --tags
```

`--tags` is not optional. Without it the commits arrive and the tag does not, and
an untagged submission is one I do not know to look at.

Verify from outside your own machine: open your repository on GitHub, click
**Tags**, confirm `submit-m0b` is listed. Thirty seconds, and it catches the
failure mode where everything looked fine locally.

---

## 6. When it goes wrong

The six things that actually happen, and what each one means.

**`UnsupportedOperationException: M0b: your turn`** — a stub you have not
replaced yet. The stack trace names the method; that is the next one to write.

**`cannot find symbol: class Position`** — the file is not where Java expects.
The package is `edu.sfsu.csc413.chess.model`, so the file must be at
`src/main/java/edu/sfsu/csc413/chess/model/Position.java`. The directory path and
the package declaration have to agree, exactly.

**`e2` prints as `151`** — missing the leading `""` in `toString`. `'a' + file` and
`'1' + rank` are `int` until something in the expression is a String, so Java adds
`101` and `50` instead of joining `'e'` and `'2'`.

**`assertEquals(new Position(4,3), Position.parse("e4"))` fails** — you wrote
`class` instead of `record`, so `equals` is still reference comparison. This is
Monday's bug, and the fix is one keyword.

**`rejectsOffBoard` fails on `parse("j9")`** — `j9` computes to file 9, rank 8, so
the constructor would reject it anyway. If the test still fails, you caught the
exception somewhere and returned instead. Let it propagate; the caller is the one
who needs to hear about it.

**`git push` rejected** — `origin` still points at my repository. `git remote -v`
to confirm; the fix is in the [environment setup guide](https://goleador.github.io/CSC413/guide.html?g=environment-setup).

Anything else: copy the **exact** error text and bring it Wednesday Sep 9. Do not
retype it from memory — the details you drop are usually the ones that matter.

---

## Your homework: M0b

Due **Wednesday, September 9, 11:59 PM.**

In class we built the compiling skeleton and three of the methods. The graded
work is what remains: write `parse` and `offsetOrNull`, fill in `Color`'s four
bodies, get all eleven tests green, and tag `submit-m0b`. If you missed class,
§3 has every step we did together.

Handout: [the full M0b handout](https://goleador.github.io/CSC413/guide.html?d=assignments/m0b-coordinates/handout).

> **A scheduling note.** Monday Sep 7 is Labor Day, so there is no Monday class
> that week — the next time we meet is Wednesday Sep 9, the day this is due. That
> means **you cannot save your questions for class.** If something is broken over
> the long weekend, email me, and start early enough that there is time for a
> reply.

---

## Next session

Wednesday Sep 9 — OO design principles, and M1 opens: `Board` and `Piece`. The
domain model proper. `Position` is what they are both built out of, which is why
we spent two sessions on sixty lines.

---

## INSTRUCTOR ONLY

**Timing (75 min):** the loop + live merge 12 · reading the tests 10 · steps
1–5 together 25 · your-turn briefing 8 · start the solo work in class 10 ·
submitting 5 · Labor-Day wrap & questions 5.

**Everyone follows along.** Say so in the first minute. Laptops open, repository
open. This session is worth roughly nothing as a demonstration and a great deal
as guided practice — the ones who type it are the ones who can write M1 alone.

**Run the tests at every checkpoint** — the transitions are the pedagogy, and
this session's are: compilation error → *"that error is the assignment"* →
stubs → **11 running, 8 red** → the same 8 at the bell. Say out loud that the
red count is the to-do list, and that ending class red mirrors how every
milestone lands. Keep the terminal beside the editor the whole time.

**The `""` in `toString`.** Write it wrong first — `(char)('a'+file) +
(char)('1'+rank)` — run it, get `151`, ask what happened. Ten seconds, and it
inoculates them against a symptom they will otherwise spend twenty minutes on
alone.

**Do not** write `Board`, `Piece`, or anything with a `switch` on piece type
today, however much someone wants to race ahead. M1 is next week and M2 is week
4; jumping now means teaching inheritance badly at the end of a coding session.

**Circulate during the solo-start window.** Once the your-turn briefing is
done, they begin `parse` in class with you walking the room — the right ten
minutes to catch silent merge failures, files in the wrong directory, and the
students who have not actually run a test yet.

**Flag the Labor Day gap twice** — once at the start, once at the end. The due
date falls on the next meeting, so the usual "ask me Monday" safety net is not
there, and this is the first milestone with real code in it.

**The withheld solutions never go on the projector.** These notes are published
to the course site, so the graded methods — `parse`, `offsetOrNull`, `Color`'s
bodies — must not appear here or on screen. They exist only in
`CSC413-chess-reference`, which stays private. If a student asks you to "just
show parse," the answer is the hint list in §4 and the tests.

**What the m0b tag ships:** `PositionTest.java`, `ColorTest.java`, and the
stubbed `Color.java` (bodies `throw new UnsupportedOperationException("M0b:
your turn")`). Nothing else — `Position.java` is written in class from scratch.
Verified checkpoint outputs, in order: header-only → `cannot find symbol:
method parse` · after stubs and again at the bell → `Tests run: 11, Failures:
1, Errors: 7` · after their `parse` → `Errors: 4` · after `offsetOrNull` →
`Errors: 3` · done → `11, 0, 0`.

**Check before class:** m0b tag (tests + stubbed `Color.java`) pushed and
merging cleanly onto a fresh m0 clone ✅ · `Position.java` absent from your demo
clone so you write it live ✅ · reference implementation open off-projector,
never mirrored ✅ · handout published and linked from the week 2 page ✅.
