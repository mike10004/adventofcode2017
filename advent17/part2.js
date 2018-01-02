const util = require('util');
const assert = require('assert');
const args = process.argv.slice(2);
const steps = parseInt(args[0], 10);
const insertions = parseInt(args[1], 10);
assert(!isNaN(steps) && !isNaN(insertions), "must provide arguments: STEPS INSERTIONS (e.g. 394 50000000): " + args.join(" "));
const value = require('./spinlock').findValueAfterZero(steps, insertions);
console.log(util.format("most recent insertion after 0: %d", value));
