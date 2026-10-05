package edu.sfsu.csc413.refactoring;

public class Queen extends Piece {

    public Queen(boolean white) {
        super('Q', white);
    }

    @Override
    public boolean canMoveTo(Board board, Square from, Square to) {
        int fileDelta = to.file() - from.file();
        int rankDelta = to.rank() - from.rank();
        return (fileDelta == 0 || rankDelta == 0 || Math.abs(fileDelta) == Math.abs(rankDelta)) && (fileDelta != 0 || rankDelta != 0) && board.isPathClear(from, to);
    }
}
