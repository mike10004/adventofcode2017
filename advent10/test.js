const assert = require('assert');
const {CircularList, Hasher, Encoder} = require('./knothash');
const util = require('util');

(function testCirclarList(){
    function testListFromArray(array) {
        console.log('testListFromArray', array);
        const list = new CircularList();
        array.forEach(value => list.add(value));
        assert.equal(list.size(), array.length, 'size');
        array.forEach((value, index) => {
            const actual = list.get(index);
            assert.equal(actual, value, 'get(' + index + '): expected ' + value + ' but got ' + actual);
        })
        assert.deepStrictEqual(list.toArray(), array, 'toArray');
        assert.equal(list.get(array.length), array[0], 'get(array.length) == get(0)');
        assert.equal(list.get(-1), array[array.length - 1], 'get(-1) === last element');
    }

    [
        [],
        ['a'],
        ['a', 'b'],
        ['a', 'b', 'c'],
        ['a', 'b', 'c', 'd']
    ].forEach(array => testListFromArray(array));

    const three = new CircularList([1, 2, 3]);
    assert.deepEqual(three.mod(0), 0);
    assert.deepEqual(three.mod(1), 1);
    assert.deepEqual(three.mod(2), 2);
    assert.deepEqual(three.mod(3), 0);
    assert.deepEqual(three.mod(4), 1);
    assert.deepEqual(three.mod(-1), 2);
    assert.deepEqual(three.mod(-2), 1);
    assert.deepEqual(three.mod(-3), 0);
    assert.deepEqual(three.mod(-4), 2);
    assert.deepEqual(three.mod(-5), 1);

    function ReverseTestCase(values, pos, length, expected) {
        this.values = values;
        this.pos = pos;
        this.length = length;
        this.expected = expected;
        const me = this;

        this.toString = function() {
            return JSON.stringify(me);
        }
    }

    function testReverse(testCase) {
        const list = new CircularList(testCase.values);
        list.reverse(testCase.pos, testCase.length);
        const actual = list.toArray();
        assert.deepEqual(actual, testCase.expected, util.format("[%s].reverse(%s, %s) produced [%s] instead of [%s]", testCase.values, testCase.pos, testCase.length, actual, testCase.expected));
    }

    [
        new ReverseTestCase([], 0, 0, []),
        new ReverseTestCase([1], 0, 1, [1]),
        new ReverseTestCase([1, 2], 0, 2, [2, 1]),
        new ReverseTestCase([1, 2, 3], 1, 1, [1, 2, 3]),
        new ReverseTestCase([1, 2, 3, 4], 1, 2, [1, 3, 2, 4]),
        new ReverseTestCase([1, 2, 3, 4], 2, 3, [3, 2, 1, 4]),
        new ReverseTestCase([0, 1, 2, 3, 4, 5], 5, 3, [0, 5, 2, 3, 4, 1]),
    ].forEach(testCase => testReverse(testCase));
})();

(function testHasher() {
    const ringSize = 5;
    const hasher = new Hasher(ringSize);
    const lengths = [3, 4, 1, 5];
    hasher.hash(lengths, i => console.log('hash step', i, hasher.toString()));
    console.log("final state", hasher.toString());
    const hash = hasher.digest();
    console.log("digest", hash);
    assert.equal(hash[0] * hash[1], 12, "multipled first two elements");

    assert.equal(hasher.xor([65, 27, 9, 1, 4, 3, 40, 50, 91, 7, 6, 0, 2, 5, 68, 22]), 64);

    const dense = hasher.makeDense([1, 2, 3, 4, 5, 6, 7, 8], 2);
    assert.equal(dense.length, 4);

    [
        ['', 'a2582a3a0e66e6e86e3812dcb672a272'],
        ['AoC 2017', '33efeb34ea91902bb2f59c9920caa6cd'],
        ['1,2,3', '3efbe78a8d82f29979031a4aa0b16a9d'],
        ['1,2,4', '63960835bcdc130f0b66d7ff4f6a5a8e'],
    ].forEach(testCase => {
        const input = testCase[0], expected = testCase[1];
        const h = new Hasher(256);
        const actual = h.hashFull(input);
        console.log(util.format("%s -> %s", input, actual));
        assert.equal(actual, expected);
    })
})();

(function testEncoder() {
    assert.deepEqual(new Encoder([]).encode("1,2,3"), [49,44,50,44,51]);
    assert.deepEqual(new Encoder().encode("1,2,3"), [49,44,50,44,51, 17, 31, 73, 47, 23]);
})();

console.log('tests passed');