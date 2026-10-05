package edu.sfsu.csc413.refactoring;

/** A move as it was typed: where from, where to, and the text itself for the history. */
public record Move(Square from, Square to, String notation) {
}
