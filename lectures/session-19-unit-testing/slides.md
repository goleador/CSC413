**CSC 413 · Week 13 · Wednesday Nov 18 · Zoom**

# Unit testing

### Designing the cases: partitions, boundaries, and tests worth keeping

San Francisco State University

> This is Monday's lecture, moved to today. Open IntelliJ and the Playlist project from session 18 if you have them; we write tests in it today.

---

## Where we are

You've run hundreds of JUnit tests this semester. You've written one.

*(reveal)* Today: how to choose the tests, and how to tell a good one from a weak one.

> Every test in your engine was given to you. In M8 you write the tests, and from now on you'll judge tests an agent writes. How did you decide what to test in session 18? Most of us test the input we were thinking about when we wrote the code.

---

## Session 18's four bugs
| Bug | The input that showed it |
|---|---|
| `current > songs.size()` | playing past the **last** song |
| `substring(colon - 1, colon)` | a **two-digit** minute, `12:30` |
| `lastPlayed` is null | asking **before the first** `next()` |
| `total / 60` | a total that isn't a **whole** number of minutes |

*(reveal)* Every one was an edge case. A typical input finds none of them.

> A three-minute song in the middle of the list works every time. Each bug sits at an edge: the last, the first, a bigger number, a fraction. Choosing cases on purpose would have found all four before anyone ran main.

---

# What a unit test is

> A unit test checks one behaviour of one small piece of code, a method or a class, on its own.

---

## Arrange, act, assert

```java
@Test
void readsTwoDigitMinutes() {
    // arrange: the input
    String line = "Track 37, 12:30";
    // act: call the code under test
    Playlist.Song song = Playlist.parse(line);
    // assert: compare with the expected value
    assertEquals(750, song.seconds());
}
```

> This is session 18's test, split into its three parts. Short tests fit on one line, as the original did. When a test is hard to read, split it this way.

---

## A good unit test
- **One behaviour.** When it fails, you know what broke.
- **Its name says the behaviour.** `readsTwoDigitMinutes`, not `test3`.
- **Independent.** Passes alone, in any order.
- **Fast.** You run hundreds on every save.

> Your engine's tests use @DisplayName to give each one a sentence, like "a pawn captures diagonally but not straight ahead". Which of these four do you think is broken most often? Independence; we'll see what that looks like in a few minutes.

---

## `assertEquals(expected, actual)`

```java
assertEquals("1:05", formatLength(65))   →  expected: <1:05> but was: <1:5>
assertEquals(formatLength(65), "1:05")   →  expected: <1:5> but was: <1:05>
```

*(reveal)* Swapped, the message says the code is right and the test is wrong.

> Both lines run against a version that forgets a leading zero. JUnit writes the message from the argument order, so the order matters when you read the failure at midnight.

---

## Watch it fail

A test you have never seen fail may not be testing anything.

*(reveal)* Break the code on purpose, run the test, see red, undo the break.

> You did this in session 18 when you put the substring bug back. Today it becomes a rule, and later it is how we check tests an agent wrote.

---

# Choosing cases

> You can't test every int, and ten random ones mostly test the same thing. Two ideas tell you which ones to pick.

---

## Follow along
- Notes §3: `Playlist.java` and session 18's `PlaylistTest.java` in `src/`.
- **File → Project Structure → Libraries → + → From Maven**
- `org.junit.jupiter:junit-jupiter:5.12.2`

> It's session 18's playlist with the four bugs fixed and one new method. This project has no pom.xml, so JUnit is added by hand; use junit-jupiter, which includes the part @ParameterizedTest needs. If Alt+Enter offers JUnit 4, don't take it: its package is org.junit, so every import stays red. If you can't get it running in two minutes, just watch, and set it up after class from the notes.

---

## The specification

> `static String formatLength(int seconds)` writes a length in seconds as minutes and seconds: 750 is `"12:30"`, 65 is `"1:05"`. It throws `IllegalArgumentException` for a negative length.

**In chat:** which inputs would you test, and what should each return?

> Don't open the code; tests come from the specification. Type one input and its expected result per message, as many as you like. Five minutes. I'll sort them into groups as they come in.

---

## Equivalence partitions
| Partition | Example | Expected |
|---|---|---|
| under a minute | 45 | `0:45` |
| whole minutes | 120 | `2:00` |
| minutes and seconds | 750 | `12:30` |
| *(reveal)* seconds under 10 | 65 | `1:05` |
| negative | -5 | throws |

*(reveal)* Groups the specification treats alike. One test from each, at least.

> If the code works for one value in a group, it very likely works for the rest. Which of these did the chat find? The fourth row is the one people miss, though the specification gives it as an example.

---

## Boundary values
| Boundary | Test |
|---|---|
| negative / valid | `-1`, `0` |
| under a minute / a minute | `59`, `60` |
| one-digit / two-digit minutes | `599`, `600` |

*(reveal)* Most bugs live where one group meets the next. Test both sides.

> That's where less-than and less-or-equal, or zero and one, get mixed up. Session 18's first bug was exactly this: greater-than where it should have been greater-or-equal.

---

## Edge cases to check every time
- zero, one, many
- the first and the last
- empty: a list, a string
- null, if a caller could pass it
- invalid input: does it throw what the specification says?
- the largest value that should work

> Keep this list next to you when you write tests in M8 and when you review tests an agent wrote. Which of these apply to formatLength? Zero, invalid input, and arguably the largest.

---

## The tests, one per case

```java
@Test
void formatsZero() {
    assertEquals("0:00", Playlist.formatLength(0));
}

@Test
void formatsOneMinuteFive() {
    assertEquals("1:05", Playlist.formatLength(65));
}

@Test
void rejectsANegativeLength() {
    assertThrows(IllegalArgumentException.class, () -> Playlist.formatLength(-1));
}
```

> assertThrows takes the exception class you expect and a lambda. The lambda delays the call, so JUnit can run it inside its own try and see what comes out. It fails if nothing is thrown, or something else is. Type these with me.

---

## A version with a bug

```java
if (seconds <= 0) {
    throw new IllegalArgumentException("negative length: " + seconds);
}
```

```
formatsZero » IllegalArgument negative length: 0
```

*(reveal)* One test red, at a boundary. Without a test of `0`, nothing catches it.

*(reveal)* An **error** (an exception escaped), not a **failure** (an assertion was false).

> I wrote this bug for the exercise; paste it over formatLength and run your tests. Which of yours went red? Notice the message too: "negative length: 0". The author never imagined zero reaching that line.

---

## Your engine's tests do the same
| Given test | Which idea |
|---|---|
| "a knight in the centre reaches eight squares" / "in the corner reaches only two" | partitions |
| "a pawn advances one square, or two from its starting rank" | a boundary |
| "a pawn reaching the last rank offers all four promotions" | the last |
| "an empty board has no moves for either side" | empty |
| "a side with no king is never in check" | invalid state, no crash |
| *(reveal)* "asking for the legal moves leaves the board as it was" | what must **not** change |

> These are from PieceMovementTest and MoveGeneratorTest, the tests you made pass. The last one is worth copying: besides "returns the right thing", ask what a method must leave alone, and test that too.

---

# Three JUnit tools

> All three come with junit-jupiter, which is already in your pom.xml and in the Playlist project.

---

## `@ParameterizedTest`: one test, many rows

```java
@ParameterizedTest
@CsvSource({
    "0,   0:00",
    "59,  0:59",
    "60,  1:00",
    "65,  1:05",
    "599, 9:59",
    "600, 10:00",
    "750, 12:30",
})
void formatsMinutesAndSeconds(int seconds, String expected) {
    assertEquals(expected, Playlist.formatLength(seconds));
}
```

> Seven tests that differ only in their numbers are seven copies of the same code. Each string is a row; the comma splits it into the parameters, and JUnit turns "59" into an int. Use it when the cases differ only in data; the negative case stays its own test because it checks something different.

---

## Each row reported on its own

```
formatsMinutesAndSeconds(int, String)[1]  expected: <0:00> but was: <0:0>
formatsMinutesAndSeconds(int, String)[3]  expected: <1:00> but was: <1:0>
formatsMinutesAndSeconds(int, String)[4]  expected: <1:05> but was: <1:5>
formatsMinutesAndSeconds(int, String)[6]  expected: <10:00> but was: <10:0>
```

*(reveal)* Rows 2, 5, and 7 pass: their seconds already have two digits.

> This is the same test against a version without the leading zero. One bad row doesn't hide the others. If you had tested only 750, you'd never know.

---

## `@BeforeEach`: a fresh start for every test

```java
private Playlist playlist;

@BeforeEach
void threeSongs() {
    playlist = new Playlist();
    playlist.load(List.of("One, 1:00", "Two, 2:00", "Three, 3:30"));
}

@Test
void goesBackToTheFirstSongAfterTheLast() {
    playlist.next();
    playlist.next();
    playlist.next();
    assertEquals("One", playlist.next().title());
}
```

> JUnit makes a new test object for every test and runs this method on it first, so every test starts with the same three songs. This test is session 18's first bug, written down so it can't come back. Three songs are enough: the boundary is "after the last".

---

## Share one playlist instead

A `static` field, loaded once with `@BeforeAll`:

```
saysNothingIsPlayingBeforeTheFirstSong  expected: <nothing yet> but was: <Two>
startsWithTheFirstSong                  expected: <One> but was: <Two>
```

*(reveal)* Each passes when run alone. Passing alone but failing in the suite means shared state.

> The other test moved the shared playlist first. JUnit doesn't promise an order, so a test that needs one will break some day for a reason that has nothing to do with the code. Exercise 2 asks you to explain these two messages.

---

# Your turn

> Ten minutes, on your own machine. Then a few of you share your partitions.

---

## Test `totalMinutes()`
- List the partitions first.
- One test per partition.
- Put session 18's bug back: `total / 60`.
- At least one test should go red. Then undo it.

> If none of yours went red, ask which partition the bug lives in. When you're done, paste your test names in the chat. Who had an empty playlist? Did it catch the bug? It shouldn't: zero divided by sixty is zero either way.

---

# Is this test any good?

> A passing test can still check almost nothing.

---

## All three pass. What doesn't each check?

```java
@Test
void a() {
    assertEquals(750 / 60 + ":" + 750 % 60, Playlist.formatLength(750));
}

@Test
void b() {
    assertNotNull(Playlist.formatLength(750));
}

@Test
void c() {
    assertEquals("0:00", Playlist.formatLength(0));
    assertThrows(IllegalArgumentException.class, () -> Playlist.formatLength(-1));
}
```

> Answer in chat: pick a, b, or c, and say what it would miss. Take a minute before typing.

---

## What each one misses
| Test | Problem |
|---|---|
| *(reveal)* `a` | The expected value uses the code's formula. Wrong formula, same wrong answer. |
| *(reveal)* `b` | Any string passes. |
| *(reveal)* `c` | Two behaviours. If the first line throws, the second never runs. |

*(reveal)* Expected values come from the specification. One behaviour per test.

> Test a also passes against the version without the leading zero, because 750 has two-digit seconds. For c: against the less-or-equal version, the first line throws and you never learn whether -1 is handled.

---

## Checking tests an agent wrote
- **Break the code on purpose.** If nothing goes red, the tests don't cover it.
- **Ask where each expected value came from.** The specification, worked out by hand.

*(reveal)* A value copied from running the code only checks that the code does what it does today.

> M7 allowed generated test scaffolding, and you'll see generated tests again. These are the same two checks you'd run on your own tests.

---

## Coverage

**Run 'PlaylistTest' with Coverage**: a bar beside each line, green if a test ran it, red if none did.

*(reveal)* Red: untested.

*(reveal)* Green: run, not necessarily checked. Test `b` turns `formatLength` green.

> It's on the right-click menu of the test class, under More Run/Debug in recent versions. Coverage shows what you missed, not that what you covered is right.

---

# When you can't work out the answer

> For formatLength you worked out every expected value by hand.

---

## How many?

From the opening position, how many different positions after three moves (white, black, white)?

**In chat:** how would you find the expected value for that test?

> Nobody can count it by hand. Running your own engine and copying the number is test a from a few slides ago. So where does the number come from?

---

## A test oracle

An independent source of the right answer:
- a specification that states it;
- a slower, simpler version you trust;
- published results, checked by many people.

> Independent is the important word: it must not come from the code under test. In other fields this is a reference implementation, a known dataset, or a result from a textbook.

---

## Perft: the oracle for move generators

Count every position reachable in exactly *n* moves.
| Moves | Positions |
|---|---|
| 1 | 20 |
| 2 | 400 |
| 3 | 8,902 |
| 4 | 197,281 |

> Perft stands for performance test. A move by either side counts as one. Depth 1 you already test: "the opening position has exactly twenty legal moves". Depth 4 runs every rule you've written, check and pins included, on almost two hundred thousand positions.

---

## A wrong count

Off by one means some rule is wrong somewhere.

*(reveal)* Split the count by first move and compare each part with a trusted engine.

*(reveal)* M8: a perft harness in JUnit. The handout has the details.

> How many positions follow e2e4, how many follow g1f3, and so on. The one part that differs points to one move, and repeating the split points to one position. That's session 18's method again: narrow it down before you guess.

---

## Exit question

> A method `parseRank(char c)` turns `'1'`…`'8'` into 0…7 and throws on anything else. List the inputs you'd test, grouped into partitions, and mark the boundaries.

> Type your answer in the chat. I'll read two or three.

---

# Next: Monday Nov 30

## Software maintenance

No class Thanksgiving week, Nov 23–27.

> Have a good break. Try exercise 5 on your engine before M8.
