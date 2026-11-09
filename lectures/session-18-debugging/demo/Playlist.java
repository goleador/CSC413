import java.util.ArrayList;
import java.util.List;

/**
 * A playlist of songs, for practising debugging. It has four bugs.
 * Run it, read what happens, and work through them in order.
 */
public final class Playlist {

    /** One song and its length in seconds. */
    record Song(String title, int seconds) {
    }

    private final List<Song> songs = new ArrayList<>();
    private int current = -1;
    private Song lastPlayed;

    /** Adds one song for each line, written like {@code Track 07, 3:45}. */
    void load(List<String> lines) {
        for (String line : lines) {
            songs.add(parse(line));
        }
    }

    /** Turns one line into a song. */
    static Song parse(String line) {
        try {
            String[] parts = line.split(", ");
            String length = parts[1];
            int colon = length.indexOf(':');
            int minutes = Integer.parseInt(length.substring(colon - 1, colon));
            int seconds = Integer.parseInt(length.substring(colon + 1));
            return new Song(parts[0], minutes * 60 + seconds);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("bad song line: " + line, e);
        }
    }

    /** Moves to the next song, going back to the first after the last. */
    Song next() {
        current++;
        if (current > songs.size()) {
            current = 0;
        }
        lastPlayed = songs.get(current);
        return lastPlayed;
    }

    /** The title of the song last returned by {@link #next()}. */
    String nowPlaying() {
        return lastPlayed.title();
    }

    /** The length of the whole playlist, in minutes. */
    double totalMinutes() {
        int total = 0;
        for (Song song : songs) {
            total += song.seconds();
        }
        return total / 60;
    }

    /** Forty tracks. Track 37 is twelve and a half minutes long. */
    static List<String> album() {
        List<String> lines = new ArrayList<>();
        for (int n = 1; n <= 40; n++) {
            String length = n == 37 ? "12:30" : (3 + n % 3) + ":" + String.format("%02d", n);
            lines.add(String.format("Track %02d, %s", n, length));
        }
        return lines;
    }

    public static void main(String[] args) {
        Playlist playlist = new Playlist();
        playlist.load(album());

        // Listen to the album, and carry on to the first track again.
        for (int i = 0; i <= 40; i++) {
            playlist.next();
        }
        System.out.println("Now playing: " + playlist.nowPlaying());

        playlist.load(List.of("Bonus 1, 4:07", "Bonus 2, 3:5O"));
        System.out.println("Total: " + playlist.totalMinutes() + " minutes");
        System.out.println("Expected: 189.5 minutes");
    }
}
