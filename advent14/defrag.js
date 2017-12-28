const {Hasher} = require('../advent10/knothash');
const util = require('util');

function range(minInclusive, maxExclusive, step) {
    step = step || 1;
    const values = [];
    for (let i = minInclusive; i < maxExclusive; i += step) {
        values.push(i);
    }
    return values;
}

function padLeft(value, minLength, padchar) {
    padchar = padchar || '0';
    minLength = minLength || 0;
    value = value.toString();
    while (value.length < minLength) {
        value = padchar + value;
    }
    return value;
}

function drawGrid(row) {
    return row.replace(/1/g, '#').replace(/0/g, '.');
}

function concatenate(a, b) {
    return a.concat(b);
}

function makeRow(key, index) {
    const knot = new Hasher().hashFull(util.format('%s-%d', key, index));
    return knot.split('').map(digit => {
        return padLeft(parseInt(digit, 16).toString(2), 4).split('').map(x => parseInt(x, 10));
    }).reduce(concatenate);
}

const GRID_HEIGHT = 128, GRID_WIDTH = 128;

function makeGrid(key) {
    const rows = range(0, GRID_HEIGHT).map(rowIndex => makeRow(key, rowIndex));
    return rows.reduce(concatenate);
}

function sum(a, b) {
    return a + b;
}

function countUsed(grid) {
    assert(Array.isArray(grid), 'not an array: ' + grid);
    return grid.reduce(sum);
}

const assert = require('assert');

(function testMakeRow(key){
    const row = makeRow(key, 0);
    assert.equal(row.length, 128);
    row.forEach(value => {
        assert(value === 0 || value === 1, 'value is not 0 or 1: ' + value);
    });
    console.log('makeRow passed tests');
})('flqrgnkx');

(function testCountUsed(key, expected) {
    assert.equal(countUsed([0, 1, 1, 0, 1, 0]), 3);
    assert.equal(countUsed(makeGrid('flqrgnkx')), 8108);
    console.log('countUsed passed tests');
})();

const {UndirectedGraph} = require('../common/structures');

function getNeighbors(index, gridWidth, gridHeight) {
    const row = parseInt(Math.floor(index / gridWidth));
    const col = index % gridWidth;
    return [index - gridWidth, index - 1, index + 1, index + gridWidth]
            .filter(i => i >= 0 && i < (gridWidth * gridHeight));
}

(function testGetNeighbors(testCases) {
    testCases.forEach(tc => {
        const index = tc[0], gridWidth = tc[1], gridHeight = tc[2], expected = tc[3];
        const actual = getNeighbors(index, gridWidth, gridHeight);
        assert.deepEqual(actual, expected, util.format("index %d in %dx%d grid: %s != %s", index, gridWidth, gridHeight, actual, expected));
    });
    console.log(util.format("getNeighbors: %d tests passed", testCases.length));
})([
    // index, gridWidth, gridHeight, expected
    [0, 128, 128, [1, 128]],
    [0, 1, 1, []],
    [129, 128, 128, [1, 128, 130, 257]]
]);

const USED = 1, FREE = 0;

function findRegions(grid, key) {
    const g = new UndirectedGraph();
    const usedSquares = new Set();
    const gridWidth = computeGridWidth(grid);
    if (grid.length > 0) {
        assert.equal(gridWidth, grid.length / gridWidth, "not a square grid: " + grid.length);
    }
    grid.forEach((value, index) => {
        if (value === USED) {
            usedSquares.add(index);
            const neighbors = getNeighbors(index, gridWidth, gridWidth);
            neighbors.forEach(n => {
                if (grid[n] === USED) {
                    g.addEdge(index, n);
                }
            });
        }
    });
    
    const regions = new Set();
    for (let index of usedSquares) {
        const region = new Set();
        g.traverseDepthFirst(index, neighbor => {
            region.add(neighbor);
        });
        regions.add(region);
        for (let member of region) {
            usedSquares.delete(member);
        }
    }
    return regions;
}

const SAMPLE_GRID = [
    1, 1, 0, 1, 0, 1, 0, 0,
    0, 1, 0, 1, 0, 1, 0, 1, 
    0, 0, 0, 0, 1, 0, 1, 0,
    1, 0, 1, 0, 1, 1, 0, 1,
    0, 1, 1, 0, 1, 0, 0, 0, 
    1, 1, 0, 0, 1, 0, 0, 1,
    0, 1, 0, 0, 0, 1, 0, 0,
    1, 1, 0, 1, 0, 1, 1, 0
];

function computeGridWidth(grid) {
    return parseInt(Math.floor(Math.sqrt(grid.length)));
}

function gridArrayToRows(grid, gridWidth) {
    gridWidth = gridWidth || computeGridWidth(grid);
    const rows = [];
    let row = [];
    for (let i = 0; i < grid.length; i++) {
        row.push(grid[i]);
        if ((i + 1) % gridWidth === 0) {
            rows.push(row);
            row = [];
        }
    }
    return rows;
}

function demoFindRegions(arrayOfGridOrKey){
    arrayOfGridOrKey.forEach(gridOrKey => {
        let grid = gridOrKey;
        if (!Array.isArray(grid)) {
            grid = makeGrid(gridOrKey);
        }
        const regions = findRegions(grid);
        const regionsByName = new Map();
        const nameByIndex = new Map();
        let n = 0;
        let longestNameLength = 0;
        for (let region of regions) {
            let name = '#';
            if (region.size > 1) {
                name = n.toString(32);
                regionsByName.set(name, region);
                if (name.length > longestNameLength) {
                    longestNameLength = name.length;
                }
            }
            for (let index of region) {
                nameByIndex.set(index, name);
            }
            n++;
        }
        const labeled = grid.map((value, index) => {
            let label = '.';
            if (nameByIndex.has(index)) {
                label = nameByIndex.get(index);
            }
            return padLeft(label, longestNameLength + 1, ' ');
        });
        const rendered = gridArrayToRows(labeled).map(row => row.join('')).join("\n");
        console.log(rendered);
    });
}

// demoFindRegions([
//     SAMPLE_GRID,
//      'flqrgnkx',
// ]);

(function testFindRegions(testCases){
    console.log(util.format("%d tests to be performed for findRegions", testCases.length));
    testCases.forEach(testCase => {
        const grid = testCase.grid || makeGrid(testCase.key);
        const actual = findRegions(grid).size;
        const gridStr = grid.length > 36 ? util.format("grid[%d]", grid.length) : grid;
        assert.equal(actual, testCase.expected, util.format("expected %d != %d regions in grid %s", testCase.expected, actual, gridStr));
    });    
})([
    {grid: [], expected: 0},
    {grid: [1], expected: 1},
    {grid: [1, 0, 
            0, 1], expected: 2},
    {grid: [0, 0, 0, 0, 
        0, 0, 0, 0, 
        0, 0, 0, 0, 
        0, 0, 0, 0], expected: 0},
    {grid: [1, 0, 
            0, 0], expected: 1},
    {grid: [
        0, 1, 
        0, 1, 
    ], expected: 1},
    {grid: [
        1, 0,
        1, 0
    ], expected: 1},
    {grid: [
        1, 0, 0, 
        1, 0, 1,
        0, 0, 1
    ], expected: 2},
    {grid: SAMPLE_GRID, expected: 12},
    {key: 'flqrgnkx', expected: 1242},
]);

const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error("usage: must specify key string");
    process.exit(1);
}
const key = args[0];
const grid = makeGrid(key);
console.log(util.format("%d squares used for key %s", countUsed(grid), key));
console.log(util.format("%d regions produced by key %s", findRegions(grid, key).size, key));
