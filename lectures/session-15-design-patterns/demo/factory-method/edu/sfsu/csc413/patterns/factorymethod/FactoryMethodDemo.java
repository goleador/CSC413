package edu.sfsu.csc413.patterns.factorymethod;

/** The same render method, two kinds of button. */
public final class FactoryMethodDemo {

    public static void main(String[] args) {
        Dialog[] dialogs = { new TextDialog(), new HtmlDialog() };
        for (Dialog dialog : dialogs) {
            System.out.println(dialog.render("Save changes?"));
        }
    }

    private FactoryMethodDemo() {
    }
}
