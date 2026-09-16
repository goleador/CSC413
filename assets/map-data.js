/* ============================================================
   CSC 413 — architecture map data
   Describes the reference chess engine (CSC413-chess-reference):
   packages, classes, relationships, and the course concepts each
   one demonstrates. Edit this file to change the map; map.js only
   draws what is here.

   Coordinates are in map units; a class box is 210 wide.
   ============================================================ */

window.MAP_DATA = (function () {

  // Chronological order in which things appear in the student project.
  const MILESTONES = [
    { id: 'M0',    week: 1,  label: 'M0 — repo & toolchain' },
    { id: 'M0b',   week: 2,  label: 'M0b — Position & Color' },
    { id: 'M1',    week: 4,  label: 'M1 — domain model' },
    { id: 'M2',    week: 4,  label: 'M2 — Piece hierarchy, Move, factories' },
    { id: 'M3',    week: 5,  label: 'M3 — turns & Game' },
    { id: 'M4',    week: 6,  label: 'M4 — Board / MoveGenerator / Game split' },
    { id: 'M5',    week: 7,  label: 'M5 — king safety & check' },
    { id: 'M7',    week: 9,  label: 'M7 — factories & FEN (studied)' },
    { id: 'M8',    week: 10, label: 'M8 — undo, checkmate & stalemate' },
    { id: 'M9',    week: 11, label: 'M9 — MVC: engine ⟂ view ⟂ controller' },
    { id: 'M11',   week: 13, label: 'M11 — perft harness' },
    { id: 'bonus', week: 11, label: 'Bonus — alternative views' },
    { id: 'planned', week: 0, label: 'Planned — AI opponent (design doc only)' },
  ];

  const REPO = 'https://github.com/goleador/CSC413-chess-reference/blob/main/';
  const SRC = REPO + 'src/main/java/edu/sfsu/csc413/chess/';
  const TEST = REPO + 'src/test/java/edu/sfsu/csc413/chess/';

  // Packages. `color` is a slot in the validated categorical palette.
  const GROUPS = [
    { id: 'main',    label: 'edu.sfsu.csc413.chess',  sub: 'entry point',                 color: 5 },
    { id: 'view',    label: 'view',                   sub: 'V and C of MVC',              color: 3 },
    { id: 'swing',   label: 'view.swing',             sub: 'event-driven windows',        color: 3 },
    { id: 'tui',     label: 'view.tui',               sub: 'full-screen terminal',        color: 3 },
    { id: 'engine',  label: 'engine',                 sub: 'the rules; Game is the Facade', color: 2 },
    { id: 'factory', label: 'factory',                sub: 'FEN → objects',               color: 4 },
    { id: 'model',   label: 'model',                  sub: 'depends on nothing',          color: 1 },
    { id: 'test',    label: 'src/test',               sub: 'the specification',           color: 6 },
    { id: 'ai',      label: 'ai (planned)',           sub: 'course/design/ai-opponents.md', color: 7, planned: true },
  ];

  // Column x-positions and row y-positions used below.
  const C = i => i * 250;
  const R = { main: 0, ctrl: 170, views: 420, engine: 680, model: 950, pieces: 1200, tests: 1400 };

  /* kind: class | abstract | interface | sealed | record | enum | final | test */
  const NODES = [
    // ---------------- entry ----------------
    {
      id: 'Main', group: 'main', kind: 'class', x: C(3), y: R.main, milestone: 'M0',
      file: 'Main.java',
      members: ['+ main(String[] args)', '- chooseView(String[]): BoardView'],
      summary: 'Builds the parts and connects them: a Game, a BoardView, and a GameController joining the two. Nothing else.',
      notes: [
        'The view variable is declared as the interface BoardView, so swapping the whole user interface is one expression.',
        'chooseView is a switch on the command-line argument: console, emoji, swing, graphical, tui.',
        'Kept thin on purpose: every line of logic in main is a line that cannot be tested.',
      ],
    },

    // ---------------- view ----------------
    {
      id: 'GameController', group: 'view', kind: 'class', x: C(1.5), y: R.ctrl, milestone: 'M9',
      file: 'view/GameController.java',
      members: ['- game: Game', '- view: BoardView', '- finished: boolean', '+ start()', '+ runLoop()', '+ handle(PlayerAction)', '- tryMove(String)', '- announceResult()'],
      summary: 'The C in MVC. The only class that knows both the Game and the BoardView; it holds no game state of its own.',
      notes: [
        'runLoop() is the ask-tell-redraw loop for views that can wait for input. Event-driven views never call it.',
        'handle(PlayerAction) is the single funnel: the console loop calls it, and so does a button’s click handler.',
        'The switch over PlayerAction has no default branch; the sealed interface makes the compiler check every case.',
        'Mentions no Scanner, no System.out, no window, and none of the words "undo", "moves", "quit".',
      ],
    },
    {
      id: 'BoardView', group: 'view', kind: 'interface', x: C(3), y: R.ctrl, milestone: 'M9',
      file: 'view/BoardView.java',
      members: ['+ render(Game)', '+ showMessage(String)', '+ start(GameController)', '+ nextAction(Game) «default»', '+ promotionChoice(Game) «default»', '+ close() «default»'],
      summary: 'Anything that can display a game and collect the player’s decisions. The V in MVC.',
      notes: [
        'start(controller) hands control to the view: a console calls controller.runLoop(); a window shows itself and returns.',
        '"A console view is happy to be asked; a window has to be told."',
        'nextAction has a default that throws UnsupportedOperationException, so an event-driven view that is wrongly asked fails loudly instead of freezing.',
        'promotionChoice defaults to QUEEN; only views that can ask override it.',
      ],
    },
    {
      id: 'PlayerAction', group: 'view', kind: 'sealed', x: C(4.5), y: R.ctrl, milestone: 'M9',
      file: 'view/PlayerAction.java',
      members: ['record Move(String notation)', 'record Undo()', 'record ShowMoves()', 'record Quit()', '+ parse(String): PlayerAction «static»'],
      summary: 'Something the player asked for, independent of how they asked. Typing "undo" and clicking an Undo button build the same value.',
      notes: [
        'sealed: these four are all there is, so the controller’s switch needs no default and a fifth action becomes a compile error until handled.',
        'parse(String) is the only place in the program that knows the words "undo", "moves", and "quit".',
        'Anything unrecognised is an attempted move, so a typo comes back as an illegal move rather than a separate error.',
      ],
    },
    {
      id: 'ConsoleView', group: 'view', kind: 'class', x: C(0), y: R.views, milestone: 'M9',
      file: 'view/ConsoleView.java',
      members: ['- renderer: TextBoardRenderer', '- out: PrintStream', '- in: Scanner', '- perspective: Color', '+ start(c) → c.runLoop()', '+ nextAction(Game)'],
      summary: 'Displays the game as text and reads moves from the keyboard. Never decides legality, never applies a move.',
      notes: [
        'Differs from EmojiView in exactly one expression: the glyph table handed to TextBoardRenderer.',
        'Yes, that is duplication, and it is kept deliberately so the seam can be read side by side. The DRY refactor (one TextView taking a PieceGlyphs) is the exercise.',
        'The second constructor takes PrintStream, Scanner, and Color so tests can drive it without a terminal.',
      ],
    },
    {
      id: 'EmojiView', group: 'view', kind: 'class', x: C(1), y: R.views, milestone: 'bonus',
      file: 'view/EmojiView.java',
      members: ['- renderer = new TextBoardRenderer(FIGURES)', '- out, in, perspective', '+ start(c) → c.runLoop()', '+ nextAction(Game)'],
      summary: 'The same game drawn with Unicode chess figures. A second user interface for one small class and one line in Main.',
      notes: [
        'Pass Color.BLACK and the board is drawn from black’s side: a view decision, made in the view.',
        'GameController does not know this class exists.',
      ],
    },
    {
      id: 'TextBoardRenderer', group: 'view', kind: 'class', x: C(2), y: R.views, milestone: 'M1',
      file: 'view/TextBoardRenderer.java',
      members: ['- glyphs: PieceGlyphs', '+ render(Board): String', '+ render(Board, Color): String'],
      summary: 'Turns a board into lines of text, optionally flipped for the player on the other side.',
      notes: [
        'This code used to live in Board.toString(). Which end is at the top and what an empty square looks like are display decisions, not chess facts.',
        'Flipping inverts both axes; flipping only the ranks is the classic bug (king and queen appear to swap).',
      ],
    },
    {
      id: 'PieceGlyphs', group: 'view', kind: 'interface', x: C(3), y: R.views, milestone: 'M1',
      file: 'view/PieceGlyphs.java',
      members: ['@FunctionalInterface', '+ glyphFor(Piece): String', 'LETTERS = piece -> …', 'FIGURES = piece -> …'],
      summary: 'How a view spells a piece. The one thing a letters board and a figures board disagree about, made swappable.',
      notes: [
        'A functional interface, so each implementation is a lambda.',
        'FIGURES uses chess symbols (U+2654–U+265F), not emoji: they are one terminal column wide so the board stays square.',
      ],
    },

    // ---------------- view.swing ----------------
    {
      id: 'SwingView', group: 'swing', kind: 'class', x: C(4.5), y: R.views, milestone: 'bonus',
      file: 'view/swing/SwingView.java',
      members: ['- controller, game, perspective', '- selected: Position', '- destinations: Set<Position>', '+ start(c) → show window, return', '- squareClicked(Position)', '+ promotionChoice(Game)'],
      summary: 'The same game in a window: sixty-four JButtons. Two clicks make a move. Proves the view seam handles events.',
      notes: [
        'Never implements nextAction and never calls runLoop. Each click handler calls controller.handle(...) directly, so nothing blocks and nothing can deadlock.',
        'An Undo button builds new PlayerAction.Undo() itself; it does not spell out a word for something to parse.',
        'Remembering the controller is separated from showing the window, so tests exercise clicks with no display.',
      ],
    },
    {
      id: 'GraphicalView', group: 'swing', kind: 'class', x: C(5.5), y: R.views, milestone: 'bonus',
      file: 'view/swing/GraphicalView.java',
      members: ['record Geometry(originX, originY, squareSize)', '- frame: JFrame «lazy»', '- dragFrom, dragging', '+ start(c) → show window, return', '- squarePressed / squareReleasedOn', '- attemptMove(from, to)'],
      summary: 'A drawn board with drag-and-drop. One panel owns its pixels instead of asking widgets to draw.',
      notes: [
        'Dragging a piece does not move it. A drag produces exactly what a typed "e2e4" produces: a PlayerAction.Move handed to the controller.',
        'Geometry is a record computed from width and height alone, so every coordinate test runs without a window.',
        'The JFrame is built lazily so the class can be constructed on a headless machine.',
      ],
    },
    {
      id: 'PieceArtist', group: 'swing', kind: 'final', x: C(6.5), y: R.views, milestone: 'bonus',
      file: 'view/swing/PieceArtist.java',
      members: ['- SHAPES: EnumMap<PieceType, Shape>', '+ shapeFor(PieceType): Shape', '+ paint(Graphics2D, Piece, x, y, size)'],
      summary: 'Draws the six pieces as vector outlines built once in a unit square and scaled with an AffineTransform.',
      notes: [
        'shapeFor returns pure geometry and never touches Graphics2D, so it is testable without a display; paint is the thin part that needs a screen.',
        'An EnumMap keyed by PieceType rather than an array indexed by ordinal(): reordering the enum cannot silently draw rooks as bishops.',
      ],
    },

    // ---------------- view.tui ----------------
    {
      id: 'TerminalView', group: 'tui', kind: 'class', x: C(7.5), y: R.views, milestone: 'bonus',
      file: 'view/tui/TerminalView.java',
      members: ['record Geometry(originColumn, originRow, …)', '- screen: Screen «Lanterna, lazy»', '- cursor, selected, destinations', '+ start(c) → try { c.runLoop() } finally', '+ nextAction(Game) reads keys', '+ promotionChoice(Game)'],
      summary: 'A pull view with the window’s experience: cursor, highlighted destinations, flippable board, drawn in the terminal with Lanterna.',
      notes: [
        'Where GraphicalView calls controller.handle(new PlayerAction.Move(…)), this view returns the same value from nextAction. Same value, opposite direction of call.',
        'The only class that imports Lanterna, so the dependency stays behind the view seam; maven-shade folds it into the jar.',
        'Terminal cells are twice as tall as wide, so a square n rows tall is 2n columns wide.',
      ],
    },

    // ---------------- engine ----------------
    {
      id: 'GameStatus', group: 'engine', kind: 'enum', x: C(1.5), y: R.engine, milestone: 'M5',
      file: 'engine/GameStatus.java',
      members: ['IN_PROGRESS', 'CHECK', 'CHECKMATE', 'STALEMATE', '+ isGameOver(): boolean'],
      summary: 'How a game currently stands for the side to move.',
      notes: [
        'Check is not terminal; checkmate and stalemate are. The only difference between those two is whether the side to move is in check.',
      ],
    },
    {
      id: 'Game', group: 'engine', kind: 'class', x: C(3), y: R.engine, milestone: 'M3',
      file: 'engine/Game.java',
      members: ['- board: Board', '- history: List<Move>', '- sideToMove: Color', '+ legalMoves(): List<Move>', '+ status(): GameStatus', '+ findLegalMove(String): Optional<Move>', '+ play(Move)', '+ undoLastMove(): Optional<Move>'],
      summary: 'One game: the board, whose turn it is, and the moves played so far. The Facade everything outside the engine talks to.',
      notes: [
        'The view never touches MoveGenerator and never applies a move to a Board directly. That single rule lets the console be swapped for a window without changing a line of the rules.',
        'play() throws IllegalArgumentException on an illegal move: a programming error, since callers choose from legalMoves().',
        'findLegalMove returns Optional because "no such move" is an ordinary outcome, not an error.',
        'undoLastMove costs almost nothing because Move already records what was captured.',
      ],
    },
    {
      id: 'MoveGenerator', group: 'engine', kind: 'final', x: C(4.5), y: R.engine, milestone: 'M4',
      file: 'engine/MoveGenerator.java',
      members: ['«static utility»', '+ legalMoves(Board, Color)', '+ pseudoLegalMoves(Board, Color)', '+ isInCheck(Board, Color)', '+ isAttacked(Board, Position, Color)', '+ status(Board, Color): GameStatus'],
      summary: 'Turns the pieces’ pseudo-legal moves into legal ones by adding the one rule no piece can enforce alone: you may not leave your own king attacked.',
      notes: [
        'Works by filtering: apply each candidate, ask isInCheck, undo it. Trying for real and taking back is why Board supports undo.',
        'pseudoLegalMoves never asks what kind of piece it is looking at; it asks each piece for its own moves. Adding a piece type changes nothing here.',
        'isAttacked asks about attacks, not moves, and the difference is the pawn.',
      ],
    },

    // ---------------- factory ----------------
    {
      id: 'BoardFactory', group: 'factory', kind: 'final', x: C(6.5), y: R.engine, milestone: 'M2',
      file: 'factory/BoardFactory.java',
      members: ['+ START_FEN: String', '+ standard(): Board', '+ empty(): Board', '+ fromFen(String): Board'],
      summary: 'Builds boards: the standard opening or any position described in FEN. Given to students at M2, studied at M7.',
      notes: [
        'Keeping setup out of Board’s constructor keeps Board a grid, and lets tests construct exactly the position a rule needs.',
        'Only the placement field of FEN is read here; side to move and castling rights belong to Game.',
      ],
    },
    {
      id: 'PieceFactory', group: 'factory', kind: 'final', x: C(7.5), y: R.engine, milestone: 'M2',
      file: 'factory/PieceFactory.java',
      members: ['+ create(PieceType, Color): Piece', '+ fromSymbol(char): Piece'],
      summary: 'Creates pieces from a type and color, or from a FEN letter. Concentrates "which constructor do I call?" at the data boundary.',
      notes: [
        'The engine never needs to know that Queen has a constructor at all.',
        'The switch has no default, so a seventh PieceType breaks the build here. Board.createPromoted duplicates four arms of it; see that method for why the duplication is accepted.',
      ],
    },

    // ---------------- model ----------------
    {
      id: 'Color', group: 'model', kind: 'enum', x: C(0), y: R.model, milestone: 'M0b',
      file: 'model/Color.java',
      members: ['WHITE, BLACK', '+ opposite(): Color', '+ pawnDirection(): int', '+ pawnStartRank(): int', '+ promotionRank(): int'],
      summary: 'The two sides. An enum rather than a boolean so meaningless values are rejected by the compiler.',
      notes: ['Carries the side-specific facts pawns need, so Pawn never says "if white then +1".'],
    },
    {
      id: 'PieceType', group: 'model', kind: 'enum', x: C(1), y: R.model, milestone: 'M1',
      file: 'model/PieceType.java',
      members: ['PAWN(\'P\') … KING(\'K\')', '- symbol: char', '+ symbol(): char', '+ fromSymbol(char): PieceType «static»'],
      summary: 'The six kinds of piece, for display and notation. Not how we decide how a piece moves.',
      notes: ['Exists for FEN letters, glyphs, promotion choices. Movement belongs to the Piece subclasses so nothing switches on this to move a piece.'],
    },
    {
      id: 'Position', group: 'model', kind: 'record', x: C(2), y: R.model, milestone: 'M0b',
      file: 'model/Position.java',
      members: ['(int file, int rank)', '+ BOARD_SIZE = 8', '+ isOnBoard(f, r) «static»', '+ parse(String) «static»', '+ offsetOrNull(df, dr): Position'],
      summary: 'A square’s coordinates, 0-based. A record because a position is a pure value.',
      notes: [
        'The compact constructor throws on off-board coordinates, so an invalid Position can never exist.',
        'offsetOrNull returns null deliberately and locally: move generation walks outward until it leaves the board, and a null check reads better there than an exception.',
      ],
    },
    {
      id: 'Move', group: 'model', kind: 'record', x: C(3), y: R.model, milestone: 'M2',
      file: 'model/Move.java',
      members: ['(from, to, moved, captured, promotesTo)', '+ quiet(from, to, moved) «static»', '+ capture(…) «static»', '+ promotion(…) «static»', '+ isCapture() / isPromotion()'],
      summary: 'Which piece went where and what happened. Records enough to be undone: captured is stored because the board forgets it once the move is applied.',
      notes: [
        'Becomes the payload of the Command pattern in Week 10; captured is exactly what makes undo() possible.',
        'Use the static factories rather than the canonical constructor; they document intent at the call site.',
        'toString() is long algebraic notation ("e2e4", "e7e8q"), which is what the console reads and writes.',
      ],
    },
    {
      id: 'Board', group: 'model', kind: 'class', x: C(4.5), y: R.model, milestone: 'M1',
      file: 'model/Board.java',
      members: ['- squares: Piece[8][8]', '+ pieceAt(Position): Piece', '+ place(Position, Piece)', '+ apply(Move)', '+ undo(Move)', '+ positionsOf(Color): List<Position>', '+ kingPosition(Color): Position', '- createPromoted(PieceType, Color)'],
      summary: 'The 8×8 grid and the pieces on it. Knows where pieces are and how to move one; not whose turn it is or whether a move is legal.',
      notes: [
        'Mutable by design: move generation explores hundreds of thousands of positions, and apply/undo keeps that affordable.',
        'apply() performs no legality checking; it trusts that the caller chose from MoveGenerator.',
        'createPromoted duplicates four arms of PieceFactory.create. Calling the factory would make model import factory, an arrow pointing backwards through the layers. Four duplicated lines are the smaller price.',
        'toString() is a FEN dump for debugging only; drawing the board is TextBoardRenderer’s job.',
      ],
    },
    {
      id: 'Piece', group: 'model', kind: 'abstract', x: C(6.5), y: R.model, milestone: 'M1',
      file: 'model/Piece.java',
      members: ['- color: Color', '- type: PieceType', '+ pseudoLegalMoves(Board, Position) «abstract»', '+ attacks(Board, from, target)', '# slidingMoves(board, from, int[][])', '# steppingMoves(board, from, int[][])', '+ symbol(): char'],
      summary: 'A chess piece: the abstraction the engine talks to. The whole design turns on one abstract method.',
      notes: [
        'The Board never asks a piece what kind it is; it asks for its moves and lets the subclass answer. That is why there is no giant switch on PieceType anywhere.',
        'Immutable, and does not know where it stands. The Board knows that and passes the square in.',
        'Sliders (bishop, rook, queen) and steppers (knight, king) share one protected helper each rather than an intermediate SlidingPiece class, which would spend the single inheritance slot on an implementation detail.',
        'attacks() is a hook with a default: it consults pseudoLegalMoves. Only Pawn overrides it.',
      ],
    },

    // ---------------- pieces ----------------
    {
      id: 'Pawn', group: 'model', kind: 'class', x: C(2.5), y: R.pieces, milestone: 'M2',
      file: 'model/Pawn.java',
      members: ['- PROMOTION_CHOICES: PieceType[]', '+ pseudoLegalMoves(…)', '+ attacks(…) «override»', '- addAdvance(…)'],
      summary: 'The piece that breaks every rule the others follow, and all of that awkwardness is contained in this one file.',
      notes: [
        'Overrides attacks() because a pawn captures diagonally but advances straight ahead: the one place where attacks and moves differ, and it matters for king safety.',
        'Promotion generates all four choices as separate Moves.',
        'En passant waits for Week 15, when Game owns the history it depends on.',
      ],
    },
    {
      id: 'Knight', group: 'model', kind: 'class', x: C(3.5), y: R.pieces, milestone: 'M2',
      file: 'model/Knight.java',
      members: ['- OFFSETS: int[8][2]', '+ pseudoLegalMoves → steppingMoves'],
      summary: 'Two along one axis, one along the other, jumping over anything. The only piece that ignores blockers, yet it needs no special case anywhere else.',
      notes: [],
    },
    {
      id: 'Bishop', group: 'model', kind: 'class', x: C(4.5), y: R.pieces, milestone: 'M2',
      file: 'model/Bishop.java',
      members: ['- DIRECTIONS: int[4][2]', '+ pseudoLegalMoves → slidingMoves'],
      summary: 'Slides any distance along the four diagonals.',
      notes: [],
    },
    {
      id: 'Rook', group: 'model', kind: 'class', x: C(5.5), y: R.pieces, milestone: 'M2',
      file: 'model/Rook.java',
      members: ['- DIRECTIONS: int[4][2]', '+ pseudoLegalMoves → slidingMoves'],
      summary: 'Slides any distance along ranks and files.',
      notes: [],
    },
    {
      id: 'Queen', group: 'model', kind: 'class', x: C(6.5), y: R.pieces, milestone: 'M2',
      file: 'model/Queen.java',
      members: ['- DIRECTIONS: int[8][2]', '+ pseudoLegalMoves → slidingMoves'],
      summary: 'Rook and bishop combined. Java’s single inheritance will not let it extend both, and borrowing their tables was tried and reverted.',
      notes: [
        'An earlier version derived its directions from Rook.DIRECTIONS and Bishop.DIRECTIONS. It forced both siblings to loosen private to package-private, shared mutable arrays, and made a reader open two files to learn how a queen moves.',
        'Eight literal pairs cost less than that coupling. That is the judgement DRY actually asks for.',
      ],
    },
    {
      id: 'King', group: 'model', kind: 'class', x: C(7.5), y: R.pieces, milestone: 'M2',
      file: 'model/King.java',
      members: ['- OFFSETS: int[8][2]', '+ pseudoLegalMoves → steppingMoves'],
      summary: 'One square in any direction. Deliberately incomplete: castling depends on history and king safety, which arrive in Week 15.',
      notes: ['That castling will require almost no change to this class is the open/closed principle paying off.'],
    },

    // ---------------- tests ----------------
    {
      id: 'PerftTest', group: 'test', kind: 'test', x: C(4.5), y: R.tests, milestone: 'M11',
      file: 'engine/PerftTest.java', test: true,
      members: ['- perft(Board, Color, depth): long', '@ParameterizedTest start position: 20, 400, 8 902, 197 281', '@ParameterizedTest Kiwipete: 46, 1 865'],
      summary: 'Counts leaf nodes of the move tree to a depth and compares with published exact counts. Any bug in generation, king safety, or apply/undo shows up as a wrong number.',
      notes: [
        'If depth 1 passes and depth 2 fails, the problem is in apply/undo, not generation.',
        'Kiwipete is short by exactly White’s two castling moves at depth 1 and by 174 at depth 2: errors compound with depth.',
      ],
    },
    {
      id: 'MoveGeneratorTest', group: 'test', kind: 'test', x: C(5.5), y: R.tests, milestone: 'M5',
      file: 'engine/MoveGeneratorTest.java', test: true,
      members: ['7 tests: pins, check, mate, stalemate'],
      summary: 'Pins, check detection, checkmate (Fool’s Mate) and stalemate, each built from a FEN position.',
      notes: [],
    },
    {
      id: 'GameTest', group: 'test', kind: 'test', x: C(3), y: R.tests, milestone: 'M3',
      file: 'engine/GameTest.java', test: true,
      members: ['8 tests: turn order, play, undo, history'],
      summary: 'Drives the Facade: turns alternate, illegal moves are rejected, undo restores captured pieces.',
      notes: [],
    },
    {
      id: 'PieceMovementTest', group: 'test', kind: 'test', x: C(6.5), y: R.tests, milestone: 'M2',
      file: 'model/PieceMovementTest.java', test: true,
      members: ['10 tests, one family per piece'],
      summary: 'Each piece’s geometry on an otherwise empty or partly blocked board, built with BoardFactory.',
      notes: ['This is the M2 specification: students make these pass by writing the six subclasses.'],
    },
    {
      id: 'GameControllerTest', group: 'test', kind: 'test', x: C(1.5), y: R.tests, milestone: 'M9',
      file: 'view/GameControllerTest.java', test: true,
      members: ['class RecordingView implements BoardView', '11 tests: Fool’s Mate to checkmate, undo, quit, promotion'],
      summary: 'Plays a full game to checkmate through a RecordingView that never prints and never reads a keyboard.',
      notes: ['If a fake view can be substituted in a test, a real one can be substituted in Main. This is the proof that the view seam is real.'],
    },
    {
      id: 'TerminalViewTest', group: 'test', kind: 'test', x: C(7.5), y: R.tests, milestone: 'bonus',
      file: 'view/tui/TerminalViewTest.java', test: true,
      members: ['39 tests via a Lanterna virtual terminal'],
      summary: 'Queues arrow keys and Enter into a virtual terminal, plays Fool’s Mate, and reads the drawn cells back.',
      notes: [],
    },

    // ---------------- planned AI (Strategy) ----------------
    {
      id: 'MoveChooser', group: 'ai', kind: 'interface', x: C(9.3), y: R.ctrl, milestone: 'planned', planned: true,
      file: 'course/design/ai-opponents.md', doc: true,
      members: ['+ choose(Game): Move'],
      summary: 'Planned: something that picks one move for the side to move. The Strategy the bonus AI track is built around.',
      notes: ['Design document only; not in the source tree yet. Every tier of opponent is one class implementing this.'],
    },
    {
      id: 'RandomChooser', group: 'ai', kind: 'class', x: C(8.8), y: R.views, milestone: 'planned', planned: true,
      file: 'course/design/ai-opponents.md', doc: true,
      members: ['- random: Random «injected»', '+ choose(Game): Move'],
      summary: 'Planned tier 0: any legal move. Proves the seam works end to end; the injected Random makes it deterministic in tests.',
      notes: [],
    },
    {
      id: 'MinimaxChooser', group: 'ai', kind: 'class', x: C(9.8), y: R.views, milestone: 'planned', planned: true,
      file: 'course/design/ai-opponents.md', doc: true,
      members: ['- depth: int', '- evaluator: Evaluator', '+ choose(Game): Move'],
      summary: 'Planned tier 2: negamax with alpha-beta, reusing Game.play / undoLastMove exactly as perft does.',
      notes: [],
    },
    {
      id: 'Evaluator', group: 'ai', kind: 'interface', x: C(9.3), y: R.engine, milestone: 'planned', planned: true,
      file: 'course/design/ai-opponents.md', doc: true,
      members: ['+ evaluate(Game, Color): int', 'MaterialEvaluator implements it'],
      summary: 'Planned: a second Strategy, scoring a position so a search can compare leaves.',
      notes: [],
    },
  ];

  /* kind: extends | implements | has | uses | creates | tests
     minor edges are hidden until "all dependencies" is on or an endpoint is selected. */
  const EDGES = [
    // inheritance
    { from: 'Pawn',   to: 'Piece', kind: 'extends' },
    { from: 'Knight', to: 'Piece', kind: 'extends' },
    { from: 'Bishop', to: 'Piece', kind: 'extends' },
    { from: 'Rook',   to: 'Piece', kind: 'extends' },
    { from: 'Queen',  to: 'Piece', kind: 'extends' },
    { from: 'King',   to: 'Piece', kind: 'extends' },

    // interface realisation
    { from: 'ConsoleView',   to: 'BoardView', kind: 'implements' },
    { from: 'EmojiView',     to: 'BoardView', kind: 'implements' },
    { from: 'SwingView',     to: 'BoardView', kind: 'implements' },
    { from: 'GraphicalView', to: 'BoardView', kind: 'implements' },
    { from: 'TerminalView',  to: 'BoardView', kind: 'implements' },
    { from: 'RandomChooser',  to: 'MoveChooser', kind: 'implements' },
    { from: 'MinimaxChooser', to: 'MoveChooser', kind: 'implements' },

    // composition (has-a)
    { from: 'Main',           to: 'GameController', kind: 'creates', label: 'wires' },
    { from: 'Main',           to: 'Game',           kind: 'creates' },
    { from: 'Main',           to: 'BoardView',      kind: 'uses', label: 'declares view as' },
    { from: 'Main',           to: 'ConsoleView',    kind: 'creates', minor: true },
    { from: 'Main',           to: 'EmojiView',      kind: 'creates', minor: true },
    { from: 'Main',           to: 'SwingView',      kind: 'creates', minor: true },
    { from: 'Main',           to: 'GraphicalView',  kind: 'creates', minor: true },
    { from: 'Main',           to: 'TerminalView',   kind: 'creates', minor: true },
    { from: 'GameController', to: 'Game',           kind: 'has' },
    { from: 'GameController', to: 'BoardView',      kind: 'has' },
    { from: 'GameController', to: 'PlayerAction',   kind: 'uses', label: 'switch, no default' },
    { from: 'GameController', to: 'GameStatus',     kind: 'uses', minor: true },
    { from: 'GameController', to: 'Move',           kind: 'uses', minor: true },
    { from: 'BoardView',      to: 'Game',           kind: 'uses', label: 'render(Game)' },
    { from: 'BoardView',      to: 'GameController', kind: 'uses', label: 'start(controller)' },
    { from: 'BoardView',      to: 'PlayerAction',   kind: 'uses', label: 'nextAction()' },
    { from: 'Game',           to: 'Board',          kind: 'has' },
    { from: 'Game',           to: 'Move',           kind: 'has', label: 'history' },
    { from: 'Game',           to: 'MoveGenerator',  kind: 'uses' },
    { from: 'Game',           to: 'BoardFactory',   kind: 'uses', label: 'standard()' },
    { from: 'Game',           to: 'GameStatus',     kind: 'uses' },
    { from: 'Game',           to: 'Color',          kind: 'uses', minor: true },
    { from: 'MoveGenerator',  to: 'Board',          kind: 'uses', label: 'apply / undo' },
    { from: 'MoveGenerator',  to: 'Piece',          kind: 'uses', label: 'pseudoLegalMoves, attacks' },
    { from: 'MoveGenerator',  to: 'GameStatus',     kind: 'creates', minor: true },
    { from: 'MoveGenerator',  to: 'Move',           kind: 'uses', minor: true },
    { from: 'MoveGenerator',  to: 'Position',       kind: 'uses', minor: true },
    { from: 'Board',          to: 'Piece',          kind: 'has', label: '[8][8]' },
    { from: 'Board',          to: 'Move',           kind: 'uses', minor: true },
    { from: 'Board',          to: 'Position',       kind: 'uses', minor: true },
    { from: 'Board',          to: 'Queen',          kind: 'creates', label: 'createPromoted (dup.)', minor: true },
    { from: 'Board',          to: 'Rook',           kind: 'creates', minor: true },
    { from: 'Board',          to: 'Bishop',         kind: 'creates', minor: true },
    { from: 'Board',          to: 'Knight',         kind: 'creates', minor: true },
    { from: 'Piece',          to: 'Color',          kind: 'has', minor: true },
    { from: 'Piece',          to: 'PieceType',      kind: 'has', minor: true },
    { from: 'Piece',          to: 'Board',          kind: 'uses', label: 'pieceAt', minor: true },
    { from: 'Piece',          to: 'Move',           kind: 'creates', label: 'quiet / capture', minor: true },
    { from: 'Piece',          to: 'Position',       kind: 'uses', minor: true },
    { from: 'Move',           to: 'Position',       kind: 'has', minor: true },
    { from: 'Move',           to: 'Piece',          kind: 'has', minor: true },
    { from: 'Move',           to: 'PieceType',      kind: 'has', minor: true },
    { from: 'Pawn',           to: 'Color',          kind: 'uses', label: 'pawnDirection', minor: true },
    { from: 'Pawn',           to: 'Move',           kind: 'creates', label: 'promotion ×4', minor: true },
    { from: 'PieceType',      to: 'Color',          kind: 'uses', minor: true },
    { from: 'PieceFactory',   to: 'Piece',          kind: 'creates' },
    { from: 'PieceFactory',   to: 'Pawn',           kind: 'creates', minor: true },
    { from: 'PieceFactory',   to: 'Knight',         kind: 'creates', minor: true },
    { from: 'PieceFactory',   to: 'Bishop',         kind: 'creates', minor: true },
    { from: 'PieceFactory',   to: 'Rook',           kind: 'creates', minor: true },
    { from: 'PieceFactory',   to: 'Queen',          kind: 'creates', minor: true },
    { from: 'PieceFactory',   to: 'King',           kind: 'creates', minor: true },
    { from: 'PieceFactory',   to: 'PieceType',      kind: 'uses', label: 'fromSymbol', minor: true },
    { from: 'BoardFactory',   to: 'Board',          kind: 'creates' },
    { from: 'BoardFactory',   to: 'PieceFactory',   kind: 'uses' },
    { from: 'BoardFactory',   to: 'Position',       kind: 'uses', minor: true },
    { from: 'ConsoleView',    to: 'TextBoardRenderer', kind: 'has' },
    { from: 'EmojiView',      to: 'TextBoardRenderer', kind: 'has' },
    { from: 'ConsoleView',    to: 'PieceGlyphs',    kind: 'uses', label: 'LETTERS', minor: true },
    { from: 'EmojiView',      to: 'PieceGlyphs',    kind: 'uses', label: 'FIGURES', minor: true },
    { from: 'ConsoleView',    to: 'GameController', kind: 'uses', label: 'runLoop()', minor: true },
    { from: 'EmojiView',      to: 'GameController', kind: 'uses', label: 'runLoop()', minor: true },
    { from: 'ConsoleView',    to: 'PlayerAction',   kind: 'creates', label: 'parse', minor: true },
    { from: 'EmojiView',      to: 'PlayerAction',   kind: 'creates', label: 'parse', minor: true },
    { from: 'ConsoleView',    to: 'Game',           kind: 'uses', minor: true },
    { from: 'EmojiView',      to: 'Game',           kind: 'uses', minor: true },
    { from: 'TextBoardRenderer', to: 'PieceGlyphs', kind: 'has' },
    { from: 'TextBoardRenderer', to: 'Board',       kind: 'uses' },
    { from: 'TextBoardRenderer', to: 'Position',    kind: 'uses', minor: true },
    { from: 'PieceGlyphs',    to: 'Piece',          kind: 'uses', minor: true },
    { from: 'SwingView',      to: 'GameController', kind: 'uses', label: 'handle()' },
    { from: 'SwingView',      to: 'PlayerAction',   kind: 'creates', label: 'new Undo()', minor: true },
    { from: 'SwingView',      to: 'Game',           kind: 'uses', label: 'legalMoves()', minor: true },
    { from: 'GraphicalView',  to: 'GameController', kind: 'uses', label: 'handle()' },
    { from: 'GraphicalView',  to: 'PieceArtist',    kind: 'uses' },
    { from: 'GraphicalView',  to: 'PlayerAction',   kind: 'creates', label: 'new Move("e2e4")', minor: true },
    { from: 'GraphicalView',  to: 'Game',           kind: 'uses', minor: true },
    { from: 'PieceArtist',    to: 'PieceType',      kind: 'uses', label: 'EnumMap key', minor: true },
    { from: 'PieceArtist',    to: 'Piece',          kind: 'uses', minor: true },
    { from: 'TerminalView',   to: 'GameController', kind: 'uses', label: 'runLoop()' },
    { from: 'TerminalView',   to: 'PlayerAction',   kind: 'creates', label: 'returns Move', minor: true },
    { from: 'TerminalView',   to: 'Game',           kind: 'uses', minor: true },
    { from: 'TerminalView',   to: 'GameStatus',     kind: 'uses', minor: true },
    { from: 'MoveChooser',    to: 'Game',           kind: 'uses', label: 'legalMoves()' },
    { from: 'MinimaxChooser', to: 'Evaluator',      kind: 'has' },
    { from: 'MinimaxChooser', to: 'Game',           kind: 'uses', label: 'play / undo', minor: true },

    // tests
    { from: 'PerftTest',          to: 'MoveGenerator',  kind: 'tests' },
    { from: 'PerftTest',          to: 'Board',          kind: 'tests', label: 'apply / undo', minor: true },
    { from: 'MoveGeneratorTest',  to: 'MoveGenerator',  kind: 'tests' },
    { from: 'GameTest',           to: 'Game',           kind: 'tests' },
    { from: 'PieceMovementTest',  to: 'Piece',          kind: 'tests' },
    { from: 'PieceMovementTest',  to: 'BoardFactory',   kind: 'uses', label: 'fromFen', minor: true },
    { from: 'GameControllerTest', to: 'GameController', kind: 'tests' },
    { from: 'GameControllerTest', to: 'BoardView',      kind: 'implements', label: 'RecordingView' },
    { from: 'TerminalViewTest',   to: 'TerminalView',   kind: 'tests' },
  ];

  const CATEGORIES = [
    { id: 'oop',        label: 'OOP fundamentals',   color: 1 },
    { id: 'java',       label: 'Java features',      color: 3 },
    { id: 'principles', label: 'Design principles',  color: 2 },
    { id: 'patterns',   label: 'Design patterns',    color: 7 },
    { id: 'arch',       label: 'Architecture',       color: 5 },
    { id: 'testing',    label: 'Testing',            color: 6 },
  ];

  /* nodes: ids, or { id, note } for a per-node remark.
     edges: "From>To" pairs to emphasise (added even if minor). */
  const CONCEPTS = [
    // ---------- OOP fundamentals ----------
    {
      id: 'encapsulation', cat: 'oop', label: 'Encapsulation', week: 4, milestone: 'M1',
      blurb: 'State is private and reached only through a narrow, named API, so an object can guarantee its own invariants. Board owns its grid; Position refuses to exist off the board.',
      nodes: [
        { id: 'Board', note: 'squares[][] is private; the API is pieceAt, place, apply, undo. Nothing outside can corrupt the grid.' },
        { id: 'Position', note: 'The compact constructor validates before the fields are assigned, so an invalid Position cannot exist.' },
        { id: 'Piece', note: 'color and type are private and final, read through accessors.' },
        { id: 'GameController', note: 'finished is private; the only way to end the game is through handle(Quit).' },
      ],
      edges: [],
    },
    {
      id: 'composition', cat: 'oop', label: 'Composition (has-a)', week: 4, milestone: 'M1',
      blurb: 'Objects built from other objects, connected by fields rather than inheritance. Follow the diamond-headed edges: each is a "has a" relationship.',
      nodes: [
        { id: 'Game', note: 'has a Board, a List<Move> history, and a Color sideToMove.' },
        { id: 'GameController', note: 'has a Game and a BoardView, and nothing else.' },
        { id: 'Board', note: 'has a Piece[8][8].' },
        { id: 'ConsoleView', note: 'has a TextBoardRenderer.' },
        { id: 'TextBoardRenderer', note: 'has a PieceGlyphs, which is what makes the glyphs swappable.' },
        'Move', 'Piece',
      ],
      edges: ['Game>Board', 'Game>Move', 'GameController>Game', 'GameController>BoardView', 'Board>Piece', 'ConsoleView>TextBoardRenderer', 'TextBoardRenderer>PieceGlyphs', 'Piece>Color', 'Piece>PieceType', 'Move>Position', 'Move>Piece'],
    },
    {
      id: 'inheritance', cat: 'oop', label: 'Inheritance', week: 4, milestone: 'M2',
      blurb: 'Six subclasses share the state and helpers of one abstract base. The base spends the single inheritance slot on what a piece is, and shares slidingMoves / steppingMoves as protected helpers instead of an intermediate SlidingPiece class.',
      nodes: [
        { id: 'Piece', note: 'Abstract base: color, type, the abstract pseudoLegalMoves, and two protected movement helpers.' },
        { id: 'Pawn', note: 'Overrides two methods; the only subclass that does.' },
        'Knight', 'Bishop', 'Rook', 'Queen', 'King',
      ],
      edges: ['Pawn>Piece', 'Knight>Piece', 'Bishop>Piece', 'Rook>Piece', 'Queen>Piece', 'King>Piece'],
    },
    {
      id: 'polymorphism', cat: 'oop', label: 'Polymorphism', week: 4, milestone: 'M2',
      blurb: 'Callers talk to the abstraction and the runtime picks the implementation. MoveGenerator asks every piece for its moves without knowing what kind it is; GameController drives any BoardView without knowing whether it is a console or a window.',
      nodes: [
        { id: 'MoveGenerator', note: 'board.pieceAt(from).pseudoLegalMoves(board, from): the call site has no idea which subclass answers.' },
        { id: 'Piece', note: 'pseudoLegalMoves is abstract; attacks() has a default that Pawn overrides.' },
        'Pawn', 'Knight', 'Bishop', 'Rook', 'Queen', 'King',
        { id: 'GameController', note: 'view.render(game) and view.nextAction(game) dispatch to whichever view Main chose.' },
        'BoardView',
      ],
      edges: ['MoveGenerator>Piece', 'GameController>BoardView', 'Pawn>Piece', 'Knight>Piece', 'Bishop>Piece', 'Rook>Piece', 'Queen>Piece', 'King>Piece'],
    },
    {
      id: 'abstraction', cat: 'oop', label: 'Abstract classes vs interfaces', week: 4, milestone: 'M2',
      blurb: 'Three kinds of abstraction, each chosen for a reason. Piece is an abstract class because subclasses share state and helper code. BoardView is an interface because a view is a capability, and default methods let each view take only what it needs. PieceGlyphs is a functional interface because it is one method.',
      nodes: [
        { id: 'Piece', note: 'Abstract class: shared fields plus protected helpers.' },
        { id: 'BoardView', note: 'Interface with three abstract methods and three defaults.' },
        { id: 'PieceGlyphs', note: '@FunctionalInterface: implemented by lambdas.' },
        { id: 'PlayerAction', note: 'Sealed interface: a closed family of records.' },
        { id: 'MoveChooser', note: 'Planned interface for the AI track.' },
      ],
      edges: [],
    },
    {
      id: 'immutability', cat: 'oop', label: 'Immutability & value objects', week: 2, milestone: 'M0b',
      blurb: 'Position and Move are records: pure values that never change, so they can sit safely in sets, maps, and a history list. Piece is immutable and does not even know where it stands. Board is the deliberate exception, mutable because apply/undo is far cheaper than copying.',
      nodes: [
        { id: 'Position', note: 'A record. equals, hashCode and toString come free.' },
        { id: 'Move', note: 'A record that carries the captured piece so it can be undone.' },
        { id: 'Piece', note: 'Immutable; the Board tracks where it is, so the fact lives in one place.' },
        { id: 'Board', note: 'Mutable by design. See the class comment for the trade.' },
        { id: 'Color', note: 'Enum constants are immutable singletons.' },
      ],
      edges: [],
    },

    // ---------- Java features ----------
    {
      id: 'enums', cat: 'java', label: 'Enums with behaviour', week: 2, milestone: 'M0b',
      blurb: 'An enum is a closed set of named values the compiler can check for exhaustiveness, and it can carry fields and methods. Color knows which way its pawns go; PieceType knows its letter; GameStatus knows whether the game is over.',
      nodes: [
        { id: 'Color', note: 'opposite(), pawnDirection(), pawnStartRank(), promotionRank().' },
        { id: 'PieceType', note: 'A char field per constant plus fromSymbol(char).' },
        { id: 'GameStatus', note: 'isGameOver() distinguishes CHECK from CHECKMATE and STALEMATE.' },
      ],
      edges: [],
    },
    {
      id: 'records', cat: 'java', label: 'Records', week: 2, milestone: 'M0b',
      blurb: 'A record declares a value type in one line. Compact constructors validate; static factories name the intent; nested records make PlayerAction’s four cases almost free.',
      nodes: [
        { id: 'Position', note: 'Compact constructor rejects off-board squares.' },
        { id: 'Move', note: 'Five components, three static factories.' },
        { id: 'PlayerAction', note: 'Four nested records: Move, Undo, ShowMoves, Quit.' },
        { id: 'GraphicalView', note: 'record Geometry: a value computed from width and height and nothing else.' },
        { id: 'TerminalView', note: 'Its own record Geometry, for terminal cells.' },
      ],
      edges: [],
    },
    {
      id: 'sealed', cat: 'java', label: 'Sealed types & exhaustive switch', week: 11, milestone: 'M9',
      blurb: 'A sealed interface closes the family, so a switch over it needs no default branch and the compiler refuses to build when a case is missing. Adding a fifth PlayerAction becomes a build error, not a bug a player finds.',
      nodes: [
        { id: 'PlayerAction', note: 'sealed interface with four permitted records.' },
        { id: 'GameController', note: 'handle() switches with pattern matching and no default.' },
        { id: 'PieceFactory', note: 'The same idea on an enum: create() has no default, so a seventh PieceType fails here.' },
        { id: 'Board', note: 'createPromoted throws on PAWN and KING instead, which is why its duplication is a risk.' },
      ],
      edges: ['GameController>PlayerAction'],
    },
    {
      id: 'defaults', cat: 'java', label: 'Interface default methods', week: 11, milestone: 'M9',
      blurb: 'A default method lets an interface grow without forcing every implementer to change. BoardView uses three: a throwing nextAction for event-driven views, a QUEEN promotionChoice for views that cannot ask, and a no-op close.',
      nodes: [
        { id: 'BoardView', note: 'nextAction, promotionChoice and close are defaults.' },
        { id: 'SwingView', note: 'Never implements nextAction; overrides promotionChoice with a dialog.' },
        { id: 'ConsoleView', note: 'Implements nextAction; inherits promotionChoice (queen).' },
        { id: 'TerminalView', note: 'Implements nextAction and overrides promotionChoice to read one key.' },
      ],
      edges: ['SwingView>BoardView', 'ConsoleView>BoardView', 'TerminalView>BoardView'],
    },
    {
      id: 'lambdas', cat: 'java', label: 'Functional interfaces & lambdas', week: 5, milestone: 'M1',
      blurb: 'When an abstraction is a single method, a lambda is the implementation. PieceGlyphs.LETTERS and FIGURES are two lambdas stored as constants on the interface itself.',
      nodes: [
        { id: 'PieceGlyphs', note: 'LETTERS = piece -> …; FIGURES = piece -> { switch … }.' },
        { id: 'TextBoardRenderer', note: 'Takes a PieceGlyphs and calls glyphFor(piece) per square.' },
        { id: 'Game', note: 'findLegalMove uses a stream with a lambda filter.' },
        { id: 'SwingView', note: 'One click listener per button, the square captured in the lambda.' },
      ],
      edges: ['TextBoardRenderer>PieceGlyphs', 'ConsoleView>PieceGlyphs', 'EmojiView>PieceGlyphs'],
    },
    {
      id: 'optional', cat: 'java', label: 'Optional, null, and exceptions', week: 5, milestone: 'M3',
      blurb: 'Three ways to say "nothing here", each used where it fits. Optional when absence is an ordinary outcome the caller must handle. A local null where a check reads better than an exception. An exception for programming errors that should never happen.',
      nodes: [
        { id: 'Game', note: 'findLegalMove and undoLastMove return Optional<Move>; play() throws on an illegal move.' },
        { id: 'Position', note: 'offsetOrNull returns null on purpose; the constructor throws on bad coordinates.' },
        { id: 'Board', note: 'pieceAt returns null for an empty square; kingPosition tolerates a missing king for partial test positions.' },
        { id: 'BoardView', note: 'Default nextAction throws UnsupportedOperationException so a misuse is seen immediately.' },
        { id: 'BoardFactory', note: 'fromFen throws IllegalArgumentException with a message that says what is wrong.' },
      ],
      edges: [],
    },
    {
      id: 'collections', cat: 'java', label: 'Collections & generics', week: 5, milestone: 'M2',
      blurb: 'Typed collections carry the engine’s data: lists of moves and positions, a set of highlighted squares, an EnumMap of shapes. Game.history() returns List.copyOf so callers cannot mutate the record of the game.',
      nodes: [
        { id: 'Piece', note: 'pseudoLegalMoves returns List<Move>.' },
        { id: 'Board', note: 'positionsOf returns List<Position>.' },
        { id: 'Game', note: 'List<Move> history, exposed as an unmodifiable copy.' },
        { id: 'SwingView', note: 'Set<Position> destinations.' },
        { id: 'PieceArtist', note: 'EnumMap<PieceType, Shape>, safer than an array indexed by ordinal().' },
      ],
      edges: [],
    },

    // ---------- Design principles ----------
    {
      id: 'srp', cat: 'principles', label: 'Single responsibility / separation of concerns', week: 6, milestone: 'M4',
      blurb: 'One reason to change per class. Board knows where pieces are. MoveGenerator knows the one global rule. Game knows whose turn it is and what was played. TextBoardRenderer knows how a board looks. The M4 split made each of those a separate class.',
      nodes: [
        { id: 'Board', note: 'Where pieces are and how to move one. No turns, no legality, no drawing.' },
        { id: 'MoveGenerator', note: 'Legality: filter pseudo-legal moves by king safety.' },
        { id: 'Game', note: 'Turn, history, and the public face of the rules.' },
        { id: 'TextBoardRenderer', note: 'Drawing, moved out of Board.toString().' },
        { id: 'PlayerAction', note: 'parse() is the only place that knows the command words.' },
      ],
      edges: ['Game>Board', 'Game>MoveGenerator', 'MoveGenerator>Board', 'TextBoardRenderer>Board'],
    },
    {
      id: 'ocp', cat: 'principles', label: 'Open/closed principle', week: 6, milestone: 'M2',
      blurb: 'Extend by adding code, not by editing it. A new piece is a new subclass and MoveGenerator does not change. A new user interface is a new class and one line in Main. Castling and en passant are left for Week 15 precisely to show this paying off.',
      nodes: [
        { id: 'Piece', note: 'Add a subclass; nothing that consumes pieces changes.' },
        { id: 'MoveGenerator', note: 'Needs no change when a piece type is added.' },
        { id: 'BoardView', note: 'Add an implementation; GameController is untouched.' },
        { id: 'Main', note: 'The one line that does change: chooseView.' },
        { id: 'King', note: 'Castling will arrive with almost no change here.' },
        'EmojiView', 'SwingView', 'GraphicalView', 'TerminalView',
      ],
      edges: ['MoveGenerator>Piece', 'EmojiView>BoardView', 'SwingView>BoardView', 'GraphicalView>BoardView', 'TerminalView>BoardView'],
    },
    {
      id: 'lsp', cat: 'principles', label: 'Substitutability (Liskov)', week: 6, milestone: 'M9',
      blurb: 'Anywhere a BoardView is expected, any implementation works, including a fake one in a test. Anywhere a Piece is expected, any subclass works, including the irregular Pawn. Nothing checks the concrete type.',
      nodes: [
        { id: 'GameController', note: 'Works with a console, a window, a terminal, or a RecordingView.' },
        'BoardView',
        { id: 'GameControllerTest', note: 'RecordingView is substituted for a real view and a whole game plays out.' },
        { id: 'Pawn', note: 'Breaks every rule the others follow, yet is used through Piece like any other.' },
        'Piece',
      ],
      edges: ['GameController>BoardView', 'GameControllerTest>BoardView', 'Pawn>Piece'],
    },
    {
      id: 'dip', cat: 'principles', label: 'Dependency inversion & injection', week: 11, milestone: 'M9',
      blurb: 'High-level code depends on abstractions, and the concrete choice is made at the edge. GameController depends on BoardView, not ConsoleView; Main is the composition root that picks the implementation. Constructors take their collaborators, which is what makes testing possible.',
      nodes: [
        { id: 'GameController', note: 'Constructor takes (Game, BoardView).' },
        { id: 'Main', note: 'The composition root: builds concrete classes and wires them.' },
        'BoardView',
        { id: 'ConsoleView', note: 'Second constructor takes PrintStream, Scanner, Color.' },
        { id: 'TerminalView', note: 'Constructor takes a Lanterna Screen so tests inject a virtual terminal.' },
        { id: 'TextBoardRenderer', note: 'Takes its PieceGlyphs.' },
        { id: 'RandomChooser', note: 'Planned: takes a Random so tests are deterministic.' },
      ],
      edges: ['GameController>BoardView', 'Main>GameController', 'Main>BoardView', 'TextBoardRenderer>PieceGlyphs'],
    },
    {
      id: 'coupling', cat: 'principles', label: 'Low coupling & layering', week: 6, milestone: 'M4',
      blurb: 'Dependencies point one way: view → engine → model, and factory → model. The model imports nothing from the rest of the project, so Piece and Board can be read without loading anything else. Board.createPromoted duplicates factory code rather than point an arrow backwards.',
      nodes: [
        { id: 'Board', note: 'Duplicates four arms of PieceFactory.create to avoid model → factory.' },
        { id: 'PieceFactory', note: 'The other half of that duplication.' },
        { id: 'Game', note: 'The only thing the view layer is allowed to import from the engine.' },
        { id: 'TerminalView', note: 'The only class that imports Lanterna; the dependency stays behind the seam.' },
        'Position', 'Piece', 'Move',
      ],
      edges: ['Board>Queen', 'PieceFactory>Piece', 'GameController>Game', 'BoardFactory>PieceFactory'],
    },
    {
      id: 'dry', cat: 'principles', label: 'DRY, and when not to', week: 7, milestone: 'M2',
      blurb: 'The engine removes duplication where it buys clarity (slidingMoves / steppingMoves) and keeps it where removing it would cost coupling or a lesson. Three deliberate duplications are documented in the code; find them.',
      nodes: [
        { id: 'Piece', note: 'The DRY that is done: two shared helpers instead of five copies of the same loop.' },
        { id: 'ConsoleView', note: 'Kept duplication: identical to EmojiView but for one expression, so the seam can be read side by side.' },
        'EmojiView',
        { id: 'Queen', note: 'Kept duplication: eight literal pairs rather than borrowing Rook’s and Bishop’s tables.' },
        { id: 'Board', note: 'Kept duplication: createPromoted mirrors PieceFactory to avoid a backwards dependency.' },
        'PieceFactory',
      ],
      edges: ['ConsoleView>TextBoardRenderer', 'EmojiView>TextBoardRenderer', 'Board>Queen'],
    },
    {
      id: 'hiding', cat: 'principles', label: 'Information hiding', week: 7, milestone: 'M2',
      blurb: 'Keep decisions local so they can change without notice. Each piece’s direction table is private; PieceArtist is package-private; TextBoardRenderer hides which end of the board is up.',
      nodes: [
        { id: 'Queen', note: 'Its DIRECTIONS are private again after the shared-table experiment.' },
        'Rook', 'Bishop',
        { id: 'PieceArtist', note: 'final and package-private: only view.swing knows it exists.' },
        { id: 'Board', note: 'squares[][] never leaks; even toString is a debugging dump, not a display.' },
      ],
      edges: [],
    },

    // ---------- Design patterns ----------
    {
      id: 'factory', cat: 'patterns', label: 'Factory', week: 9, milestone: 'M7',
      blurb: 'Concentrate "which constructor do I call?" where data becomes objects. PieceFactory turns a type and colour, or a FEN letter, into a Piece; BoardFactory turns a FEN string into a set-up Board. Move’s static factories are the same idea at method scale.',
      nodes: [
        { id: 'PieceFactory', note: 'create(type, color) and fromSymbol(letter).' },
        { id: 'BoardFactory', note: 'standard(), empty(), fromFen(fen).' },
        { id: 'Move', note: 'Static factory methods quiet, capture, promotion name the intent.' },
        { id: 'Game', note: 'The no-arg constructor calls BoardFactory.standard().' },
        'Piece', 'Board',
      ],
      edges: ['PieceFactory>Piece', 'BoardFactory>Board', 'BoardFactory>PieceFactory', 'Game>BoardFactory', 'PieceFactory>Pawn', 'PieceFactory>Knight', 'PieceFactory>Bishop', 'PieceFactory>Rook', 'PieceFactory>Queen', 'PieceFactory>King'],
    },
    {
      id: 'command', cat: 'patterns', label: 'Command (undo)', week: 10, milestone: 'M8',
      blurb: 'A request is an object that carries everything needed to perform and reverse it. Move records the captured piece because the board forgets it once the move is applied; Game.play and undoLastMove push and pop a history of them.',
      nodes: [
        { id: 'Move', note: 'The command payload: from, to, moved, captured, promotesTo.' },
        { id: 'Game', note: 'play() appends to history; undoLastMove() pops and reverses.' },
        { id: 'Board', note: 'apply(move) and undo(move) are the do/undo pair.' },
        { id: 'MoveGenerator', note: 'Uses the same apply/undo to ask "what if?" for every candidate.' },
        { id: 'PlayerAction', note: 'The player-facing requests; Undo is one of them.' },
      ],
      edges: ['Game>Move', 'Game>Board', 'MoveGenerator>Board', 'GameController>PlayerAction'],
    },
    {
      id: 'state', cat: 'patterns', label: 'State', week: 10, milestone: 'M8',
      blurb: 'The game’s status is classified as an enum, not as State-pattern objects with behaviour. Week 10 uses this as the comparison: what would change if IN_PROGRESS, CHECK, CHECKMATE and STALEMATE were classes that decided what the controller may do next?',
      nodes: [
        { id: 'GameStatus', note: 'Four constants and one method. The lightweight end of the spectrum.' },
        { id: 'MoveGenerator', note: 'status() computes the classification from in-check and has-move.' },
        { id: 'GameController', note: 'announceResult() branches on the status; runLoop stops when isGameOver().' },
        'Game',
      ],
      edges: ['MoveGenerator>GameStatus', 'Game>GameStatus', 'GameController>GameStatus'],
    },
    {
      id: 'facade', cat: 'patterns', label: 'Facade', week: 11, milestone: 'M9',
      blurb: 'One class fronts a subsystem. Everything outside the engine talks to Game and to nothing behind it: not MoveGenerator, not Board.apply, not BoardFactory. That single rule is what lets the console be swapped for a window without touching the rules.',
      nodes: [
        { id: 'Game', note: 'legalMoves, status, findLegalMove, play, undoLastMove: the whole rules API.' },
        { id: 'MoveGenerator', note: 'Behind the facade.' },
        { id: 'Board', note: 'Behind the facade; views read it only to draw.' },
        { id: 'BoardFactory', note: 'Behind the facade.' },
        { id: 'GameController', note: 'In front: uses Game only.' },
        { id: 'BoardView', note: 'In front: render(Game).' },
      ],
      edges: ['GameController>Game', 'BoardView>Game', 'Game>MoveGenerator', 'Game>Board', 'Game>BoardFactory'],
    },
    {
      id: 'mvc', cat: 'patterns', label: 'MVC', week: 11, milestone: 'M9',
      blurb: 'Model: Game and everything behind it owns the position. View: BoardView and its implementations own the display. Controller: GameController owns only the conversation between them. PlayerAction is the message the view sends the controller, independent of how the player entered it.',
      nodes: [
        { id: 'Game', note: 'M. Owns the position and the rules.' },
        { id: 'BoardView', note: 'V. Draws what it is given and reports what the player asked.' },
        { id: 'GameController', note: 'C. Carries out the request, then asks the view to redraw.' },
        { id: 'PlayerAction', note: 'The message type between V and C.' },
        { id: 'Main', note: 'Wires M, V and C together.' },
        'ConsoleView', 'EmojiView', 'SwingView', 'GraphicalView', 'TerminalView',
      ],
      edges: ['Main>GameController', 'Main>Game', 'Main>BoardView', 'GameController>Game', 'GameController>BoardView', 'GameController>PlayerAction', 'BoardView>Game', 'ConsoleView>BoardView', 'EmojiView>BoardView', 'SwingView>BoardView', 'GraphicalView>BoardView', 'TerminalView>BoardView'],
    },
    {
      id: 'strategy', cat: 'patterns', label: 'Strategy', week: 11, milestone: 'M9',
      blurb: 'An interchangeable algorithm behind an interface, chosen at runtime. TextBoardRenderer takes a PieceGlyphs and does not care which; Main picks a BoardView from the command line. The planned AI track is the textbook case: MoveChooser with random, greedy and minimax implementations.',
      nodes: [
        { id: 'PieceGlyphs', note: 'The strategy interface: one method, two supplied lambdas.' },
        { id: 'TextBoardRenderer', note: 'The context: renders the same layout with whatever glyphs it was given.' },
        { id: 'Main', note: 'Selects the view strategy from args.' },
        'BoardView',
        { id: 'MoveChooser', note: 'Planned: the move-selection strategy.' },
        'RandomChooser', 'MinimaxChooser',
        { id: 'Evaluator', note: 'Planned: a second strategy, for scoring positions.' },
      ],
      edges: ['TextBoardRenderer>PieceGlyphs', 'Main>BoardView', 'RandomChooser>MoveChooser', 'MinimaxChooser>MoveChooser', 'MinimaxChooser>Evaluator', 'MoveChooser>Game'],
    },
    {
      id: 'template', cat: 'patterns', label: 'Template method', week: 4, milestone: 'M2',
      blurb: 'A base class fixes the skeleton and subclasses fill in a step. Piece.attacks() is written once in terms of the abstract pseudoLegalMoves(); slidingMoves and steppingMoves are the shared loops into which each subclass plugs its direction table. GameController.runLoop plays the same role over BoardView.nextAction.',
      nodes: [
        { id: 'Piece', note: 'attacks() calls the abstract hook; the helpers take a table and run the loop.' },
        { id: 'Knight', note: 'Supplies OFFSETS to steppingMoves.' },
        { id: 'Bishop', note: 'Supplies DIRECTIONS to slidingMoves.' },
        { id: 'Pawn', note: 'Replaces the attacks() step because the default is wrong for it.' },
        { id: 'GameController', note: 'runLoop() fixes ask-tell-redraw; the view supplies nextAction.' },
        'BoardView',
      ],
      edges: ['Knight>Piece', 'Bishop>Piece', 'Pawn>Piece', 'GameController>BoardView'],
    },
    {
      id: 'observer', cat: 'patterns', label: 'Observer (where it would go)', week: 11, milestone: 'M9', absent: true,
      blurb: 'Not present, by design. The controller pushes a redraw with view.render(game) after every change instead of the view subscribing to the model. One view at a time makes that enough. The day two views must show the same game at once, Game becomes the subject and BoardView.render the update callback.',
      nodes: [
        { id: 'GameController', note: 'handle() ends with view.render(game): an explicit push.' },
        { id: 'BoardView', note: 'render(Game) is already shaped like an observer’s update().' },
        { id: 'Game', note: 'Would become the subject, holding a list of listeners.' },
      ],
      edges: ['GameController>BoardView', 'GameController>Game'],
    },

    // ---------- Architecture ----------
    {
      id: 'layers', cat: 'arch', label: 'Layered architecture', week: 11, milestone: 'M4',
      blurb: 'Four packages with one-way dependencies. The map is laid out to show it: entry point on top, views next, engine and factory below, model at the bottom. Every arrow that is not a test points downward or sideways, never up.',
      nodes: ['Main', 'GameController', 'BoardView', 'Game', 'MoveGenerator', 'BoardFactory', 'PieceFactory', 'Board', 'Piece', 'Move', 'Position'],
      edges: ['Main>GameController', 'GameController>Game', 'Game>MoveGenerator', 'Game>Board', 'MoveGenerator>Piece', 'BoardFactory>Board', 'PieceFactory>Piece', 'Game>BoardFactory'],
    },
    {
      id: 'pushpull', cat: 'arch', label: 'Pull views vs event-driven views', week: 11, milestone: 'M9',
      blurb: '"A console view is happy to be asked; a window has to be told." BoardView.start(controller) hands control to the view. Pull views call runLoop() and answer nextAction(). Event-driven views show themselves, return, and call controller.handle(...) from their handlers. Same PlayerAction values, opposite direction of call.',
      nodes: [
        { id: 'BoardView', note: 'start(controller) is the method that absorbs the difference.' },
        { id: 'GameController', note: 'runLoop() for pull views; handle() is what both kinds end up calling.' },
        { id: 'ConsoleView', note: 'Pull: start() is controller.runLoop() in one line.' },
        { id: 'TerminalView', note: 'Pull, but with the window’s experience: nextAction returns a Move after a cursor gesture.' },
        { id: 'SwingView', note: 'Event-driven: start() shows a window and returns; clicks call handle().' },
        { id: 'GraphicalView', note: 'Event-driven: a drag ends in controller.handle(new PlayerAction.Move(…)).' },
        'PlayerAction',
      ],
      edges: ['ConsoleView>GameController', 'TerminalView>GameController', 'SwingView>GameController', 'GraphicalView>GameController', 'BoardView>GameController', 'GraphicalView>PlayerAction', 'TerminalView>PlayerAction'],
    },
    {
      id: 'pseudolegal', cat: 'arch', label: 'Pseudo-legal vs legal moves', week: 7, milestone: 'M5',
      blurb: 'Two questions, two places. A piece answers the geometric one: where could I go? MoveGenerator answers the global one: which of those leave my own king safe? A bishop cannot know it is pinned; that fact depends on the whole board.',
      nodes: [
        { id: 'Piece', note: 'pseudoLegalMoves: geometry only.' },
        { id: 'MoveGenerator', note: 'legalMoves: apply, isInCheck, undo, keep or discard.' },
        { id: 'Board', note: 'apply/undo make the trial cheap.' },
        { id: 'Pawn', note: 'attacks() differs from moves, which is why isAttacked asks about attacks.' },
        'Game',
      ],
      edges: ['MoveGenerator>Piece', 'MoveGenerator>Board', 'Game>MoveGenerator'],
    },

    // ---------- Testing ----------
    {
      id: 'testability', cat: 'testing', label: 'Designing for testability', week: 13, milestone: 'M9',
      blurb: 'Every view can be exercised without a screen because its collaborators are injected and its side effects are deferred. A fake view plays a whole game; a virtual terminal receives keystrokes; pure geometry records are checked without a window.',
      nodes: [
        { id: 'GameControllerTest', note: 'RecordingView: a test double that records instead of printing.' },
        { id: 'ConsoleView', note: 'Injectable PrintStream and Scanner.' },
        { id: 'TerminalView', note: 'Injectable Screen; the real terminal is opened lazily in start().' },
        { id: 'GraphicalView', note: 'JFrame built lazily so the class constructs headless; Geometry is a pure record.' },
        { id: 'PieceArtist', note: 'shapeFor returns geometry, never paints.' },
        { id: 'BoardFactory', note: 'fromFen lets a test state any position in one string.' },
        'TerminalViewTest', 'GameController',
      ],
      edges: ['GameControllerTest>GameController', 'GameControllerTest>BoardView', 'TerminalViewTest>TerminalView', 'PieceMovementTest>BoardFactory'],
    },
    {
      id: 'perft', cat: 'testing', label: 'Perft: testing against an oracle', week: 13, milestone: 'M11',
      blurb: 'Instead of a hundred hand-written cases, count every leaf of the move tree to depth 4 and compare with published exact numbers. One wrong digit anywhere in generation, king safety or apply/undo fails the test, and which depth fails says where to look.',
      nodes: [
        { id: 'PerftTest', note: '20, 400, 8 902, 197 281 from the start position; 46 and 1 865 from Kiwipete until castling lands.' },
        { id: 'MoveGenerator', note: 'The code under test.' },
        { id: 'Board', note: 'apply/undo correctness is what depth 2 checks.' },
        { id: 'BoardFactory', note: 'Kiwipete is loaded from FEN.' },
        'MoveGeneratorTest', 'PieceMovementTest',
      ],
      edges: ['PerftTest>MoveGenerator', 'PerftTest>Board', 'MoveGeneratorTest>MoveGenerator', 'PieceMovementTest>Piece'],
    },
  ];

  return { MILESTONES, GROUPS, NODES, EDGES, CATEGORIES, CONCEPTS, SRC, TEST, REPO };
})();
