#!/usr/bin/env python3

import re
import sys

def is_valid(passphrase):
    tokens = re.split(r'\s+', passphrase.strip())
    return len(tokens) == len(set(tokens))

def main():
    count = 0
    total = 0
    for passphrase in sys.stdin:
        count += 1 if is_valid(passphrase) else 0
        total += 1
    print("{} of {} passphrases are valid".format(count, total))

if __name__ == '__main__':
    exit(main())
