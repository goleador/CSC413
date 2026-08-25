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

## 4. Create and set up your repository

You will keep **one repository for the whole semester**. Everything you write in
week 4 is still there in week 15. Set it up once, now.

### 4.1 Create it on GitHub

On GitHub, create a new repository named **`CSC413`** (exactly).

- Leave it **public**.
- Do **not** add a README, .gitignore, or licence — it must start empty.

If you are working in a group, **one** member creates it and adds the others
under **Settings → Collaborators**.

### 4.2 What you are about to do, and why

Your repository starts empty, but the project does not start from nothing — so
you copy the course's starter into it.

A **remote** is just a nickname git stores for a repository's address. When you
clone, git automatically creates one called `origin` pointing at wherever you
cloned from. Nothing says you have to keep it that way, and you get **two**:

```
  goleador/CSC413-chess-starter                YOUR-USERNAME/CSC413
  ┌───────────────────────────┐                ┌──────────────────┐
  │  the course's repository  │                │  your repository │
  │  milestones appear here   │                │  your work lives │
  │  read-only to you         │                │  here            │
  └───────────┬───────────────┘                └────────▲─────────┘
              │                                         │
              │  you PULL from it                       │  you PUSH to it
              │  (git fetch / git merge)                │  (git push)
              │                                         │
              └────────────►  your laptop  ─────────────┘
                              nicknamed:
                              upstream        origin
```

You will `git pull` from `upstream` every time a milestone is released, and
`git push` to `origin` every time you finish work. **You cannot push to
`upstream`** — it is mine, and GitHub will refuse.

The setup below clones my repository and then *repoints* the nicknames: my
address gets renamed to `upstream`, and `origin` is pointed at yours. That is
why you end up with my starter code sitting in your repository.

### 4.3 Do it

Substituting your own GitHub username on the fifth line:

```bash
git clone --branch m0 https://github.com/goleador/CSC413-chess-starter.git CSC413
cd CSC413
git switch -c main
git remote rename origin upstream
git remote add origin https://github.com/YOUR-USERNAME/CSC413.git
git push -u origin main
```

Line by line:

| | |
|---|---|
| `git clone --branch m0 …` | Copy the course starter **at the `m0` tag** — the starting point, before any milestone. |
| `cd CSC413` | Move into the folder it just created. |
| `git switch -c main` | Put yourself on a branch called `main`. **Do not skip this** — see the warning below. |
| `git remote rename origin upstream` | The course's address was nicknamed `origin` by the clone. Rename it to `upstream`, freeing up the name. |
| `git remote add origin …` | Point `origin` at *your* repository. This is the line with your username in it. |
| `git push -u origin main` | Send everything to your repository. `-u` remembers the choice, so later you can just type `git push`. |

> ⚠️ **Why `git switch -c main` is not optional.** Cloning at a tag leaves you in
> "detached HEAD" state — git has your files, but you are not on any branch.
> Commits made there are easy to lose, and `git push` will not know where to send
> them. `git switch -c main` creates the branch and puts you on it. If you ever
> see the words *detached HEAD*, this is the fix.

**Why `--branch m0`?** Without it you would get every milestone released so far in
one go, including ones we have not covered yet. Milestones should arrive one at a
time, when they are assigned.

### 4.4 Check both remotes

This is the most important check in this guide. Get it wrong and milestones will
not reach you.

```bash
git remote -v
```

You must see **two** names, each listed twice (once for fetch, once for push):

```
origin      https://github.com/YOUR-USERNAME/CSC413.git       (fetch)
origin      https://github.com/YOUR-USERNAME/CSC413.git       (push)
upstream    https://github.com/goleador/CSC413-chess-starter  (fetch)
upstream    https://github.com/goleador/CSC413-chess-starter  (push)
```

Read it as: **`origin` has your username. `upstream` has mine.**

| What you see | What it means | Fix |
|---|---|---|
| Only `origin`, pointing at `goleador` | The rename did not run | `git remote rename origin upstream`, then add `origin` |
| Only `origin`, pointing at you | The rename ran, the add did not | `git remote add upstream https://github.com/goleador/CSC413-chess-starter.git` |
| `origin` points at `goleador` | Both names are backwards | `git remote remove origin`, then re-run lines 4–5 |
| Both correct | ✅ You are done | |

Also confirm you are actually on a branch:

```bash
git branch --show-current
```

It must print `main`. If it prints nothing, you are in detached HEAD — run
`git switch -c main`.

### 4.5 Register your repository

**Submit your repository's URL on the course form:**

<https://forms.gle/BkTNA7dXet9vRYUw6>

Do this even if you have pushed nothing else yet — I use it to find your work all
semester. You can edit your response later if the URL changes.

If you are in a group, **every member** fills out the form, and you all give the
*same* repository URL.

You only do all this once. `guides/git-workflow.md` covers what to do each week.

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
