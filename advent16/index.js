const util = require('util');
const assert = require('assert');
const args = process.argv.slice(2);
if (args.length != 2) {
    console.error("exactly two arguments required: FILENAME DANCES");
    process.exit(1);
}
const text = require('fs').readFileSync(args[0], 'utf8');
const numDances = parseInt(args[1], 10);
assert(!isNaN(numDances), 'numDances NaN');
const {Promenade, Instruction} = require('./promenade');
const instructions = text.split(',').map(s => Instruction.parseInstruction(s));
const original = 'abcdefghijklmnop';
const p = new Promenade(original);
assert.equal(p.sequence.length, 16);
let current;
let cyclePoint;
for (let dance = 0; dance < numDances; dance++) {
    p.processAll(instructions);
    current = p.state();
    if (current === original) {
        console.log(util.format("cycle after %d dances", dance + 1));
        cyclePoint = dance + 1;
        break;
    }
}
if (cyclePoint) {
    for (let dance = 0; dance < (numDances % cyclePoint); dance++) {
        p.processAll(instructions);
    }
}
const result = p.state();
console.log(util.format("'%s' is result after %d dance(s) of %d instructions", result, numDances, instructions.length));
