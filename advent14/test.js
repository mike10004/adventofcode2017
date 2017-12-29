const util = require('util');
const assert = require('assert');
const {
    countUsed, 
    makeGrid, 
    makeRow,
    getNeighbors,
    findRegions,
    computeGridWidth,
    getSampleGrid
} = require('./defrag');

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

function areSetsEqual(as, bs) {
    if (as.size !== bs.size) {
        return false;
    }
    for (let a of as) {
        if (!bs.has(a)) {
            return false;
        }
    }
    return true;
}

function compareInts(a, b) {
    return a - b;
}

(function testGetNeighbors(testCases) {
    testCases.forEach(tc => {
        const index = tc[0], gridWidth = tc[1], gridHeight = tc[2];
        let expected = tc[3];
        expected = expected.concat([]);
        expected.sort(compareInts);
        const actual = getNeighbors(index, gridWidth, gridHeight);
        actual.sort(compareInts);
        assert.deepEqual(actual, expected, util.format("index %d in %dx%d grid: actual %s != %s expected", index, gridWidth, gridHeight, actual, expected));
    });
    console.log(util.format("getNeighbors: %d tests passed", testCases.length));
})([
    // index, gridWidth, gridHeight, expected
    [0, 128, 128, [1, 128]],
    [0, 1, 1, []],
    [129, 128, 128, [1, 128, 130, 257]],
    [3, 4, 4, [2, 7]],
    [3, 2, 2, [1, 2]],
    [7, 4, 4, [3, 6, 11]]
]);

(function testFindRegions(testCases){
    console.log(util.format("%d tests to be performed for findRegions", testCases.length));
    testCases.forEach(testCase => {
        const grid = testCase.grid || makeGrid(testCase.key);
        const gridStr = grid.length > 36 ? util.format("grid[%d]", grid.length) : grid;
        console.log(util.format("expecting %d regions in %s", testCase.expected, gridStr));
        const actual = findRegions(grid).size;
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
    {grid: getSampleGrid(), expected: 12},
    {key: 'flqrgnkx', expected: 1242},
]);
