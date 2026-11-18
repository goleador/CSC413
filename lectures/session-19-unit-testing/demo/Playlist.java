import java.util.ArrayList;
import java.util.List;

/**
 * Session 18's playlist with its four bugs fixed, plus {@code formatLength}.
 * For practising test design in session 19.
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
            int minutes = Integer.parseInt(length.substring(0, colon));
            int seconds = Integer.parseInt(length.substring(colon + 1));
            return new Song(parts[0], minutes * 60 + seconds);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("bad song line: " + line, e);
        }
    }

    /**
     * Writes a length in seconds as minutes and seconds: 750 is {@code 12:30},
     * 65 is {@code 1:05}. Throws IllegalArgumentException for a negative length.
     */
    static String formatLength(int seconds) {
        if (seconds < 0) {
            throw new IllegalArgumentException("negative length: " + seconds);
        }
        return seconds / 60 + ":" + String.format("%02d", seconds % 60);
    }

    /** Moves to the next song, going back to the first after the last. */
    Song next() {
        current++;
        if (current >= songs.size()) {
            current = 0;
        }
        lastPlayed = songs.get(current);
        return lastPlayed;
    }

    /** The title of the song last returned by {@link #next()}, or "nothing yet". */
    String nowPlaying() {
        return lastPlayed == null ? "nothing yet" : lastPlayed.title();
    }

    /** The length of the whole playlist, in minutes. */
    double totalMinutes() {
        int total = 0;
        for (Song song : songs) {
            total += song.seconds();
        }
        return total / 60.0;
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
        Song song = null;
        for (int i = 0; i <= 40; i++) {
            song = playlist.next();
        }
        System.out.println("Now playing: " + song.title() + " (" + formatLength(song.seconds()) + ")");

        playlist.load(List.of("Bonus 1, 4:07", "Bonus 2, 3:50"));
        System.out.println("Total: " + playlist.totalMinutes() + " minutes");
    }
}
