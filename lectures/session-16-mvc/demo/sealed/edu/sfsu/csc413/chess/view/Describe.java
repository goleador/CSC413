package edu.sfsu.csc413.chess.view;

/** Session 16: a switch over PlayerAction with one case missing does not compile. */
final class Describe {

    private Describe() {
    }

    static String describe(PlayerAction action) {
        return switch (action) {
            case PlayerAction.Move move -> "play " + move.notation();
            case PlayerAction.Undo undo -> "take back a move";
            case PlayerAction.ShowMoves showMoves -> "list the legal moves";
        };
    }
}
