package edu.sfsu.csc413.patterns.state;

/** Push, pay, pay again, walk through, push. */
public final class StateDemo {

    public static void main(String[] args) {
        Turnstile gate = new Turnstile();
        gate.push();
        gate.coin();
        gate.coin();
        gate.push();
        gate.push();
    }

    private StateDemo() {
    }
}
