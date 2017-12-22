const assert = require('assert');
const {CircularList} = require('./knothash');
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
    const hash = hasher.digest();
    console.log("digest", hash);
    assert.equal(hash[0] * hash[1], 12, "multipled first two elements");
})();

console.log('tests passed');