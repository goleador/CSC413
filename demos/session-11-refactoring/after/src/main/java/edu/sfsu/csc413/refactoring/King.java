package edu.sfsu.csc413.refactoring;

public class King extends Piece {

    public King(boolean white) {
        super('K', white);
    }

    @Override
    public boolean canMoveTo(Board board, Square from, Square to) {
        int fileDelta = to.file() - from.file();
        int rankDelta = to.rank() - from.rank();
        return Math.abs(fileDelta) <= 1 && Math.abs(rankDelta) <= 1 && (fileDelta != 0 || rankDelta != 0);
    }
}
