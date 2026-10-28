package edu.sfsu.csc413.patterns.decorator;

/** Decorators stack in any order and any number. */
public final class DecoratorDemo {

    public static void main(String[] args) {
        Beverage[] orders = {
            new Espresso(),
            new Milk(new Espresso()),
            new Mocha(new Mocha(new Milk(new Espresso()))),
        };
        for (Beverage order : orders) {
            System.out.printf("%-30s $%d.%02d%n",
                    order.description(), order.cents() / 100, order.cents() % 100);
        }
    }

    private DecoratorDemo() {
    }
}
