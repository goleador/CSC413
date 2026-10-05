package edu.sfsu.csc413.refactoring;

/** Eight by eight squares. Stores pieces and answers questions about squares; decides nothing. */
public class Board {

    private final Piece[][] grid = new Piece[8][8];

    public Piece get(Square square) {
        return grid[square.file()][square.rank()];
    }

    public void set(Square square, Piece piece) {
        grid[square.file()][square.rank()] = piece;
    }

    /** Every square strictly between the two given squares is empty. */
    public boolean isPathClear(Square from, Square to) {
        int fileStep = Integer.signum(to.file() - from.file());
        int rankStep = Integer.signum(to.rank() - from.rank());
        Square square = new Square(from.file() + fileStep, from.rank() + rankStep);
        while (!square.equals(to)) {
            if (get(square) != null) {
                return false;
            }
            square = new Square(square.file() + fileStep, square.rank() + rankStep);
        }
        return true;
    }

    /** The standard starting position. */
    public static Board initial() {
        Board board = new Board();
        char[] backRank = {'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'};
        for (int file = 0; file < 8; file++) {
            board.set(new Square(file, 0), create(backRank[file], true));
            board.set(new Square(file, 1), new Pawn(true));
            board.set(new Square(file, 6), new Pawn(false));
            board.set(new Square(file, 7), create(backRank[file], false));
        }
        return board;
    }

    /** The one place that turns a letter into a kind of piece. */
    private static Piece create(char letter, boolean white) {
        return switch (letter) {
            case 'K' -> new King(white);
            case 'Q' -> new Queen(white);
            case 'R' -> new Rook(white);
            case 'B' -> new Bishop(white);
            case 'N' -> new Knight(white);
            case 'P' -> new Pawn(white);
            default -> throw new IllegalArgumentException("No piece for letter " + letter);
        };
    }
}
