# M0 — Repository and Environment Setup

**Course:** CSC 413 Software Development
**Milestone:** M0 · Week 1
**Objectives advanced:** 8 (professional tools: IntelliJ, Git, GitHub, Maven, JUnit)
**Attempt before:** Wednesday, August 26 — bring what breaks to class
**Due:** Sunday, August 30, 11:59 PM

---

## The idea

Before we can build a chess engine, you need a place to build it and a toolchain
that works. This milestone is entirely setup — but it is graded, because a
broken environment in week 3 costs you a week of the project, and because
"my machine is set up" is a claim best verified early.

There is nothing to design here. Follow the guide, and get a green build.

**Two dates, on purpose.** Get as far as you can before **Wednesday** — even if
you get stuck, especially if you get stuck. Wednesday's session is set aside for
working through whatever broke, and that is far more useful to you than watching
me talk. The actual deadline is **Sunday**, which gives you the weekend to finish
after we have fixed things together.

Arriving Wednesday having not tried is the one way to waste the session.

---

## What to do

1. **Install the tools** — JDK 25 (Temurin), IntelliJ IDEA, Git.
2. **Create your repository** — public, named `CSC413` exactly.
3. **Seed it from the course starter** and wire up both remotes.
4. **Register your repository** on the course form.
5. **Run the tests** and confirm a green build.

All five steps are spelled out in **`guides/environment-setup.md`**. Follow it
start to finish rather than improvising — the remote setup in particular has to
be exactly right, or milestones will not reach you.

If you are working in a group, **one** member creates the repository and adds
the others as collaborators. Everyone still installs the tools on their own
machine.

---

## What "done" looks like

From inside your repository:

```bash
./mvnw test
```

ends with three zeros and `BUILD SUCCESS`:

```
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

And `git remote -v` lists **two** remotes:

```
origin      https://github.com/YOUR-USERNAME/CSC413.git       yours
upstream    https://github.com/goleador/CSC413-chess-starter  the course's
```

---

## What you submit

Push your repository and tag it:

```bash
git tag submit-m0
git push origin main --tags
```

**The tag is the submission.** There is nothing to upload to Canvas. If you have
also submitted the registration form, you are done.

---

## How it is graded

| | |
|---|---|
| Repository exists, public, named `CSC413`, seeded from the starter | 30% |
| Both remotes correct (`origin` yours, `upstream` the course's) | 25% |
| `./mvnw test` passes on your machine | 25% |
| `submit-m0` tag pushed | 10% |
| Registration form submitted | 10% |

Checked mechanically — I clone your repository and run the same commands.

---

## Common problems

Every error we have seen before is in the troubleshooting section at the bottom
of `guides/environment-setup.md`. The three most common:

- **`This project requires JDK 25 or newer`** — your JDK is too old. The most
  common cause is installing the newest number rather than 25.
- **`java -version` says 25 but `javac -version` disagrees** — a PATH problem,
  fixed in section 1 of the guide. Do not ignore it; it will bite you later.
- **`git push` rejected** — `origin` still points at my repository. You cannot
  push there. Re-run the `git remote add origin` step with your own URL.

Bring anything else to Wednesday's class — that is what the session is for.
Have the exact error text ready (copy it, do not describe it from memory), and
tell me which step of the guide you were on when it appeared.

---

## A note on what comes next

Keep this repository for the entire semester. You will never create another one,
and you will never start a milestone from scratch — each one builds on the code
you already have. `guides/git-workflow.md` covers the weekly routine, and it is
worth reading now even though you will not need it until M1.
