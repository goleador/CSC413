package edu.sfsu.csc413.chess.view;

import edu.sfsu.csc413.chess.engine.Game;
import edu.sfsu.csc413.chess.model.Move;
import edu.sfsu.csc413.chess.model.Position;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Session 17: four excerpts from a generated Swing view, for review.
 * Three break a rule from session 16; one is fine. Not a working view.
 */
final class ReviewExcerpts {

    private Game game;
    private GameController controller;
    private Position selected;

    private ReviewExcerpts() {
    }

    // A
    void squareClicked(Position target) {
        Optional<Move> move = game.findLegalMove(selected.toString() + target);
        move.ifPresent(game::play);
        repaint();
    }

    // B
    List<Position> knightTargets(Position from) {
        int[][] jumps = {{1, 2}, {2, 1}, {2, -1}, {1, -2},
                         {-1, -2}, {-2, -1}, {-2, 1}, {-1, 2}};
        List<Position> targets = new ArrayList<>();
        for (int[] jump : jumps) {
            Position to = from.offsetOrNull(jump[0], jump[1]);
            if (to != null) {
                targets.add(to);
            }
        }
        return targets;
    }

    // C
    public void start(GameController controller) {
        this.controller = controller;
        buildWindow();
        controller.runLoop();
    }

    // D
    List<Position> targetsOf(Position from) {
        List<Position> targets = new ArrayList<>();
        for (Move move : game.legalMoves()) {
            if (move.from().equals(from)) {
                targets.add(move.to());
            }
        }
        return targets;
    }

    private void repaint() {
    }

    private void buildWindow() {
    }
}
