#include <stdio.h>
#include <string.h>

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

Boolean quiet = FALSE;

void reset_layer(Layer* layer)
{
    layer->scanner_position = 0;
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
    if (quiet) {
        return;
    }
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
    if (quiet) {
        return;
    }
    fprintf(ofile, EOL);
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
    fprintf(ofile, EOL);
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
    const unsigned long MAX_DELAY_CAP = 1024 * 1024 * 1024;
    int num_layers, pico = -1, severity, i;
    unsigned long max_delay = MAX_DELAY_CAP, delay, min_delay = 0;
    char* min_delay_str = NULL;
    char* max_delay_str = NULL;
    Boolean caught = FALSE;
    Firewall firewall;
    State state;
    FILE* layer_out = stderr;
    FILE* info_out = stdout;
    if (argc < 3) {
        fprintf(stderr, "%s: must specify delay interval%s", PROG, EOL);
        return ERR_USAGE;
    }
    min_delay_str = argv[1];
    max_delay_str = argv[2];
    if (argc > 3) {
        quiet = (strcmp("quiet", argv[3]) == 0) ? TRUE : FALSE;
    }
    if (min_delay_str != NULL) {
        if (sscanf(min_delay_str, "%lu", &min_delay) != 1) {
            fprintf(stderr, "%s: invalid min delay: %s%s", PROG, min_delay_str, EOL);
            return ERR_USAGE;
        }
    }
    if (max_delay_str != NULL) {
        if (sscanf(max_delay_str, "%lu", &max_delay) != 1) {
            fprintf(stderr, "%s: invalid max delay: %s%s", PROG, max_delay_str, EOL);
            return ERR_USAGE;
        }
    }
    if ((min_delay > max_delay) || (max_delay > MAX_DELAY_CAP)) {
        fprintf(stderr, "%s: invalid min or max delay: [%lu, %lu]%s", PROG, min_delay, max_delay, EOL);
        return ERR_USAGE;
    }
    num_layers = read_layers(stdin, firewall.layers);
    firewall.num_layers = num_layers;
    firewall.max_depth = find_max_depth(firewall.layers, firewall.num_layers);
    fprintf(info_out, "%s: %d layers parsed; delay [%lu, %lu]; quiet = %s%s", PROG, num_layers, min_delay, max_delay, quiet ? "true" : "false", EOL);
    if (num_layers < 0) {
        return ERR_INPUT;
    }
    for (delay = min_delay; delay <= max_delay; delay++) {
        pico = -1;
        if (!quiet) {
            fprintf(layer_out, "Delay: %lu%s", delay, EOL);
        }
        reset_firewall(&firewall);
        reset_state(&state);
        if (!quiet) {
            fprintf(layer_out, "Picosecond %d (packet depth %d of %d)%s", pico, state.packet_depth, firewall.max_depth, EOL);
        }
        dump_layers(&firewall, &state, layer_out);
        caught = FALSE;
        while (state.packet_depth < firewall.max_depth) {
            pico++;
            if (pico >= delay) {
                caught = advance_packet(&firewall, &state, &severity);
            }
            if (!quiet) {
                fprintf(layer_out, "Picosecond %d (packet depth %d of %d; %s)%s", pico, state.packet_depth, firewall.max_depth, caught ? "CAUGHT" : "uncaught", EOL);
            }
            dump_layers(&firewall, &state, layer_out);
            if (caught) {
                if (!quiet) {
                    fprintf(layer_out, "%s>>> Accumulated severity %d at depth %d; total severity %d%s", EOL, severity, state.packet_depth, state.accum_severity, EOL);
                }
                break;
            }
            advance_scanners(&firewall);
            dump_layers(&firewall, &state, layer_out);
        }
        if (caught) {
            if (!quiet) {
                fprintf(layer_out, "CAUGHT with delay %lu; total severity accumulated: %d%s", delay, state.accum_severity, EOL);
            }
        } else {
            fprintf(info_out, "Successful delay: %lu picoseconds%s", delay, EOL);
            break;
        }            
    }
    if (caught) {
        fprintf(info_out, "CAUGHT with all delays in interval [%lu, %lu]%s", min_delay, max_delay, EOL);
        return ERR_CAUGHT;
    }
    return 0;
}

