const {Instruction, Processor, communicate} = require('./duet');
const util = require('util');
const assert = require('assert');

describe('Instruction', () => {
    it('parse', () => {
        const actual = Instruction.parse('set a 1');
        assert.deepStrictEqual(actual, new Instruction('set', ['a', '1']));
    })
    it('parseAll', () => {
        const text = "set a 1\nadd a 2\nmul a a\n";
        const actual = Instruction.parseAll(text);
        assert.equal(actual.length, 3);
        actual.forEach(inst => {
            assert(inst instanceof Instruction);
        });
    });
})

describe('communicate', () => {
    it.only('sample', () => {
        const text = "snd 1\n" + 
            "snd 2\n" + 
            "snd p\n" + 
            "rcv a\n" + 
            "rcv b\n" + 
            "rcv c\n" + 
            "rcv d\n";
        const instructions = Instruction.parseAll(text);
        const states = communicate(instructions, (result0, result1) => {
            console.log(util.format("result0 = %s", result0));
            console.log(util.format("result1 = %s", result1));
            process.stdout.write("\n");
        });
        const r0 = states[0].registers, r1 = states[1].registers;
        console.log("states[0]", states[0].toString());
        console.log("states[1]", states[1].toString());
        assert.equal(r0['c'], 1);
        assert.equal(r1['c'], 0);
        assert.equal(states[0].transmitter.getNumSent(), 3);
        assert.equal(states[1].transmitter.getNumSent(), 3);
        assert.equal(states[0].transmitter.getNumReceived(), 3);
        assert.equal(states[1].transmitter.getNumReceived(), 3);
    })
})