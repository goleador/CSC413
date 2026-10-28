package edu.sfsu.csc413.patterns.state;

public class Locked implements TurnstileState {

    @Override
    public TurnstileState coin() {
        System.out.println("unlocked");
        return new Unlocked();
    }

    @Override
    public TurnstileState push() {
        System.out.println("locked: insert a coin");
        return this;
    }
}
