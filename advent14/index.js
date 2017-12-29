const {
    makeGrid,
    countUsed,
    findRegions
} = require('./defrag');
const util = require('util');

const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error("usage: must specify key string");
    process.exit(1);
}
const key = args[0];
const grid = makeGrid(key);
console.log(util.format("%d squares used for key %s", countUsed(grid), key));
console.log(util.format("%d regions produced by key %s", findRegions(grid, key).size, key));
