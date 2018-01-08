const util = require('util');
const assert = require('assert');
const args = process.argv.slice(2);
const text = require('fs').readFileSync(args[0], 'utf-8');
const numBursts = parseInt(args[1], 10);
assert(!isNaN(numBursts), "expecting num bursts as second argument: " + args[1]);
const {Grid, Virus} = require('./sporifica');
const grid = Grid.parse(text);
const virus = new Virus();
for (let i = 0; i < numBursts; i++) {
    virus.move(grid);
}
console.log(util.format("%d infections after %d bursts", virus.numInfections, numBursts));