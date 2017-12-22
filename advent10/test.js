const assert = require('assert');
const {CircularList} = require('./knothash');

(function(){
    const list = new CircularList();
    assert.equal(typeof list.head, 'undefined');
    assert.equal(typeof list.tail, 'undefined');
    assert.equal(0, list.size());
    list.add('a');
    assert.equal(list.head.value, 'a');
    assert.equal(list.tail.value, 'a');
    assert.notEqual(typeof list.head, 'undefined');
    assert.notEqual(typeof list.head, 'undefined');
    assert.equal(list.head, list.tail, 'head == tail');
    assert.equal(list.head.next, list.head, 'head.next == head');
    list.add('b');
    assert.notEqual(list.head.next, list.head, 'head.next updated with new node');
    assert.equal(list.tail.value, 'b');
})();

(function(){
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
        assert(typeof list.get(array.length), 'undefined', 'get(index > length) is undefined');
        assert(typeof list.get(-1), 'undefined', 'get(-1) undefined');
        // implementation details
        assert.equal(typeof list.head, typeof list.tail);
        if (list.head) assert.equal(list.head.value, array[0], 'head.value');
        if (list.tail) assert.equal(list.tail.value, array[array.length - 1], 'tail.value');
        if (list.tail) assert.equal(list.tail.next, list.head, 'tail.next == head');
        if (list.head) assert.equal(list.head.prev, list.tail)
    }

    [
        [],
        ['a'],
        ['a', 'b'],
        ['a', 'b', 'c'],
        ['a', 'b', 'c', 'd']
    ].forEach(array => testListFromArray(array));
})();

console.log('tests passed');