#!/usr/bin/env python3

import re
import sys

def to_multiset(token): 
    """ Creates a multiset from a string. A multiset is a set of tuples (c, n) where c is a character and n is a count of that character in the string."""
    counts = {}
    for ch in token:
        try:
            count = counts[ch]
        except KeyError:
            count = 0
        counts[ch] = count + 1
    multiset = set()
    for ch in counts:
        multiset.add((ch, counts[ch]))
    return frozenset(multiset)

def parse_tokens(passphrase):
    return re.split(r'\s+', passphrase.strip())

def is_tokens_not_anagrams(passphrase):
    tokens = parse_tokens(passphrase)
    multisets = [to_multiset(token) for token in tokens]
    return len(multisets) == len(set(multisets))

def is_tokens_unique(passphrase):
    tokens = parse_tokens(passphrase)
    return len(tokens) == len(set(tokens))

def main():
    tokens_unique_count = 0
    tokens_not_anagrams_count = 0
    total = 0
    for passphrase in sys.stdin:
        tokens_unique_count += 1 if is_tokens_unique(passphrase) else 0
        tokens_not_anagrams_count += 1 if is_tokens_not_anagrams(passphrase) else 0
        total += 1
    print("{} of {} passphrases have unique tokens".format(tokens_unique_count, total))
    print("{} of {} passphrases have anagram-unique tokens".format(tokens_not_anagrams_count, total))

if __name__ == '__main__':
    exit(main())
