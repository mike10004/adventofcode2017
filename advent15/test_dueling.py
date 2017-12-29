#!/usr/bin/python3

# -*- coding: utf-8 -*-

import unittest
from dueling import Generator, Judge, FACTOR_A, FACTOR_B

class TestGenerator(unittest.TestCase):

    def test_a(self):
        g = Generator(FACTOR_A, 65)
        self.assertEqual(g.next(5), [1092455, 1181022009, 245556042, 1744312007, 1352636452])
    
    def test_b(self):
        g = Generator(FACTOR_B, 8921)
        self.assertEqual(g.next(5), [430625591, 1233683848, 1431495498, 137874439, 285222916])

class TestJudge(unittest.TestCase):

    def test_compare_5(self):
        a = Generator(FACTOR_A, 65)
        b = Generator(FACTOR_B, 8921)
        judge = Judge()
        actual = judge.compare_all(a, b, 5)
        self.assertEqual(actual, 1)
    
    def test_compare_40m(self):
        a = Generator(FACTOR_A, 65)
        b = Generator(FACTOR_B, 8921)
        judge = Judge()
        actual = judge.compare_all(a, b, 40000000)
        self.assertEqual(actual, 588)

if __name__ == '__main__':
    unittest.main()
