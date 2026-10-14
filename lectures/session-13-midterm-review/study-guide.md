# Midterm Study Guide

**CSC 413 Software Development · Fall 2026**

**The exam.** Wednesday October 21, in class, 75 minutes, 100 points. Closed
resource: no notes, no laptop, no phone, no AI tools. Bring a pen.

| Questions | Format | Points |
|---|---|---|
| 1–15 | Short questions: predict output, explain, fix, name the concept | 5 each, 75 |
| 16 | Write a small record and class that compile and run correctly | 25 |

Budget about 45 minutes for questions 1 to 15 and 30 for question 16.

**What it covers.** The concepts from sessions 3 to 12, through Wednesday
October 7. Questions 1 to 15 test concepts with small, general examples,
not the chess engine. Question 16 is one entry from the coding bank. UML,
MVC, and design patterns are not on the exam.

**How to study.** Answer the practice problems on paper, without notes. Then
check your answers against the session notes. When a question asks *why*,
name the consequence, not just the principle.

## Topics

**Modeling**
- Value vs. identity vs. closed set
- `record` vs. `class` vs. `enum`
- Equality: `==` vs. `equals`; `equals` with `hashCode`
- Immutability
- Validation in the constructor: invalid objects cannot exist

**Composition and inheritance**
- Composition (has-a) vs. inheritance (is-a)
- `abstract`, `extends`, `super`, `protected`, `@Override`
- Override vs. overload
- Polymorphism and dynamic dispatch
- Abstract class vs. interface

**Collections, generics, exceptions**
- `List` vs. `Set` vs. `Map`
- Interface type vs. implementation (`List` / `ArrayList`)
- Generics
- Modifying a collection while iterating over it
- Saying no: `null`, `boolean`, `Optional`, empty collection, exception
- Checked vs. unchecked exceptions

**Design quality**
- Cohesion and coupling
- Separation of concerns: the model knows nothing about the view
- Dependency direction and cycles
- SOLID
- Dependency inversion vs. dependency injection

**Refactoring**
- Definition: same behavior, better structure
- Code smells and their refactorings
- Two hats: refactor and add features in separate commits

**Information hiding**
- Encapsulation vs. `private`
- Invariants
- Leaking mutable state
- Tell, don't ask
- Hide decisions that might change
- Don't over-encapsulate

---

## Practice: short questions

**1. Buckets.** Value, identity, or closed set? Give the Java construct for
each: a library member; an ISBN; the months of the year; a GPS coordinate; a
bank transfer.

**2. Validation.**

```java
public record Temperature(double celsius) {
    public Temperature {
        if (celsius < -273.15) {
            throw new IllegalArgumentException("below absolute zero");
        }
    }
}
```

What does `new Temperature(-300)` do? What would go wrong if the record
stored the value and returned normally?

**3. Two keywords.** `Vehicle` is `abstract` and its constructor is
`protected`. What does each keyword prevent?

**4. Override or overload?**
(a) `toString()` written in a record.
(b) `print(int)` and `print(String)` in the same class.
(c) The `equals` method in this class:

```java
public class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public boolean equals(Point other) {
        return x == other.x && y == other.y;
    }
}
```

```java
Point p = new Point(1, 2);
Object o = new Point(1, 2);
List<Point> list = List.of(new Point(1, 2));
System.out.println(p.equals(new Point(1, 2)));   // line 1
System.out.println(p.equals(o));                 // line 2
System.out.println(list.contains(p));            // line 3
```

What does each line print? Why does line 1 print something different from
lines 2 and 3? Which annotation would have caught the mistake at compile
time?

**5. Declare variables with the interface type.**

```java
List<String> names = new ArrayList<>();
```

(a) Which type is the interface, and which is the implementation?
(b) The team decides to use a `LinkedList` instead. What changes on this
line, and why does no other code that uses `names` have to change?
(c) Why would that change be harder if the line said
`ArrayList<String> names = new ArrayList<>();`?
(d) What does the empty `<>` on the right mean?

**6. Removing while iterating.**

```java
List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4));
for (Integer n : numbers) {
    if (n % 2 == 0) {
        numbers.remove(n);
    }
}
```

What happens? Give two correct ways to remove the even numbers.

**7. Which principle?**
(a) A `Report` class computes totals, formats them as PDF, and emails them.
(b) An area method with `if (shape instanceof Circle) ... else if (shape
instanceof Square) ...`, edited for every new shape.
(c) `ReadOnlyFile extends File`, and its `write` throws.
(d) Define dependency inversion and dependency injection in one sentence
each.

**8. Refactoring or not?** How could a caller tell?
(a) Inlining a local variable used once.
(b) Throwing `IllegalStateException` instead of `IllegalArgumentException`.
(c) Moving a method to another class, with every caller updated and the same
results.
(d) Silently ignoring a `null` argument instead of throwing.


**9. Choose a collection.** A guest list with no duplicates; the songs of a
playlist, in order; a phone book from name to number.

**10. Saying no.**

```java
Map<String, Integer> ages = new HashMap<>();
ages.put("ana", 20);
System.out.println(ages.get("bob"));

try {
    int n = Integer.parseInt("abc");
    System.out.println("parsed " + n);
} catch (NumberFormatException e) {
    System.out.println("caught");
}
```

What does this print? Is `NumberFormatException` checked or unchecked? A
`findStudent(id)` method can fail to find the student: which of the ways to
say no should it use, and why?

**11. A leak.**

```java
public class Classroom {
    private final String[] students;
    public Classroom(String[] students) { this.students = students; }
    public String[] students() { return students; }
}
```

Write one line of caller code that changes the class list without going
through `Classroom`. The constructor has the same problem: show how. Fix
both.


**12. Smells.**

```java
public void greet(User u) {
    if (u.isAdmin()) {
        System.out.println("Welcome back, " + u.firstName() + " "
                + u.lastName() + " (admin)");
    } else {
        System.out.println("Welcome back, " + u.firstName() + " "
                + u.lastName());
    }
}
```

Name two smells and the refactoring for each. Write the cleaned version with
exactly the same output.

**13. Has-a or is-a?** `public class Car extends Engine`, so that a car can
call `start()`. What is wrong? Rewrite the relationship.

**14. Interface or abstract class?** A CSV exporter and a PDF exporter both
hold a report title and write the same header line in the same way. They
differ only in how a row is written. Interface or abstract class? Write the
declaration with one concrete and one abstract method.

**15. Separation of concerns.** A `Temperature` record has two extra methods:
`printToConsole()` and `toHtml()`. Where should each go, and which way should
the dependency point between `Temperature` and the code that displays it?


**16. Dispatch.**

```java
class Shape {
    String name() { return "shape"; }
    String describe() { return "I am a " + name(); }
}

class Circle extends Shape {
    @Override
    String name() { return "circle"; }
}
```

What do `new Circle().describe()`, `new Shape().describe()`, and
`((Shape) new Circle()).describe()` return? Which `name()` runs in each, and
when is that decided? Add a `describe()` to `Circle` that reuses `Shape`'s
and appends `"."`.

## Practice: writing code

Question 16 is one of the classes or functions in the **coding bank**
(`coding-bank.md`). Learn every entry there. Problem 17 is extra practice
in the same style.

**17. A playlist.** On paper, then type it in and run it.

- A record `Song` with a `title` (`String`) and a length in `seconds`
  (`int`). A `null` or blank title, or a length of zero or less, throws
  `IllegalArgumentException`.
- A class `Playlist` with `add(Song)`, `int totalSeconds()`,
  `Optional<Song> longest()` (empty when the playlist is empty), and
  `List<Song> songs()`, which must not let a caller change the playlist.

Check that it compiles, that a bad `Song` throws, and that
`playlist.songs().clear()` leaves the playlist unchanged. On the exam, code
that does not compile loses points, so write imports and semicolons.

Bring your answers, and the questions they raise, to class.
