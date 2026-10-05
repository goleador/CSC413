package edu.sfsu.csc413.refactoring;

public class Rook extends Piece {

    public Rook(boolean white) {
        super('R', white);
    }

    @Override
    public boolean canMoveTo(Board board, Square from, Square to) {
        int fileDelta = to.file() - from.file();
        int rankDelta = to.rank() - from.rank();
        return (fileDelta == 0 || rankDelta == 0) && (fileDelta != 0 || rankDelta != 0) && board.isPathClear(from, to);
    }
}
