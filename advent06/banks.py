#!/usr/bin/env python3

# -*- coding: utf-8 -*-

import sys
import logging

_log = logging.getLogger('banks')

def arg_max(things):
    assert len(things) > 0
    mx = None
    a = 0
    for i in range(len(things)):
        if mx is None or things[i] > mx:
            a = i
            mx = things[i]
    return a

_MAX_CYCLES = 1024000

def main():
    from argparse import ArgumentParser
    parser = ArgumentParser()
    parser.add_argument("--log-level", choices=('DEBUG', 'INFO', 'WARN', 'ERROR'), default="INFO")
    args = parser.parse_args()
    logging.basicConfig(level = eval('logging.' + args.log_level))
    banks = list(map(int, sys.stdin.read().split()))
    seen = set()
    ncycles = 0
    while ncycles < _MAX_CYCLES:
        _log.debug(" %s", banks)
        current = tuple(banks)
        if current in seen:
            break
        seen.add(current)
        i = arg_max(banks)
        blocks = banks[i]
        # _log.debug("%d blocks in bank %d", blocks, i)
        banks[i] = 0
        while blocks > 0:
            i = (i + 1) % len(banks)
            # _log.debug("adding to bank %d", i)
            banks[i] += 1
            blocks -= 1
        ncycles += 1
    print("encountered already-seen configuration after {} cycles".format(ncycles))

if __name__ == '__main__':
    exit(main())
