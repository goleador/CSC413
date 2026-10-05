package edu.sfsu.csc413.refactoring;

public class Pawn extends Piece {

    public Pawn(boolean white) {
        super('P', white);
    }

    @Override
    public boolean canMoveTo(Board board, Square from, Square to) {
        return isSingleStep(board, from, to)
                || isDoubleStepFromStart(board, from, to)
                || isDiagonalCapture(board, from, to);
    }

    private boolean isSingleStep(Board board, Square from, Square to) {
        return to.file() == from.file()
                && to.rank() == from.rank() + forward()
                && board.get(to) == null;
    }

    private boolean isDoubleStepFromStart(Board board, Square from, Square to) {
        Square stepAhead = new Square(from.file(), from.rank() + forward());
        return to.file() == from.file()
                && to.rank() == from.rank() + 2 * forward()
                && from.rank() == startRank()
                && board.get(to) == null
                && board.get(stepAhead) == null;
    }

    private boolean isDiagonalCapture(Board board, Square from, Square to) {
        Piece target = board.get(to);
        return Math.abs(to.file() - from.file()) == 1
                && to.rank() == from.rank() + forward()
                && target != null
                && target.isWhite() != isWhite();
    }

    /** +1 for White, who moves up the board; -1 for Black. */
    private int forward() {
        return isWhite() ? 1 : -1;
    }

    private int startRank() {
        return isWhite() ? 1 : 6;
    }
}
