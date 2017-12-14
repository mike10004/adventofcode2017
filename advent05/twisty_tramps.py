#!/usr/bin/env python3

# -*- coding: utf-8 -*-

import sys

class JumpList:

    def __init__(self, jumps):
        self.jumps = jumps
        self.cursor = 0
        self.steps = 0
    
    def advance(self):
        current = self.jumps[self.cursor]
        self.jumps[self.cursor] += 1
        self.cursor += current
        self.steps += 1
    
    def in_bounds(self):
        return self.cursor >= 0 and self.cursor < len(self.jumps)

def main():
    text = sys.stdin.read()
    jumps = list(map(int, text.split()))
    jumplist = JumpList(jumps)
    while jumplist.in_bounds():
        jumplist.advance()
    print("exited after {} jumps".format(jumplist.steps))

if __name__ == '__main__':
    exit(main())
