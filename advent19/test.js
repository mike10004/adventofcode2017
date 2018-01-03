const assert = require('assert');
const util = require('util');
const tubes = require('./tubes');
const text = '     |          \r\n     |  +--+    \r\n     A  |  C    \r\n F---|----E|--+ \r\n     |  |  |  D \r\n     +B-+  +--+ \r\n';

describe('Coordinate', () => {
    it('translate', () => {
        const c = new tubes.CoordinatePair(3, 5);
        const d = c.translate(new tubes.Offset(-1, 0));
        assert.deepEqual(d, new tubes.CoordinatePair(2, 5));
        assert(c !== d);
    })
})

describe('TubeMap', () => {
    it('parse', () => {
        const map = tubes.TubeMap.parse(text);
        assert.equal(map.width, 16);
        assert.equal(map.height, 6);
    })
})

describe('TubeMap', () => {
    const map = tubes.TubeMap.parse(text);
    it('isDefined', () => {
        assert.equal(map.isDefined(3, 16), false, 'expected false at (3, 16): ' + map.cell(3, 16));
        assert.equal(map.isDefined(-1, 4), false);
        assert.equal(map.isDefined(8, 4), false);
        assert.equal(map.isDefined(0, 0), false);
        assert.equal(map.isDefined(5, 15), false);
        assert.equal(map.isDefined(3, 1), true);
        assert.equal(map.isDefined(5, 11), true, 'expected isDefined at (5, 11): ' + map.cell(5, 11));
    })
    it('isChar', () => {
        assert(map.isChar(2, 5), 'expected char at (2, 5): ' + map.cell(2, 5));
    })
    it('start', () => {
        assert.deepEqual(map.start(), new tubes.CoordinatePair(0, 5));
    })
    it('isTurn', () => {
        assert(map.isTurn(1, 8));
        assert(!map.isTurn(1, 9));
    })
})

describe('Packet', () => {
    const map = tubes.TubeMap.parse(text);
    it('move', () => {
        const packet = new tubes.Packet();
        const path = [];
        let val;
        while ((val = packet.move(map)) !== null) {
            path.push(val);
        }
        assert.equal(path.length, 38, 'steps');
        assert.equal('||A||+B-+|-|+--+C||+--+D+--|E----|---F', path.join(''));
    });
})

