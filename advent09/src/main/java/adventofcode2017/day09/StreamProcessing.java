package adventofcode2017.day09;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.function.BiConsumer;

public class StreamProcessing {

    public static class Group {
        public Group parent;
        public Group(Group parent) {
            this.parent = parent;
        }

        public static int score(Group group) {
            if (group == null) {
                return 0;
            }
            return 1 + score(group.parent);
        }
    }

    public static class State {
        public Group group;
        public boolean inGarbage;
        public boolean ignore;
        public int totalScore;
        public int numGroups;
    }

    private static final char START_GROUP = '{', END_GROUP = '}', START_GARBAGE = '<', END_GARBAGE = '>', IGNORE = '!', DELIM_GROUP = ',';

    public void processNext(State state, char ch) {
        if (state.ignore) {
            if (!state.inGarbage) {
                throw new IllegalStateException("ignoring char outside of garbage");
            }
            state.ignore = false;
        } else {
            if (state.inGarbage) {
                switch (ch) {
                    case END_GARBAGE:
                        state.inGarbage = false;
                        break;
                    case IGNORE:
                        state.ignore = true;
                        break;
                    default:
                        // do nothing, just pass over the garbage
                        break;
                }
            } else {
                switch (ch) {
                    case START_GROUP:
                        state.group = new Group(state.group);
                        break;
                    case END_GROUP:
                        state.totalScore += Group.score(state.group);
                        state.group = state.group.parent;
                        state.numGroups++;
                        break;
                    case START_GARBAGE:
                        state.inGarbage = true;
                        break;
                    case DELIM_GROUP:
                        // do nothing; no semantic content
                        break;
                    default:
                        throw new IllegalStateException("non-garbage unhandled char: " + ch);
                }
            }
        }
    }

    public void processAll(State state, Reader charStream) throws IOException {
        processAll(state, charStream, (ch, state_) -> {});
    }

    public void processAll(State state, Reader charStream, BiConsumer<? super Character, ? super State> callback) throws IOException {
        char[] buf = new char[1];
        while (charStream.read(buf) == 1) {
            processNext(state, buf[0]);
            callback.accept(buf[0], state);
        }
    }

    public static void main(String[] args) throws Exception {
        File file = new File("./input.txt");
        State state = new State();
        try (InputStreamReader reader = new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8)) {
            new StreamProcessing().processAll(state, reader);
        }
        System.out.format("state.totalScore = %d%n", state.totalScore);
    }
}
