package edu.sfsu.csc413.patterns.factorymethod;

public class TextButton implements Button {

    @Override
    public String render(String label) {
        return "[ " + label + " ]";
    }
}
