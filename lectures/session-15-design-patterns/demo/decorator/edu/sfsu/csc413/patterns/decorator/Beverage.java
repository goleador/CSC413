package edu.sfsu.csc413.patterns.decorator;

/** Anything a coffee shop can sell: a description and a price in cents. */
public interface Beverage {

    String description();

    int cents();
}
