package edu.sfsu.csc413.patterns.factorymethod;

/**
 * A dialog with a message and an OK button.
 *
 * <p>{@code render} is written once, here. It needs a button but does not
 * know which kind: {@code createButton} is the factory method, and each
 * subclass decides what it returns.
 */
public abstract class Dialog {

    protected abstract Button createButton();

    public String render(String message) {
        Button ok = createButton();
        return message + "\n" + ok.render("OK");
    }
}
