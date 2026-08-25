# Session 2 — Tools
### Java · IntelliJ · Maven · Git
**Week 1, Wednesday Aug 26**

> Speaker notes point back to `notes.md` sections.

---

## Today

- Java, and why **25** specifically
- The IDE
- Maven — the build
- Git — **two remotes**
- Your homework: **M0**, due Monday

*No chess today. That starts next week.*

> §Where this sits. Set expectation: basics only, just enough for M0.

---

## Four tools, all semester

| Tool | Job |
|---|---|
| **JDK 25** | Compiles and runs your code |
| **IntelliJ** | Where you write it |
| **Maven** | Builds it, fetches libraries |
| **Git** | Where it lives, how milestones reach you |

---

# 1. Java

---

## Get 25. Not the newest.

- Java releases **every 6 months**
- Only some are **LTS** — years of support
- Non-LTS: dead after 6 months
- **25 is the current LTS**

> §1. The most common setup mistake in this course.

---

## Get Temurin. Not Oracle.

- "download Java" → oracle.com
- Oracle's build is free **only inside a licence window**
- Temurin = same OpenJDK source, simply free

### [adoptium.net](https://adoptium.net)

---

## The build enforces it

```
This project requires JDK 25 or newer.
Download Eclipse Temurin 25 (LTS) from https://adoptium.net
Then check it with:  java -version
```

*Rather than* `release version 25 not supported`

> Point out: a good error message tells you what to DO.

---

## ⚠️ The classic trap

```bash
java -version    # 25  ✅
javac -version   # 17  ❌
```

Two JDKs. Your PATH prefers the wrong one **for compiling**.

**Both must say 25.** Fix is in the setup guide.

> §1. Demo this live if you can produce a mismatch.

---

# 2. The IDE

---

## IntelliJ IDEA Community

Open the **folder**, not the files.

IntelliJ reads `pom.xml` and configures itself.

---

## Four things to know today

- ▶️ **green arrow** — run one test
- ▶️ next to the class — run them all
- <kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + click — jump to a symbol
- double-<kbd>Shift</kbd> — find any class

*Debugger: Week 12.*

> DEMO: open starter, run ToolchainTest with the gutter arrow.

---

# 3. Maven

---

## Two jobs

1. **Builds** your project
2. **Manages dependencies**

All described by one file: `pom.xml`

---

## You do not install Maven

The project ships the **Maven Wrapper**.

```bash
./mvnw test       # compile + run tests
./mvnw package    # build the jar
```

Windows: `mvnw.cmd`

*First run downloads Maven itself. Give it a minute.*

---

## The only output that matters

```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

## Three zeros.

That is the whole acceptance criterion for M0.

> DEMO: run it in the terminal on the projector.

---

## Why a wrapper?

So **"works on my machine"** stops being a sentence anyone says.

- Same Maven version for everyone
- New laptop needs only a JDK

*Pin your tooling. Do not assume the environment.*

> §3. This is an engineering practice, not a Maven quirk.

---

# 4. Version control

---

## One repository. All semester.

Not one per assignment.

Week 4's code is still there in week 15.

**The project is cumulative** — each milestone builds on the last.

---

## Two remotes

```
origin     github.com/YOU/CSC413
           yours — you push here

upstream   github.com/goleador/CSC413-chess-starter
           mine — you pull from here
```

A *remote* is a named URL git can fetch from or push to.

> §4. This is the key idea of the whole delivery model.

---

## Check them

```bash
git remote -v
```

If `origin` points at **goleador**, your push fails.

*You cannot write to my repository.*

### ← the most common M0 failure

> DEMO: add a wrong origin, show the failed push. Let them SEE the error.

---

## The weekly rhythm — from next week

```bash
git fetch upstream --tags
git merge m1
./mvnw test        # RED — that's the assignment
# ...work until green...
git tag submit-m1
git push origin main --tags
```

**The tag is the submission.** Nothing to upload.

---

## Red is normal

New tests describe behaviour **you have not written yet**.

- Red *after a merge* → the assignment landed ✅
- Red *in week one* → your setup is wrong ❌

---

## Will his code overwrite mine?

# No.

> The natural worry. Answer it before they ask.

---

## The rule I hold myself to

> **Milestones only ever add files.**
> Once a file is yours, it is yours permanently.

M2 arrives → git adds six new files.
Your code is untouched. Different files.

---

## The one thing you must not do

> **Do not rename or change the signature of a method the scaffold gave you.**

Next week's tests are written against it.

*Add methods freely. Fill in bodies however you like.*

Working against a fixed interface = being on a team.

---

# Homework: M0

## Due Monday Aug 31, 11:59 PM

---

## Four steps, ~30 minutes

1. Install **JDK 25 (Temurin)**, IntelliJ, Git
2. Create a **public** repo named `CSC413` — exactly
3. Seed it from the course starter, **register the URL on the form**
4. `./mvnw test` → three zeros

```bash
git tag submit-m0
git push origin main --tags
```

---

## Where everything is

- **Handout:** `assignments/m00-setup/handout.md`
- **Step by step:** `guides/environment-setup.md`
- **Register your repo:** [the course form](https://forms.gle/BkTNA7dXet9vRYUw6)

### goleador.github.io/CSC413

---

## Start before the weekend

You have **Monday's class** to ask about what is broken.

That only helps if you have **tried it** by then.

> Almost every problem here is a 5-minute fix in person, an hour alone.

---

## Next session

**Monday Aug 31** — Java review, the project's shape

**M1 opens:** the domain model. First real code.
