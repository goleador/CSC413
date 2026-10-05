package edu.sfsu.csc413.refactoring;

/** A square as a file and a rank, both 0..7 when on the board. a1 is (0, 0). */
public record Square(int file, int rank) {

    public boolean isOnBoard() {
        return file >= 0 && file <= 7 && rank >= 0 && rank <= 7;
    }
}
