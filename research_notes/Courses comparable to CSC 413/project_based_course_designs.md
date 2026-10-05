# Courses That Anchor OO Design on One Incrementally Built Semester Project (comparison set for SFSU CSC 413)

## Which university courses build a chess engine or comparable board/strategy game incrementally across a term?

### Takeaway
The closest structural match to CSC 413's 14-milestone chess engine is EPFL CS-108 "Pratique de la programmation orientée objet," which builds one board/strategy game (a new one each year — ChaCuN in 2024) across 12 weekly, numbered stages with staged autograded submissions and code-review-based final grading. Northeastern CS 3500 and CMU 17-214 also ride OO design topics on a multi-assignment evolving project, but their projects are shorter arcs (3–5 assignments) embedded in a larger homework sequence rather than one project spanning every week.

### Cited Findings
- **EPFL CS-108** is titled "Practice of object-oriented programming"; students "improve their knowledge in Java and put it into practice by completing a substantial project," covering collections and design patterns — [EPFL Graphsearch CS-108](https://graphsearch.epfl.ch/course/CS-108)
- The CS-108 2024 project is **ChaCuN**, an electronic version of the board game "Chasseurs et cueilleurs au Néolithique" (Hunters and Gatherers in the Neolithic) for 2–5 players, who build a prehistoric landscape by placing square tiles and score points by occupying terrain with hunters/gatherers/fishermen — [CS-108 2024 project introduction](https://cs108.epfl.ch/archive/24/p/00_introduction.html)
- ChaCuN is implemented in **12 weekly stages in three guidance phases**: stages 1–6 heavily guided, stages 7–11 less guided, stage 12 optional and nearly unrestricted — [CS-108 2024 project introduction](https://cs108.epfl.ch/archive/24/p/00_introduction.html)
- The CS-108 landing page links to **previous editions every year from 2017 through 2026**, i.e., the one-game-per-semester format has run continuously through the 2020–2026 window; next edition begins February 2027 — [cs108.epfl.ch](https://cs108.epfl.ch/)
- The 2024 archive confirms late-project stage content: "l'étape 11 du projet" is titled *Programme principal* (main program), followed by "le rendu final et le bonus" (final submission and bonus) — [CS-108 2024 archive](https://cs108.epfl.ch/archive/24/)
- A fetch of the 2024 stage archive listed the stage sequence as roughly: setup → tiles (*Tuiles*) → areas (*Aires*) → partitions and messages → game board (*Plateau de jeu*) → game state (*État de la partie*) → messages → graphical interface (*Interface graphique*) → graphical game board → remote play (*Jeu à distance*) → final submission + bonus — [CS-108 2024 stage archive](https://cs108.epfl.ch/archive/24/archive.html). (Caution: this list came back from an automated page summary; exact stage titles/numbering should be re-checked against the page before quoting verbatim.)
- **Northeastern CS 3500 "Object-Oriented Design"** (Java, upper-division) explores object, class, interface, encapsulation, polymorphism, inheritance; uses Java 11 + IntelliJ; references Effective Java and the GoF/Head First design-patterns books; some homework done with an assigned partner, some with a larger team — [CS 3500 Fall 2023](https://course.ccs.neu.edu/cs3500f23/)
- In **CS 3500 Fall 2019**, the semester project was **"Beyond gOOD: A Simple Spreadsheet"** built across Assignments 5–8 (Parts 1–4, 10/31–12/04), capped by Assignment 9 **"From gOOD to Excellent"** (due 12/11); it was preceded by a "Playing with Cards" sequence (Assignments 2–4) — [CS 3500 Fall 2019](https://course.ccs.neu.edu/cs3500f19/)
- **CMU 17-214 "Principles of Software Construction: Objects, Design, and Concurrency"** (Fall 2021) ran six major homeworks with sub-parts: HW1 "Intro to OO and Libraries," HW2 "Testing," HW3 "Intro to Design," HW4 "Improving Designs with Refactoring," HW5 (two parts, 10/25 and 11/1) around a "Milestone" and "Designing Complex Software," and HW6 (three parts, 11/15–12/3) on "Framework Design," "Implementation," and "Plugins"; the syllabus says assignments "involve engagement with complex software such as distributed massively multi-player game systems" — [17-214 Fall 2021](https://cmu-17-214.github.io/f2021/)
- The CMU-17-214 GitHub org now (2026) hosts materials for **"17-214/514: Agentic Software Development"** with `f2026`/`s2026` sites and lab repos (e.g., a TypeScript reservation-service, a Java booking API) — i.e., the course has pivoted away from the classic OO-design project format as of 2026 — [github.com/CMU-17-214](https://github.com/CMU-17-214)
- **Rose-Hulman CSSE 220 "Object-Oriented Software Development"** used a chess design exercise in which students develop a program design for a two-player chess game using CRC cards — [CSSE 220 HW14](https://www.rose-hulman.edu/class/csse/csse220/201110/Homework/hw14.html) (2011 offering; older than the preferred window but a documented chess-design artifact in an OO course)
- A web-search summary reported that **Rutgers CS 213 "Software Methodology"** included a chess game project teaching inheritance, abstract classes, and MVC; this came from an aggregator (a student portfolio page, [realistictalha.is-a.dev/work/chess-game](https://realistictalha.is-a.dev/work/chess-game)), not an official Rutgers page — treat as unverified.

### Inferences
- CS-108 is the strongest analog to CSC 413: one game, numbered weekly stages for the whole term, early stages tightly scripted and later stages open-ended — the same "scaffold then release" shape as CSC 413's M0–M13, though CS-108 changes the game annually (tCHu, Javass, ChaCuN are named in the EPFL archive years) while CSC 413 fixes chess.
- CS-108's three-phase guidance gradient (guided 1–6, semi-guided 7–11, free 12) is an explicit design the CSC 413 schedule could borrow as a framing device: CSC 413's M0–M6 (domain model through check detection) are analogous to the guided phase, M7–M12 to the semi-guided phase, M13 (integration + defense) to the free phase.
- Northeastern deliberately uses *two* project arcs per term (a warm-up card-game arc, then the main 4-part project plus an "adapt someone else's code" capstone) instead of one 14-step arc — the capstone-against-foreign-code move has no CSC 413 equivalent and is the most distinctive assessment idea found.
- CMU 17-214's arc ends in a framework-plus-plugins homework, i.e., it sequences toward *extensibility* as the terminal design skill, where CSC 413 sequences toward *completeness/correctness* (perft, castling/en passant, defense).

### Gaps
- Could not confirm from a primary source that CMU 17-214's HW5 board-game project is **Santorini** (or that an earlier offering used "Scrabble with the Stars"): targeted searches for "Santorini 17-214" returned no course pages, the f2021 site fetch did not name the game, and the GitHub org no longer shows pre-2026 homework repos. The f2021 "Milestone"/"Designing Complex Software" HW5 is the likely slot, but the game name is unsourced here.
- Could not retrieve the per-stage pages for earlier CS-108 editions (tCHu 2021, Javass 2019) — archive sub-URLs returned 404 in the paths tried; the yearly editions are only confirmed to exist via the landing-page archive list.
- Northeastern CS 3500 Fall 2023's project name (recent offerings reportedly use an image-processor or "Pawns Board" project) could not be confirmed — the f23 page fetch returned only assignment numbers/dates, not project names.
- UIUC CS 126 (Software Design Studio), Rice COMP 310/504, Caltech, Swarthmore, and Grinnell were not investigated within the tool budget — no findings either way.

## For each found course: project, milestone schedule, design-concept sequencing, team vs individual, assessment style

### Takeaway
EPFL CS-108 pairs each weekly stage with an autograded "rendu testé" early on and shifts to human code review (judging "efficiency, conciseness, elegance") for the intermediate and final submissions; Northeastern CS 3500 assesses via next-day self-evaluations plus the Examplar requirement-testing system; CMU 17-214 sequences testing → design → refactoring → big-project milestone → framework/plugins across six homeworks.

### Cited Findings
- **CS-108 team size:** teams of at most 2 ("2 personnes au maximum"); groups may change during the semester subject to plagiarism rules — [CS-108 2024 project introduction](https://cs108.epfl.ch/archive/24/p/00_introduction.html)
- **CS-108 grading (500 pts total):** project = 300 pts, split into tested submissions for stages 2–6 (90 pts, 18 per submission), intermediate submission covering stages 1–6 (80 pts), final submission covering stages 7–11 (110 pts), and a final test (20 pts); midterm exam 75 pts; final exam 125 pts. Intermediate and final submissions are "evaluated through code review, emphasizing efficiency, conciseness, and elegance" — [CS-108 2024 project introduction](https://cs108.epfl.ch/archive/24/p/00_introduction.html)
- **CS-108 concept sequencing (2024/ChaCuN):** domain objects first (tiles, areas/zone partitions), then game board and game state, then message/scoring systems, then JavaFX GUI stages, then networking ("Jeu à distance"), then final integration/bonus — [CS-108 2024 stage archive](https://cs108.epfl.ch/archive/24/archive.html)
- **CS 3500 assessment:** "every homework where you write code will be followed one day later by a self-evaluation assignment"; for team assignments only one partner completes the self-eval — [CS 3500 Fall 2019](https://course.ccs.neu.edu/cs3500f19/)
- **CS 3500 Fall 2023 assessment/grading:** homework = 60% of grade, two exams 15% + 24%, in-class exercises 1–2%; uses "Examplar" to test students' understanding of problem requirements alongside traditional test cases; 9 homeworks spanning 9/12–12/06 with roughly 1.5–2 week spacing — [CS 3500 Fall 2023](https://course.ccs.neu.edu/cs3500f23/)
- **CS 3500 Fall 2023 lecture-to-assignment sequencing:** OO fundamentals/Java review → MVC and Builder → controllers, encapsulation/invariants → Command pattern, inheritance vs composition → performance → Swing GUI → Observer/Strategy/Decorator/Adapter — [CS 3500 Fall 2023](https://course.ccs.neu.edu/cs3500f23/)
- **CS 3500 Fall 2019 pacing:** project parts due 10/31, 11/14, 11/26, 12/04, capstone 12/11 — i.e., roughly biweekly milestones occupying the back half of the semester after a patterns-focused front half — [CS 3500 Fall 2019](https://course.ccs.neu.edu/cs3500f19/)
- **17-214 Fall 2021 pacing:** HW1 9/12, HW2 9/19, HW3 9/27, HW4 10/11, HW5a/5b 10/25 + 11/1, HW6a/6b/6c 11/15 + 11/21 + 12/3 — weekly early, widening to ~2-week multi-part milestones for the big builds — [17-214 Fall 2021](https://cmu-17-214.github.io/f2021/)

### Inferences
- CS-108's split of project credit — ~30% of project points on weekly autograded checkpoints, ~63% on two human-reviewed consolidated submissions — is a concrete model for weighting CSC 413's per-milestone autograding (e.g., the perft/JUnit harness) against a holistic design review; it rewards weekly cadence without letting checkpoint-passing dominate the grade.
- CSC 413's design-defense finale has no direct counterpart at these three schools: CS-108 substitutes written exams plus code review; CS 3500 substitutes self-evaluations (articulating one's own design decisions in writing); 17-214's equivalent rigor lands in the framework/plugin interoperability homework. The self-evaluation mechanic is the cheapest of these to adopt alongside a defense.
- All three courses place GUI work late (CS-108 stages 8–10, CS 3500 mid-late Swing assignments, 17-214 HW5/6), matching CSC 413's M9 MVC-split placement.

### Gaps
- Per-stage due dates for CS-108 2024 were not on the fetched pages (only the 12-stage structure and grading weights).
- Whether CS 3500 f19's capstone "From gOOD to Excellent" is the known provider-code-exchange exercise (teams extend another team's codebase) is strongly suggested by the title but not stated on the fetched syllabus page — unverified.
- 17-214's team-vs-individual breakdown per homework was not on the fetched page.

## Published teaching papers (SIGCSE etc.) on semester-long game projects for OO design

### Takeaway
The searches surfaced one recent (2025) peer-reviewed paper directly on tile-based game projects for OOP learning, plus an old SIGCSE CS-1 game-project paper; no SIGCSE/ITiCSE paper specifically on a semester-long *chess* project for an OO design course was found in the queries run.

### Cited Findings
- "Tile-Based Games for Object-Oriented Programming Learning" (2025) — a published paper on using tile-based games to teach OOP — [SciTePress PDF](https://scitepress.org/publishedPapers/2025/133461/pdf/index.html) (CSEDU-family venue; fetch the PDF to confirm venue, authors, and findings before citing)
- A SIGCSE article (circa 1998, per the bibliography index) describes a CS-1 object-oriented final project where students build Player1/Player2 classes for "Chance-It," a two-person dice game, as an introduction to OO design and codifying strategy — [SIGCSE bibliography index](https://ftp.math.utah.edu/pub/tex/bib/idx/sigcse1990/30/1/10_14.html)
- EPFL's CS-108 course page and graphsearch entry document the pedagogy (substantial single project + collections + design patterns) but no companion teaching paper was found — [EPFL Graphsearch CS-108](https://graphsearch.epfl.ch/course/CS-108)

### Inferences
- The scarcity of chess-specific pedagogy papers means CSC 413's 14-milestone chess-engine design (with perft as an autogradable correctness oracle and a design defense) is itself potentially publishable as a SIGCSE experience report; the closest published neighbors are tile-game and generic game-project papers.

### Gaps
- No SIGCSE/ITiCSE paper on a semester-long chess-engine project for OO design was found; queries combining "SIGCSE," "chess," and "object-oriented design course" returned mostly student repos and interview-prep material. A dedicated ACM DL search (not available in this session's toolset) might still surface one — e.g., around perft-based autograding or the CMU Santorini assignments (Kästner/Titzer-adjacent groups publish on 17-214 regularly), but nothing is confirmed here.
- The 2025 SciTePress paper's abstract/details were not fetched (tool budget); only its existence and title are confirmed.
