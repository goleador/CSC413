**CSC 413 · Week 8 · Monday Oct 12**

# Midterm Review

### The topics, the practice problems, and the coding bank

> M4 is due tonight at 11:59 PM. Today is practice on paper, in pairs, the way the exam works. Take out the study guide.

---

## The exam

| Questions | Format | Points |
|---|---|---|
| 1–15 | Short questions: predict output, explain, fix, name the concept | 5 each, 75 |
| 16 | Write a small class or function that compiles and runs | 25 |

**Wednesday Oct 21, in class, 75 minutes.** Closed resource: no notes, laptop, phone, or AI.

> Budget about 45 minutes for the fifteen short questions and 30 for the code. DPRC letters to me by Wednesday.

---

## What it covers

- Concepts from sessions 3 to 12, through Wednesday Oct 7
- Questions 1–15: small, general examples, not the chess engine
- Question 16: one entry from the coding bank
- Not on it: UML, MVC, design patterns, Git and tools

> Wednesday's UML session is not on the exam. The coding bank uses engine classes you have already written, and every entry is in the bank file.

---

**Topics**

## Modeling

- Value vs. identity vs. closed set
- `record` vs. `class` vs. `enum`
- Equality: `==` vs. `equals`; `equals` with `hashCode`
- Immutability
- Validation in the constructor: invalid objects cannot exist

> For each line, ask the room for a one-line example before moving on. Push for a type that is a value and one that has identity.

---

**Topics**

## Composition and inheritance

- Composition (has-a) vs. inheritance (is-a)
- `abstract`, `extends`, `super`, `protected`, `@Override`
- Override vs. overload
- Polymorphism and dynamic dispatch
- Abstract class vs. interface

> Ask what each keyword prevents. Someone should say that abstract stops new, and protected limits who calls the constructor.

---

**Topics**

## Collections, generics, exceptions

- `List` vs. `Set` vs. `Map`
- Interface type vs. implementation (`List` / `ArrayList`)
- Generics
- Modifying a collection while iterating over it
- Saying no: `null`, `boolean`, `Optional`, empty collection, exception
- Checked vs. unchecked exceptions

> Ask which collection answers which question: is it there, what order, what goes with this key.

---

**Topics**

## Design quality

- Cohesion and coupling
- Separation of concerns: the model knows nothing about the view
- Dependency direction and cycles
- SOLID
- Dependency inversion vs. dependency injection

> Ask for the five SOLID names, then the one-sentence difference between inversion and injection.

---

**Topics**

## Refactoring

- Definition: same behavior, better structure
- Code smells and their refactorings
- Two hats: refactor and add features in separate commits

> Ask how a caller could tell whether a change was a refactoring.

---

**Topics**

## Information hiding

- Encapsulation vs. `private`
- Invariants
- Leaking mutable state
- Tell, don't ask
- Hide decisions that might change
- Don't over-encapsulate

> Ask for the difference between private and encapsulated. The cart and the bank account are the examples to name.

---

**Round 1**

# Practice 1–8

## In pairs, on paper. 7 minutes.

> Set a timer for seven minutes. Walk the room; listen for which question pairs argue about.

---

## 1 · Value, identity, or closed set?

| Type | Answer |
|---|---|
| A library member | *(reveal)* identity · `class` |
| An ISBN | *(reveal)* value · `record` |
| The months of the year | *(reveal)* closed set · `enum` |
| A GPS coordinate | *(reveal)* value · `record` |
| A bank transfer | *(reveal)* identity · `class` |

> Ask for the construct before each reveal. On the transfer: two transfers of the same amount on the same day are still two transfers.

---

## 2 · Validation in the constructor

```java
public record Temperature(double celsius) {
    public Temperature {
        if (celsius < -273.15) {
            throw new IllegalArgumentException("below absolute zero");
        }
    }
}
```

What does `new Temperature(-300)` do? What if it stored the value instead?

*(reveal)* It throws `IllegalArgumentException`. An invalid `Temperature` never exists.

*(reveal)* Stored, the bad value fails far from where it was made, and every user must check it.

> Ask where the error would surface if the constructor said nothing.

---

## 3 · `abstract` and `protected`

`Vehicle` is `abstract`, and its constructor is `protected`. What does each keyword prevent?

*(reveal)* `abstract`: nobody, anywhere, can create a bare `Vehicle`.

*(reveal)* `protected`: only subclasses and the package can call the constructor, through `super(...)`.

> With abstract in place, protected adds no extra protection against new Vehicle(). It says who the constructor is for.

---

## 4 · Override or overload?

- (a) `toString()` written in a record
- (b) `print(int)` and `print(String)` in the same class

*(reveal)* (a) Override: it replaces `Object.toString()`.

*(reveal)* (b) Overload: same name, different parameters.

> Override: same signature in a subclass. Overload: same name, different parameter list, chosen at compile time.

---

## 4 (c) · The `equals` method in this class

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

What does each line print? Why does line 1 differ? Which annotation catches it?

> Give them a minute on this one. Answer on the next slide.

---

## 4 (c) · Answer

```
true
false
false
```

- `equals(Point)` is an **overload**: it does not replace `equals(Object)`
- Line 1 passes a `Point`, so the compiler picks `equals(Point)`
- Lines 2 and 3 use the inherited `equals(Object)`, which compares identity
- `@Override` would have made it a compile error

The fix: `public boolean equals(Object o)`, with `hashCode` beside it.

> contains always calls equals(Object). That is why the collection never sees the overload.

---

## 5 · Declare variables with the interface type

```java
List<String> names = new ArrayList<>();
```

- (a) Which type is the interface, which the implementation?
- (b) Switching to `LinkedList`: what changes, and why nothing else?
- (c) Why is it harder if the line declares `ArrayList<String>`?
- (d) What does the empty `<>` mean?

> Answers on the next slide.

---

## 5 · Answer

- (a) `List` is the interface; `ArrayList` is the implementation
- (b) Only `new ArrayList<>()` changes. Callers use only what `List` promises
- (c) Callers may use `ArrayList`-only methods, such as `trimToSize()`, and those break
- (d) The diamond: the compiler infers `<String>` from the left side

> The point is (b): code depends on the promise, not on the class that keeps it.

---

## 6 · Removing while iterating

```java
List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4));
for (Integer n : numbers) {
    if (n % 2 == 0) {
        numbers.remove(n);
    }
}
```

What happens? Give two correct ways to remove the even numbers.

> Answer on the next slide.

---

## 6 · Answer

```
Exception in thread "main" java.util.ConcurrentModificationException
```

### Remove in place

```java
numbers.removeIf(n -> n % 2 == 0);
```

### Or the iterator's own remove

```java
Iterator<Integer> it = numbers.iterator();
while (it.hasNext()) {
    if (it.next() % 2 == 0) {
        it.remove();
    }
}
```

A third way: build a new list of the numbers to keep.

> The for-each loop's iterator notices the list changed under it and throws. Both fixes print [1, 3].

---

## 7 · Which SOLID principle does each break?

| Design | Principle |
|---|---|
| A `Report` class computes totals, formats a PDF, and emails it | *(reveal)* Single responsibility |
| An area method with an `instanceof` branch per shape, edited for every new shape | *(reveal)* Open/closed |
| `ReadOnlyFile extends File`, and its `write` throws | *(reveal)* Liskov substitution |

> For open/closed, ask for the fix: an area() method on each shape.

---

## 7 (d) · Inversion vs. injection

Define each in one sentence.

*(reveal)* **Dependency inversion:** high-level code depends on an abstraction, not a concrete low-level class.

*(reveal)* **Dependency injection:** a class receives its dependencies, usually through its constructor, instead of creating them.

*(reveal)* Inversion is the principle. Injection is one technique for following it.

> Students swap these two names more than any others. Make them say both sentences.

---

## 8 · Refactoring or not?

| Change | Answer |
|---|---|
| Inlining a local variable used once | *(reveal)* Refactoring |
| Throwing `IllegalStateException` instead of `IllegalArgumentException` | *(reveal)* Not: a caller's `catch` stops catching it |
| Moving a method to another class, callers updated, same results | *(reveal)* Refactoring |
| Silently ignoring `null` instead of throwing | *(reveal)* Not: a call that threw now returns |

> The test every time: could any caller observe the difference?

---

**Round 2**

# Practice 9, 10, 11, 16

## In pairs, on paper. 8 minutes.

> Reading code without running it. Write the output down before you discuss.

---

## 9 · Choose a collection

| Need | Type |
|---|---|
| A guest list with no duplicates | *(reveal)* `Set<String>` |
| The songs of a playlist, in order | *(reveal)* `List<Song>` |
| A phone book from name to number | *(reveal)* `Map<String, String>` |

> Ask which question each collection answers: is it there, what order, what goes with this key.

---

## 10 · Saying no

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

What does it print? Is `NumberFormatException` checked? What should `findStudent(id)` return?

> Answer on the next slide.

---

## 10 · Answer

```
null
caught
```

- `Map.get` says no with `null`; `parseInt` says no by throwing
- `NumberFormatException` is unchecked: a `RuntimeException`
- `findStudent` returns `Optional<Student>`: a missing student is ordinary, and the caller must handle it

> Throwing is for a caller's bug. null is allowed but does not force the caller to check.

---

## 11 · A leak

```java
public class Classroom {
    private final String[] students;
    public Classroom(String[] students) { this.students = students; }
    public String[] students() { return students; }
}
```

Write one line that changes the class list without going through `Classroom`. The constructor leaks too: how?

> Answer on the next slide.

---

## 11 · Answer

### Two leaks

```java
classroom.students()[0] = "Mallory";

String[] names = {"Ana"};
Classroom c = new Classroom(names);
names[0] = "Mallory";
```

### Copy on the way in and out

```java
public class Classroom {
    private final String[] students;
    public Classroom(String[] students) { this.students = students.clone(); }
    public String[] students() { return students.clone(); }
}
```

`private` hid the field. The array itself was shared with the caller.

> Returning an unmodifiable List.copyOf is the other fix. Arrays cannot be made read-only.

---

## 16 · Dispatch

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

- What do `new Circle().describe()`, `new Shape().describe()`, and `((Shape) new Circle()).describe()` return?
- Which `name()` runs, and when is that decided?
- Add a `describe()` to `Circle` that reuses `Shape`'s and appends `"."`

> Answer on the next slide.

---

## 16 · Answer

```
I am a circle
I am a shape
I am a circle
```

The object's class picks `name()`, at run time. The cast changes nothing.

```java
@Override
String describe() { return super.describe() + "."; }
```

> Ask what the declared type does decide: which methods the compiler lets you call.

---

**Round 3**

# Practice 12–15

## In pairs, on paper. 8 minutes.

> Design questions. Answers are short; name the concept and the consequence.

---

## 12 · Smells

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

Name two smells and the refactoring for each. Write the cleaned version, same output.

> Answer on the next slide.

---

## 12 · Answer

- **Duplicated Code:** the branches differ only by a suffix
- **Feature Envy:** building the user's full name from the user's fields; move it to `User`
- **Mysterious Name:** `u`; rename

```java
public void greet(User user) {
    String suffix = user.isAdmin() ? " (admin)" : "";
    System.out.println("Welcome back, " + user.fullName() + suffix);
}
```

`fullName()` on `User` returns `firstName() + " " + lastName()`. Output unchanged.

> Verified: both versions print the same two lines for an admin and a regular user.

---

## 13 · Has-a or is-a?

`public class Car extends Engine`, so that a car can call `start()`. What is wrong?

*(reveal)* A car is not an engine; it has one. `Car` now exposes every public method of `Engine`.

*(reveal)* ```java
public class Car {
    private final Engine engine;
    public Car(Engine engine) { this.engine = engine; }
    public void start() { engine.start(); }
}
```

> Composition: hold the engine, and delegate only the methods a car should have.

---

## 14 · Interface or abstract class?

CSV and PDF exporters both hold a report title and write the same header. They differ only in how a row is written.

Which one? Write the declaration with one concrete and one abstract method.

> Answer on the next slide.

---

## 14 · Answer: an abstract class

Shared state (the title) and shared code (the header).

```java
public abstract class ReportExporter {
    private final String title;

    protected ReportExporter(String title) { this.title = title; }

    public String header() { return "Report: " + title; }

    protected abstract String formatRow(List<String> cells);
}
```

No shared state or code: an interface.

> Compare with the notifier example: nothing shared but the operation means interface.

---

## 15 · Separation of concerns

A `Temperature` record has `printToConsole()` and `toHtml()`. Where should each go?

*(reveal)* Both move out of the model, into display code: a console view and a web view.

*(reveal)* The view depends on `Temperature`. `Temperature` knows nothing about any view.

> Then a new display needs no change to Temperature.

---

**Question 16**

# Writing code

## 25 points: a class or function from the coding bank

> Question 16 is one entry of coding-bank.md, written from memory. Learn every entry.

---

## The coding bank

### Classes

- `Position` as a record
- `Position` by hand: `equals`, `hashCode`
- `Color` and `PieceType` enums
- `Piece`: identity, composition
- Abstract `Piece` and `Knight`
- `PieceGlyphs`, `BoardView` interfaces
- `PieceFactory`
- `BankAccount`, before and after
- `Game`: copies, guards, `Optional`

### Functions

- `isOnBoard`, compact constructor, `toString`
- An enum with a field
- `symbol()`, `attacks`
- `PieceFactory.create`
- `history()`, `play`, `undoLastMove`
- `deposit`, `withdraw`
- Removing from a list safely
- The refactored `report`

> Each entry states its concept. Learn the concept, not only the code: the exam may change the names.

---

## Writing code on paper

- Imports and semicolons count
- Fields `private final` unless they must change
- Validate in the constructor; throw `IllegalArgumentException`
- Never return a private mutable collection

> Code that does not compile loses points. These four lines cover most of what the rubric reads for.

---

## 17 · A playlist

- `Song`: a record with a `title` and `seconds`. Blank title or `seconds <= 0` throws
- `Playlist`: `add(Song)`, `int totalSeconds()`, `Optional<Song> longest()`, `List<Song> songs()`
- `songs()` must not let a caller change the playlist

> Alone, on paper, eight minutes. Then swap with your partner and mark each other's for compile errors.

---

## 17 · Answer: `Song`

```java
public record Song(String title, int seconds) {
    public Song {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title is required");
        }
        if (seconds <= 0) {
            throw new IllegalArgumentException("seconds must be positive");
        }
    }
}
```

> isBlank covers the empty string and spaces. Check null first, or isBlank throws a NullPointerException.

---

## 17 · Answer: `Playlist`, part 1

Imports: `java.util.ArrayList`, `java.util.List`, `java.util.Optional`.

```java
public class Playlist {
    private final List<Song> songs = new ArrayList<>();

    public void add(Song song) {
        songs.add(song);
    }

    public int totalSeconds() {
        int total = 0;
        for (Song song : songs) {
            total += song.seconds();
        }
        return total;
    }

    ...
```

> A private final list, and add that only appends. totalSeconds is a plain loop.

---

## 17 · Answer: `Playlist`, part 2

```java
    ...

    public Optional<Song> longest() {
        Song best = null;
        for (Song song : songs) {
            if (best == null || song.seconds() > best.seconds()) {
                best = song;
            }
        }
        return Optional.ofNullable(best);
    }

    public List<Song> songs() {
        return List.copyOf(songs);
    }
}
```

> Verified: an empty playlist's longest() is empty; after Intro (90) and Epic (600), totalSeconds() is 690 and longest() is Epic.

---

# Next: Wednesday Oct 14

## UML: class and sequence diagrams

Not on the midterm. The midterm is Wednesday Oct 21, in class.

> Bring the study guide's remaining questions on Wednesday; I take five minutes at the start.
