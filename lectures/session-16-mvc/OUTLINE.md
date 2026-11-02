# Session 16 — MVC · outline for approval (revision 5, Nov 2)

**Monday November 2 · 75 min · on Zoom, no breakouts · Objective 6 · M5 due tonight · M6 opens**

Revision 4 was a tour of the reference's view code: six `BoardView`
methods, who calls each one, `PlayerAction`, `sealed`, `runLoop` vs.
`handle`, Swing's event thread. A student could repeat our design without
being able to apply MVC to the next project. This revision teaches MVC as a
way of thinking first, on a small program students already know, and then
uses the chess engine as the worked example.

One idea: *ask three questions of every piece of code. Is it a rule? Is it
how it looks? Is it turning what the user did into a request? Model, view,
controller. Then keep the arrows pointing one way: the model knows nothing
about the other two.*

What students should be able to do after class, on any project:

1. Sort code into model, view, and controller with the three questions.
2. State the dependency rule and spot code that breaks it.
3. Check a design with three tests: the model runs with no UI, a new view
   changes nothing else, a rule changes in one place.
4. Recognize the same split in a web app and a GUI, and in input that
   arrives through a loop or through events.
5. Use 1–3 to check AI-generated view code (M7).

**What students have seen so far:**
- MVC by name and diagram (session 15 §10, which promised "MVC in full"
  today).
- Layers and separation of concerns (session 9 §4). Dependency inversion
  (session 10 §8).
- Their own `Main`, which plays hard-coded moves and prints the board
  (M1–M5). The given `TextBoardRenderer` and `PieceGlyphs`.

**Not shown:**
- No `GameController` bodies.
- No game-status, checkmate, or stalemate logic.
- No chess game loop. Showing one would be the M6 solution, which is why
  sections 1–5 use tic-tac-toe, which is not a milestone.

## 1. The problem (0–8 min)

- **Your `Main` can't play against a person.** The obvious fix is a loop in
  `Main`: read a line, check it, play it, print. Every rule, every message,
  and every prompt end up in one method.
- **The same thing, small: tic-tac-toe in one method** (about 20 lines).
  Draws the board, reads a square 1–9, checks it's free, places the mark,
  checks for three in a row, switches turns.
- **What goes wrong:**
  - The rules can't be tested without typing.
  - A second interface (nine buttons) means copying the rules.
  - Changing how the board looks means reading past the rules.

## 2. Three questions (8–20 min)

- **One question per role, asked of a single line of code:**
  - Is this a rule, or the state the rules work on? → **model**.
  - Is this what the user sees, or how they type or click? → **view**.
  - Does this take a request, run the rule, and tell the view? →
    **controller**.
- **Exercise in chat (5 min):** label eight lines M, V, or C. Reveal.
- **No line is the controller:** it is the order (request, rule, tell the
  view).
- **The mixed line:** `if (cells[square] != '.') println("That square is
  taken.")`. Split it: the model's `play` returns `Outcome.TAKEN`; the
  view's `report` decides the wording.
- **On screen, the split** (snippets on slides, no demo project):
  - `TicTacToe` (no I/O);
  - a `TicTacToeView` interface (`show`, `report`, `start`) and
    `ConsoleTicTacToeView`;
  - `TicTacToeController` with one method, `play(square)`.
  - No game loop or game-over handling in the controller, so it doesn't
    preview M6's `GameController`.

## 3. The dependency rule (20–27 min)

- **The arrows:**
  - The model depends on nothing.
  - The view reads the model and never changes it.
  - The controller changes the model and tells the view, through an
    interface (session 10's dependency inversion).
  - A class diagram of the tic-tac-toe split.
- **Why one direction:** the model is the part you most want to reuse and
  test, so it must not know which UI is in front of it.
- **Question slide:** four snippets.
  - The model printing "X wins!";
  - the view calling `game.play`;
  - the controller holding `ConsoleTicTacToeView`;
  - the view reading `game.cell(4)` (fine).

## 4. Three tests (27–35 min)

Shown on slides; the live coding is on the chess engine in section 7.

1. **The model runs with no UI.** A JUnit test: X wins on the top row.
2. **A new view changes nothing else.** A grid view with lines; prediction
   in chat: *which files change?* The new view and one line in `Main`.
3. **A rule changes in one place.** O moves first: one line in the model.

## 5. Input arrives two ways (40–45 min)

- **A loop asks:** a console waits for a line, then the controller handles
  it. Fine, because a terminal has nothing else to do while it waits.
- **Events tell:**
  - A button click or a web request calls your code.
  - The controller offers one method per user action, and the UI calls it.
  - Never wait for input inside an event: the window or the server stops
    responding.
- **The same controller serves both:** the console loop and nine buttons
  both call `controller.play(square)`.
- No Swing internals; "the event thread" is named once.

## 6. The same shape elsewhere (45–50 min)

- **A web app**, described generically (not every student took CSC 317):
  - the code that handles each request = controller;
  - the page sent back = view;
  - data and rules = model;
  - each request is an event.
- **Original MVC** (Smalltalk, session 15): the model notifies its views
  when it changes (Observer). Ours: the controller tells the view to redraw.
  Both keep the model ignorant of the view.
- **Names you'll meet:** MVP, MVVM. Same goal, different wiring. One slide,
  names only.
- **When it's overkill:** a 30-line script with one interface and no tests.

## 7. Chess as the worked example (50–65 min)

- **The roles in our engine:**
  - model = `Game` and everything behind it (M1–M5);
  - view = the `BoardView` interface and its implementations;
  - controller = `GameController` (M6).
  - One slide each, no method tables.
- **`BoardView`, once:**
  - `render(Game)`, `showMessage(String)`, `start(GameController)`;
  - a sentence on the defaults, which match section 5: a console answers
    `nextAction`, a window doesn't.
- **`PlayerAction`:** the request type, so a typed `undo` and a clicked Undo
  button are the same request. `sealed` gets one sentence; the M6 handout
  explains it.
- **The three questions on chess:**
  - highlighting a piece's legal squares from `game.legalMoves()` is view;
    working out knight moves in the view is a rule;
  - "Checkmate": who decides, who shows.
- **Live:**
  - `ConsoleView`, then `EmojiView`.
  - `CompactView` written live, with `git diff --stat` showing the new
    class and two lines in `Main`. This is test 2 again, on the real
    engine.
  - Run the reference's Swing view (running only, no code).

## 8. Applying it with AI, M6 and M7 (65–72 min)

- **Checking a generated view with the rules, not our method names:**
  - Does it call `game.play`, or compute a rule?
  - Does the diff touch anything but new view files and `Main`?
  - Does it wait for input inside a click?
- **M6:** checkmate and stalemate in the model; the controller by hand
  against the given `BoardView` and `PlayerAction`.
- **M7:** a Swing view and one other, generated with AI; groups of 1–3
  compare. Wednesday covers details.
- **The rename:** session 12's read-only interface is now `ReadOnlyBoard`.

## 9. Exit question (72–75 min)

> A weather app shows today's forecast on the command line and on a web
> page. Name one class each for model, view, and controller, and say which
> one must not know about the others.

## Active minutes

- Classify exercise, 5.
- Dependency question slide, 2.
- Test 2 prediction, 1.
- Chess placement questions, 2.
- `CompactView` predictions, 3.
- Exit question, 3.

About 19 minutes.

## What changes from revision 4

- **New:**
  - sections 1–6 on tic-tac-toe;
  - the dependency question slide;
  - the three tests;
  - the web/Observer slide;
  - a transfer exit question.
- **Cut from the deck:**
  - the "who calls each method" and "which methods each view writes"
    tables;
  - the three `sealed` slides (to the M6 handout);
  - the two-button event-thread demo;
  - the separate typed/clicked sequence diagrams (one remains, optional);
  - the slide showing the AI `start` that calls `runLoop()`, folded into
    section 8's checklist.
- **Kept:**
  - the console transcript;
  - `Destinations` (the legal-squares example);
  - the castling question;
  - `CompactView` live;
  - Swing run;
  - the rename slide.

## Deliverables after approval

- Tic-tac-toe as slide snippets only (no demo project), compile-checked.
- `notes.md`, `slides.html`, `slides.md` rebuilt, about 32 slides.
- `notes-INSTRUCTOR-ONLY.md` with:
  - classify answers;
  - the demo checklist;
  - timing.

## Decisions

- **No breakouts.** Active work is chat answers and live coding with
  predictions (Nov 1).
- **M6 gives** `BoardView`, `PlayerAction`, `ConsoleView`, and `EmojiView`;
  students write the controller and game status by hand (Nov 1).
- **The goal for the project is M7:** students generate the graphical view
  with AI. Sections 2–5 are what they check it against (Nov 1).
- **Swing in class:** run the reference Swing view live; its code is not
  shown (Nov 1).
- **Fundamentals before the reference** (Nov 2): the transferable ideas come
  first, on a non-chess program; chess is the worked example.

## Resolved (Nov 2)

1. Session 15's "M9" references now say M6 (controller, `BoardView`) and
   M6–M7 (MVC). Future sessions use the new numbering.
2. The web example is generic: request → handler → page. No Express.

## As built

- The small example changed twice on Nov 2: turnstile, then vending
  machine, then tic-tac-toe (Rodrigo's choice). Tic-tac-toe lives on the
  slides only: no demo project, no live coding on it.
- 39 slides.
