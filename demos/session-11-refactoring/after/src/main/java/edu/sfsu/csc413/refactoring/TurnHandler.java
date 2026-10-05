package edu.sfsu.csc413.refactoring;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** Plays one turn at a time from four-character notation such as "e2e4". */
public class TurnHandler {

    private final Board board = Board.initial();
    private boolean whiteToMove = true;
    private final List<String> history = new ArrayList<>();
    private final BoardPrinter printer = new BoardPrinter();

    public boolean isWhiteToMove() {
        return whiteToMove;
    }

    public List<String> history() {
        return List.copyOf(history);
    }

    /** The piece on a square such as "e4" as a letter, or '.' for an empty square. */
    public char symbolAt(String square) {
        Piece piece = board.get(MoveParser.parseSquare(square, 0));
        return piece == null ? '.' : piece.symbol();
    }

    /** Plays the move if it is legal. Returns whether it was played. */
    public boolean handleTurn(String input) {
        Optional<Move> parsed = MoveParser.parse(input);
        if (parsed.isEmpty()) {
            System.out.println("Cannot read move: " + input);
            return false;
        }
        Move move = parsed.get();
        if (!isLegal(move)) {
            System.out.println("Illegal move: " + input);
            return false;
        }
        Piece mover = board.get(move.from());
        play(move);
        announce(mover, move);
        return true;
    }

    /** The right side is moving, it is not capturing its own piece, and the piece's rule allows it. */
    private boolean isLegal(Move move) {
        Piece piece = board.get(move.from());
        if (piece == null || piece.isWhite() != whiteToMove) {
            return false;
        }
        Piece target = board.get(move.to());
        if (target != null && target.isWhite() == piece.isWhite()) {
            return false;
        }
        return piece.canMoveTo(board, move.from(), move.to());
    }

    /** Moves the piece, records the move, and hands the turn to the other side. */
    private void play(Move move) {
        board.set(move.to(), board.get(move.from()));
        board.set(move.from(), null);
        history.add(move.notation());
        whiteToMove = !whiteToMove;
    }

    private void announce(Piece mover, Move move) {
        System.out.println((mover.isWhite() ? "White" : "Black") + " plays " + move.notation());
        printer.print(board);
    }
}
