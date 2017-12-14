#include <stdio.h>
#include <string.h>

#define MAX_OFFSETS 65535
#define MAX_JUMPS 64000000
#define ERR_JUMP_THRESHOLD_EXCEEDED -1

int parse_offsets(FILE* file, int* offsets)
{
    int offset, sresult, n = 0;
    while ((n < MAX_OFFSETS) && (sresult = fscanf(file, "%d", &offset)) == 1)
    {
        offsets[n] = offset;
        n++;
    }
    return n;
}

void dump_offsets(int* offsets, const int num_offsets, FILE* debug_out)
{
    int i;
    fprintf(debug_out, "%d offsets:", num_offsets);
    for (i = 0; i < num_offsets; i++) {
        fprintf(debug_out, " %d", offsets[i]);
    }
    fprintf(debug_out, "\n");
}

int perform_jumps(int* offsets, const int num_offsets, FILE* debug_out)
{
    int i = 0, n = 0, offset;
    dump_offsets(offsets, num_offsets, debug_out);
    while ((i >= 0) && (i < num_offsets)) {
        if (n >= MAX_JUMPS) {
            fprintf(stderr, "warn: probable error; jump threshold exceeded at %d\n", n);
            return ERR_JUMP_THRESHOLD_EXCEEDED;
        }
        offset = offsets[i];
        fprintf(debug_out, "debug: [%d, %d] jump with offset %d and increment offsets[%d] to %d\n", n, i, offset, i, offsets[i] + 1);
        offsets[i] = offset + 1;
        i = i + offset;
        n++;
    }
    return n;
}

int main(int argc, char* argv[])
{
    int num_offsets, num_jumps;
    int offsets[MAX_OFFSETS];
    FILE* debug_out = fopen("/dev/null", "w");
    if ((argc > 1) && (strncmp(argv[1], "debug", 5) == 0)) {
        debug_out = stderr;
    }
    num_offsets = parse_offsets(stdin, offsets);
    // fprintf(stderr, "debug: %d offsets parsed\n", num_offsets);
    num_jumps = perform_jumps(offsets, num_offsets, debug_out);
    if (num_jumps == ERR_JUMP_THRESHOLD_EXCEEDED) {
        return ERR_JUMP_THRESHOLD_EXCEEDED;
    }
    fprintf(stdout, "%d jumps performed from %d offsets\n", num_jumps, num_offsets);
    return 0;
}