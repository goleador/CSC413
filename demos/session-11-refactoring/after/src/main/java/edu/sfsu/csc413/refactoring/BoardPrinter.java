package edu.sfsu.csc413.refactoring;

/** Prints a board as eight rows of letters, rank 8 at the top, then the file letters. */
public class BoardPrinter {

    public void print(Board board) {
        for (int rank = 7; rank >= 0; rank--) {
            StringBuilder line = new StringBuilder();
            line.append(rank + 1).append("  ");
            for (int file = 0; file < 8; file++) {
                Piece occupant = board.get(new Square(file, rank));
                line.append(occupant == null ? '.' : occupant.symbol());
                if (file < 7) {
                    line.append(' ');
                }
            }
            System.out.println(line);
        }
        System.out.println();
        System.out.println("   a b c d e f g h");
    }
}
