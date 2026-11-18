# Session 19 — Unit testing: designing the cases

You have run hundreds of JUnit tests this semester, and since session 4 you
have read them as the specification. You have written one: session 18's
`readsTwoDigitMinutes`. This session is about choosing tests: which inputs to
try, how many, and how to tell whether a test is worth keeping.

The idea in one line: **a test suite is designed, not collected.** Split the
inputs into groups that should behave alike, test one case from each group
and both sides of every boundary, and keep a test only if you have seen it
fail.

## 1. Session 18's bugs were all edge cases

Look again at the four bugs in `Playlist`:

| Bug | The input that showed it |
|---|---|
| `current > songs.size()` should be `>=` | playing past the **last** song |
| `substring(colon - 1, colon)` reads one digit | a **two-digit** minute, `12:30` |
| `lastPlayed` is null | asking **before the first** `next()` |
| `total / 60` drops the fraction | a total that isn't a **whole** number of minutes |

None of them shows up on a typical input. A three-minute song in the middle
of the list works every time. Each bug sits at an edge: the last one, the
first one, a bigger number, a fraction. Testing only the typical case finds
none of them. Choosing the cases on purpose would have found all four before
anyone ran `main`.

## 2. What a unit test is

A **unit test** checks one behaviour of one small piece of code, such as a
method or a class, on its own. Here is session 18's test again, in three
parts:

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

**Arrange, act, assert.** Short tests often fit all three on one line, as
the original did. When a test is hard to read, split it into these three
parts.

A good unit test has four properties:

- **One behaviour.** When it fails, you know what broke.
- **Its name says the behaviour.** `readsTwoDigitMinutes`, not `test3`. The
  engine's tests use `@DisplayName` for a sentence:
  `"a pawn captures diagonally but not straight ahead"`.
- **Independent.** It passes alone, in any order, with any other test.
- **Fast.** You run hundreds of them every time you save.

**`assertEquals(expected, actual)`: the order matters.** JUnit writes the
failure message from it. Swap them and the message points you the wrong way:

```
assertEquals("1:05", formatLength(65))   →  expected: <1:05> but was: <1:5>
assertEquals(formatLength(65), "1:05")   →  expected: <1:5> but was: <1:05>
```

The second message says the code is right and the test is wrong.

**Watch it fail.** Session 18 had you put the bug back and see the test go
red. Make that a rule: a test you have never seen fail may not be testing
anything. Break the code on purpose, run the test, then undo the break.

## 3. Choosing cases: partitions and boundaries

Today's demo is session 18's `Playlist` with the four bugs fixed and one new
method:
[`Playlist.java`](https://goleador.github.io/CSC413/lectures/session-19-unit-testing/demo/Playlist.java).
Put it in the `Playlist` project you made in session 18, replacing the old
file. JUnit is already on its classpath.

Here is the specification, without the code:

> `static String formatLength(int seconds)` writes a length in seconds as
> minutes and seconds: 750 is `"12:30"`, 65 is `"1:05"`. It throws
> `IllegalArgumentException` for a negative length.

Which inputs should you test? Trying every `int` is impossible, and ten
random ones mostly test the same thing. Use two ideas.

**Equivalence partitions.** Split the inputs into groups that the
specification treats the same way. If the code works for one value in a
group, it very likely works for the rest. One test per group is the
minimum.

| Partition | Example | Expected |
|---|---|---|
| under a minute | 45 | `0:45` |
| whole minutes | 120 | `2:00` |
| minutes and seconds | 750 | `12:30` |
| seconds under 10 | 65 | `1:05` |
| negative | -5 | throws |

**Boundary values.** Most bugs live where one group meets the next, because
that's where `<` and `<=`, or `0` and `1`, get mixed up. Test both sides of
every boundary:

| Boundary | Test |
|---|---|
| negative / valid | `-1`, `0` |
| under a minute / a minute | `59`, `60` |
| one-digit / two-digit minutes | `599`, `600` |

**The usual edge cases.** Every specification has some of these, and they
are worth a check each time:

- zero, one, and many;
- the first and the last;
- empty (an empty list, an empty string);
- null, if a caller could pass it;
- invalid input: does it throw what the specification says?
- the largest value that should work.

The row people miss here is "seconds under 10". The specification shows it
in its own example, `1:05`, and a version that forgets the leading zero
returns `1:5`.

### The tests, one per case

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

**`assertThrows`** takes the exception class you expect and a lambda that
runs the code. The lambda delays the call, so JUnit can run it inside its
own `try` and check what comes out. The test fails if nothing is thrown, or
if something else is.

In class we ran these against a `formatLength` written with a bug for the
exercise:

```java
if (seconds <= 0) {
    throw new IllegalArgumentException("negative length: " + seconds);
}
```

Every test passed except one, at a boundary:

```
formatsZero » IllegalArgument negative length: 0
```

Two things to notice. Without a test of `0`, nothing would have caught it.
And it's reported as an **error**, not a **failure**: JUnit calls a test a
failure when an assertion is false, and an error when an unexpected
exception escapes. The message ("negative length: 0") is wrong too, which is
common at a boundary: the author never imagined that value reaching the
line.

### Your engine's tests do the same

The tests you were given were designed this way. A few names, from
`PieceMovementTest` and `MoveGeneratorTest`:

| Test | Which idea |
|---|---|
| "a knight in the centre reaches eight squares" / "a knight in the corner reaches only two squares" | partitions: centre and corner behave differently |
| "a pawn advances one square, or two from its starting rank" | a boundary: the starting rank |
| "a pawn reaching the last rank offers all four promotions" | the last |
| "an empty board has no moves for either side" | empty |
| "a side with no king is never in check" | an invalid state that must not crash |
| "asking for the legal moves leaves the board as it was" | something that must **not** change |

The last row is worth copying. Besides "returns the right thing", ask what
a method must leave alone, and test that too.

## 4. Three JUnit tools

All three come with `junit-jupiter`, which is already in your chess
project's `pom.xml` and in the `Playlist` project from session 18.

### `@ParameterizedTest`: one test, many rows

Seven boundary tests that differ only in their numbers are seven copies of
the same code. A parameterized test keeps the code once and the cases in a
table:

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

Each string in `@CsvSource` is one row; the comma splits it into the
method's parameters, and JUnit converts `"59"` to an `int` for you. Each row
runs and is reported on its own, so one bad row doesn't hide the others:

```
formatsMinutesAndSeconds(int, String)[1]  expected: <0:00> but was: <0:0>
formatsMinutesAndSeconds(int, String)[3]  expected: <1:00> but was: <1:0>
formatsMinutesAndSeconds(int, String)[4]  expected: <1:05> but was: <1:5>
formatsMinutesAndSeconds(int, String)[6]  expected: <10:00> but was: <10:0>
```

That's this test against a `formatLength` without the leading zero. Rows 2,
5, and 7 pass, because 59, 9:59, and 12:30 have two-digit seconds anyway.

Use it when the cases differ only in data. Keep separate tests when they
differ in what they check, like the negative input that must throw.

### `@BeforeEach`: a fresh start for every test

Tests of `next()` all need a playlist with a few songs in it. Build it in
one method that JUnit runs before **each** test:

```java
class PlaylistTest {

    private Playlist playlist;

    @BeforeEach
    void threeSongs() {
        playlist = new Playlist();
        playlist.load(List.of("One, 1:00", "Two, 2:00", "Three, 3:30"));
    }

    @Test
    void startsWithTheFirstSong() {
        assertEquals("One", playlist.next().title());
    }

    @Test
    void goesBackToTheFirstSongAfterTheLast() {
        playlist.next();
        playlist.next();
        playlist.next();
        assertEquals("One", playlist.next().title());
    }
}
```

JUnit makes a new `PlaylistTest` object for every test and runs
`@BeforeEach` on it, so each test gets a new `Playlist`. That's what makes
the tests independent: `goesBackToTheFirstSongAfterTheLast` moves through
all three songs, and `startsWithTheFirstSong` still sees a playlist that
hasn't started.

Share one playlist instead (a `static` field, loaded once with
`@BeforeAll`) and the suite breaks:

```
saysNothingIsPlayingBeforeTheFirstSong  expected: <nothing yet> but was: <Two>
startsWithTheFirstSong                  expected: <One> but was: <Two>
```

Run either test alone and it passes. A test that passes alone and fails in
the suite, or the reverse, is the sign of state shared between tests.
JUnit doesn't promise an order, so don't write tests that need one.

`goesBackToTheFirstSongAfterTheLast` is session 18's first bug, written down
so it can't return. Three songs is enough: the boundary is "after the last",
and the last of three is as good as the last of forty.

### The finished file

[`PlaylistTest.java`](https://goleador.github.io/CSC413/lectures/session-19-unit-testing/demo/PlaylistTest.java)
has all of the above: 12 tests, all green against the fixed `Playlist`.

## 5. Your turn: `totalMinutes`

```java
/** The length of the whole playlist, in minutes. */
double totalMinutes()
```

1. List the partitions before writing anything.
2. Write one test per partition in `PlaylistTest`.
3. Put session 18's bug back (`total / 60` instead of `total / 60.0`), run
   your tests, and check that at least one goes red. Then undo it.

If none went red, ask which partition the bug lives in.

## 6. Is this test any good?

A passing test can still check very little. All three of these pass against
the correct `formatLength`:

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

- **`a` computes the expected value with the code's own formula.** If the
  formula is wrong, the test is wrong the same way. This one also passes
  against the version without the leading zero, since 750 has two-digit
  seconds. Expected values come from the specification, worked out by hand.
- **`b` checks almost nothing.** Any string at all passes.
- **`c` tests two behaviours.** Against the `<= 0` version, the first line
  throws and the test stops; you never learn whether `-1` is handled. Split
  it, and the report tells you both.

**Checking tests an agent wrote.** M7 let a coding agent write test
scaffolding, and you'll meet generated tests again. Two checks, both from
this section:

1. **Break the code on purpose.** Change a `<` to `<=`, or remove a line. If
   no test goes red, the tests don't cover that line.
2. **Look at where each expected value came from.** A value copied from
   running the code only checks that the code does what it does today.

**Coverage.** In IntelliJ, right-click the test class and choose **Run
'PlaylistTest' with Coverage** (under **More Run/Debug** in recent
versions). Each line of `Playlist.java` gets a coloured
bar in the gutter: green if some test ran it, red if none did. Red lines
are untested. Green lines are only *run*: test `b` turns `formatLength`
green and checks nothing. Coverage shows what you missed, not that what you
covered is right.

## 7. When you can't work out the answer: oracles

For `formatLength` you worked out every expected value by hand. Some
questions have answers nobody can work out by hand: how many different
games of three moves each are there from the starting position?

A **test oracle** is any independent source of the right answer:

- a specification that states it;
- a slower, simpler version you trust, run on the same input;
- published results, checked by many people.

**Perft** ("performance test") is the oracle for chess move generators. It
counts every position reachable in exactly *n* moves (a move by either
side counts as one) from a starting position. The counts from the opening
position are published and agreed by every serious engine:

| Moves | Positions |
|---|---|
| 1 | 20 |
| 2 | 400 |
| 3 | 8,902 |
| 4 | 197,281 |

Depth 1 you already test: "the opening position has exactly twenty legal
moves". Depth 4 runs every rule you've written, check and pins included,
on almost two hundred thousand positions. If your count is off by one, some
rule is wrong somewhere. Splitting the count by the first move (how many
positions follow `e2e4`, how many follow `g1f3`) and comparing each part
with a trusted engine's split narrows it to one move, then one position.

M8 is a perft harness in JUnit. The handout has the details.

## Exercises

1. **Partitions for `parse`.** List the partitions and boundaries for
   `Playlist.parse`. Include lines it should reject. Which of your cases
   does session 18's `readsTwoDigitMinutes` already cover?
2. **Shared state.** Make `playlist` and `threeSongs` `static`, and change
   `@BeforeEach` to `@BeforeAll`. Run the whole class, then each failing
   test alone. Explain each failure message from the order the tests ran
   in.
3. **Make it parameterized.** Turn your `totalMinutes` tests into one
   `@ParameterizedTest`. What does the `@CsvSource` row look like for "an
   empty playlist"? Is the parameterized version clearer?
4. **Read a given test.** Pick one test in your engine's `MoveGeneratorTest`.
   Which partition or boundary is it testing? Name a case next to it that
   isn't tested.
5. **Coverage on your engine.** Run your chess tests with coverage. Find one
   red line in `model/` or `engine/`, and write a test that turns it green
   *and* would fail if that line were wrong.

## Exit question

> A method `parseRank(char c)` turns `'1'`…`'8'` into 0…7 and throws on
> anything else. List the inputs you'd test, grouped into partitions, and
> mark the boundaries.

## Related material

- [Session 4 notes](https://goleador.github.io/CSC413/guide.html?d=lectures/session-04-position/notes):
  reading tests as the specification.
- [Session 18 notes](https://goleador.github.io/CSC413/guide.html?d=lectures/session-18-debugging/notes):
  the `Playlist` bugs, and adding JUnit to a project.
- [JUnit 5 user guide](https://junit.org/junit5/docs/current/user-guide/):
  assertions, `@BeforeEach`, and parameterized tests.
- [IntelliJ: code coverage](https://www.jetbrains.com/help/idea/code-coverage.html).
- [Perft results on the Chess Programming Wiki](https://www.chessprogramming.org/Perft_Results).
