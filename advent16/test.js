const assert = require('assert');
const {
    Promenade,
    Action,
    Instruction
} = require('./promenade');

describe('Instruction.parseInstruction', () => {
    [
        {
            input: 's1',
            expected: new Instruction(Action.SPIN, 1)
        },
        {
            input: 'x3/4',
            expected: new Instruction(Action.EXCHANGE, 3, 4)
        },
        {
            input: 'pe/b',
            expected: new Instruction(Action.PARTNER, 'e', 'b')
        }
    ].forEach(testCase => {
        it('input: ' + testCase.input, () => {
            const actual = Instruction.parseInstruction(testCase.input);
            assert.deepEqual(actual, testCase.expected);
        });
    });
});

describe('Promenade', () => {
    it('spin', () => {
        assert.equal(new Promenade('abcde').spin(1).state(), 'eabcd');
        assert.equal(new Promenade('abcde').spin(5).state(), 'abcde');
        assert.equal(new Promenade('abcde').spin(3).state(), 'cdeab');
    });
    it('exchange', () => {
        assert.equal(new Promenade('eabcd').exchange(3, 4).state(), 'eabdc');
    });
    it('partner', () => {
        assert.equal(new Promenade('eabdc').partner('e', 'b').state(), 'baedc');
    });
});

describe('Promenade.processAll', () => {
    it('one dance', () => {
        const instructions = ['s1', 'x3/4', 'pe/b'].map(s => Instruction.parseInstruction(s));
        const actual = new Promenade('abcde').processAll(instructions).state();
        assert.equal(actual, 'baedc');
    });
    it('two dances', () => {
        const instructions = ['s1', 'x3/4', 'pe/b'].map(s => Instruction.parseInstruction(s));
        const p = new Promenade('abcde');
        p.processAll(instructions);
        p.processAll(instructions);
        assert.equal(p.state(), 'ceadb');
    })
});
