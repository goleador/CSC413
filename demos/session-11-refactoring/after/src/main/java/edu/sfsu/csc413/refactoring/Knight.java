package edu.sfsu.csc413.refactoring;

public class Knight extends Piece {

    public Knight(boolean white) {
        super('N', white);
    }

    @Override
    public boolean canMoveTo(Board board, Square from, Square to) {
        int fileDelta = to.file() - from.file();
        int rankDelta = to.rank() - from.rank();
        return (Math.abs(fileDelta) == 1 && Math.abs(rankDelta) == 2) || (Math.abs(fileDelta) == 2 && Math.abs(rankDelta) == 1);
    }
}
