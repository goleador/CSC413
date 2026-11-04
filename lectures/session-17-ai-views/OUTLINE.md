# Session 17 — Generating code with a coding agent · outline for approval (revision 2, Nov 3)

**Wednesday November 4 · 75 min · on Zoom, no breakouts · Objectives 6, 7, 8 · M6 due Mon Nov 9 · M7 opens Mon Nov 9**

Monday taught MVC as three questions, a dependency rule, and three tests.
Today applies them to code you did not write. A coding agent can write a
Swing view for your engine in a few minutes. What it cannot do is decide
whether that view belongs in your program. Deciding that is your job, and
it is the same job on any project that takes generated code, a library, or
a teammate's pull request.

One idea: *tell the agent what to do and what not to do, in writing; check
what it did with checks you can run; keep only what you can explain.*

What students should be able to do after class, on any project:

1. Write instructions for a coding agent: the goal, the files it may
   create, the files it must not change, the rules, and how it checks its
   own work.
2. Check an agent's work: tests, `git diff --stat`, a search for forbidden
   calls, and reading it against the rules.
3. Compare runs fairly: one branch and one fresh session per run, one
   change between runs.
4. Explain every line they keep (the syllabus rule).
5. Know how M7 works: what is generated, what is not, groups, and what is
   handed in.

**What students have seen:**
- Session 16: the three questions, the dependency rule, the three tests,
  input by loop vs events, "never wait inside a click", and the four checks
  for an AI-generated view (§8).
- The reference's Swing view, run but not opened.
- M6: the given `BoardView`, `PlayerAction`, `ConsoleView`; their own
  `GameController`.

**Not shown:**
- No tic-tac-toe generation. Tic-tac-toe was Monday's example only.
- No Swing view generated in class. Swing is the part of M7 each student
  generates and compares.
- `GameController` stays closed on screen: M6 is due Monday.

## 1. Where we are (0–5 min)

- Monday's split and Monday's three tests, one slide each.
- M6 due Monday; M7 opens Monday.

## 2. Chat or coding agent (5–12 min)

- **A chat** sees only what you paste. You copy code in and out; you run
  the build.
- **A coding agent** runs on your machine, in your repository. It reads
  the files, edits them, runs `./mvnw test`, and reads the result.
- Use whichever you have access to: Codex (OpenAI), Claude Code, GitHub
  Copilot's agent mode, Gemini CLI, and others. Most have a free tier or a
  student plan.
- **The goal in M7 is a coding agent.** A chat is allowed; the checks are
  the same either way.
- Because an agent can change any file, what it must not do matters as
  much as what it should.

## 3. Instructions: what to do and what not to do (12–22 min)

- **A wish:** "Add a GUI to my chess game." Run before class; show the
  diff: it edits `Game`, adds a method to `BoardView`, and changes
  `GameController`. Every one breaks a rule from Monday.
- **Chat exercise (4 min):** what would you tell the agent? Collect
  answers.
- **Instructions, on one slide:**
  - **Do:** the goal; the interface to implement (`BoardView`); the
    package for new files (`view/`); the one line it may add to `Main`.
  - **Don't:** change anything in `model/`, `engine/`, `factory/`; change
    `BoardView`, `PlayerAction`, or `GameController`; work out a rule in
    the view; wait for input inside a click.
  - **Check:** `./mvnw test` green; `git diff --stat` shows only new view
    files and `Main`.
  - **Stop:** if it thinks a forbidden file must change, stop and say why
    instead of changing it.
- **Put them in a file in the repository** (`AGENTS.md`; some agents read
  `CLAUDE.md` or `.github/copilot-instructions.md`). Every session starts
  from the same rules. Why this transfers: teams do the same for any agent
  working in their codebase.

## 4. Live: an agent adds a view (22–40 min)

- On the instructor's copy of the engine at M6, with the instructions file
  from section 3.
- **The task:** a text view, not Swing. For example, a console view that
  draws the board from the side to move with a border. See open
  question 1.
- **Prediction in chat** before running: which rule will it break?
- Run the agent; watch it read, edit, and run the tests.
- Then the checks, live:
  - `git diff --stat`;
  - search the new view for `game.play(`;
  - read the new class with the three questions;
  - run it and play a few moves.
- Fix one thing, by asking the agent again or by hand, and say which and
  why.
- This section is the live coding (18 min).

## 5. Reviewing what an agent wrote (40–48 min)

- **Question slide:** four short excerpts from a chess view, written for
  the deck, each with one problem. Not a working view.
  - a click handler that calls `game.play(move)`;
  - a highlight that works out knight moves itself;
  - a `start` that calls `controller.runLoop()`;
  - a `render` that reads `game.legalMoves()` (fine).
- Chat: which break a rule, and which rule?
- The check that would catch each one without reading: the search, the
  diff, the frozen window.

## 6. Comparing runs (48–56 min)

- Two runs of the same task from section 4, made before class: one branch
  each, a fresh session each, one change between them (the model, or one
  line of the instructions).
- Side by side: what differs, which fits the interface better, which is
  easier to read. Chat: which would you keep?
- **Keeping runs apart:** each run on its own branch
  (`git switch -c m7-run-2 main`), started in a new session, so nothing
  from the last run leaks into the next. The instructions file is the only
  thing they share.
- **One change at a time:** change the model and the instructions at once
  and you can't say which made the difference.

## 7. M7: how it works (56–68 min)

- **Generated:** a Swing view and at least one other view, in `view/`.
  Test scaffolding may be generated too.
- **Not changed:** `GameController`, the model, `BoardView`,
  `PlayerAction`. Monday's test 2 is the acceptance test.
- **Groups of 1–3**, chosen by you, for comparison:
  - everyone keeps their own repository and submits individually;
  - read each other's generated views (collaborator access) and compare;
  - adopt at least one idea from a groupmate, rewritten and cited.
- **Solo:** generate the views at least three times, each run on its own
  branch in a fresh session, changing one thing each time, and compare
  your own runs.
- **`m7-submission.md`:** your instructions file and prompts, what you
  fixed or rejected (file:line), the comparison answers, what you took and
  from whom.
- **The syllabus AI policy still applies:** disclose and explain. In M7
  the disclosure is `m7-submission.md`.
- Dates: opens Mon Nov 9, due Mon Nov 16.

## 8. Owning it (68–72 min)

- You will explain your view in the final defense (M10).
- The test: could you change one behaviour in it by hand, without the
  agent? If not, read it until you can.

## 9. Exit question (72–75 min)

> Monday's weather app gets a web page, written by a coding agent. Write
> one "do" and two "don't" lines for its instructions, and one check you
> would run on what it produced.

## Active minutes

- Instructions exercise, 4.
- Prediction before the live run, 2.
- Live run and checks, 18 (the rule-3 requirement).
- Review question slide, 6.
- Comparison, 4.
- Exit question, 3.

About 37 minutes.

## Deliverables after approval

- The instructions file (`AGENTS.md`) used in class, published in the
  notes as an example students adapt.
- Before class, on a branch of the reference at the M6 state with the
  extra views removed:
  - the "wish" run and its diff (section 3);
  - two runs of the section 4 task on separate branches (section 6);
  - the prompts that produced them.
- A rehearsal of the live run, so a fallback branch exists if the agent
  misbehaves on Zoom.
- Four review excerpts for section 5, compile-checked against M6's given
  types.
- `notes.md`, `slides.html`, `slides.md`, `notes-INSTRUCTOR-ONLY.md`
  (answers, demo checklist, timing).
- Week 11 page: Wednesday topics and links.
- Syllabus:
  - team size 2–4 → 1–3;
  - collaboration: reading groupmates' repositories to compare is allowed;
    copying is not;
  - AI policy: coding agents may run against your own repository; never
    give an agent or a chat another student's code.
- Index: weeks 12–16 renumbered to M7–M10 (done Nov 3).

## Decisions (Nov 3)

- Students use whatever AI assistant they have access to; the deck names
  a few.
- Nothing is generated for tic-tac-toe.
- M7 opens Mon Nov 9, due Mon Nov 16.
- Groups of 1–3. Solo students generate several times and compare their
  own runs, each on its own branch in a fresh session.
- The goal is a coding agent run locally against the student's repository,
  with clear instructions on what to do and not do. Chats are allowed.

## Open questions

1. **The live task.** A text view keeps Swing as each student's own
   first run, but students may reuse it as M7's "other view". Fine, or
   pick a task outside M7 (say, an agent writing extra tests for
   `PlayerAction`)?
2. **Which agent on screen?** I'd use the one you have set up, and say
   on the slide that the steps are the same in the others.
3. **Group sign-up.** A Canvas group sign-up, or a line in
   `m7-submission.md` naming groupmates?
4. **Post-M7 numbering.** I renumbered the index to M8 perft, M9 castling
   and en passant, M10 defense, and dropped "debug & harden" as a
   milestone (week 12 keeps the debugging lecture). The map, session 11,
   and handouts m2/m3/m5 still say M8–M13; I'll align them once you
   confirm.

## Revision 3 (Nov 4, as built)

Rodrigo's answers: the agent builds a graphical 2D view live (not a text
view); group sign-up is a line in `m7-submission.md`; renumber the site;
he runs Claude Code on screen.

- The wish run did **not** break a rule: it followed `BoardView`'s
  comments. The deck says so and makes the point that it was unrequired,
  and that the agent never opened the window (white pieces hard to see).
- Runs 1 and 2 (one change: the model) both passed every check. Run 2
  refused a modal promotion dialog, citing AGENTS.md: the "instructions are
  read literally" slide, with the rewritten rule in the notes.
- Demo repository: `~/Workspace/SFSU/CSC413-agent-demo`, branches `wish`,
  `run-1`, `run-2`, and `main` with `AGENTS.md` and `CLAUDE.md`.
- 34 slides. `tools/slides_md.py` writes `slides.md` from the deck.
