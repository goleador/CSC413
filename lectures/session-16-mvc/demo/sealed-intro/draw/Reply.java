package draw;

/** Session 16: a sealed interface. Accept and Decline are the only replies there are. */
public sealed interface Reply permits Accept, Decline {}
