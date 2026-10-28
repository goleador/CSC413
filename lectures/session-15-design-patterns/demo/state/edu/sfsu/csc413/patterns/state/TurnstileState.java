package edu.sfsu.csc413.patterns.state;

/**
 * One state of a turnstile: what each event does, and which state follows.
 */
public interface TurnstileState {

    TurnstileState coin();

    TurnstileState push();
}
