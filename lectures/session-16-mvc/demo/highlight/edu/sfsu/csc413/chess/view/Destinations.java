package edu.sfsu.csc413.chess.view;

import edu.sfsu.csc413.chess.engine.Game;
import edu.sfsu.csc413.chess.model.Move;
import edu.sfsu.csc413.chess.model.Position;

import java.util.ArrayList;
import java.util.List;

/** Session 16: how a view finds the squares to highlight without deciding a rule. */
final class Destinations {

    private Destinations() {
    }

    static List<Position> from(Game game, Position selected) {
        List<Position> targets = new ArrayList<>();
        for (Move move : game.legalMoves()) {
            if (move.from().equals(selected)) {
                targets.add(move.to());
            }
        }
        return targets;
    }

    public static void main(String[] args) {
        System.out.println(from(new Game(), Position.parse("g1")));
    }
}
