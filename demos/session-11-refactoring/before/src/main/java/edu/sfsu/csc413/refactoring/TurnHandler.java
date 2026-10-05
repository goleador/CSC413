package edu.sfsu.csc413.refactoring;

import java.util.ArrayList;
import java.util.List;

/** Plays one turn at a time from four-character notation such as "e2e4". */
public class TurnHandler {

    private final Board board = Board.initial();
    private boolean whiteToMove = true;
    private final List<String> history = new ArrayList<>();

    public boolean isWhiteToMove() {
        return whiteToMove;
    }

    public List<String> history() {
        return List.copyOf(history);
    }

    /** The piece on a square such as "e4" as a letter, or '.' for an empty square. */
    public char symbolAt(String square) {
        int x = square.charAt(0) - 'a';
        int y = square.charAt(1) - '1';
        Piece p = board.get(x, y);
        return p == null ? '.' : p.symbol();
    }

    /** Plays the move if it is legal. Returns whether it was played. */
    public boolean handleTurn(String input) {
        if (input == null || input.length() != 4) {
            System.out.println("Cannot read move: " + input);
            return false;
        }
        int x = input.charAt(0) - 'a';
        int y = input.charAt(1) - '1';
        int x2 = input.charAt(2) - 'a';
        int y2 = input.charAt(3) - '1';
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            System.out.println("Cannot read move: " + input);
            return false;
        }
        if (x2 < 0 || x2 > 7 || y2 < 0 || y2 > 7) {
            System.out.println("Cannot read move: " + input);
            return false;
        }
        Piece p = board.get(x, y);
        if (p == null || p.white != whiteToMove) {
            System.out.println("Illegal move: " + input);
            return false;
        }
        Piece tmp = board.get(x2, y2);
        if (tmp != null && tmp.white == p.white) {
            System.out.println("Illegal move: " + input);
            return false;
        }
        int dx = x2 - x;
        int dy = y2 - y;
        boolean flag = false;
        if (p.type == 'N') {
            flag = (Math.abs(dx) == 1 && Math.abs(dy) == 2) || (Math.abs(dx) == 2 && Math.abs(dy) == 1);
        } else if (p.type == 'K') {
            flag = Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx != 0 || dy != 0);
        } else if (p.type == 'R') {
            flag = (dx == 0 || dy == 0) && (dx != 0 || dy != 0) && chk(x, y, x2, y2);
        } else if (p.type == 'B') {
            flag = Math.abs(dx) == Math.abs(dy) && dx != 0 && chk(x, y, x2, y2);
        } else if (p.type == 'Q') {
            flag = (dx == 0 || dy == 0 || Math.abs(dx) == Math.abs(dy)) && (dx != 0 || dy != 0) && chk(x, y, x2, y2);
        } else if (p.type == 'P') {
            int dir = p.white ? 1 : -1;
            int start = p.white ? 1 : 6;
            flag = (dx == 0 && dy == dir && tmp == null)
                    || (dx == 0 && dy == 2 * dir && y == start && tmp == null && board.get(x, y + dir) == null)
                    || (Math.abs(dx) == 1 && dy == dir && tmp != null && tmp.white != p.white);
        }
        if (!flag) {
            System.out.println("Illegal move: " + input);
            return false;
        }
        board.set(x2, y2, p);
        board.set(x, y, null);
        history.add(input);
        whiteToMove = !whiteToMove;
        System.out.println((p.white ? "White" : "Black") + " plays " + input);
        for (int r = 7; r >= 0; r--) {
            StringBuilder sb = new StringBuilder();
            sb.append(r + 1).append("  ");
            for (int f = 0; f < 8; f++) {
                Piece q = board.get(f, r);
                sb.append(q == null ? '.' : q.symbol());
                if (f < 7) {
                    sb.append(' ');
                }
            }
            System.out.println(sb);
        }
        System.out.println();
        System.out.println("   a b c d e f g h");
        return true;
    }

    // every square strictly between (a,b) and (c,d) is empty
    private boolean chk(int a, int b, int c, int d) {
        int sx = Integer.signum(c - a);
        int sy = Integer.signum(d - b);
        int f = a + sx;
        int r = b + sy;
        while (f != c || r != d) {
            if (board.get(f, r) != null) {
                return false;
            }
            f += sx;
            r += sy;
        }
        return true;
    }
}
