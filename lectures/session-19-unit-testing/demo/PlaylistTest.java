import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class PlaylistTest {

    private Playlist playlist;

    @BeforeEach
    void threeSongs() {
        playlist = new Playlist();
        playlist.load(List.of("One, 1:00", "Two, 2:00", "Three, 3:30"));
    }

    @Test
    void readsTwoDigitMinutes() {
        assertEquals(750, Playlist.parse("Track 37, 12:30").seconds());
    }

    @ParameterizedTest
    @CsvSource({
        "0,   0:00",
        "59,  0:59",
        "60,  1:00",
        "65,  1:05",
        "599, 9:59",
        "600, 10:00",
        "750, 12:30",
    })
    void formatsMinutesAndSeconds(int seconds, String expected) {
        assertEquals(expected, Playlist.formatLength(seconds));
    }

    @Test
    void rejectsANegativeLength() {
        assertThrows(IllegalArgumentException.class, () -> Playlist.formatLength(-1));
    }

    @Test
    void startsWithTheFirstSong() {
        assertEquals("One", playlist.next().title());
    }

    @Test
    void goesBackToTheFirstSongAfterTheLast() {
        playlist.next();
        playlist.next();
        playlist.next();
        assertEquals("One", playlist.next().title());
    }

    @Test
    void saysNothingIsPlayingBeforeTheFirstSong() {
        assertEquals("nothing yet", playlist.nowPlaying());
    }
}
