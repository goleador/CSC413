# Session 2 — Tools: Java, the IDE, Maven, Version Control

**Week 1, Wednesday August 26** · CSC 413 Software Development
**Objectives advanced:** 8 (professional tools: IntelliJ IDEA, Git, GitHub, Maven, JUnit)
**Milestone supported:** M0 — repository and environment setup (due Mon Aug 31)

---

## Where this sits

Monday was the course and the project. Today is the toolchain — the four things
you will touch every single week for the rest of the semester. We stay on the
basics: what each tool is *for*, and just enough of each to get M0 done.

None of this is chess yet. That starts next week.

---

## 1. Java, and why the version matters

You know Java from CSC 220. Two things are worth saying anyway.

**Java releases every six months, but only some releases are LTS.** Long-Term
Support means security updates for years; a non-LTS release stops getting them
after six months. **25 is the current LTS.** Getting "the newest one" is the most
common setup mistake in this course, and it is a mistake — newer is not better
here, supported is better.

**Get Temurin, not Oracle's build.** Searching "download Java" leads to
oracle.com, whose build is free only inside a licence window. Temurin is the same
OpenJDK source under a licence that is simply free. Get it from
[adoptium.net](https://adoptium.net).

The project enforces this. Build on an older JDK and it fails immediately with a
message telling you where to download the right one — deliberately, because
"release version 25 not supported" tells a student nothing about what to do next.

> **The classic trap.** `java -version` says 25 but `javac -version` says
> something else. That means you have two JDKs and your PATH prefers the wrong
> one for compiling. Both must say 25. The fix is in the setup guide.

---

## 2. The IDE

IntelliJ IDEA Community Edition. Open your project folder — **not** individual
files — and IntelliJ reads `pom.xml` and configures itself: source roots,
dependencies, test runner, the lot.

What is worth learning today:

- **Run a single test** — the green arrow in the gutter next to a test method
- **Run the whole suite** — the arrow next to the class name
- **Jump to a symbol** — <kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + click on any name
- **Find a class by name** — double-<kbd>Shift</kbd>

We come back to the debugger properly in Week 12. For now, know that the green
arrow exists and that red means a test failed.

If IntelliJ complains about the SDK: **File → Project Structure → Project**, set
it to your JDK 25.

---

## 3. Maven

Maven does two jobs: it **builds** your project and it **manages dependencies**.

The whole build is described by one file, `pom.xml`, which says: this is a Java
25 project, it depends on JUnit 5 for tests, and its entry point is `Main`. You
will barely edit it this semester — but you should be able to read it.

**You do not install Maven.** The project ships the *Maven Wrapper*: a small
script that downloads the correct Maven version on first run. That is why every
command in this course starts `./mvnw` rather than `mvn`:

```bash
./mvnw test        # compile everything and run the tests
./mvnw package     # build the runnable jar
```

On Windows, `mvnw.cmd` instead of `./mvnw`.

The first run takes a minute or two while it downloads Maven and JUnit. After
that it is fast.

**The only output that matters today:**

```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Three zeros and `BUILD SUCCESS`. That is the whole acceptance criterion for M0.

### Why a wrapper at all

So that "works on my machine" stops being a sentence anyone says. Everyone in
this room builds with the same Maven version, and a new laptop needs only a JDK.
That idea — pin your tooling, do not assume the environment — is a software
engineering practice, not a Maven quirk.

---

## 4. Where your code lives

Before any git command, decide where your coursework sits on disk. This sounds
too small to mention in a lecture. It is the reason a handful of students every
semester cannot find their project, or clone it three times into three different
places, or lose work to a cloud sync.

Make one folder in your home directory and keep everything under it:

```bash
mkdir -p ~/Workspace
cd ~/Workspace
```

Clone from there, and your repository lands at `~/Workspace/CSC413`. Every
command this semester — `./mvnw test`, `git push`, all of it — runs from inside
that folder. `pwd` tells you where you are; `cd ~/Workspace/CSC413` takes you
back when you are lost.

Two rules. **Not in iCloud Drive, Dropbox, OneDrive, or Google Drive** — they
sync half-written files while git is mid-operation and corrupt the repository.
**No spaces or accents in the path** — parts of the Java toolchain still handle
them badly.

## 5. Version control

You have used Git. What is new here is the *shape* of how we use it.

**You keep one repository for the whole semester.** Not one per assignment. Code
you write in week 4 is still there in week 15, in one continuous history, because
the project is cumulative — each milestone builds on the last.

**Two remotes.** This is the part worth understanding today:

```
origin     github.com/YOUR-USERNAME/CSC413              yours — you push here
upstream   github.com/goleador/CSC413-chess-starter     mine — you pull from here
```

A *remote* is just a named URL that git can fetch from or push to. You get two:
your own repository, and mine. Each week I publish a milestone to `upstream`, you
merge it into your repository, and your own work stays exactly where it is.

Check yours any time:

```bash
git remote -v
```

If `origin` still points at `goleador`, you will not be able to push — you cannot
write to my repository. That is the single most common M0 failure.

### The weekly rhythm (preview)

Starting next week, every milestone looks like this:

```bash
git fetch upstream --tags     # see what's new
git merge m0b                 # bring it in
./mvnw test                   # RED — the failures are the assignment
# ...work until green...
git tag submit-m0b
git push origin main --tags   # the tag IS the submission
```

There is nothing to upload anywhere. The tag is the submission, and it timestamps
itself.

**A milestone arriving red is normal.** New tests describe behaviour you have not
written yet. Red right after a merge means the assignment landed; red in week one
means something in your setup is wrong.

Full details in [the git workflow guide](https://goleador.github.io/CSC413/guide.html?g=git-workflow) — read it now, use it next week.

---

## 6. Why merges will not eat your work

The natural worry: "if he pushes code every week, does it overwrite mine?"

No, and the reason is a rule I hold myself to:

> **Milestones only ever add files. Once a file is yours, it is yours
> permanently — I never ship a second copy of it.**

When M2 arrives with six new piece classes, git adds six files. Your existing
code is not touched, because we are working on different files.

The one thing you must not do:

> **Do not rename or change the signature of a method the scaffold gave you.**
> Next week's tests are written against it.

Add methods freely. Fill in bodies however you like. But if you rename
`pseudoLegalMoves` to `generateMoves`, next week's tests will not compile against
your code. Working against a fixed interface is what being on a team means.

---

## Your homework: M0

Due **Monday, August 31, 11:59 PM**. Four steps, about 30 minutes:

1. Install JDK 25 (Temurin), IntelliJ, Git
2. Create a **public** GitHub repo named `CSC413` exactly, and seed it from the
   course starter
3. Register the URL on the [course form](https://forms.gle/BkTNA7dXet9vRYUw6)
4. `./mvnw test` → three zeros and `BUILD SUCCESS`

Then `git tag submit-m0 && git push origin main --tags`.

Handout: `assignments/m00-setup/handout.md`. Step-by-step: [the setup guide](https://goleador.github.io/CSC413/guide.html?g=environment-setup).

**Start it before the weekend.** You have Monday's class to ask about anything
still broken — but that only helps if you have tried it by then. Almost every
problem here is a five-minute fix in person and an hour alone.

---

## Next session

Monday Aug 31 — the Java review, aimed at designing `Position`. M0b — board
coordinates, the first real code — opens Wednesday.

---

## INSTRUCTOR ONLY

**Timing (75 min):** Java/JDK 15 · IDE demo 15 · Maven 20 · Git/two-remotes 20 ·
M0 walkthrough + questions 5.

**Live demo, in this order** — do it in a throwaway clone on the projector:
1. `java -version` and `javac -version` side by side; show a mismatch if you can
2. Open the starter in IntelliJ; run `ToolchainTest` with the green arrow
3. `./mvnw test` in the terminal; point at the three zeros
4. `git remote -v` showing origin/upstream; then `git remote add origin <wrong>`
   and a failed push, so they have *seen* the error before they hit it at 11pm

**Emphasize:** the JDK-25-not-newest point and the `origin` push failure. Those
two account for most of the setup support load.

**Do not** get pulled into the debugger, branching strategy, or how the engine
works. Weeks 12, and next week, respectively.

**Check before class:** starter repo pushed to GitHub ✅, Pages live ✅,
registration form created and linked ✅. Have the form open in a tab to show them.
