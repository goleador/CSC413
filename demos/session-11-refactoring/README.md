# Session 11 demo — refactoring `TurnHandler`

Two small Maven projects with the same nine tests.

- `before/` — a working but tangled turn handler. One 71-line method parses
  the move, validates it, updates the board and the history, switches the
  turn, and prints the board.
- `after/` — the same program after ten refactorings. The test file is
  byte-for-byte identical to `before/`'s, and still green.

```bash
cd before && ./mvnw test      # Tests run: 9, Failures: 0, Errors: 0
cd ../after && ./mvnw test    # the same nine
```

Open either folder in IntelliJ (File → Open → the folder with `pom.xml`).
`Main` lets you type moves such as `e2e4`; type `quit` to stop.

This program is **not** the course chess engine. It has no `Game`, no move
list, no king safety, and its pieces answer a different question
(`canMoveTo` for one destination) from the engine's `Piece`. It exists so
that we can refactor something real in class without touching your
milestone code.
