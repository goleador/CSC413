package edu.sfsu.csc413.patterns.factorymethod;

public class HtmlDialog extends Dialog {

    @Override
    protected Button createButton() {
        return new HtmlButton();
    }
}
