package edu.sfsu.csc413.refactoring;

public class Bishop extends Piece {

    public Bishop(boolean white) {
        super('B', white);
    }

    @Override
    public boolean canMoveTo(Board board, Square from, Square to) {
        int fileDelta = to.file() - from.file();
        int rankDelta = to.rank() - from.rank();
        return Math.abs(fileDelta) == Math.abs(rankDelta) && fileDelta != 0 && board.isPathClear(from, to);
    }
}
