package edu.sfsu.csc413.chess.view;

import edu.sfsu.csc413.chess.engine.Game;
import edu.sfsu.csc413.chess.model.Board;
import edu.sfsu.csc413.chess.model.Move;
import edu.sfsu.csc413.chess.model.Piece;
import edu.sfsu.csc413.chess.model.Position;

import java.util.List;
import java.util.Scanner;

/**
 * The whole position on one line: the piece placement in FEN, the last move,
 * and whose turn it is. Session 16's live-coded view.
 *
 * <p>Written without changing {@code Game} or {@code GameController}: the new
 * class plus one line in {@code Main}.
 */
public class CompactView implements BoardView {

    private final Scanner in = new Scanner(System.in);

    @Override
    public void render(Game game) {
        List<Move> history = game.history();
        String last = history.isEmpty()
                ? "-"
                : history.get(history.size() - 1).toString();
        System.out.println(placement(game.board())
                + "  last " + last
                + "  " + game.sideToMove() + " to move, " + game.status());
    }

    /** Ranks 8 down to 1, separated by '/', with a digit for a run of empty squares. */
    private String placement(Board board) {
        StringBuilder text = new StringBuilder();
        for (int rank = Position.BOARD_SIZE - 1; rank >= 0; rank--) {
            int empty = 0;
            for (int file = 0; file < Position.BOARD_SIZE; file++) {
                Piece piece = board.pieceAt(new Position(file, rank));
                if (piece == null) {
                    empty++;
                } else {
                    if (empty > 0) {
                        text.append(empty);
                        empty = 0;
                    }
                    text.append(piece.symbol());
                }
            }
            if (empty > 0) {
                text.append(empty);
            }
            if (rank > 0) {
                text.append('/');
            }
        }
        return text.toString();
    }

    @Override
    public void showMessage(String message) {
        System.out.println(message);
    }

    @Override
    public void start(GameController controller) {
        controller.runLoop();
    }

    @Override
    public PlayerAction nextAction(Game game) {
        System.out.print("> ");
        System.out.flush();
        return PlayerAction.parse(in.hasNextLine() ? in.nextLine() : "quit");
    }
}
