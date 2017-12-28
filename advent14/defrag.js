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

function toGrid(row) {
    return row.replace(/1/g, '#').replace(/0/g, '.');
}

function makeRow(key, index) {
    const knot = new Hasher().hashFull(util.format('%s-%d', key, index));
    return knot.split('').map(digit => {
        return padLeft(parseInt(digit, 16).toString(2), 4);
    }).join('');
}

function countUsed(key) {
    const rows = range(0, 128).map(rowIndex => makeRow(key, rowIndex));
    const grid = rows.map(toGrid).join('\n');
    const numUsed = grid.split('').map(x => x === '#' ? 1 : 0).reduce((a, b) => a + b);
    return numUsed;
}

const assert = require('assert');

(function testMakeRow(key){
    const row = makeRow(key, 0);
    assert.equal(row.length, 128);
    console.log('makeRow passed tests');
})('flqrgnkx');

(function testCountUsed(key, expected) {
    assert.equal(countUsed(key), expected);
    console.log('countUsed passed tests');
})('flqrgnkx', 8108);

const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error("usage: must specify key string");
    process.exit(1);
}

const key = args[0];
console.log(util.format("%d squares used for key %s", countUsed(key), key));

