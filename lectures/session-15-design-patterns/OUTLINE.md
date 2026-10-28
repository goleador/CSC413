# Session 15 — Design Patterns · outline for approval (revision 2, Oct 27)

**Wednesday October 28 · 75 min · Objective 5 · M5 due Mon Nov 2**

Revision 1 taught Command and State only, on a position editor. This revision
steps back: what a design pattern is, where the idea came from, the catalog,
where patterns sit in our architecture map, and then seven patterns in some
depth. The editor code from revision 1 stays, as the worked code for Command
and State.

One idea: *a pattern is a named, proven answer to a recurring design
problem; the name is the useful part, because it lets two programmers agree
on a design in one word.*

**Not shown:** any milestone method body (M3 `apply`/`undo`/`play`/
`undoLastMove`; M5 anything; any game-status computation; M9 controller,
`BoardView`, `PlayerAction` code). Signatures, the map, and given files
(`PieceFactory`, `BoardFactory`, `PieceGlyphs`, `TextBoardRenderer`) are fine.

## Hook (0–3 min)

Open the architecture map with the Patterns lens. You have already written
or used five patterns: Template Method (`Piece.attacks` over the abstract
`pseudoLegalMoves`), Factory (`PieceFactory`), Strategy (`PieceGlyphs`),
Command (`Move`), Facade (`Game`). Nobody called them that at the time.

## What a design pattern is (3–11 min)

- **Origin.** Christopher Alexander, *A Pattern Language* (1977): 253
  patterns for towns and buildings, each a problem, its context, and a
  solution "you can use a million times over without doing it the same way
  twice." Kent Beck and Ward Cunningham applied the idea to software at
  OOPSLA 1987.
- **The book.** Gamma, Helm, Johnson, Vlissides, *Design Patterns: Elements
  of Reusable Object-Oriented Software* (Addison-Wesley, 1994), the "Gang of
  Four" (GoF): 23 patterns in three groups. Link:
  <https://www.amazon.com/dp/0201633612>. Friendlier companions: *Head First
  Design Patterns*, 2nd ed. (Freeman and Robson, 2020)
  <https://www.amazon.com/dp/149207800X>, and the free site
  <https://refactoring.guru/design-patterns>.
- **Four parts of every pattern** (GoF): a name, the problem, the solution
  (a shape of classes, not code to paste), the consequences.
- **How they are used in practice.** As vocabulary in design discussions
  and code review ("make the glyphs a strategy"); in class names
  (`PieceFactory`, `BoardView`); and inside the libraries you already use:
  `Iterator` in every for-each loop, decorators in `java.io`
  (`new BufferedReader(new InputStreamReader(System.in))`), `Runnable` as a
  command, `List.of` as a static factory.
- **Caution.** A pattern is a means. Applying one where the problem is
  absent adds classes and indirection; the session 10 SOLID warnings apply.

## The catalog (11–15 min)

- One table: the 23 GoF patterns in their three groups, **creational**
  (how objects are made), **structural** (how objects are put together),
  **behavioral** (how objects share work). The ones in this course are
  highlighted. MVC is listed separately: it predates the book (Smalltalk-80,
  Trygve Reenskaug, 1979) and is an architectural pattern, built from
  Observer, Strategy, and Composite.
- **In our project, as you build it:** a table keyed to the architecture
  map.

| Pattern | In the engine | Milestone |
|---|---|---|
| Template Method | `Piece.attacks` over `pseudoLegalMoves` | M2 |
| Factory (static) | `PieceFactory`, `BoardFactory`, `Move.quiet` | M2 |
| Strategy | `PieceGlyphs` in `TextBoardRenderer` | M1 (given) |
| Command | `Move`, applied by `Board`, kept by `Game` | M3 |
| Facade | `Game` in front of `Board`, `MoveGenerator`, factories | M3–M4 |
| State | game status; the position editor | later / this session |
| MVC | engine ⟂ view ⟂ controller | M9 |
| Observer | absent by design; where it would go | M9 (discussion) |
| Decorator, Factory Method | not in the engine; where each would go | this session |

## Deep dives (15–60 min)

Same four beats for each: **the problem**, **the pattern** (one class
diagram), **where it is in our engine** (or would be), **when not to**.

1. **Factories, 6 min.** Problem: callers that say `new Rook(color)`
   depend on every concrete piece class, and data (a FEN letter) has to
   become objects somewhere. `PieceFactory.create(type, color)` and
   `fromSymbol`, `BoardFactory.fromFen`: shown in full, they are given code.
   Static factory methods on `Move` (`quiet`, `capture`, `promotion`):
   signatures only, they name the intent. Note: "simple factory" and
   "static factory method" are idioms, not GoF patterns.
2. **Factory Method, 5 min.** The GoF pattern with the confusing name: a
   superclass method that subclasses override to choose what gets created.
   Not in the engine. Example on given code: an abstract `BoardPrinter`
   with `abstract PieceGlyphs glyphs()`, subclasses `LetterPrinter` and
   `FigurePrinter`. Then the comparison: our `TextBoardRenderer` takes its
   `PieceGlyphs` through the constructor instead, which is Strategy.
   Inheritance versus composition, as in session 6.
3. **Facade, 5 min.** Problem: a subsystem with many parts that the
   outside should not have to know. `Game` is the one door into the engine;
   its public methods (signatures only) against what stands behind it. The
   rule from `Game`'s javadoc: the view never applies a move to a `Board`.
   When not to: a facade that grows every method of everything behind it is
   a god class.
4. **Command, 8 min.** Revision 1's material, condensed: `Edit`, the four
   roles with the engine column, the `execute(Board)` question,
   `EditHistory` with redo, the redo bug trace. Code from `demo/command/`.
5. **State, 8 min.** The editor's three modes, the `switch` version and its
   six-place change, the refactor to `Mode` classes, `WhiteToMove` as the
   counterexample, the three-options table. Code from `demo/switch/` and
   `demo/state/`, shown, not typed.
6. **Decorator, 5 min + type-along.** Problem: adding to an object's
   behavior without subclassing every combination. `java.io` as the
   classic case. Ours: `PieceGlyphs colored(PieceGlyphs inner)` wraps any
   glyph set in ANSI colour codes, so `colored(LETTERS)` and
   `colored(FIGURES)` both work with no new subclass. Decorator versus
   Strategy: a decorator implements the interface it wraps.
7. **MVC, 5 min.** Overview only: the three roles on the architecture map,
   what is model in the engine you have (`Game` and everything behind it),
   what is view (`TextBoardRenderer`, `PieceGlyphs`), and that the
   controller is M9. No `GameController`, `BoardView`, or `PlayerAction`
   code. Monday's session is the full treatment.

## Active work (15 min, inside the deep dives)

- **Type-along, Decorator (7 min):** write `colored` as a static method
  returning a lambda, run it with both glyph sets on a scratch branch.
- **Pairs, pattern hunt (8 min, after the catalog or at minute 60):** open
  the architecture map with the lens off and your own repository. For four
  given classes, name the pattern and the one line of code that shows it.
  Answers on the map's lens.

## Close (72–75 min)

Exit card:

> Name one pattern you have already written in this engine, the class it
> is in, and the problem it solves. Then name one pattern from today that
> would be the wrong choice for whose turn it is, and why.

## Deliverables after approval

Rewrite `notes.md`, `slides.md`, `slides.html` around this outline (about
35 slides), keeping the Command and State sections and their code. Add
`demo/decorator/` and `demo/factory-method/`, compiled against the
reference. New diagrams: the catalog table, Factory, Factory Method versus
Strategy, Facade, Decorator, MVC roles. Update `notes-INSTRUCTOR-ONLY.md`,
the week 10 page title ("Design patterns"), and the index line.

## What this session does not do

- No milestone bodies, and no M9 view or controller code.
- The other 16 GoF patterns get one line each in the catalog, no more.
- No Singleton beyond one sentence on why `MoveGenerator` is a static
  utility instead.

## Open questions for you

1. **MVC depth.** Monday (week 11) is the MVC lecture and M9 is its
   milestone. I recommend the 5-minute overview here and the deep dive
   Monday. A full deep dive here means moving Monday's material forward
   and showing parts of M9's design early.
2. **Time.** Seven patterns plus the introduction in 75 minutes leaves
   5–8 minutes per pattern, and the 32 minutes of editor type-along from
   revision 1 drops to 7 (Decorator). The alternative is to split: the
   introduction, catalog, Factories, Factory Method, Facade, and Decorator
   on Wednesday; Command, State, and MVC on Monday.
3. **Amazon links.** The ISBN links above are from memory and not checked
   in a browser; I will verify them before publishing.

---

## Decisions (Oct 27)

- **Examples:** engine code where the pattern is in the engine (Factories,
  Facade, Command, MVC); a classic example otherwise. Factory Method uses
  the `Dialog`/`Button` example and `Collection.iterator()`; State uses
  the turnstile; Decorator uses the coffee shop and `java.io`. The
  position editor from revision 1 is dropped.
- **One session.** MVC is the overview; Monday is the full treatment.
- **Active work:** the Decorator type-along becomes "write `Mocha` and
  `Whip`" (7 min), plus the pattern hunt (8 min).
- **Links checked:** ISBN 0201633612 is the GoF book (Addison-Wesley,
  1994); 149207800X is *Head First Design Patterns*, 2nd ed. (O'Reilly,
  2020).
- The session directory is now `session-15-design-patterns`.
