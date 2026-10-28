package edu.sfsu.csc413.patterns.state;

/**
 * A subway turnstile, written with an enum and a switch in every event.
 */
public class Turnstile {

    private enum State { LOCKED, UNLOCKED }

    private State state = State.LOCKED;

    public void coin() {
        switch (state) {
            case LOCKED -> {
                System.out.println("unlocked");
                state = State.UNLOCKED;
            }
            case UNLOCKED -> System.out.println("already unlocked: coin returned");
        }
    }

    public void push() {
        switch (state) {
            case LOCKED -> System.out.println("locked: insert a coin");
            case UNLOCKED -> {
                System.out.println("you pass");
                state = State.LOCKED;
            }
        }
    }
}
