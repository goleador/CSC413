package edu.sfsu.csc413.patterns.factorymethod;

public class HtmlButton implements Button {

    @Override
    public String render(String label) {
        return "<button>" + label + "</button>";
    }
}
