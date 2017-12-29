const assert = require('assert');
const util = require('util');

const Action = {
    SPIN: 'spin',
    EXCHANGE: 'exchange',
    PARTNER: 'partner'
};

class Instruction {

    constructor(action) {
        this.action = action;
        this.args = [];
        for (let i = 1; i < arguments.length; i++) {
            this.args.push(arguments[i]);
        }
    }

    static parseInstruction(instructionStr) {
        let m = /^s(\d+)$/.exec(instructionStr);
        if (m !== null) {
            return new Instruction(Action.SPIN, parseInt(m[1], 10));
        }
        m = /^x(\d+)\/(\d+)$/.exec(instructionStr);
        if (m !== null) {
            return new Instruction(Action.EXCHANGE, parseInt(m[1], 10), parseInt(m[2], 10));
        }
        m = /^p(\w+)\/(\w+)$/.exec(instructionStr);
        if (m !== null) {
            return new Instruction(Action.PARTNER, m[1], m[2]);
        }
        throw 'Invalid instruction ' + instructionStr.slice(0, 128);
    }

}

class Promenade {

    constructor(sequence) {
        if (typeof sequence === 'string') {
            sequence = sequence.split('');
        }
        assert(Array.isArray(sequence), "sequence must be a string or Array");
        this.sequence = sequence;
    }

    /**
     * Returns string representation of sequence after all instructions processed.
     * @param {Array} instructions 
     */
    processAll(instructions) {
        instructions.forEach(instruction => {
            this.processOne(instruction);
        });
        return this;
    }

    state() {
        return this.sequence.join('');
    }

    /**
     * Processes one instruction. Does not return a value.
     * @param {Instruction} instruction 
     */
    processOne(instruction) {
        switch (instruction.action) {
            case Action.SPIN:
                return this.spin(instruction.args[0]);
            case Action.EXCHANGE:
                return this.exchange(instruction.args[0], instruction.args[1]);
            case Action.PARTNER:
                return this.partner(instruction.args[0], instruction.args[1]);
            default:
                throw 'unhandled action: ' + instruction.action;
        }
    }

    spin(n) {
        const copy = this.sequence.concat([]);
        for (let i = 0; i < n; i++) {
            this.sequence[i] = copy[this.sequence.length - n + i];
        }
        for (let i = n; i < this.sequence.length; i++) {
            this.sequence[i] = copy[i - n];
        }
        return this;
    }

    exchange(a, b) {
        const tmp = this.sequence[a];
        this.sequence[a] = this.sequence[b];
        this.sequence[b] = tmp;
        return this;
    }

    partner(a, b) {
        const ai = this.sequence.indexOf(a), bi = this.sequence.indexOf(b);
        return this.exchange(ai, bi);
    }
}

module.exports = {
    Action: Action,
    Instruction: Instruction,
    Promenade: Promenade
}