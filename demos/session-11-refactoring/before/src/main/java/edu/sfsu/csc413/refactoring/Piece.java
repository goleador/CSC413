package edu.sfsu.csc413.refactoring;

/** A piece is a letter and a side. K Q R B N P, white or black. */
public class Piece {

    public final char type;
    public final boolean white;

    public Piece(char type, boolean white) {
        this.type = type;
        this.white = white;
    }

    /** Upper case for White, lower case for Black, as in FEN. */
    public char symbol() {
        return white ? Character.toUpperCase(type) : Character.toLowerCase(type);
    }
}
