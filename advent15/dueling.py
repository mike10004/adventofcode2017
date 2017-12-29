#!/usr/bin/python3

# -*- coding: utf-8 -*-

_MODULUS = 2147483647
_NUM_TAIL_BITS = 16

FACTOR_A = 16807
FACTOR_B = 48271
CONSTRAINT_A = 4
CONSTRAINT_B = 8

class Generator(object):

    def __init__(self, factor, start, modulus=_MODULUS):
        self.previous = start
        self.factor = factor
        self.modulus = modulus
    
    def next(self, n=None):
        if n is None:
            self.previous = (self.previous * self.factor) % self.modulus
            return self.previous
        else:
            return list(map(lambda _: self.next(), list(range(n))))

class PickyGenerator(Generator):

    def __init__(self, factor, start, constraint, modulus=_MODULUS):
        super(PickyGenerator, self).__init__(factor, start, modulus)
        self.constraint = constraint
    
    def next(self, n=None):
        if n is None:
            while True:
                val = super(PickyGenerator, self).next()
                if val % self.constraint == 0:
                    return val
        else:
            return super(PickyGenerator, self).next(n)

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
    from argparse import ArgumentParser
    p = ArgumentParser()
    p.add_argument("part", choices=('one', 'two'))
    p.add_argument("--start-a", type=int, default=634)
    p.add_argument("--start-b", type=int, default=301)
    args = p.parse_args()
    if args.part == 'one':
        a = Generator(FACTOR_A, args.start_a)
        b = Generator(FACTOR_B, args.start_b)
        trials = 40000000
    elif args.part == 'two':
        a = PickyGenerator(FACTOR_A, args.start_a, CONSTRAINT_A)
        b = PickyGenerator(FACTOR_B, args.start_b, CONSTRAINT_B)
        trials = 5000000
    judge = Judge()
    matches = judge.compare_all(a, b, trials)
    print("part {}: {} matches in {} trials".format(args.part, matches, trials))
