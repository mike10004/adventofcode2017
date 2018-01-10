const util = require('util');
const assert = require('assert');

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

class SoundPlayer {

    constructor(callback) {
        this.callback = callback || (() => {});
    }

    play(frequency) {
        this.lastPlayed = frequency;
        return this.callback('play', frequency);
    }

    recover() {
        return this.callback('recover', this.lastPlayed);
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

const NOT_STARTED = 'not_started';
const TERMINATED = 'terminated';
const WAITING_FOR_MESSAGE = 'waiting';

class Result {
    constructor(position, status) {
        this.position = position;
        this.status = status;
    }
}

class Processor {
    
    constructor(player) {
        this.player = player;
        assert(player instanceof SoundPlayer);
        this.offset = 0;
    }

    /**
     * 
     * @param {object} registers 
     * @param {Array} instructions 
     * @param {number} [maxActions]
     * @returns 
     */
    processAll(registers, instructions, maxActions) {
        let i = 0;
        let numActions = 0;
        maxActions = typeof maxActions === 'undefined' ? -1 : maxActions;
        while (i >= 0 && i < instructions.length && (maxActions < 0 || numActions < maxActions)) {
            const instruction = instructions[i];
            const offset = this.process(registers, instruction.command, instruction.args);
            i += offset;
            numActions++;
        }
        
    }

    /**
     * 
     * @param {object} registers 
     * @param {string} command 
     * @param {Array} args 
     * @returns {number} offset of next instruction
     */
    process(registers, command, args) {
        const X = args[0];
        //assert.notEqual(typeof X, 'undefined', util.format("X must be defined by first argument of %s (%s)", args, args[0]));
        const Y = args[1];
        let offset = 1;
        if ((/[a-z]/).test(X)) {
            if (typeof registers[X] === 'undefined') {
                registers[X] = 0;
            }
        }
        switch (command) {
            case 'snd':
                this.player.play(valueOf(X, registers));
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
            case 'rcv':
                if (valueOf(X, registers) !== 0) {
                    const result = this.player.recover();
                    if (typeof result !== 'undefined') {
                        offset = result;
                    }
                }                
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

module.exports = {
    Instruction: Instruction,
    Processor: Processor,
    SoundPlayer: SoundPlayer,
};