const structures = require('../common/structures');
const assert = require('assert');
const util = require('util');

class Hex {

    constructor(x, y, z) {
        if (Array.isArray(x)) {
            this.x = x[0];
            this.y = x[1];
            this.x = x[2];
        } else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
        this.str = util.format("[%s, %s, %s]", this.x, this.y, this.z);
    }

    toString() {
        return this.str;
    }
    
}

// https://stackoverflow.com/a/5085274/2657036
const ALTHENIA = {
    offsets: [
        ['nw', [ -1,  1,  0]],
        ['n',  [  0,  1,  0]],
        ['ne', [  1,  0,  0]],
        ['se', [  1, -1,  0]],
        ['s',  [  0, -1,  0]],
        ['sw', [ -1,  0,  0]],
    ], 
    distance: function(a, b) {
        const dx  = a.x - b.x;
        const dy = a.y - b.y;
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
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
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
    travel(hex, path) {
        let final = hex;
        path.forEach(direction => {
            final = this.move(final, direction);
        });
        return final;
    }

    // produce a new hex that represents a move from the given hex along an array of offsets
    translate(hex, offset) {
        return new Hex(hex.x + offset[0], hex.y + offset[1], hex.z + offset[2]);
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


const origin = new Hex(0, 0, 0);
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
    const position = geometry.travel(origin, hexPath);
    const dist = geometry.distance(origin, position);
    console.log(util.format("%d steps to reach %s from %s", dist, origin, position));
}