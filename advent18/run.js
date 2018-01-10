const util = require('util');
const assert = require('assert');
const {Instruction, Processor, SoundPlayer} = require('./duet');
const text = require('fs').readFileSync('./input.txt', 'utf-8');
const instructions = Instruction.parseAll(text);
const recoveryListener = (action, frequency) => {
    if (action === 'recover') {
        console.log('recovered frequency', frequency);
        return instructions.length; // force to terminate
    }
};
const player = new SoundPlayer(recoveryListener);
const processor = new Processor(player);
processor.processAll({}, instructions, 100 * 1000);
