#!/usr/bin/python3

# -*- coding: utf-8 -*-

import unittest
from dueling import Generator, Judge, PickyGenerator, FACTOR_A, FACTOR_B, CONSTRAINT_A, CONSTRAINT_B

class TestGenerator(unittest.TestCase):

    def test_a(self):
        g = Generator(FACTOR_A, 65)
        self.assertEqual(g.next(5), [1092455, 1181022009, 245556042, 1744312007, 1352636452])
    
    def test_b(self):
        g = Generator(FACTOR_B, 8921)
        self.assertEqual(g.next(5), [430625591, 1233683848, 1431495498, 137874439, 285222916])

class TestPickyGenerator(unittest.TestCase):

    def test_a(self):
        expected = [1352636452, 1992081072, 530830436, 1980017072, 740335192]
        actual = PickyGenerator(FACTOR_A, 65, CONSTRAINT_A).next(5)
        self.assertEqual(actual, expected)

class TestJudge(unittest.TestCase):

    def test_compare_5(self):
        a = Generator(FACTOR_A, 65)
        b = Generator(FACTOR_B, 8921)
        judge = Judge()
        actual = judge.compare_all(a, b, 5)
        self.assertEqual(actual, 1)
    
    def ignore_test_compare_40m(self): # ignored because it takes a long time
        a = Generator(FACTOR_A, 65)
        b = Generator(FACTOR_B, 8921)
        judge = Judge()
        actual = judge.compare_all(a, b, 40000000)
        self.assertEqual(actual, 588)
    
    def test_picky(self):
        a = PickyGenerator(FACTOR_A, 65, CONSTRAINT_A)
        b = PickyGenerator(FACTOR_B, 8921, CONSTRAINT_B)
        judge = Judge()
        actual = judge.compare_all(a, b, 1065)
        self.assertEqual(actual, 1)
        

if __name__ == '__main__':
    unittest.main()
