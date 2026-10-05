package edu.sfsu.csc413.refactoring;

import java.util.Optional;

/** Reads four-character notation such as "e2e4". Knows nothing about pieces or turns. */
public final class MoveParser {

    private MoveParser() {
    }

    /** The move the text names, or empty when the text is not two squares on the board. */
    public static Optional<Move> parse(String input) {
        if (input == null || input.length() != 4) {
            return Optional.empty();
        }
        Square from = parseSquare(input, 0);
        Square to = parseSquare(input, 2);
        if (!from.isOnBoard() || !to.isOnBoard()) {
            return Optional.empty();
        }
        return Optional.of(new Move(from, to, input));
    }

    /** Reads the two characters at offset as a square: a letter for the file, a digit for the rank. */
    public static Square parseSquare(String text, int offset) {
        return new Square(text.charAt(offset) - 'a', text.charAt(offset + 1) - '1');
    }
}
