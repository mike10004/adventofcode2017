const util = require('util');
const assert = require('assert');
const args = process.argv.slice(2);
const steps = parseInt(args[0]);
assert(!isNaN(steps), "must provide step count as argument");
const {SpinLock} = require('./spinlock');
const lock = new SpinLock();
lock.iterate(steps, 2017);
const indexOf2017 = lock.nodes.indexOf(2017);
console.log(util.format("value after 2017: %s", lock.nodes[indexOf2017 + 1]));