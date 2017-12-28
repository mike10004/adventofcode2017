#include <stdio.h>

#define MAX_LAYERS 256

#define PROG "packetscanners"

#define ERR_USAGE 1
#define ERR_INPUT 2
#define ERR_CAUGHT 3

#define EOL "\n"
#define DEPTH_FMT "%2d"
#define NO_SCANNER " "
#define YES_SCANNER "S"
#define FMT_WITH_PACKET " (%s)"
#define FMT_WITHOUT_PACKET " [%s]"
// packet position within a layer at some depth
#define PACKET_POSITION 0
#define MAX_LINE_LENGTH 1024

typedef enum boolean_t {
    FALSE = 0, TRUE = 1
} Boolean;

typedef struct layer_t {
    int depth;
    int range;
    int scanner_position;
    int scanner_direction;
} Layer;

typedef struct state_t {
    int picosecond;
    int packet_depth;
    int accum_severity;
} State;

typedef struct firewall_t {
    Layer layers[MAX_LAYERS];
    int num_layers;
    int max_depth;
} Firewall;

void reset_layer(Layer* layer)
{
    layer->scanner_direction = 0;
    layer->scanner_direction = 1;
}

void reset_firewall(Firewall* firewall)
{
    int i;
    for (i = 0; i < MAX_LAYERS; i++) {
        reset_layer(&(firewall->layers[i]));
    }
}

void reset_state(State* state)
{
    state->packet_depth = -1;
    state->accum_severity = 0;
}

int find_max_depth(Layer* layers, const int num_layers) 
{
    int max_depth = -1, i;
    for (i = 0; i < num_layers; i++) {
        if (layers[i].depth > max_depth) {
            max_depth = layers[i].depth;
        }
    }
    return max_depth;
}

void dump_layer(Layer* layer, State* state, FILE* ofile)
{
    int r;
    Boolean has_scanner, has_packet;
    fprintf(ofile, DEPTH_FMT, layer->depth);
    for (r = 0; r < layer->range; r++) {
        has_scanner = (r == layer->scanner_position);
        has_packet = (state->packet_depth == layer->depth);
        fprintf(ofile, (has_packet && (r == PACKET_POSITION)) ? FMT_WITH_PACKET : FMT_WITHOUT_PACKET, has_scanner ? YES_SCANNER : NO_SCANNER);
    }
    fprintf(ofile, EOL);
}

void dump_layers(Firewall* firewall, State* state, FILE* ofile) 
{
    int depth, j;
    Boolean has_layer = FALSE;
    for (depth = 0; depth <= firewall->max_depth; depth++) {
        has_layer = FALSE;
        for (j = 0; j < firewall->num_layers; j++) {
            if (firewall->layers[j].depth == depth) {
                has_layer = TRUE;
                dump_layer(&(firewall->layers[j]), state, ofile);
            }
        }
        if (!has_layer) {
            fprintf(ofile, DEPTH_FMT, depth);
            if (depth == state->packet_depth) {
                fprintf(ofile, " (.)%s", EOL);
            } else {
                fprintf(ofile, " ...%s", EOL);
            }            
        }
    }
}

// read "depth: range" lines from file into layers array; return num layers
int read_layers(FILE* infile, Layer* layers)
{
    int num_layers = 0;
    char line_buffer[MAX_LINE_LENGTH];
    int depth, range, ntokens;
    while ((num_layers < MAX_LAYERS) && (fgets(line_buffer, MAX_LINE_LENGTH, infile))) {
        ntokens = sscanf(line_buffer, "%d: %d\n", &depth, &range);
        if (ntokens != 2) {
            fprintf(stderr, "%s: %d tokens on malformed line: %s\n", PROG, ntokens, line_buffer);
            return -1;
        }
        layers[num_layers].depth = depth;
        layers[num_layers].range = range;
        num_layers++;
    }
    return num_layers;
}

int get_severity(Layer* layer)
{
    return layer->depth * layer->range;
}

Boolean advance_packet(Firewall* firewall, State* state, int* severity)
{
    int j;
    *severity = -1;
    state->packet_depth = state->packet_depth + 1;
    for (j = 0; j < firewall->num_layers; j++) {
        if (firewall->layers[j].depth == state->packet_depth) {
            if (firewall->layers[j].scanner_position == PACKET_POSITION) {
                *severity = get_severity(&(firewall->layers[j]));
                state->accum_severity += (*severity);
                return TRUE;
            }
        }
    }
    return FALSE;
}

void advance_scanner(Layer* layer)
{
    layer->scanner_position += layer->scanner_direction;
    if (layer->scanner_position == (layer->range - 1)) {
        layer->scanner_direction = -1;
    } else if (layer->scanner_position == 0) {
        layer->scanner_direction = 1;
    }
}

void advance_scanners(Firewall* firewall)
{
    int i;
    Layer* layers = firewall->layers;
    for (i = 0; i < firewall->num_layers; i++) {
        advance_scanner(&(layers[i]));
    }
}

int main(int argc, char* argv[]) 
{
    int num_layers, pico = -1, severity, delay = -1, min_delay;
    unsigned long max_delay;
    Boolean caught = FALSE;
    const unsigned long MAX_DELAY = 1024 * 1024 * 1024;
    Firewall firewall;
    State state;
    FILE* layer_out = stderr;
    FILE* info_out = stdout;
    if (argc > 1) {
        if ((sscanf(argv[1], "%d", &delay) != 1) || (delay < 0) || (delay > MAX_DELAY)) {
            fprintf(stderr, "%s: invalid delay: %s%s", PROG, argv[1], EOL);
            return ERR_USAGE;
        }
    }
    num_layers = read_layers(stdin, firewall.layers);
    firewall.num_layers = num_layers;
    firewall.max_depth = find_max_depth(firewall.layers, firewall.num_layers);
    fprintf(stderr, "%s: %d layers parsed\n", PROG, num_layers);
    if (num_layers < 0) {
        return ERR_INPUT;
    }
    if (delay == -1) {
        min_delay = 0;
        max_delay = MAX_DELAY;
    } else {
        min_delay = delay;
        max_delay = delay;
    }
    for (delay = min_delay; delay <= max_delay; delay++) {
        fprintf(layer_out, "Delay: %d%s", delay, EOL);
        reset_firewall(&firewall);
        reset_state(&state);
        fprintf(layer_out, "Picosecond %d (packet depth %d of %d)%s", pico, state.packet_depth, firewall.max_depth, EOL);
        dump_layers(&firewall, &state, layer_out);
        fprintf(layer_out, EOL);
        while (state.packet_depth < firewall.max_depth) {
            pico++;
            if (pico >= delay) {
                caught = advance_packet(&firewall, &state, &severity);
            }
            fprintf(layer_out, "Picosecond %d (packet depth %d of %d; %s)%s", pico, state.packet_depth, firewall.max_depth, caught ? "CAUGHT" : "uncaught", EOL);
            dump_layers(&firewall, &state, layer_out);
            if (caught) {
                fprintf(layer_out, "%s>>> Accumulated severity %d at depth %d; total severity %d%s", EOL, severity, state.packet_depth, state.accum_severity, EOL);
                break;
            }
            advance_scanners(&firewall);
            fprintf(layer_out, EOL);
            dump_layers(&firewall, &state, layer_out);
            fprintf(layer_out, EOL);
        }
        if (caught) {
            fprintf(layer_out, "CAUGHT with delay %d; total severity accumulated: %d%s", delay, state.accum_severity, EOL);
        } else {
            fprintf(info_out, "Successful delay: %d picoseconds%s", delay, EOL);
            break;
        }            
    }
    return 0;
}

