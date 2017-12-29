const assert = require('assert');

describe('basic test', () => {
    it('says something', () => {
        const {Promenade} = require('./promenade');
        const actual = new Promenade().go('world');
        assert.equal(actual, 'Hello world');
    });
});
