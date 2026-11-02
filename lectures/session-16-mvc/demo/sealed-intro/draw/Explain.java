package draw;

/** Session 16: a switch over a sealed interface needs no default. */
final class Explain {

    private Explain() {
    }

    static String explain(Reply reply) {
        return switch (reply) {
            case Accept accept -> "draw agreed";
            case Decline decline -> "declined: " + decline.reason();
        };
    }

    public static void main(String[] args) {
        System.out.println(explain(new Accept()));
        System.out.println(explain(new Decline("I'm winning")));
    }
}
