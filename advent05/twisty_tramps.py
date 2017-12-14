#!/usr/bin/env python3

# -*- coding: utf-8 -*-

import sys

class JumpList1:

    def __init__(self, jumps):
        self.jumps = jumps
        self.cursor = 0
        self.steps = 0

    def _update(self):
        self.jumps[self.cursor] += 1

    def advance(self):
        current = self.jumps[self.cursor]
        self._update()
        self.cursor += current
        self.steps += 1
    
    def in_bounds(self):
        return self.cursor >= 0 and self.cursor < len(self.jumps)

class JumpList2(JumpList1):

    def _update(self):
        offset = self.jumps[self.cursor]
        if offset >= 3:
            offset -= 1
        else:
            offset += 1
        self.jumps[self.cursor] = offset

def main():
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument("--part", choices=('one', 'two'), default='one')
    args = parser.parse_args()
    text = sys.stdin.read()
    jumps = list(map(int, text.split()))
    jumplist = JumpList1(jumps) if args.part == 'one' else JumpList2(jumps)
    while jumplist.in_bounds():
        jumplist.advance()
    print("exited after {} jumps from {} offsets".format(jumplist.steps, len(jumps)))

if __name__ == '__main__':
    exit(main())
