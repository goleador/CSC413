package edu.sfsu.csc413.patterns.state;

public class Unlocked implements TurnstileState {

    @Override
    public TurnstileState coin() {
        System.out.println("already unlocked: coin returned");
        return this;
    }

    @Override
    public TurnstileState push() {
        System.out.println("you pass");
        return new Locked();
    }
}
