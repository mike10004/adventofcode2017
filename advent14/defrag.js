const {Hasher} = require('../advent10/knothash');
const util = require('util');
const {UndirectedGraph} = require('../common/structures');
const USED = 1, FREE = 0;
const GRID_HEIGHT = 128, GRID_WIDTH = 128;
const assert = require('assert');

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

function getSampleGrid() {
    return [
        1, 1, 0, 1, 0, 1, 0, 0,
        0, 1, 0, 1, 0, 1, 0, 1, 
        0, 0, 0, 0, 1, 0, 1, 0,
        1, 0, 1, 0, 1, 1, 0, 1,
        0, 1, 1, 0, 1, 0, 0, 0, 
        1, 1, 0, 0, 1, 0, 0, 1,
        0, 1, 0, 0, 0, 1, 0, 0,
        1, 1, 0, 1, 0, 1, 1, 0
    ];
}

function computeGridWidth(grid) {
    return parseInt(Math.floor(Math.sqrt(grid.length)));
}

function getNeighbors(index, gridWidth, gridHeight) {
    const row = parseInt(Math.floor(index / gridWidth));
    const col = index % gridWidth;
    const indices = [
        [row - 1,     col],
        [    row, col - 1],
        [    row, col + 1],
        [row + 1,     col]
    ];
    return indices.filter(pair => {
        const row = pair[0], col = pair[1];
        return row >= 0 && row < gridHeight && col >= 0 && col < gridWidth;
    }).map(pair => {
        const row = pair[0], col = pair[1];
        return row * gridWidth + col;
    });
}

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

module.exports = {
    countUsed: countUsed, 
    makeGrid: makeGrid, 
    makeRow: makeRow,
    getNeighbors: getNeighbors,
    findRegions: findRegions,
    computeGridWidth: computeGridWidth,
    getSampleGrid: getSampleGrid,
    padLeft: padLeft
};
