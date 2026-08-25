# Git Workflow

How your code reaches you, and how your work reaches me. Read this once in week
one, then keep the [milestone loop](#the-milestone-loop) handy — you will run
those four commands twelve times.

`guides/environment-setup.md` covers the one-time setup. This guide assumes you
have already created your `CSC413` repository, pushed the starter into it, and
have both remotes wired up.

---

## The two remotes

```
upstream   github.com/goleador/CSC413-chess-starter     the course's — you pull
origin     github.com/YOUR-USERNAME/CSC413              yours — you push
```

Check yours any time with `git remote -v`. You **pull** from `upstream` and
**push** to `origin`. You never push to `upstream`; you have no permission to,
and nothing you do can damage the course repository.

**You keep one repository for the entire semester.** There is no new repo per
milestone. Everything you write in week 4 is still there in week 15, in one
continuous history.

---

## The milestone loop

When I announce a milestone, run these:

```bash
git fetch upstream --tags        # 1. see what's new
git merge m5                     # 2. bring it into your repo
./mvnw test                      # 3. RED — the failures are the assignment
```

Then work until the tests pass, committing as you go:

```bash
./mvnw test                      # GREEN
git tag submit-m5
git push origin main --tags      # 4. this IS the submission
```

That is the whole cycle. Substitute the milestone number each week.

### Step 3 is supposed to fail

A milestone arrives as new tests that describe behaviour you have not written
yet. `./mvnw test` going red right after `git merge` is the assignment landing,
not something breaking. Read the failures — they are the specification. The
handout arrives in the same merge, at `docs/milestones/m05.md`.

### The tag is the submission

There is nothing to upload. `git push origin main --tags` submits your work, and
the tag records exactly when:

```bash
git log -1 --format=%aI submit-m5
```

That timestamp is what the late policy is measured against, so push before the
deadline even if you plan to keep improving the code afterwards. You can always
move a tag you own — but the *pushed* tag is what counts.

### Commit as you go, not at the end

Aim for at least five meaningful commits per milestone. `git commit -m "M5: king
safety"` at 11:57 PM tells me nothing about how you worked, and it is worth part
of the milestone grade. Small commits also mean `git diff` is useful to you when
something breaks.

---

## Why merges will not eat your work

Scaffolds **only ever add files**. Once a file is handed to you it is yours
permanently — I never ship a second copy of it. When M5 arrives it contains new
tests and a handout, and touches nothing you have written.

That is why `git merge m5` reports no conflicts even though you have been editing
`MoveGenerator.java` all week: your files and the incoming files are different
files.

### The one rule that keeps this true

> **Fill in bodies. Add methods freely. Do not rename or change the signature of
> a method the scaffold gave you.**

Next week's tests are written against those signatures. If you rename
`pseudoLegalMoves` to `generateMoves`, M3's tests will not compile against your
code. This is not busywork — programming against a fixed interface is exactly
what working on a team means.

If you want a differently-named method, add it *alongside* the original and have
the original delegate to it.

### Refactoring milestones

M4 and M9 ask you to *move* code — legality logic out of `Board`, display logic
out of `Game`. The scaffold gives you an empty class to move it into and the
handout tells you what goes where. **You** do the moving. That is the assignment,
and it is why the merge itself stays clean.

---

## When a merge does conflict

Rare, but if it happens nothing is lost. See what conflicted:

```bash
git diff --name-only --diff-filter=U
```

Open each file, look for the `<<<<<<<` markers, keep what belongs, delete the
markers, then:

```bash
git add -A
git commit
```

To back out entirely and return to exactly where you were:

```bash
git merge --abort
```

**Nothing bad can happen here.** `--abort` is a complete undo. Try the merge; if
it goes sideways, abort and bring it to lab.

---

## If you fall behind

Every milestone's reference solution is published when the *next* milestone
opens. If M4 defeated you, `solution-m4` appears the week M5 starts, and you have
three options.

**Read mine without taking it:**

```bash
git fetch upstream --tags
git show solution-m4:src/main/java/edu/sfsu/csc413/chess/engine/MoveGenerator.java
```

This prints to your terminal and changes nothing in your repository.

**Take one file:**

```bash
git checkout solution-m4 -- src/main/java/edu/sfsu/csc413/chess/engine/MoveGenerator.java
git commit -m "Adopt reference MoveGenerator from solution-m4"
```

Everything else stays yours.

**Take everything, if you are badly stuck:**

```bash
git merge solution-m4
```

Here conflicts *are* expected — you are asking to replace your own versions.

Adopting the reference does not change the grade already recorded for that
milestone, and it does not cost you anything on later ones. Note it in your
design journal and keep going. **No unfinished milestone ever blocks you from the
rest of the project** — that is the entire reason the solutions are published.

---

## Working in a group

One repository, shared by the team: one member creates `CSC413` and adds the
others under **Settings → Collaborators**. Only that repository is graded, so
register its URL on the course form and make sure everyone pushes to it rather
than keeping private copies.

Branch for your own work and open a pull request rather than all pushing to
`main`:

```bash
git switch -c m5-king-safety
# ...work, commit...
git push origin m5-king-safety
```

Then open the PR on GitHub and have a teammate review it. One person handles the
`git fetch upstream && git merge m5` step and pushes the result to `main`;
everyone else pulls it with `git pull origin main`.

Reviewing each other's code is a course objective, not overhead — and it is much
easier to review a 60-line pull request than a 400-line one.

---

## Quick reference

| Situation | Command |
|---|---|
| What are my remotes? | `git remote -v` |
| Get the new milestone | `git fetch upstream --tags && git merge m5` |
| Submit | `git tag submit-m5 && git push origin main --tags` |
| What did I change? | `git status` / `git diff` |
| Undo a merge that went wrong | `git merge --abort` |
| Read the reference | `git show solution-m4:<path>` |
| Take one reference file | `git checkout solution-m4 -- <path>` |
| When did I submit? | `git log -1 --format=%aI submit-m5` |
