package edu.sfsu.csc413.refactoring;

/** A piece has a side and a letter, and knows how it moves. K Q R B N P, white or black. */
public abstract class Piece {

    private final char letter;
    private final boolean white;

    protected Piece(char letter, boolean white) {
        this.letter = letter;
        this.white = white;
    }

    public boolean isWhite() {
        return white;
    }

    /** Upper case for White, lower case for Black, as in FEN. */
    public char symbol() {
        return white ? Character.toUpperCase(letter) : Character.toLowerCase(letter);
    }

    /** Whether this piece's movement rule allows going from one square to the other on this board. */
    public abstract boolean canMoveTo(Board board, Square from, Square to);
}
