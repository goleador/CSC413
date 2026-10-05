package edu.sfsu.csc413.refactoring;

/** Eight by eight squares, indexed [file][rank], both 0..7. Stores pieces; decides nothing. */
public class Board {

    private final Piece[][] grid = new Piece[8][8];

    public Piece get(int file, int rank) {
        return grid[file][rank];
    }

    public void set(int file, int rank, Piece piece) {
        grid[file][rank] = piece;
    }

    /** The standard starting position. */
    public static Board initial() {
        Board board = new Board();
        char[] backRank = {'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'};
        for (int file = 0; file < 8; file++) {
            board.set(file, 0, new Piece(backRank[file], true));
            board.set(file, 1, new Piece('P', true));
            board.set(file, 6, new Piece('P', false));
            board.set(file, 7, new Piece(backRank[file], false));
        }
        return board;
    }
}
