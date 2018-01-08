const util = require('util');
const assert = require('assert');
const args = process.argv.slice(2);
const part = args[0];
assert(['one', 'two'].indexOf(part) >= 0, "first argument must be either 'one' or 'two'");
const text = require('fs').readFileSync(args[1], 'utf-8');
const numBursts = parseInt(args[2], 10);
assert(!isNaN(numBursts), "expecting num bursts as third argument: " + args[2]);
const {Grid, Virus, PartTwoVirus, INFECTED} = require('./sporifica');
const grid = Grid.parse(text);
console.log(util.format("grid of size %d starts with %d infections", grid.count(), grid.count(INFECTED)));
const virus = part === 'one' ? new Virus() : new PartTwoVirus();
for (let i = 0; i < numBursts; i++) {
    virus.move(grid);
}
console.log(util.format("grid of size %d ends with %d infections", grid.count(), grid.count(INFECTED)));
console.log(util.format("%d bursts cause a node to become infected", virus.numInfections, numBursts));