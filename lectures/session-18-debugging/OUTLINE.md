# Session 18 — Debugging: stack traces, the debugger, logging, reading code · outline for approval

**Monday November 9 · 75 min · Objective 7 (test, debug, document, maintain), catalog outcome "use debugging tools" · M6 due tonight · M7 opens today, due Mon Nov 16 · Week 12's only meeting (Veterans Day Wed Nov 11)**

Session 2 promised the debugger "properly in Week 12". Students have read
stack traces since M0b and were told in session 7 to read one bottom up.
They have never been taught a method, a breakpoint, or a logger.

One idea: *debugging is an experiment. Reproduce the failure, read the
evidence, form one guess, test the guess, then fix it and keep a test.*

What students should be able to do after class, on any project:

1. Read a stack trace: exception, message, frames, `Caused by`, and which
   frame to open first.
2. Use the IntelliJ debugger: line and conditional breakpoints, step
   over/into/out, the variables pane, evaluate expression, moving up the
   call stack.
3. Choose between a breakpoint, a log line, and a test, and replace
   `System.out` with a logger with levels.
4. Read code they did not write by following one action through it.
5. Apply all of this to a generated view in M7.

**What students have seen:**
- Stack traces in M0b, session 7 (bottom up), M3; the green run arrow and
  Cmd/Ctrl+click (session 2); `toString` for debuggers (session 5).
- Session 16: "never wait inside a click"; session 17: excerpts A–D,
  including `start` calling `runLoop`.
- M6: `BoardView`'s default `nextAction` throws on purpose, and the handout
  lists that message under Common problems.

**Not shown:**
- `GameController`, `MoveGenerator`, and `Game` bodies stay closed on
  screen (rule 2; M6 is due tonight). Every breakpoint in the engine section
  is in the view, the demo uses Step Over at `controller.handle(...)`, and
  frames from those classes are read but never clicked.
- No bug is planted in any milestone method.

## 1. Where we are, and the method (0–5 min)

- M6 tonight, M7 today. M7 means running code you did not write.
- The five steps, on one slide: reproduce, read the evidence, guess, test
  the guess, fix and keep a test.

## 2. Stack traces, on a small program (5–15 min)

A new 40-line `Playlist.java`, no chess, published with the notes. Songs,
`next()` that wraps around, `totalMinutes()`.

- The anatomy of one trace: exception type, message, frames, your line.
- Bottom up tells the story; top down names the failure.
- Helpful `NullPointerException` messages.
- `Caused by`: read the last one first.
- **Question slide:** a trace with library frames in it. Which line do you
  open first? *The first frame in your own package.*

## 3. Live: the debugger on `Playlist` (15–35 min) · students follow along

Rule 3's live work. Students download `Playlist.java` and do it with me.

- A wrong answer with no exception: `totalMinutes()` loses the half minute
  to integer division. A stack trace cannot help; a breakpoint can.
- Line breakpoint, Debug instead of Run, variables pane.
- Step over, step into, step out; evaluate expression.
- **Conditional breakpoint:** the bug appears only at song 37. Stepping
  would take 37 passes.
- Moving up the call stack to see who passed the bad value.
- Prediction before each step: what will this variable hold?
- Fix it, then write the test that would have caught it (next week's
  topic, seen once).

## 4. Logging (35–43 min)

- `System.out` has no off switch and no levels, and in the model it breaks
  session 16's rule.
- `java.util.logging`: JDK only, so no `pom.xml` change.

```java
private static final Logger LOG = Logger.getLogger(Playlist.class.getName());
LOG.fine(() -> "next: index=" + index);
LOG.warning("empty playlist");
```

- Levels; `fine` is off by default. **The trap:** setting the logger to
  `FINE` is not enough, because the console handler also stops at `INFO`.
  A four-line `logging.properties` and
  `-Djava.util.logging.config.file=` turns both on. (Verified on JDK 25.)
- **Question slide:** breakpoint, log, or test? A crash you can repeat; a
  bug only on a classmate's machine; a bug you fixed and never want back.

## 5. Reading and debugging a generated view (43–62 min) · live

The session-17 `run-1` view in the agent-demo repository, on a new branch
with one planted bug in the view.

- **Reading (5 min).** Follow one click: the mouse listener, `squareClicked`,
  `controller.handle`, `render`. Tools: Find Usages, Go to Implementation,
  Call Hierarchy. Read what the view does with the three questions.
- **Failure 1, a trace (4 min).** Excerpt C from session 17 run for real.
  Captured:

  ```
  Exception in thread "main" java.lang.UnsupportedOperationException: SwingView is event-driven, ...
      at ...view.BoardView.nextAction(BoardView.java:58)
      at ...view.GameController.runLoop(GameController.java:58)
      at ...view.SwingView.start(SwingView.java:8)
      at ...view.GameController.start(GameController.java:45)
  ```

  Which frame is the agent's mistake? Not the top one.
- **Failure 2, an exception in a click (3 min).** It prints on
  `AWT-EventQueue-0`, with 15 Swing frames under two of ours, and **the
  window keeps running**. Look at the console while you test a window.
- **Failure 3, wrong behaviour (7 min).** `7 - e.getY() / SQUARE` changed
  to `e.getY() / SQUARE`. The board draws correctly; clicking the e2 pawn
  says "That is not your piece." Which is wrong, the model or the view? A
  breakpoint in `squareClicked` shows `clicked` is e7; one frame up shows
  why.

## 6. M7 (62–72 min)

Session 17 explained how M7 works, so this is the handout only: what is new
since Wednesday, the debugging entry in `m7-submission.md`, the hand-made
change, pushing run branches, and naming your group.

## 7. Exit question (72–75 min)

> A weather app shows yesterday's forecast, with no exception. Name the
> first thing you would do, and whether you would reach for a breakpoint, a
> log line, or a test, and why.

## Active minutes

- Debugger follow-along, 20 (the rule-3 requirement).
- Live view debugging, 14.
- Question slides and predictions, about 8.
- Exit question, 3.

About 45 minutes.

## Deliverables after approval

- `demo/Playlist.java` and `demo/logging.properties`, compiled and run.
- A `debug-demo` branch for section 5, made from `run-1`, with the planted
  bug. The demo repository's working tree has uncommitted changes from
  Wednesday's live run; I won't touch them without asking.
- Traces on slides recaptured from the real window. The two above came from
  a headless stand-in with the same call path, so line numbers will change.
- `notes.md`, `slides.html`, `slides.md`, `notes-INSTRUCTOR-ONLY.md`.
- `guides/debugging-intellij.md`, listed as planned in `guides/README.md`,
  if time allows; otherwise the notes carry it.
- `weeks/week-12.html`, and the index row and milestone list linked.
- `./check-lectures.sh` passing.

## Decisions (Nov 8)

In person. Students follow along in IntelliJ. `GameController` method names
and line numbers may appear in traces. The two new M7 items stay.

## Revision 2 (Nov 8, as built)

- `Playlist.java` grew to about 90 lines, with four bugs that surface in
  order: wrap-around crash, `Caused by` from bad data, integer division,
  and a one-digit minutes parse.
- **The `runLoop` failure varies on a real window.** The headless stand-in
  always gave the clean trace. Twelve runs of the real window gave three
  outcomes (5 clean, 4 NPE on the event thread then clean, 3 NPE on `main`),
  because `main` and Swing's thread both call `game.status()` on one `Game`.
  Added a "twelve runs" slide, a notes section, and a Common Problems entry
  in the M7 handout.
- An exception in a click has about 21 Swing frames, not 15.
- The demo is a worktree, `~/Workspace/SFSU/CSC413-debug-demo`, with branches
  `debug-demo` and `debug-1-runloop`, `debug-2-click`, `debug-3-rank`.
- `guides/debugging-intellij.md` not written; the notes carry it.

## Revision 3 (Nov 8, after review)

Logging rebuilt so each idea follows from the last: why not `println`, levels,
one line that prints nothing, logger and handler, the properties file, VM options
versus program arguments, where the file goes, the working directory, where log
lines go (from the bugs already fixed), and `WARNING` on the second run's typo.
The lambda form is gone; students haven't been taught lambdas. Logging is now
14 minutes (35–49), the view section 49–67, and M7 67–72. Definitions added
where they first appear: thread, frame, breakpoint, `Caused by`, `SQUARE`.
