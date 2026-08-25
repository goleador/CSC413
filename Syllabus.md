# CSC 413 — Software Development
## Syllabus · Fall 2026 · San Francisco State University
### Department of Computer Science · 3 units

---

## Course information

| | |
|---|---|
| **Course** | CSC 413 — Software Development (3 units) |
| **Section** | 1 |
| **Term** | Fall 2026 (instruction begins Monday, August 24, 2026) |
| **Meeting time** | Monday & Wednesday, 8:00–9:15 AM |
| **Location** | Thornton Hall 210 |
| **Prerequisites** | CSC 220 *and* CSC 317, both with a grade of **C or better** |

## Instructor

| | |
|---|---|
| **Instructor** | Rodrigo Oliveira |
| **Email** | didigo@sfsu.edu — allow up to 48 hours for a reply on weekdays |
| **Office** | Zoom (remote) |
| **Office hours** | By request over Zoom; tentatively available Wednesdays 3:00–5:00 PM |
| **Course site** | [goleador.github.io/CSC413](https://goleador.github.io/CSC413/) · **Code hosting:** [github.com/goleador](https://github.com/goleador) |

---

## Catalog description

> *"Design and development of modern software applications. Object-oriented techniques: encapsulation, inheritance, and polymorphism as mechanisms for data design and problem solution."* — SF State Bulletin

**This section's approach.** We take the catalog's object-oriented foundation and build it out into the full modern practice of software development: not just writing classes, but *designing* them well — applying SOLID principles and design patterns, separating architecture from presentation, testing and refactoring, using professional tools (IntelliJ, Git/GitHub, Maven, JUnit), and communicating designs with UML. The whole semester is anchored by **one project you build incrementally from week one: an object-oriented chess engine.** Every concept we cover appears in that project, so the ideas compound rather than arriving as disconnected exercises.

---

## Prerequisites

CSC 220 and CSC 317, each completed with a grade of **C or better**. You are expected to arrive comfortable with Java syntax, control flow, arrays and collections, basic classes and objects, and fundamental data structures. This course teaches the *engineering* of software — design, architecture, testing, and tooling — not introductory programming.

---

## Course learning outcomes

**Official catalog outcomes.** Per the course record, students will be able to: write Java programs using an IDE; use debugging tools during development; apply object-oriented programming principles when developing small-to-medium projects; implement exception handling for robust code; and use profiling/analysis tools to reason about program behavior.

**This section's expanded outcomes.** By the end of the course, you will be able to:

1. Design and implement object-oriented software systems using modern Java.
2. Apply encapsulation, inheritance, polymorphism, abstraction, interfaces, composition, and SOLID design principles.
3. Analyze designs for maintainability, extensibility, reuse, cohesion, coupling, and responsibility assignment.
4. Refactor poorly designed code into cleaner, more maintainable software.
5. Apply common design patterns (Factory, Command, State, Strategy, Observer, and others) to recurring problems.
6. Design architectures that separate presentation from business logic using patterns such as MVC.
7. Test, debug, document, and maintain a medium-sized object-oriented system.
8. Use professional tools: IntelliJ IDEA, Git, GitHub, Maven, and JUnit.
9. Communicate designs using UML diagrams and technical documentation.

---

## Required tools & materials

- **Java Development Kit (JDK):** Eclipse Temurin (Adoptium) — **JDK 25 (LTS)**. Download: https://adoptium.net
  - Get **25**, not the highest number you see. Java releases every six months, but only some are Long-Term Support; 25 is the current LTS and is supported into 2028, while newer numbers are short-term releases that stop getting updates after six months.
  - Get **Temurin**, not Oracle's build. Searching "download Java" leads to oracle.com, whose build is free only inside a licence window. Temurin is the same OpenJDK source under a licence that is simply free. See the [environment setup guide](https://goleador.github.io/CSC413/guide.html?g=environment-setup) for step-by-step setup and troubleshooting.
  - The project will refuse to build on an older JDK, with a message telling you where to download the right one.
- **IntelliJ IDEA** (Community Edition is sufficient; free Ultimate available with a student license).
- **Git** and a **GitHub** account. You create your own **public** repository
  named `CSC413` in week one and seed it from the course starter at
  [github.com/goleador](https://github.com/goleador); milestones then arrive
  through a second remote all semester. Setup: [environment-setup](https://goleador.github.io/CSC413/guide.html?g=environment-setup);
  the weekly routine: [git-workflow](https://goleador.github.io/CSC413/guide.html?g=git-workflow).
- **Maven** (project build/dependency management) and **JUnit 5** (unit testing) — both introduced in class.
- **Textbook:** No required textbook. Readings and references are posted on the course site as they are assigned.
- A computer capable of running the JDK and IntelliJ.

---

## Course format & the semester project

Class time combines short lectures, live coding, in-class design exercises, and code review. The spine of the course is a **semester-long chess engine** built in milestones that track the weekly topics.

**What you build:** a console-based, object-oriented chess program that enforces the full rules of chess (legal moves, check, checkmate, stalemate, and the special moves). The required baseline is **human-vs-human play in the terminal**. A graphical interface and a computer opponent (AI) are **optional bonus** extensions — the course is about object-oriented *design*, not networking or graphics, so the baseline deliberately stays in that lane.

**Bonus extensions.** Two optional tracks earn extra credit, both of which test the same idea: whether your design lets you add something *without* rewriting what already works.

- **Alternative views** — render the board a different way (chess figures, a bordered board, or a Swing window), with the rule that you may not modify the model or the engine to do it. Handout: `assignments/bonus-alternative-views/`.
- **A computer opponent** — a move-choosing AI, from random through greedy to minimax. There is no starter interface for this one on purpose: designing it is the exercise.

**How it's structured:** the project advances through numbered milestones (M0–M13), each a tagged Git commit plus a short demo or an automated test run. Early milestones establish the domain model and the piece hierarchy; mid-semester milestones add design patterns, architecture (MVC), and legality rules; and a dedicated **testing milestone** has you validate your move generator against published *perft* counts in JUnit — so a rules bug shows up as a wrong number rather than a silent defect. The final milestone is an individual walkthrough in which you explain and defend your design decisions.

**Team size:** the project may be done **individually or in groups of 2–4**. Individual assignments and exams remain individual work regardless of your project group.

---

## Grading

| Component | Weight | Notes |
|---|---|---|
| **Semester project** (milestones M0–M13, incl. final defense) | **40%** | Graded across the term at each milestone |
| **Programming assignments / labs** | **15%** | Smaller, skill-building exercises |
| **Midterm exam** | **15%** | ~Week 9; covers OO foundations through UML |
| **Final exam** | **20%** | Cumulative; scheduled in finals week |
| **Attendance** | **10%** | Up to 5 absences without penalty; each further absence reduces this component |
| **Total** | **100%** | |

**Grading scale (standard ±):** A 93–100, A− 90–92, B+ 87–89, B 83–86, B− 80–82, C+ 77–79, C 73–76, C− 70–72, D+ 67–69, D 63–66, D− 60–62, F below 60.

---

## Weekly schedule (Tentative)

*Topics and milestones may shift; any changes will be announced in class and on the course site.*

| Wk | Week of | Topic | Project milestone | Notes |
|---|---|---|---|---|
| 1 | Aug 24 | Course intro; project overview; policies; Git basics | M0a — repo & environment setup | Classes begin Aug 24 |
| 2 | Aug 31 | Java review; IDE & tools; **Maven**; version control | M0b — Maven skeleton; board coordinates | |
| 3 | Sep 7 | OO design principles; classes, encapsulation, constructors, packages, composition | M1 — domain model (`Board`, `Position`, `Piece`) | **Labor Day Mon Sep 7 — no Monday class; only Wed Sep 9 meets** |
| 4 | Sep 14 | Inheritance, polymorphism, abstract classes, interfaces | **M2 — the `Piece` hierarchy** | Drop-without-W & add deadline Sep 14 |
| 5 | Sep 21 | Collections, generics, enums, records, exceptions | M3 — `Move`, turns, pseudo-legal moves | Census Sep 21 |
| 6 | Sep 28 | Cohesion, coupling, separation of concerns, SOLID | M4 — split `Board` / `MoveGenerator` / `Game` | |
| 7 | Oct 5 | Refactoring, code smells, information hiding, clean code | M5 — king-safety → **check detection** | |
| 8 | Oct 12 | UML: class, sequence, component, state diagrams | M6 — diagram the engine | |
| 9 | Oct 19 | Design Patterns I: Factory, Builder; **Midterm exam** | M7 — `BoardFactory`, FEN parsing | **Midterm this week** (covers Wks 1–8) |
| 10 | Oct 26 | Design Patterns II: Command, State (behavioral) | M8 — undo/history; checkmate & stalemate | |
| 11 | Nov 2 | Architecture; layered design; **MVC**; logic vs. presentation | M9 — engine ⟂ view ⟂ controller | Same engine, swappable views — the bonus view track opens here |
| 12 | Nov 9 | Debugging with IntelliJ; stack traces; logging; reading code | M10 — debug & harden | **Veterans Day Wed Nov 11 — no class; only Mon Nov 9 meets** |
| 13 | Nov 16 | Unit testing with JUnit; test design; edge cases; regression | **M11 — perft test harness** | Withdrawal deadline (serious/compelling) Nov 16 |
| 14 | Nov 23 | *Thanksgiving recess — no class* | *(buffer)* | **Full week off — no Mon Nov 23 or Wed Nov 25 session** |
| 15 | Nov 30 | Software maintenance; evolution; technical debt; documentation | M12 — add castling & en passant | Special moves that depend on *history*, not just the board |
| 16 | Dec 7 | Course wrap-up; review; project presentations | M13 — integration, docs, demo/defense | **Last day of classes Fri Dec 11** |
| 17 | Dec 14 | **Final exam — Mon, Dec 14, 8:00–10:00 AM** | Final project submission & defense | Per SFSU final-exam schedule (MW 8:00 AM → Mon Dec 14, Thornton 210) |

---

## Course policies

### Academic integrity
All submitted work must be your own, except where collaboration is explicitly permitted. Cheating and plagiarism — including copying code from classmates, prior semesters, online sources, or AI tools and presenting it as your own understanding — are violations of SFSU's Student Code of Conduct and will be handled per university policy. See the Office of Student Conduct's [Academic Integrity](https://conduct.sfsu.edu/academic-integrity) page for the university's definitions of cheating and plagiarism, and the [Standards for Student Conduct](https://conduct.sfsu.edu/standards) (Title 5 §41301) for the underlying policy. When in doubt about what's allowed on a given assignment, ask *before* you submit.

### Generative AI policy
AI coding assistants are part of modern software development, and this course does not pretend otherwise. The following policy balances that reality with the fact that **you must actually learn to design software:**

- **Permitted, with disclosure, on the project and programming assignments.** You may use AI tools to explain concepts, suggest approaches, or help debug — but you must briefly **disclose** what tool you used and how (a note in your commit message or a `AI-USE.md` in your repo).
- **You own everything you submit.** You are responsible for understanding every line. If you cannot explain your code, it does not count as yours — and milestone defenses, demos, and code reviews exist specifically to check that understanding. Submitting code you cannot explain is treated as an integrity violation.
- **Not permitted on exams** or any assessment marked closed-resource.
- **Never paste** private course materials, exam questions, or another student's work into an external AI service.

The goal is simple: use whatever helps you learn, but *be able to stand behind your work.*

### Late work
Assignments and milestones are due by **11:59 PM on the stated due date.** Late submissions are penalized **25% per day late** — so a submission four or more days late receives no credit. Extensions for documented emergencies are handled case by case; contact me as early as possible.

### Collaboration
Discussing concepts and helping each other debug is encouraged. Unless an assignment says otherwise, the **code you submit must be written by you or your project group.** Sharing or copying solution code between groups is not permitted. Cite any external snippet you're allowed to use.

### Attendance & participation
Attendance is worth **10% of your course grade.** This section meets twice a week, so there are roughly **28 class sessions**. You may miss up to **5 sessions without penalty**; each absence beyond five reduces your course grade by **2 percentage points**, so the attendance component reaches zero at 10 total absences. Much of the course's value is in the in-class design exercises and code reviews, so being present matters. Excused absences for documented, university-recognized reasons are handled separately — please notify me in advance when possible.

### Class cancellations
On rare occasions I may need to cancel a class session due to professional commitments. When that happens, I will notify you as early as possible and provide **asynchronous work — a reading, exercise, or homework assignment — in place of the missed meeting**, so the course stays on track. Sessions I cancel never count against your attendance.

### Exams & make-ups
The midterm (~Week 9) and the cumulative final are individual and closed-resource unless stated. Make-up exams are given only for documented, university-recognized reasons arranged in advance. If you have DPRC-approved testing accommodations, send me your letter well before the midterm so the arrangements are in place — see [Disability access & accommodations](#disability-access-accommodations) below.

### Disability access & accommodations
SF State is committed to providing equal access. Students with disabilities who need reasonable accommodations should register with the **Disability Programs and Resource Center (DPRC)** and provide me with an accommodation letter as early as possible so arrangements can be made.

The DPRC is in the Student Services Building, Room 110 — [access.sfsu.edu](https://access.sfsu.edu/), dprc@sfsu.edu, (415) 338-2472, video phone (415) 335-7210.

Please talk to me early in the semester if you have an accommodation letter, or if you think you may need accommodations and have not yet registered. Arrangements for exams in particular need lead time, and nothing about this conversation is shared with anyone else.

### Changes to the syllabus
This syllabus is a plan, not a contract; content, schedule, and policies may be adjusted to serve the class. Any changes will be announced in class and posted to the course site.

---

## Key Fall 2026 dates & deadlines

- **First day of instruction:** Monday, August 24, 2026
- **Labor Day (no classes):** Monday, September 7, 2026 — a Monday, so this MW section loses that session (only Wed Sep 9 meets in Week 3)
- **Last day to add / drop without a "W":** Monday, September 14, 2026 (primary add period ends Sun Sep 6)
- **Census:** Monday, September 21, 2026
- **Withdrawal (serious & compelling reasons):** September 15 – November 16, 2026; by exception with documentation November 17 – December 11, 2026
- **Veterans Day (no classes):** Wednesday, November 11, 2026 — a Wednesday, so this MW section's Nov 11 session is canceled
- **Thanksgiving recess:** November 23–28, 2026 (campus recess; Thanksgiving Nov 26) — **no class the entire week of Nov 23**, so both the Nov 23 and Nov 25 sessions are off
- **Last day of classes:** Friday, December 11, 2026
- **Final examinations:** Saturday December 12 and December 14–18, 2026. **This section's final exam: Monday, December 14, 2026, 8:00–10:00 AM** (MW 8:00 AM classes, per the SFSU final-examination schedule)

