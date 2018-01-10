const util = require('util');
const assert = require('assert');
const {Instruction, Processor, communicate} = require('./duet');
const {Queue} = require('../common/structures');

const text = require('fs').readFileSync('./input.txt', 'utf-8');
const instructions = Instruction.parseAll(text);
let numActions = 0;
const MAX_ACTIONS = 1024 * 1024 * 1024;
assert(MAX_ACTIONS > 0);
const debug = console.log;
const limiter = (result0, result1) => {
    debug(util.format("[%s, %s]", result0, result1));
    numActions += (result0.progress + result1.progress);
    if (numActions > MAX_ACTIONS) {
        throw 'max actions exceeded';
    }
}
const states = communicate(instructions, limiter);
const r0 = states[0].registers, r1 = states[1].registers;
console.log("states[0]", states[0]);
console.log("states[1]", states[1]);
