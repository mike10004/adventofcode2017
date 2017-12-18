package adventofcode2017.day09;

import adventofcode2017.day09.StreamProcessing.State;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.BiConsumer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;

class StreamProcessingTest {

    @ParameterizedTest
    @CsvSource({
            "'{}', 1",
            "'{{{}}}', 3",
            "'{{},{}}', 3",
            "'{{{},{},{{}}}}', 6",
            "'{<{},{},{{}}>}', 1",
            "'{{<a>},{<a>},{<a>},{<a>}}', 5",
            "'{{<!>},{<!>},{<!>},{<a>}}', 2",
    })
    void processAll_wholeStreams(String stream, int expectedNumGroups) throws IOException {
        State state = processAll(stream);
        assertEquals(expectedNumGroups, state.numGroups, "group count");
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "<>",
        "<random characters>",
        "<<<<>",
        "<{!>}>",
        "<!!>",
        "<!!!>>",
        "<{o\"i!a,<{i<a>"
    })
    void processAll_selfContainedGarbage(String stream) throws IOException {
        AtomicInteger count = new AtomicInteger(0);
        State state = processAll(stream, (ch, state_) -> {
            int current = count.incrementAndGet();
            assertEquals(current < stream.length(), state_.inGarbage, () -> String.format("still in garbage if not finished with stream at position %d in '%s'", current, stream));
        });
        assertFalse(state.inGarbage, "garbage should have closed out");
        assertEquals(0, state.numGroups, "numGroups");
        assertEquals(0, state.totalScore, "totalScore");
    }

    @ParameterizedTest
    @CsvSource({
        "'{}', 1",
        "'{{{}}}', 6",
        "'{{},{}}', 5",
        "'{{{},{},{{}}}}', 16",
        "'{<a>,<a>,<a>,<a>}', 1",
        "'{{<ab>},{<ab>},{<ab>},{<ab>}}', 9",
        "'{{<!!>},{<!!>},{<!!>},{<!!>}}', 9",
        "'{{<a!>},{<a!>},{<a!>},{<ab>}}', 3",
    })
    void processAll_totalScores(String stream, int expectedScore) throws IOException {
        State state = processAll(stream);
        assertEquals(expectedScore, state.totalScore, "score for " + stream);
        assertFalse(state.inGarbage);
        assertFalse(state.ignore);
        assertNull(state.group);
    }

    private State processAll(String stream) throws IOException {
        return processAll(stream, (ch, state) -> {});
    }

    private State processAll(String stream, BiConsumer<? super Character, ? super State> consumer) throws IOException {
        State state = new State();
        try (Reader reader = new StringReader(stream)) {
            new StreamProcessing().processAll(state, reader, consumer);
            return state;
        }
    }
}