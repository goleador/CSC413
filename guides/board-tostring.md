# Addendum: `Board.toString()`

**Week 5 addendum to session 5 §4 and M1 step 4.** The M1 handout asked for
this method and the tests pin its format, but the lecture gave it one slide
and never showed the inner loop. This note is what that slide should have
been. If your `Board.toString()` is empty, or `emptyBoardToStringIsEightEights`
is red, start here.

---

## What it is for

`toString()` is a **one-line dump of the position** for debuggers and test
failure messages. When `BoardTest` fails, this is the string it shows you.
When you hover over a `Board` in IntelliJ's debugger, this is what you see.

It is **not** how the game is drawn. Drawing has rank numbers down the side,
a file legend, a choice of `.` or `·` for empty, and an opinion about which
end of the board is at the top. Those are display decisions, and they live
in `TextBoardRenderer`, in the `view` package. `Main` prints the board with
the renderer, never with `System.out.println(board)`.

---

## The format: FEN placement

The output is the placement field of FEN, the notation every chess program
uses to write down a position:

```
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
```

Read it left to right:

- **Rank 8 first**, then a `/`, then rank 7, down to rank 1. No `/` after
  rank 1.
- Within a rank, **file a to h**.
- A piece is its **`symbol()`**: uppercase for white, lowercase for black.
- Empty squares are **not written one by one**. A *run* of empty squares
  becomes one digit, its length. `8` is a whole empty rank; `4k3` is four
  empties, a black king, three empties.

The two strings the tests check:

| Position | `toString()` |
|---|---|
| empty board | `8/8/8/8/8/8/8/8` |
| black king e8, black pawn c7, white rook a1, white king e1 | `4k3/2p5/8/8/8/8/8/R3K3` |

Work the second one by hand once. Rank 8 has a king on e8, the fifth file:
four empties, `k`, three empties. Rank 7 has a pawn on c7: two empties, `p`,
five empties. Ranks 6 to 2 are empty. Rank 1: rook on a1, three empties, king
on e1, three empties.

---

## The method

Two loops and a counter. The outer loop counts **down**, because rank 8 comes
first; it is the only descending loop in `Board`. The inner loop walks the
files. The counter holds the length of the current run of empties and is
written out, as a digit, the moment the run ends: when a piece is reached,
or when the rank is.

```java
@Override
public String toString() {
    StringBuilder text = new StringBuilder();
    for (int rank = Position.BOARD_SIZE - 1; rank >= 0; rank--) {   // 8 down to 1
        int emptyRun = 0;
        for (int file = 0; file < Position.BOARD_SIZE; file++) {    // a to h
            Piece piece = squares[file][rank];
            if (piece == null) {
                emptyRun++;                 // extend the run; write nothing yet
                continue;
            }
            if (emptyRun > 0) {
                text.append(emptyRun);      // the run ended: one digit
                emptyRun = 0;
            }
            text.append(piece.symbol());
        }
        if (emptyRun > 0) {
            text.append(emptyRun);          // a run that reaches the h-file
        }
        if (rank > 0) {
            text.append('/');               // between ranks, not after the last
        }
    }
    return text.toString();
}
```

Three things to notice:

1. **`null` is what empty is.** The null check comes first, before anything
   asks the piece for its symbol. Thirty-two squares are empty at the start.
2. **The digit is written when the run ends, not while it grows.** That is
   why `emptyRun` is flushed in two places: before a piece, and at the end
   of the rank. Forget the second and `8/8/8/8/8/8/8/8` comes out as
   `///////`.
3. **`squares[file][rank]`**, the same order as `pieceAt` and `place`. If
   your array is indexed `[rank][file]`, swap the subscripts here; do not
   change the loops.

`StringBuilder.append(int)` writes the number as decimal digits, so
`append(emptyRun)` is exactly the digit you want. No conversion needed.

---

## What the failures mean

| Test says | Cause |
|---|---|
| `missing return statement` (compile error) | the method body is empty; nothing runs until it returns a `String` |
| expected `8/8/8/8/8/8/8/8` but was `11111111/...` | a digit per empty square instead of per run |
| expected `8/8/8/8/8/8/8/8` but was `///////` or `/8/8...` | the run at the end of a rank was never written, or the `/` is on the wrong side of the `if` |
| ends with `/` | `/` appended after rank 1 as well; the guard is `rank > 0` |
| `4k3/2p5/...` comes out as `R3K3/8/.../4k3` | the outer loop counts up; rank 8 goes first |
| `4k3` comes out as `3k4` or the ranks look mirrored | `[file][rank]` swapped in the array access, or `place` and `pieceAt` disagree with each other |
| `NullPointerException` | `piece.symbol()` called before the null check |
| `ArrayIndexOutOfBoundsException: 8` | `<=` where the loop needs `<` |

---

## Why this is worth getting right

Every position in the rest of the course can be written as one of these
strings. `BoardFactory.fromFen` (given in M2) reads them back, so a test can
build any position in one line, and the M3 `GameTest` does exactly that. M7
makes the full FEN round trip the milestone. The method you are writing now
is the half of that conversation the board speaks.
