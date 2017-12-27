const structures = require('../common/structures');
const assert = require('assert');
const util = require('util');

// https://stackoverflow.com/a/5085274/2657036
const ALTHENIA = {
    offsets: [
        ['nw', [ -1,  1]],
        ['n',  [  0,  1]],
        ['ne', [  1,  0]],
        ['se', [  1, -1]],
        ['s',  [  0, -1]],
        ['sw', [ -1,  0]],
    ], 
    distance: function(a, b) {
        const dx  = a[0] - b[0];
        const dy = a[1] - b[1];
        if ((dx < 0) === (dy < 0)) {
            return Math.abs(dx + dy);
        } else {
            return Math.max(Math.abs(dx), Math.abs(dy));
        }
    }
}

const CUBE = {
    offsets: [
        ['nw', [ 1,  0,  0]],
        ['n',  [ 0,  0,  1]],
        ['ne', [ 0, -1,  0]],
        ['se', [-1,  0,  0]],
        ['s',  [ 0,  0, -1]],
        ['sw', [ 0,  1,  0]],
    ], 
    distance: function(a, b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    }
};

class Geometry {

    constructor(definition) {
        this.distance = definition.distance;
        this.hexes = new structures.QSet();
        this.neighborOffsetsMap = new Map();
        definition.offsets.forEach(entry => {
            this.neighborOffsetsMap.set(entry[0], entry[1]);
        });
        this.neighborOffsets = Array.from(this.neighborOffsetsMap.values());
    }

    // produce a new hex that represents a move from the given hex in a single direction
    move(hex, direction) {
        return this.translate(hex, this.neighborOffsetsMap.get(direction));
    }

    // produce a new hex that represents a move from the given hex along an array of directions
    travel(hex, path, callback) {
        let final = hex;
        let n = 0;
        path.forEach(direction => {
            final = this.move(final, direction);
            n++;
            callback && callback(final, direction, n);
        });
        return final;
    }

    // produce a new hex that represents a move from the given hex along an array of offsets
    translate(hex, offset) {
        return hex.map((value, index) => value + (offset[index] || 0));
    }

    // produce an array of hexes that represents the neighbors of the given hex
    neighbors(hex) {
        return this.neighborOffsets.map(offset => {
            return this.translate(hex, offset);
        });
    }
}

function parsePath(input) {
    return input.trim().split(',');
}


const origin = [0, 0];
const geometry = new Geometry(ALTHENIA);

(function testTravel(testCases){
    console.log('testTravel: running tests', testCases.length);
    testCases.forEach(tc => {
        const destination = geometry.travel(origin, parsePath(tc.path));
        const actual = geometry.distance(origin, destination);
        assert.equal(geometry.distance(destination, origin), actual, 'geometry.distance is not commutative');
        console.log(tc.path, destination, actual, tc.steps);
        assert.equal(actual, tc.steps, util.format('failed on "%s": expected %d, got %d', tc.path, tc.steps, actual));
    });
    console.log('testTravel: tests passed', testCases.length);
})([
    {path: 'ne,ne,ne', steps: 3},
    {path: 'ne,ne,sw,sw', steps: 0},
    {path: 'ne,ne,s,s', steps: 2},
    {path: 'se,sw,se,sw,sw', steps: 3},
]);

const args = process.argv.slice(2);
if (args.length > 0) {
    const path = args[0];
    const fs = require('fs');
    const hexPath = parsePath(fs.readFileSync(path, 'utf8'));
    let farthest = 0;
    const position = geometry.travel(origin, hexPath, (hex) => {
        const current = geometry.distance(origin, hex);
        if (current > farthest) {
            farthest = current;
        }
    });
    const dist = geometry.distance(origin, position);
    console.log(util.format("%d steps to reach %s from %s", dist, origin, position));
    console.log(util.format("farthest distance was %s hexes", farthest));
}