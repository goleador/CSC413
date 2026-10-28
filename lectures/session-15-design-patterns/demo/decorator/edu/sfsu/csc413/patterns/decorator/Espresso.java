package edu.sfsu.csc413.patterns.decorator;

/** A plain drink: the object being decorated. */
public record Espresso() implements Beverage {

    @Override
    public String description() {
        return "espresso";
    }

    @Override
    public int cents() {
        return 250;
    }
}
