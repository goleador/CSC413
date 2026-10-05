# Flagship University Software Construction / OO Design Courses Comparable to SFSU CSC 413 (as of 2025–2026)

Comparison baseline: SFSU CSC 413 "Software Development" — upper-division, 3 units, Java, one incremental semester project (console chess engine, milestones M0–M13 incl. perft JUnit milestone and design defense). Topics: Java tooling (IntelliJ/Git/Maven), OO principles, cohesion/coupling/SOLID, refactoring/code smells/information hiding, UML, design patterns (Factory, Builder, Command, State, Strategy, Observer), MVC/layered architecture, debugging, JUnit, maintenance/technical debt. Grading: project 40%, assignments 15%, midterm 15%, final 20%, attendance 10%.

## MIT 6.102 Software Construction (formerly 6.031, formerly 6.005): topics, schedule, projects, grading, alignment

### Takeaway
MIT 6.102 (Spring 2025 offering captured) is a specification- and testing-centered software construction course taught in **TypeScript, not Java**, with five iterated individual problem sets (alpha → code review → beta) and a 3-person team project (Star Battle puzzle game). It shares CSC 413's core of specifications-adjacent OO design, testing, and debugging, but centers ADTs/rep invariants and concurrency rather than UML, named GoF patterns, SOLID, or refactoring vocabulary.

### Cited Findings
- Course is 6.102 Software Construction, Spring 2025, taught in **TypeScript**, meeting Tu/Th 9:30–11am — [MIT 6.102 Spring 2025 site](https://web.mit.edu/6.102/www/sp25/)
- Class topic sequence (in order): Static Checking; Testing; Code Review; Specifications; Designing Specifications; Abstract Data Types; Abstraction Functions & Rep Invariants; Interfaces & Subtyping; Functional Programming; Equality; Recursive Data Types; Grammars & Parsing; Debugging; Concurrency; Promises; Mutual Exclusion; Callbacks & GUIs; Message-Passing & Networking; Little Languages — [MIT 6.102 Spring 2025 site](https://web.mit.edu/6.102/www/sp25/)
- Calendar pages: [semester view](https://web.mit.edu/6.102/www/sp25/calendar-agenda) and [week view](https://web.mit.edu/6.102/www/sp25/calendar) — [MIT 6.102 Spring 2025 site](https://web.mit.edu/6.102/www/sp25/)
- Grading: problem sets 45% (PS0 = 5%, PS1–PS4 = 10% each), quizzes 30% (Quiz 1 = 12%, Quiz 2 = 18%), team project 10%, classwork 10% (nanoquizzes, reading exercises, in-class work), code review 5%; default cutoffs A ≥ 90, B ≥ 80, C ≥ 70 — [6.102 Sp25 General Info](https://web.mit.edu/6.102/www/sp25/general/)
- Problem sets PS0–PS4 are individual and iterative: alpha submission → code-review period → beta resubmission, with staff grading plus peer code review; 10 slack-day budget (24-hour extensions, max 2 per deadline) — [6.102 Sp25 General Info](https://web.mit.edu/6.102/www/sp25/general/)
- Final project is a **three-person team project** (Spring 2025: "Star Battle," multi-phase with iterations and a final submission); teams meet with assigned TAs during class time; one grade for the whole team — [MIT 6.102 Sp25 site](https://web.mit.edu/6.102/www/sp25/); [6.102 Sp25 General Info](https://web.mit.edu/6.102/www/sp25/general/)
- Prerequisite: 6.101 (Fundamentals of Programming, Python) is strictly required; course builds on Python proficiency from 6.100/6.101 — [6.102 Sp25 General Info](https://web.mit.edu/6.102/www/sp25/general/)
- Exams: two cumulative closed-book quizzes (Quiz 1, 80 min; Quiz 2, 120 min during finals period), one handwritten note page allowed; weekly nanoquizzes on readings — [6.102 Sp25 General Info](https://web.mit.edu/6.102/www/sp25/general/)
- A Spring 2026 site already exists (previous-semesters index at web.mit.edu/6.102/www/sp26/...), confirming the course continues under the 6.102 number; course was formerly numbered 6.031 ("6.1020[6.031]") — [MIT EECS eduportal](https://eecseduportal.mit.edu/eduportal/misc/course_more_info_balloon/2525); [sp26 previous-semesters page](https://web.mit.edu/6.102/www/sp26/general/previous-semesters.html)
- Full course materials (readings for every class, problem sets, calendar) are fully public on the open course site; predecessor 6.005 is on MIT OpenCourseWare — [OCW 6.005 Spring 2016](https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-005-software-construction-spring-2016); [6.005 site](https://web.mit.edu/6.005/www)

### Inferences
- Overlap with CSC 413: testing (heavy), debugging, interfaces/subtyping, equality, code review as a graded practice, one culminating team-built interactive game. The alpha/code-review/beta PS cycle is functionally a refactoring/maintenance exercise even though "refactoring" is not a unit title.
- Differences from CSC 413: no UML, no named GoF design-patterns unit, no SOLID/code-smells vocabulary, no build-tool/Java ecosystem content; adds specifications/ADT theory (abstraction functions, rep invariants), functional programming, grammars/parsing, and a large concurrency/async arc (promises, mutual exclusion, message passing). Project is only 10% of grade vs CSC 413's 40%; exams 30% vs CSC 413's 35%.
- MIT's switch from Java (6.005/6.031 era) to TypeScript (6.102) means CSC 413 is now more Java-ecosystem-focused than MIT's equivalent.

### Gaps
- Exact per-class dates for Spring 2025 were not captured (only ordered topic list); the week-view calendar URL above has them.

## CMU 17-214/17-514 Principles of Software Construction: Objects, Design, and Concurrency: topics, schedule, projects, grading, alignment

### Takeaway
CMU 17-214 is the closest flagship analog to CSC 413: the Spring 2026 offering ("Objects, Design, and Concurrency," Java + TypeScript) explicitly teaches UML, responsibility assignment, design patterns, refactoring/anti-patterns, testing/testability, and a multi-milestone board-game design project (Santorini) with peer design review — plus a large concurrency/API-design/DevOps back half that CSC 413 lacks. Note: the **Fall 2026 offering has been radically redesigned as "Agentic Software Development,"** reorganizing the course around AI-agent-assisted engineering.

### Cited Findings
- Spring 2026: 17-214/514 "Principles of Software Construction: Objects, Design, and Concurrency," taught in **Java and TypeScript/JavaScript**, M/W 11:00–12:20 — [CMU 17-214 Spring 2026 site](https://cmu-17-214.github.io/s2026/)
- Spring 2026 lecture sequence (in order): Intro/IDEs/Build Systems/CI/Libraries; OO basics, dynamic dispatch, encapsulation; OO Analysis and UML; Responsibility Assignment; Inheritance and Delegation; Design Patterns; Design Practice; Refactoring and Anti-patterns; Specifications/Unit Testing/Exceptions; Test Case Design; Testability; Intro to Concurrency; Concurrency Hazards; Java Parallelism; Concurrency & Asynchrony in TypeScript; Concurrency and Patterns; GUIs; Libraries and Frameworks; API Design (x2); Supply Chain Security; Distributed Systems: Designing for Robustness; DevOps; Static & Dynamic Analyses; Looking Back & Looking Forward — [CMU 17-214 Spring 2026 site](https://cmu-17-214.github.io/s2026/)
- Spring 2026 assignments: HW1 Flash cards (intro OO + libraries); **HW2 Santorini board game in 3 milestones (intro design, peer review, final design)**; HW3 Testing; HW4 Design and Testability Refactoring; HW5 Concurrency; HW6 Santorini UI in 2 milestones (user interface, god cards); plus 13 pass/no-pass labs — [CMU 17-214 Spring 2026 site](https://cmu-17-214.github.io/s2026/)
- Spring 2026 grading: assignments 50%, exams 30% (two midterms 7.5% each + final 15%), labs 10%, participation/quizzes 10% — [CMU 17-214 Spring 2026 site](https://cmu-17-214.github.io/s2026/)
- Spring 2026 required textbooks: Larman, *Applying UML and Patterns* (3rd ed.) and Bloch, *Effective Java* (3rd ed.); prerequisites 15-122 or 15-211 plus 15-151/21-127 math — [CMU 17-214 Spring 2026 site](https://cmu-17-214.github.io/s2026/)
- Fall 2026 redesign: 17-214/514 is retitled **"Agentic Software Development"**; lecture arc runs Course Intro & Modern Software Engineering → Agentic Development and Design for Verification → Testing/Testability → Test Design & Coverage → What Is a Software System's Design? → Communicating and Recording Designs → Design for Change → Modularity and Anti-Patterns → Refactoring and Design Improvement → Design Patterns and Tradeoffs → APIs/Libraries/Frameworks → Evolution, Drift, and Engineering Memory → Agent Architectures → Agent Supervision and Safety → Software Architecture & Subsystem Design → Data Models at Scale → Concurrency and Asynchrony → Coordinating/Communicating Systems → Containers and the Cloud → DevOps → Verification in the Pipeline → Supply Chain Security → Observability and Monitoring → Summary — [CMU 17-214 Fall 2026 site](https://cmu-17-214.github.io/f2026/)
- Fall 2026 assignments: six individual assignments with checkpoints — A1 "Bad Slack," A2 "Better Slack (v0.1)," A3 "Two Roads," A4 "Refactor and Critique an Unfamiliar Codebase," A5 "Scale What You Built," A6 "Operate What You Built" — plus 13 weekly individual labs; grading: assignments 50%, exams 30% (2 midterms + final), labs 10%, quizzes/participation 10%; no required textbook — [CMU 17-214 Fall 2026 site](https://cmu-17-214.github.io/f2026/)
- All course materials are public on GitHub Pages; the CMU-17-214 GitHub org hosts per-semester site and lab repos (f2026, s2026, f25-lab*, s25-lab*, etc.) — [CMU-17-214 GitHub org](https://github.com/orgs/CMU-17-214/repositories)

### Inferences
- Topic-for-topic, Spring 2026 17-214 covers nearly every CSC 413 lecture topic by name (UML, encapsulation/inheritance/polymorphism, design patterns, refactoring, anti-patterns ≈ code smells, unit testing, GUIs/frameworks) and uses the same pedagogical device — one board game (Santorini) built and refactored across milestones with a peer design review, analogous to CSC 413's chess engine M0–M13 and design defense.
- CMU adds beyond CSC 413: concurrency (4–5 lectures), API design, supply-chain security, distributed systems, DevOps, static/dynamic analysis, and a second language (TypeScript). CSC 413 topics with no named CMU lecture: SOLID as a framework (CMU covers the ideas under design-for-change/modularity), MVC as an explicit unit.
- The Fall 2026 agentic redesign is a leading indicator for the field: the classic OO-design skeleton (testing → design → modularity → refactoring → patterns) is retained but reframed around AI-agent-assisted development — relevant to how CSC 413 might evolve.
- Grading weight on the project-ish assignment stream (50%) is comparable to CSC 413's project+assignments (55%).

### Gaps
- Could not confirm whether Spring 2026 is the final run of the "Objects, Design, and Concurrency" version or whether both versions will coexist; the f2026 site presents the agentic version as the course's current form.
- Per-lecture dates for Spring 2026 were not captured (ordered list only).

## University of Washington CSE 331 Software Design & Implementation: topics, schedule, projects, grading, alignment

### Takeaway
UW CSE 331 (Spring 2025 captured) has been redesigned away from its old Java/specs form: it is now a **TypeScript/React, individual-homework course centered on formal reasoning about correctness** (specifications, Floyd logic, induction, ADTs with abstraction functions/rep invariants), ending with a single design-patterns lecture. It overlaps CSC 413 on specifications-lite topics (testing, ADTs, subtypes, equality, patterns) but has no semester project, no UML, no refactoring unit, and almost no OO-design-pattern depth.

### Cited Findings
- Spring 2025 site: "CSE 331: Software Design & Implementation," three lectures weekly (MWF) plus Thursday quiz sections — [CSE 331 25sp](https://courses.cs.washington.edu/courses/cse331/25sp); syllabus at [info page](https://courses.cs.washington.edu/courses/cse331/25sp/info/); calendar at [calendar page](https://courses.cs.washington.edu/courses/cse331/25sp/calendar/calendar.html)
- Spring 2025 lecture sequence (29 lectures, in order): JavaScript; HTTP Servers; The Browser; React; TypeScript; Client-Server Interaction I–III and mutation; Specifications; Inductive data types; Testing; Correctness; Proof by calculation; Structural induction; Floyd logic (straight-line, conditionals, loops); Tail recursion I–II; Bottom-up recursion I–II; Data abstraction; Abstraction functions & representation invariants; Inductive ADTs and proofs; Reasoning about arrays; Loops on arrays; Mutable ADTs; Subtypes; Equality; Design patterns — [CSE 331 25sp calendar](https://courses.cs.washington.edu/courses/cse331/25sp/calendar/calendar.html)
- Assignments: a knowledge quiz plus 9 weekly homeworks (HW1–HW9), all **individual**; AI tools (e.g., ChatGPT) prohibited; typical workload 8+ hours/week — [CSE 331 25sp syllabus](https://courses.cs.washington.edu/courses/cse331/25sp/info/)
- Grading: knowledge quiz 1%, homework 75% (HW1–2 at 5% each, HW3 8%, HW4–6 9% each, HW7–9 10% each), final exam 24%; **no midterm** — [CSE 331 25sp syllabus](https://courses.cs.washington.edu/courses/cse331/25sp/info/)
- Language: assumes Java knowledge from prerequisite CSE 123 but "students will not program in Java" — assignments are in TypeScript, with Java used as a comparison point — [CSE 331 25sp syllabus](https://courses.cs.washington.edu/courses/cse331/25sp/info/)
- Course goals: reason accurately about code, apply software-engineering practices, defensive programming, debug client-server applications, structure modular maintainable programs; correctness via "careful specifications" and reasoning emphasized over debugging — [CSE 331 25sp syllabus](https://courses.cs.washington.edu/courses/cse331/25sp/info/)
- Offerings continue: 26au and 26sp sites exist ([26au](https://courses.cs.washington.edu/courses/cse331/26au/), [26sp](https://courses.cs.washington.edu/courses/cse331/26sp)); older Java-era archive e.g. [23au](https://courses.cs.washington.edu/courses/cse331/23au/index.html); all public via [course index](https://courses.cs.washington.edu/courses/cse331)

### Inferences
- CSE 331 is now the least CSC 413-like of the classic comparison set: no team project, no UML/patterns-by-name curriculum (one patterns lecture at quarter's end), no refactoring; its distinctive content (Floyd logic, structural induction, proofs of correctness) has no CSC 413 counterpart.
- The 2023-era CSE 331 (Java, specs/ADTs/JUnit/design patterns, "HW: campus paths" style) was much closer to CSC 413; anyone comparing should note the redesign (the 23au archive shows the old form).
- Grading contrast: UW puts 75% on individual homework and 0% on any project; CSC 413 puts 40% on one team-scale project.

### Gaps
- The exact quarter the redesign took effect was not verified (23au still looks transitional; 25sp is clearly the new form).
- Spring 2025 homework topics (what each HW covers) were listed only by number/date on the calendar, not by title.

## Stanford CS 108 Object-Oriented Systems Design: current status, topics, alignment

### Takeaway
CS 108 ("Software design and construction in the context of large OOP libraries. Taught in Java.") is the Stanford course historically closest to CSC 413, but it appears **dormant/not currently scheduled**: the Stanford bulletin shows "No Sections Found" for 2026–27 Autumn, the public web.stanford.edu class site is an explicitly unmaintained archive, and the most recent confirmed teaching evidence found is Winter 2023-24.

### Cited Findings
- Catalog description: "Software design and construction in the context of large OOP libraries. Taught in Java. Topics: OOP design, design patterns, testing, graphical user interface (GUI) OOP libraries, software engineering strategies, approaches to programming in teams." 3–4 units; prerequisite CS 107 — [Stanford Bulletin CS 108](https://bulletin.stanford.edu/courses/1056501)
- Bulletin schedule section for 2026–27 Autumn displays "No Sections Found," with no 2025–26 section information shown — [Stanford Bulletin CS 108](https://bulletin.stanford.edu/courses/1056501)
- The public course site (instructor Dr. Patrick Young, TuTh 1:30–2:50, Gates B3) covers multi-threaded applications, inter-process communication, database interaction, and GUI assignments targeting Android; the page states Canvas is the active class website and "The web.stanford.edu website you are currently viewing will not be updated" — i.e., the public site is an archive — [CS 108 class site](http://web.stanford.edu/class/cs108/)
- CS 108 appeared on CS department schedules through at least Winter 2022–23 — [Stanford CS schedules 2022–23 winter](https://cs.stanford.edu/courses/schedules/2022-2023.winter.php); a faculty profile indicates it was taught Winter 2023-24 — [Stanford profile](https://profiles.stanford.edu/47222)

### Inferences
- For a 2025–26 comparison, CS 108 is best treated as a historical reference point rather than an active peer: its catalog topic list (Java, OOP design, design patterns, testing, GUI libraries, team programming) is essentially CSC 413's topic list, but Stanford has let the course go quiet while MIT/CMU/UW modernized theirs.
- Stanford's active materials live behind Canvas, so unlike MIT/CMU/UW there is no current public schedule to mine.

### Gaps
- Could not verify via ExploreCourses whether CS 108 has 2025–26 sections (the ExploreCourses page is JavaScript-rendered and returned no content); the bulletin's empty 2026–27 schedule and archived class site are the best available evidence of dormancy, not definitive proof it is cancelled.
- No public week-by-week syllabus or grading breakdown for any recent CS 108 offering was found.

## UC Berkeley CS 61B (Java OOP + projects portion): topics, schedule, projects, grading, alignment

### Takeaway
CS 61B (Fall 2025, Hug & Kao) is primarily a **Java data-structures course** whose first ~5 weeks teach the Java OO material CSC 413 reviews (classes, inheritance, interfaces, polymorphism, comparators), backed by substantial individual Java projects and one partner project (BYOW); software-engineering lectures are optional sidebars. It is comparable to CSC 413 only in its Java-OOP-with-big-projects front end, not in design-theory content.

### Cited Findings
- Fall 2025 site: Java-based, instructors Josh Hug and Peyrin Kao, MWF 4–5pm; weekly arc: weeks 1–3 Java fundamentals/classes/lists/linked structures; weeks 4–5 inheritance, interfaces, asymptotics; weeks 6–9 trees/heaps/graphs/shortest paths; weeks 10–12 hashing/tries/sorting; weeks 13–16 advanced sorting/compression; lectures 8–10 cover interface vs implementation inheritance, polymorphism, comparables/comparators; **optional software-engineering lectures in weeks 11–12** — [CS 61B Fall 2025](https://fa25.datastructur.es/)
- Fall 2025 projects: Project 1 LinkedListDeque61B; Project 2 ArrayDeque61B; Project 3 Percolation; Project 4 NGrams/WordNet (multi-part); Project 5 "BYOW" (Build Your Own World), a **partner** project with design, world generation, and interactivity; Gitlet does not appear in the Fall 2025 lineup — [CS 61B Fall 2025](https://fa25.datastructur.es/)
- Fall 2025 grading (1500 points total): design projects 400, final exam 400, midterm 2 250, midterm 1 150, mini-projects 120, homework 100, lecture attendance (opt-in) 50, surveys 30; fixed letter-grade bins (A ≥ 1320, B ≥ 1050, etc.) — [CS 61B Fall 2025 policies](https://fa25.datastructur.es/policies/)
- Prerequisite: CS 61A, CS 88, or E7 or equivalent; assumes "zero Java experience" coming in — [CS 61B Fall 2025 policies](https://fa25.datastructur.es/policies/)
- Collaboration: design-project code must be written primarily alone (or with partner on Project 5); AI-generated code must be cited explicitly — [CS 61B Fall 2025 policies](https://fa25.datastructur.es/policies/)

### Inferences
- Overlap with CSC 413: Java language + tooling immersion, JUnit-style tested projects, inheritance/interfaces/polymorphism, and project-heavy grading (projects+mini-projects+HW ≈ 41% of points, close to CSC 413's 40% project weight). Exams are heavier at Berkeley (~53% of points vs CSC 413's 35%).
- Not covered relative to CSC 413: UML, design patterns by name, SOLID, refactoring/code smells, MVC — design/SE content is optional, not assessed core. Conversely 61B's core (asymptotics, trees, graphs, hashing, sorting) is outside CSC 413's scope. It's a feeder-level comparison (sophomore course), not a true peer.
- The famous Gitlet project is not in the Fall 2025 lineup, so citations of 61B's project list should be semester-specific.

### Gaps
- Spring 2025 (sp25.datastructur.es) lineup was not separately captured; project rosters differ semester to semester.

## Cross-course comparison with CSC 413 and public availability of materials

### Takeaway
CMU 17-214 (Spring 2026 form) is the only flagship course that matches CSC 413 nearly topic-for-topic (UML, patterns, refactoring, testing, one evolving game project) and, like CSC 413, in Java; MIT and UW have both moved to TypeScript and toward specifications/reasoning, Stanford's Java OO-design course is dormant, and Berkeley's is a lower-division data-structures course. Every active course except Stanford publishes full materials on a public site.

### Cited Findings
- Public course sites with full schedules: MIT 6.102 [sp25 site](https://web.mit.edu/6.102/www/sp25/) + [calendar](https://web.mit.edu/6.102/www/sp25/calendar-agenda); CMU 17-214 [s2026](https://cmu-17-214.github.io/s2026/) and [f2026](https://cmu-17-214.github.io/f2026/) (+ [GitHub org](https://github.com/orgs/CMU-17-214/repositories)); UW CSE 331 [25sp](https://courses.cs.washington.edu/courses/cse331/25sp) + [calendar](https://courses.cs.washington.edu/courses/cse331/25sp/calendar/calendar.html) + [all quarters](https://courses.cs.washington.edu/courses/cse331); Berkeley CS 61B [fa25](https://fa25.datastructur.es/); MIT OCW archive of predecessor [6.005](https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-005-software-construction-spring-2016). Stanford CS 108's public page is an unmaintained archive pointing to Canvas — [CS 108 site](http://web.stanford.edu/class/cs108/)
- Language: MIT 6.102 TypeScript ([general info](https://web.mit.edu/6.102/www/sp25/general/)); UW CSE 331 TypeScript, explicitly not Java ([syllabus](https://courses.cs.washington.edu/courses/cse331/25sp/info/)); CMU 17-214 s2026 Java + TypeScript ([site](https://cmu-17-214.github.io/s2026/)); Berkeley 61B Java ([site](https://fa25.datastructur.es/)); Stanford CS 108 Java per catalog ([bulletin](https://bulletin.stanford.edu/courses/1056501))
- UML taught by name: only CMU ("OO Analysis and UML" lecture; Larman *Applying UML and Patterns* required) — [CMU s2026](https://cmu-17-214.github.io/s2026/). Design patterns as a multi-lecture named unit: CMU ([s2026](https://cmu-17-214.github.io/s2026/)); single closing lecture at UW ([25sp calendar](https://courses.cs.washington.edu/courses/cse331/25sp/calendar/calendar.html)); not a named unit at MIT ([sp25 topic list](https://web.mit.edu/6.102/www/sp25/)). Refactoring/anti-patterns as named lectures: CMU only (s2026 "Refactoring and Anti-patterns", HW4 "Design and Testability Refactoring"; f2026 "Refactoring and Design Improvement," "Modularity and Anti-Patterns") — [s2026](https://cmu-17-214.github.io/s2026/), [f2026](https://cmu-17-214.github.io/f2026/)
- Topics these courses cover that CSC 413 does not: concurrency/parallelism (MIT: Concurrency, Promises, Mutual Exclusion, Message-Passing — [sp25](https://web.mit.edu/6.102/www/sp25/); CMU: 4–5 concurrency lectures — [s2026](https://cmu-17-214.github.io/s2026/)); specifications/ADT theory with abstraction functions & rep invariants (MIT [sp25](https://web.mit.edu/6.102/www/sp25/); UW [25sp calendar](https://courses.cs.washington.edu/courses/cse331/25sp/calendar/calendar.html)); formal correctness proofs/Floyd logic (UW only); grammars/parsing and little languages (MIT); API design, supply-chain security, DevOps, distributed systems, static & dynamic analysis (CMU [s2026](https://cmu-17-214.github.io/s2026/)); AI-agentic development (CMU [f2026](https://cmu-17-214.github.io/f2026/)); web/client-server stack (UW [25sp calendar](https://courses.cs.washington.edu/courses/cse331/25sp/calendar/calendar.html))
- Project models: CSC 413-style single evolving game project appears at CMU (Santorini across HW2 + HW6 milestones with peer design review — [s2026](https://cmu-17-214.github.io/s2026/)) and, in team form, at MIT (3-person Star Battle final project, but only 10% of grade — [general info](https://web.mit.edu/6.102/www/sp25/general/)); Berkeley uses several discrete projects incl. one partner project ([fa25](https://fa25.datastructur.es/)); UW has no project, 9 individual HWs ([25sp syllabus](https://courses.cs.washington.edu/courses/cse331/25sp/info/))
- Grading-weight comparison (project-ish work / exams): CSC 413 40+15 / 35; CMU 50 (assignments) + 10 (labs) / 30 ([s2026](https://cmu-17-214.github.io/s2026/)); MIT 45 (PS) + 10 (project) + 15 (classwork/code review) / 30 ([general](https://web.mit.edu/6.102/www/sp25/general/)); UW 76 / 24 ([syllabus](https://courses.cs.washington.edu/courses/cse331/25sp/info/)); Berkeley ≈ 43% coursework / ≈ 53% exams by points ([policies](https://fa25.datastructur.es/policies/))

### Inferences
- CSC 413's distinctive position: it is the only course in this set that (a) devotes 40% of the grade to one incremental individual semester project, (b) teaches SOLID by name, and (c) stays entirely in the Java/IntelliJ/Maven/JUnit ecosystem end to end. Its chess-engine milestone structure most closely parallels CMU's Santorini milestones (both: build game core → test → refactor → extend with UI/variants → design review/defense).
- CSC 413 topics none of the five currently foreground: SOLID as a named framework, MVC as a named architecture unit (CMU's GUI/frameworks lectures come closest), and technical debt as an explicit topic (CMU f2026's "Evolution, Drift, and Engineering Memory" is the nearest analog).
- Trend across flagships in 2025–26: movement away from Java (MIT, UW), heavier emphasis on testing + specification + concurrency, and (CMU f2026) explicit restructuring around AI-agent-assisted development — useful framing for positioning or evolving CSC 413.

### Gaps
- Attendance is graded in CSC 413 (10%); none of the five courses grades attendance comparably except Berkeley's opt-in lecture-attendance points and MIT/CMU participation/classwork buckets — no exact analog found.
- No 2025–26 offering with a Stanford-style pure "OO systems design in Java" identity was found at these flagships other than CMU s2026; if the comparison set should include active Java-first peers, other universities (not in scope here) would need to be researched.
