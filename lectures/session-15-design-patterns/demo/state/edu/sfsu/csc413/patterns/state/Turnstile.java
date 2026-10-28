package edu.sfsu.csc413.patterns.state;

/**
 * A subway turnstile, written with the State pattern.
 *
 * <p>The turnstile hands each event to its current state and keeps whatever
 * state comes back. It has no switch, and it does not know how many states
 * there are.
 */
public class Turnstile {

    private TurnstileState state = new Locked();

    public void coin() {
        state = state.coin();
    }

    public void push() {
        state = state.push();
    }
}
