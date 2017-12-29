console.log('index.js');

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error("exactly one argument required (input filename)");
    process.exit(1);
}
const text = require('fs').readFileSync(args[0], 'utf8');
const instructions = text.split(',');
const util = require('util');
const {Promenade} = require('./promenade');
const p = new Promenade('abcdefghijklmnop');
const assert = require('assert');
assert.equal(p.sequence.length, 16);
const result = p.processAll(instructions);
console.log(util.format("'%s' is result after %d instructions", result, instructions.length));
