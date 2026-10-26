# Session 14 — UML: Class and Sequence Diagrams · outline for approval

**Monday October 26 · 75 min · Objectives 3, 9 · M5 opens (due Mon Nov 2)**

The first meeting since the midterm, and the UML session that the October 14
cancellation pushed back. One idea: *a diagram is a claim about the code, and
it is checked against the code like any other claim.* Two kinds of diagram are
taught properly, class and sequence. Two are shown once each, package and
state; state sets up Wednesday's State pattern. Every diagram is of code the
students already have: `model` (M1–M2), `Game` (M3), `MoveGenerator` as of M4,
the four packages (session 9), and `BoardView` (session 12, optional). Notation
is Mermaid, because M5 asks for Mermaid and because text in the repository
gets diffed with the code.

**Not drawn in class:** anything M5 adds. No `isAttacked`, no `isInCheck`, no
filter. The engine half of the class diagram and the `legalMoves()` sequence
diagram after M5 are the M5 deliverable.

## Hook (0–5 min)

The M4 handout spent four paragraphs saying where `MoveGenerator` sits:
static, no fields, `Game` calls it, `Main` cannot reach `pseudoLegalMoves`.
Show the same facts as one class diagram with three boxes. Ask: what does the
picture say faster, and what can it not say at all? (It cannot say why.)

## What UML is, and how much of it we use (5–10 min)

A standard notation, fourteen diagram kinds; working programmers use about
two. Sketch versus blueprint: we sketch, to explain or check a design, not to
generate code. A diagram that disagrees with the code is wrong, and the code
wins.

## Class diagrams (10–30 min)

1. **The box.** Name, fields, methods. Visibility: `+` public, `-` private,
   `#` protected, `~` package. `~pseudoLegalMoves` is the one package-private
   method they have written. Abstract in italics (`Piece`), `<<interface>>`
   (`BoardView`, if they have it), static underlined (`MoveGenerator`). (5 min)
2. **Five arrows, weakest to strongest.** Dependency (`MoveGenerator ..>
   Board`: uses it as a parameter, keeps nothing); association (`Move -->
   Position`: holds a reference); aggregation versus composition (`Game *--
   Board`: `Game` creates it and nothing outlives it); inheritance (`Piece <|--
   Rook`); realization (`BoardView <|.. Board`). The question each arrow
   answers: if the class at the far end changes, does this one have to? (10
   min)
3. **Question slides, one arrow each.** `Game`–`Board`, `Game`–`MoveGenerator`,
   `Move`–`Piece`, `TextBoardRenderer`–`Board`. Reveal the arrow and one plain
   sentence why. (5 min)

## Active: the `model` package, in pairs (30–45 min)

Pairs draw `model` in [mermaid.live](https://mermaid.live), or on paper:
`Position`, `Color`, `PieceType`, `Piece` and its six subclasses, `Move`,
`Board`. Twelve minutes. Then the instructor types it on the projector from
what the pairs call out, and the room checks each arrow against the source
(`Move`'s five components, `Board`'s methods). Students keep the result; it
is half of the M5 class diagram, and the `engine` half is theirs to add.

Pitfall to show when it comes up: Mermaid writes generics as `List~Move~`, and
`~` at the start of a member means package-private.

## Sequence diagrams (45–62 min)

1. **The parts.** Lifelines, activation bars, synchronous calls, returns. The
   `loop`, `alt`, and `opt` fragments. (4 min)
2. **Worked: `game.play(move)`, from M3.** Caller → `Game`: is it in
   `legalMoves()`? `alt` not legal: throw. Otherwise `board.apply`,
   `history.add`, flip the side to move. Every step is in the M3 handout and
   the session 12 notes. (5 min)
3. **Pairs: `game.legalMoves()` as of M4.** `Game` → `MoveGenerator.legalMoves`
   → `pseudoLegalMoves` → `loop` over `board.positionsOf(color)` →
   `board.pieceAt`, `piece.pseudoLegalMoves`. Eight minutes, then compare with
   the projector version. Close by stating that M5 changes this diagram, and
   drawing the new one is part of M5. (8 min)

## Two more, once each (62–68 min)

- **Package diagram** of `model`, `engine`, `factory`, `view`, with the
  dependency arrows from session 9. Arrows into `model` only; nothing points
  at `view`.
- **State diagram** of a game's turn: *white to move* and *black to move*,
  with `play` and `undoLastMove` as transitions. Wednesday asks what to do
  when a class's behavior depends on a state like this.

## Close (68–75 min)

Diagrams go stale when the code moves on and the drawing does not. Keeping
them as Mermaid text in `docs/design.md` means a stale diagram shows up in the
same diff as the change that made it stale. What M5's diagrams ask for, in two
sentences. Exit card:

> Draw the arrow between `Game` and `Board`, and the arrow between
> `MoveGenerator` and `Board`. In one sentence, say why they are different
> arrows.

## Deliverables after approval

`notes.md`, `slides.md`, `slides.html` (+ `slides.css` if needed),
`notes-INSTRUCTOR-ONLY.md` with the full `model` diagram and the two sequence
diagrams as Mermaid source, checked against the starter's `m4` tag and
rendered in mermaid.live. Week 10 page links the deck and notes.

## What this session does not do

- No M5 code or M5 diagrams: no `kingPosition`, `isAttacked`, `isInCheck`, or
  filter, on a slide or in notes.
- No component or deployment diagrams beyond the package sketch; no
  activity, use-case, or timing diagrams.
- No code generation from diagrams or diagrams generated from code. IntelliJ
  can draw one; the point is to draw it yourself and check it.

---

## Appendix: midterm recap · outline for approval (added Oct 25)

Source: Canvas *Student Analysis Report* for the midterm, exported Oct 21
12:48, 28 submissions, hand-graded essays, Q16, and the Q6 half points
already in. Only aggregates go on a slide; no names, no individual answers.

### A1. The numbers (1 slide)

| Mean | Median | Min | Max | SD |
|---|---|---|---|---|
| 69.6 | 70.8 | 27.1 | 96.5 | 18.8 |

Bands: 90+ 7 · 80–89 1 · 70–79 6 · 60–69 7 · 50–59 3 · below 50 4.
Drawn as a small bar chart (inline SVG, same style as the diagrams).

### A2. Top 5 (1 slide, one line each)

Ranked by percent of points earned, class-wide.

| Q | Topic | Avg | One line on what the class got right |
|---|---|---|---|
| 3 | Equality in collections | 93% | `contains` and `get` use `equals`; same object found, a copy not |
| 1 | Value, identity, closed set | 85% | record, class, enum |
| 8 | Encapsulation | 85% | `List.copyOf`; 8 of 28 thought `setTotalCents(0)` keeps the invariant |
| 4 | Collections | 83% | interface type; 10 of 28 counted the duplicate `Point` in the set |
| 15 | Polymorphism | 82% | dispatch; 8 of 28 picked `woof` for the `Puppy` |

### A3. Bottom 5: mini review (one slide each, ~2 min each)

Each slide: the question in one line, what most answers did, the answer.

1. **Q12 Dependencies, 44%** (9 zeros). Injection vs inversion. Show
   `OrderService` with an `OrderRepository` interface passed in through the
   constructor. Injection is a technique, inversion is a principle; injecting
   `MySqlOrderDatabase` is injection without inversion. HTML is a leaked
   presentation concern. Ties forward to M4's `MoveGenerator` design and to
   today's dependency arrow.
2. **Q9 Composition or inheritance, 50%** (1 full score). `Stack extends
   ArrayList`: `add(0, x)` breaks LIFO. Composition: a private `List` field,
   `push`/`pop` delegate, nothing else reachable. Show the 6-line class. Ties
   to today: inheritance arrow vs association arrow.
3. **Q16 Archer, 54%.** 12 of 28 wrote no constructor; only 8 wrote
   `super(color, PieceType.ARCHER)`. 15 had all four jump offsets right; 14
   called `steppingMoves`. Show the 12-line reference `Archer`.
4. **Q13 Smells, 55%** (1 full score). Strings for a closed set → enum;
   the `if` chain → a multiplier on the enum constant, `MANAGER(1.2)`;
   print inside a calculation; names `calc`, `l`, `t`. Show the enum.
5. **Q7 Exceptions, 73%.** The miss is blank 4: 11 of 28 said catching
   `IllegalArgumentException` compiles. Catching the wrong exception leaves
   the checked one undeclared. One slide, no code beyond the question's.

### A4. Notes

A short "Appendix: midterm recap" at the end of `notes.md` with the table,
the top and bottom five, and the five answers. Exam questions are quoted
only as far as each review needs.

### Not in the appendix

- No per-student data, no score for any individual (min and max are shown
  unlabelled).
- No regrade discussion; that goes to office hours.

### Time (decided Oct 25)

The recap opens class, minutes 0–15. The slides stay in the deck as an
appendix after the last UML slide, and the speaker notes on the title slide
say to start there. To make room: the model pair work goes from 12 to 8
minutes, and the package and state slides move to the notes only. The
reference `Archer` is shown in full.
