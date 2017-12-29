#!/usr/bin/python3

# -*- coding: utf-8 -*-

_MODULUS = 2147483647
_NUM_TAIL_BITS = 16

FACTOR_A = 16807
FACTOR_B = 48271

class Generator:

    def __init__(self, factor, start, modulus=_MODULUS):
        self.previous = start;
        self.factor = factor
        self.modulus = modulus
    
    def next(self, n=None):
        if n is None:
            self.previous = (self.previous * self.factor) % self.modulus
            return self.previous
        else:
            return list(map(lambda _: self.next(), list(range(n))))

def base2str(value):
    """Produces the binary string representation of an integer value"""
    return "{:032b}".format(value)

class Judge:

    def __init__(self):
        self.matches = 0
    
    def _trim(self, binstr):
        return binstr[len(binstr) - _NUM_TAIL_BITS:]

    def compare_once(self, a, b):
        avalue = self._trim(base2str(a.next()))
        bvalue = self._trim(base2str(b.next()))
        return avalue == bvalue
    
    def compare_all(self, a, b, trials):
        for i in range(trials):
            if self.compare_once(a, b):
                self.matches += 1
        return self.matches

# Puzzle Input
#
# Generator A starts with 634
# Generator B starts with 301

if __name__ == '__main__':
    a = Generator(FACTOR_A, 634)
    b = Generator(FACTOR_B, 301)
    judge = Judge()
    trials = 40000000
    matches = judge.compare_all(a, b, trials)
    print("{} matches in {} trials".format(matches, trials))
    
