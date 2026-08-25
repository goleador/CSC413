# Guides

Standalone references students consult outside of lecture. Unlike lecture notes,
these are not tied to a session and are updated as tooling changes.

**Guides are written in Markdown and read through the viewer.** GitHub Pages
serves a raw `.md` as plain text, so students would otherwise see `#` symbols and
unformatted tables. Link to them as:

```
https://goleador.github.io/CSC413/guide.html?g=<filename-without-.md>
```

`guide.html` renders any guide in this directory with the course styling —
no build step, and the file stays plain Markdown. Styling lives in
`assets/guide.css` and `assets/guide.js`.

Written:

- `environment-setup.md` — JDK 25, IntelliJ IDEA, cloning your repo, verifying
  the build
- `git-workflow.md` — the milestone loop, submitting by tag, catching up

Planned:

- `maven-basics.md` — what `./mvnw test` actually does, and the project layout
- `junit-guide.md` — writing and running tests; reading a failure
- `debugging-intellij.md` — breakpoints, stepping, watches, reading stack traces
- `chess-notation.md` — algebraic notation and FEN, with worked examples
