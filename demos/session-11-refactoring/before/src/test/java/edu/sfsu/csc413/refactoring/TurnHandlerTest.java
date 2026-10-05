package edu.sfsu.csc413.refactoring;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Characterization tests: they pin down what TurnHandler does today, right or
 * wrong, so that a refactoring which changes any of it is caught. They only use
 * the public surface of TurnHandler, so they pass unchanged before and after.
 */
class TurnHandlerTest {

    private TurnHandler handler;
    private final ByteArrayOutputStream captured = new ByteArrayOutputStream();
    private PrintStream originalOut;

    @BeforeEach
    void setUp() {
        handler = new TurnHandler();
        originalOut = System.out;
        System.setOut(new PrintStream(captured, true, StandardCharsets.UTF_8));
    }

    @AfterEach
    void restoreOut() {
        System.setOut(originalOut);
    }

    private String printed() {
        return captured.toString(StandardCharsets.UTF_8).replace("\r\n", "\n");
    }

    @Test
    void legalPawnMoveIsPlayed() {
        assertTrue(handler.handleTurn("e2e4"));
        assertEquals('P', handler.symbolAt("e4"));
        assertEquals('.', handler.symbolAt("e2"));
    }

    @Test
    void unreadableStringIsRejected() {
        assertFalse(handler.handleTurn("hello"));
        assertEquals("Cannot read move: hello\n", printed());
    }

    @Test
    void offBoardSquareIsRejected() {
        assertFalse(handler.handleTurn("e2e9"));
        assertFalse(handler.handleTurn("i2i4"));
        assertEquals('P', handler.symbolAt("e2"));
        assertEquals("Cannot read move: e2e9\nCannot read move: i2i4\n", printed());
    }

    @Test
    void wrongSideCannotMove() {
        assertFalse(handler.handleTurn("e7e5"));
        assertEquals('p', handler.symbolAt("e7"));
        assertTrue(handler.isWhiteToMove());
    }

    @Test
    void turnSwitchesAfterEachLegalMove() {
        assertTrue(handler.isWhiteToMove());
        handler.handleTurn("e2e4");
        assertFalse(handler.isWhiteToMove());
        assertTrue(handler.handleTurn("e7e5"));
        assertTrue(handler.isWhiteToMove());
    }

    @Test
    void historyGrowsOnlyForLegalMoves() {
        handler.handleTurn("e2e4");
        handler.handleTurn("e2e3");
        handler.handleTurn("e7e5");
        assertEquals(List.of("e2e4", "e7e5"), handler.history());
    }

    @Test
    void knightJumpsButRookIsBlocked() {
        assertTrue(handler.handleTurn("b1c3"));
        assertFalse(handler.handleTurn("a8a6"));
    }

    @Test
    void pawnCannotAdvanceThreeSquares() {
        assertFalse(handler.handleTurn("e2e5"));
        assertEquals("Illegal move: e2e5\n", printed());
    }

    @Test
    void oneMovePrintsAnnouncementAndBoard() {
        handler.handleTurn("e2e4");
        String expected = """
                White plays e2e4
                8  r n b q k b n r
                7  p p p p p p p p
                6  . . . . . . . .
                5  . . . . . . . .
                4  . . . . P . . .
                3  . . . . . . . .
                2  P P P P . P P P
                1  R N B Q K B N R

                   a b c d e f g h
                """;
        assertEquals(expected, printed());
    }
}
