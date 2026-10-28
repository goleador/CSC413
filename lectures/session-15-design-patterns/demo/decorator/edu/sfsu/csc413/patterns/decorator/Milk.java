package edu.sfsu.csc413.patterns.decorator;

/**
 * A decorator: it is a {@link Beverage}, and it holds the beverage it adds to.
 */
public record Milk(Beverage inner) implements Beverage {

    @Override
    public String description() {
        return inner.description() + ", milk";
    }

    @Override
    public int cents() {
        return inner.cents() + 50;
    }
}
