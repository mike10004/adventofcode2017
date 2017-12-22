const assert = require('assert');
const {CircularList} = require('./knothash');

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