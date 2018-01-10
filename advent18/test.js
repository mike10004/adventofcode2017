const {Instruction, Processor, SoundPlayer} = require('./duet');
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

describe('Processor', () => {
    it('processAll', () => {
        const text = "set a 1\nadd a 2\nmul a a\nmod a 5\nsnd a\nset a 0\nrcv a\njgz a -1\nset a 1\njgz a -2\n";
        const instructions = Instruction.parseAll(text);
        const player = new SoundPlayer();
        const p = new Processor(player);
        const registers = {};
        p.processAll(registers, instructions, 8);
        assert.equal(player.last(), 4);
    })
})