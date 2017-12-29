const assert = require('assert');
const {
    Promenade,
    Action,
    Instruction
} = require('./promenade');

describe('Promenade.parseInstruction', () => {
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
            const actual = new Promenade('').parseInstruction(testCase.input);
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
    it('example', () => {
        const instructions = ['s1', 'x3/4', 'pe/b'];
        const actual = new Promenade('abcde').processAll(instructions);
        assert.equal(actual, 'baedc');
    })
});
