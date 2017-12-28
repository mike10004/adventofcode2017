#!/usr/bin/python3

# -*- coding: utf-8 -*-

import sys

class Layer:

    def __init__(self, depth, range):
        self.depth = depth
        self.range = range
    
    def period(self):
        return 2 * (self.range - 1)

def find_delay(layers, mindelay=0, maxdelay=16):
    for delay in range(mindelay, maxdelay + 1):
        caught = False
        for layer in layers:
            picos = delay + layer.depth
            if picos % layer.period() == 0:
                caught = True
                break
        if not caught:
            return delay

def parse_layer(line):
    tokens = line.strip().split(': ')
    return Layer(int(tokens[0]), int(tokens[1]))

if __name__ == '__main__':
    from argparse import ArgumentParser
    p = ArgumentParser()
    p.add_argument("mindelay", type=int)
    p.add_argument("maxdelay", type=int)
    args = p.parse_args()
    layers = [parse_layer(line) for line in sys.stdin.readlines()]
    delay = find_delay(layers, args.mindelay, args.maxdelay)
    print("delay: {}".format(delay))
    exit(2 if delay is None else 0)