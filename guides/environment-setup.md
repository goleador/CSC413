# Environment Setup

What to install before the first lab, and how to check it worked.

You need three things: a JDK, IntelliJ IDEA, and Git. Nothing else — the project
downloads Maven itself.

---

## 1. The JDK

**Install Eclipse Temurin 25 (LTS)** from **<https://adoptium.net>**.

Two details matter, and both are easy to get wrong:

**Get version 25, not the newest number you see.** Java releases every six
months, but only some are Long-Term Support. Version 26 exists and is newer; it
is a short-term release that stops getting updates after six months. Version 25
is the current LTS and is supported into 2028. We use the LTS.

**Get Temurin, not Oracle's build.** Searching "download Java" leads to
oracle.com, whose build is free only inside a licence window that expires on a
schedule. Temurin is the same OpenJDK source under a licence (GPLv2 with the
Classpath Exception) that is simply free, permanently. Everything in this course
works identically on either; the difference is legal, not technical.

**Pick the right package for your machine:**

| Machine | Package |
|---|---|
| Mac, Apple Silicon (M1 or later) | macOS **aarch64** |
| Mac, Intel | macOS **x64** |
| Windows | Windows **x64** |
| Linux | Linux **x64** (or aarch64) |

Not sure which Mac you have? Apple menu → About This Mac. "Apple M1/M2/M3/M4"
means aarch64.

### Check it

Open a terminal and run **both** of these:

```bash
java -version
javac -version
```

You want to see 25 from both:

```
openjdk version "25.0.4.1" 2026-08-18 LTS
javac 25.0.4.1
```

**If the two numbers disagree**, you have more than one JDK installed and your
PATH is finding different ones. That will cause errors that make no sense later,
so fix it now rather than working around it. On macOS, list what you have:

```bash
/usr/libexec/java_home -V
```

and set the default in `~/.zshrc`:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 25)
```

Then open a new terminal and check again.

---

## 2. IntelliJ IDEA

The **Community Edition** is free and does everything this course needs:
<https://www.jetbrains.com/idea/download/>

Students can also get the Ultimate Edition free with a university email through
the JetBrains student programme, but nothing in this course requires it.

When you open your cloned repository, IntelliJ reads `pom.xml` and configures
itself.
If it complains about the SDK, go to **File → Project Structure → Project** and
set the SDK to your JDK 25.

---

## 3. Git

Check whether you already have it:

```bash
git --version
```

If not: macOS installs it with `xcode-select --install`; Windows users get it
from <https://git-scm.com>.

---

## 4. Clone your repository

Accept the GitHub Classroom invitation posted on the course site. That creates a
repository for you (or for your team) named something like `chess-yourname`.
Clone it, substituting your own repository's address:

```bash
git clone https://github.com/csc413-f26/chess-yourname.git
cd chess-yourname
```

Now add the course repository as a second remote called `upstream`. This is how
each milestone reaches you for the rest of the semester:

```bash
git remote add upstream https://github.com/csc413-f26/CSC413-chess-starter.git
git remote -v
```

That last command should list **two** remotes: `origin` (yours, where you push)
and `upstream` (the course's, where milestones come from). If you only see
`origin`, the `git remote add` line did not run — try it again.

You only do this once. `guides/git-workflow.md` covers what to do each week.

---

## 5. Check everything at once

Run the tests. This is the real test of your setup, because it exercises the
JDK, Maven, and the build all together:

```bash
./mvnw test
```

On Windows, use `mvnw.cmd test`.

The first run takes a minute or two — it is downloading Maven and the test
libraries. You should end with:

```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

The exact number of tests does not matter and grows every week as milestones
arrive. What matters is **the three zeros and `BUILD SUCCESS`**.

**A clean test run means your environment is correct.** You are done.

> **Later in the semester, a fresh milestone will make `./mvnw test` fail — on
> purpose.** Those failing tests are the assignment. A red suite right after
> `git merge mN` is expected; a red suite *now*, in week one, means something in
> this guide did not work.

---

## When it goes wrong

**`This project requires JDK 25 or newer`** — exactly what it says. Your JDK is
too old. Install Temurin 25 and check with `java -version`.

**`java: command not found`** — the JDK either did not install or is not on your
PATH. Reinstall, then open a *new* terminal; an old one keeps the old PATH.

**`./mvnw: Permission denied`** — mark it executable: `chmod +x mvnw`.

**`java -version` says 25 but `javac -version` says something else** — see the
PATH fix in section 1. Do not ignore this one.

**Tests fail in week one** — that is a real failure. Copy the output and bring it
to lab; do not start the assignment on a broken build. (Later in the semester,
failing tests immediately after `git merge mN` are the new milestone's
assignment, not a setup problem.)

**`git remote add upstream` says "remote upstream already exists"** — harmless,
it means you ran it twice. Confirm with `git remote -v` that `upstream` points at
`CSC413-chess-starter`; if it points somewhere else, fix it with
`git remote set-url upstream <the right address>`.

**Downloads are slow or fail on the first `./mvnw`** — it is fetching Maven and
JUnit. Campus Wi-Fi is sometimes the culprit; try again, and try a different
network before assuming it is broken.
