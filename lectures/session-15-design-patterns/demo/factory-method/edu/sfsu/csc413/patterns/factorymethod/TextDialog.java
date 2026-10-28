package edu.sfsu.csc413.patterns.factorymethod;

public class TextDialog extends Dialog {

    @Override
    protected Button createButton() {
        return new TextButton();
    }
}
