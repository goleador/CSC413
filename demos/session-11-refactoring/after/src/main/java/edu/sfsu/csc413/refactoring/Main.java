package edu.sfsu.csc413.refactoring;

import java.util.Scanner;

/** Type moves such as e2e4; type quit to stop. */
public class Main {

    public static void main(String[] args) {
        TurnHandler handler = new TurnHandler();
        Scanner in = new Scanner(System.in);
        System.out.print((handler.isWhiteToMove() ? "White" : "Black") + "> ");
        while (in.hasNextLine()) {
            String line = in.nextLine().trim();
            if (line.equals("quit")) {
                break;
            }
            handler.handleTurn(line);
            System.out.print((handler.isWhiteToMove() ? "White" : "Black") + "> ");
        }
    }
}
