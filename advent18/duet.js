const util = require('util');
const assert = require('assert');
const {Queue} = require('../common/structures');

class Instruction {
    constructor(command, args) {
        this.command = command;
        assert.equal(typeof command, 'string');
        assert.equal(command.length, 3);
        this.args = args;
        assert(args instanceof Array);
    }

    static parse(line) {
        const m = /^\s*([a-z]+)(\s+-?\w+)(\s+-?\w+)?\s*$/.exec(line);
        assert(m !== null, util.format("not parseable: %s", line));
        const arg2 = (m[3] || '').trim();
        return new Instruction(m[1], [m[2].trim(), arg2]);
    }

    static parseAll(text) {
        return text.split("\n").map(line => line.trim()).filter(line => !!line).map(line => Instruction.parse(line));
    }
}

function valueOf(value, registers) {
    if (typeof value !== 'undefined') {
        const n = parseInt(value, 10);
        if (isNaN(n)) {
            assert.notEqual(typeof registers, 'undefined');
            return registers[value];
        } else {
            return n;
        }
    }
}

const TERMINATED = 'terminated';
const WAITING_FOR_MESSAGE = 'waiting';
const MAX_ACTIONS = 10 * 1000 * 1000;

class Result {
    constructor(progress, status, position) {
        this.progress = progress;
        this.status = status;
        this.position = position;
    }
    toString() {
        return util.format("[%s, %s, %s]", this.progress, this.status, this.position);
    }
}

function maybeInitialize(registers, key, value) {
    if ((/[a-z]/).test(key)) {
        if (typeof registers[key] === 'undefined') {
            registers[key] = value;
        }
    }
}

class Processor {
    
    /**
     * 
     * @param {function} transmitter function that takes arguments (action, argument, registers); 
     * action may be 'snd' or 'rcv'; if action is 'rcv', may return WAITING_FOR_MESSAGE
     */
    constructor(transmitter) {
        this.transmitter = transmitter;
        assert.equal(typeof transmitter, 'function', 'transmitter must be a function');
        this.offset = 0;
    }

    /**
     * 
     * @param {object} registers 
     * @param {Array} instructions 
     * @param {number} [position] starting position (index of instructions array)
     * @returns instance of Result
     */
    processAll(registers, instructions, position) {
        assert.equal(typeof registers, 'object', "expected object for registers argument: " + typeof registers);
        assert(instructions instanceof Array, "expected instance of Array: " + typeof instructions);
        assert.equal(typeof position, 'number', "expected number for position argument: " + typeof position);
        let i = position;
        let numActions = 0;
        let offset;
        while (i >= 0 && i < instructions.length && (numActions < MAX_ACTIONS)) {
            const instruction = instructions[i];
            offset = this.process(registers, instruction.command, instruction.args);
            if (offset === 0) {
                return new Result(numActions, WAITING_FOR_MESSAGE, i);
            }
            numActions++;
            i += offset;
        }
        if (numActions === MAX_ACTIONS) {
            throw 'max actions exceeded: ' + MAX_ACTIONS;
        }
        return new Result(numActions, TERMINATED, i);
    }

    /**
     * 
     * @param {object} registers 
     * @param {string} command 
     * @param {Array} args 
     * @returns {Result} offset of next instruction (possibly 0 if instruction requires waiting for message)
     */
    process(registers, command, args) {
        const X = args[0];
        const Y = args[1];
        let offset = 1;
        maybeInitialize(registers, X, 0);
        maybeInitialize(registers, Y, 0);
        switch (command) {
            case 'snd':
                this.transmitter('snd', X, registers);
                break;
            case 'rcv':
                const result = this.transmitter('rcv', X, registers);
                if (result === WAITING_FOR_MESSAGE) {
                    offset = 0;
                }
                break;
            case 'set':
                registers[X] = valueOf(Y, registers);
                break;
            case 'add':
                registers[X] += valueOf(Y, registers);
                break;
            case 'mul':
                registers[X] *= valueOf(Y, registers);
                break;
            case 'mod':
                registers[X] = valueOf(X, registers) % valueOf(Y, registers);
                break;
            case 'jgz':
                if (registers[X] > 0) {
                    offset = valueOf(Y, registers);
                }
                break;
            default:
                throw 'Illegal argument: ' + command;
        }
        return offset;
    }
}

function createTransmitter(myQueue, otherQueue) {
    assert(myQueue instanceof Queue && otherQueue instanceof Queue);
    let tx = 0, rx = 0;
    const fn = function(action, argument, registers) {
        if (action === 'snd') {
            otherQueue.push(valueOf(argument, registers));
            tx++;
        } else if (action === 'rcv') {
            if (myQueue.isEmpty()) {
                return WAITING_FOR_MESSAGE;
            }
            const message = myQueue.pop();
            registers[argument] = valueOf(message, registers);
            rx++;
        } else {
            throw 'illegal action: ' + action;
        }
    };
    fn.getNumSent = function() {
        return tx;
    };
    fn.getNumReceived = function() { 
        return rx;
    };
    return fn;
}

class State {
    constructor(registers, transmitter) {
        this.registers = registers;
        assert.notEqual(typeof registers, 'undefined', "registers not defined");
        this.transmitter = transmitter;
        assert.equal(typeof transmitter, 'function', "transmitter not defined");
    }

    toString() {
        return util.format("{registers: %O, tx: %d, rx: %d}", this.registers, this.transmitter.getNumSent(), this.transmitter.getNumReceived());
    }

}

function communicate(instructions, callback) {
    callback = callback || (() => {});
    const queue0 = new Queue(), queue1 = new Queue();
    const registers0 = {'p': 0};
    const registers1 = {'p': 1};
    const transmitter0 = createTransmitter(queue0, queue1);
    const transmitter1 = createTransmitter(queue1, queue0);
    const processor0 = new Processor(transmitter0);
    const processor1 = new Processor(transmitter1);
    let result0 = new Result(-1, 'not_started', 0);
    let result1 = new Result(-1, 'not_started', 0);
    while (!(result0.progress === 0 && result1.progress === 0)) {
        result0 = processor0.processAll(registers0, instructions, result0.position);
        result1 = processor1.processAll(registers1, instructions, result1.position);
        callback(result0, result1);
    }
    return [
        new State(registers0, transmitter0), 
        new State(registers1, transmitter1),
    ];
}

module.exports = {
    Instruction: Instruction,
    Processor: Processor,
    Result: Result,
    communicate: communicate,
};