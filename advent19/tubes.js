const assert = require('assert');
const util = require('util');

const TURN = '+';
const VERT = '|';
const HORIZ = '-';
const CHAR_REGEX = /[A-Za-z]/g;

class CoordinatePair {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    translate(offset) {
        return new CoordinatePair(this.row + offset.row, this.col + offset.col);
    }

    equals(other) {
        return other && this.row === other.row && this.col === other.col;
    }

    toString() {
        return util.format("(%s, %s)", this.row, this.col);
    }
}

class Offset extends CoordinatePair {
    constructor(row, col) {
        super(row, col);
    }

    opposite() {
        return new Offset(this.row * -1, this.col * -1);
    }
}

class TubeMap {

    constructor(rows) {
        this.rows = rows || [];
        let width;
        rows.forEach((row, i) => {
            if (typeof width === 'undefined') {
                width = row.length;
            }
            assert.equal(row.length, width, util.format('not all rows are the same width; row %d is incongruent: %s != %s', i, row.length, width));
        });
        this.width = width;
        this.height = rows.length;
    }

    static parse(text) {
        const rows = text.split(/[\r\n]+/g).filter(row => row.trim().length > 0);
        return new TubeMap(rows);
    }

    cell(row, col) {
        return TubeMap.overload((row, col) => {
            const r = this.rows[row];
            if (typeof r !== 'undefined') {
                return r[col];
            }
        }, row, col);
    }

    isDefined(row, col) {
        return TubeMap.overload((row, col) => {
            const value = this.cell(row, col);
            return typeof value !== 'undefined' && !!(value.trim());
        }, row, col);
    }

    /**
     * Calls a function with (row, col) arguments, given a CoordinatePair object or row and col number values.
     * @param {function} fn function to invoke
     * @param {number|Object} row row index or object with row and col properties defined as numbers
     * @param {number} [col] column index or undefined
     */
    static overload(fn, row, col) {
        assert(fn instanceof Function && (row instanceof Object || (typeof row === 'number' && typeof col === 'number')), util.format("arguments must be (Function, CoordinatePair) or (Function, row, col): (%s, %s, %s)", typeof fn, typeof row, typeof col));
        if (row instanceof Object) {
            return TubeMap.overload(fn, row.row, row.col);
        } else {
            return fn(row, col);
        } 
        throw 'unhandled case';
    }

    isChar(row, col) {
        return TubeMap.overload((row, col) => {
            return CHAR_REGEX.test(this.cell(row, col));
        }, row, col);
    }

    /**
     * @returns the coordinates of the starting position
     */
    start() {
        return new CoordinatePair(0, this.rows[0].indexOf(VERT));
    }

    neighbors(row, col) {
        return TubeMap.overload((row, col) => {
            let pairs = [
                new CoordinatePair(row - 1, col),
                new CoordinatePair(row, col + 1),
                new CoordinatePair(row + 1, col),
                new CoordinatePair(row, col - 1),
            ];
            pairs = pairs.filter(p => {
                return this.isDefined(p);
            });
            if (pairs.length === 0) {
                throw util.format("no defined neighbors at (%s, %s) value = %s", row, col, this.cell(row, col));
            }
            return pairs;
        }, row, col);
    }

    isTurn(row, col) {
        return this.is(TURN, row, col);
    }

    isVertical(row, col) {
        return this.is(VERT, row, col);
    }

    isHorizontal(row, col) {
        return this.is(HORIZ, row, col);
    }

    static test(stringOrRegex, value) {
        return (typeof stringOrRegex === 'string') ? value === stringOrRegex : stringOrRegex.test(value);
    }

    is(stringOrRegex, row, col) {
        return TubeMap.overload((row, col) => {
            return TubeMap.test(stringOrRegex, this.cell(row, col));
        }, row, col);
    }
}

class Packet {

    constructor() {
        this.position = null;
        this.direction = null;
        this.previous = null;
    }

    /**
     * @returns character corresponding to the next position, or null if there is nowhere else to go
     */
    move(tubeMap) {
        const previous = this.previous;
        this.previous = this.position;
        if (this.position === null) {
            this.position = tubeMap.start();
            this.direction = new Offset(1, 0);
        } else {
            if (tubeMap.isTurn(this.position)) {
                const neighbors = tubeMap.neighbors(this.position);
                const next = neighbors.filter(n => !n.equals(previous))[0];
                if (!(next instanceof CoordinatePair)) {
                    assert.fail(util.format("all neighbors %O of %O are equal to previous %O", neighbors, this.position, previous));
                }
                this.direction = new Offset(next.row - this.position.row, next.col - this.position.col);
                this.position = next;
            } else {
                this.position = this.position.translate(this.direction);
            }
        }
        return tubeMap.isDefined(this.position) ? tubeMap.cell(this.position) : null;
    }

    /**
     * Travels through a tube map from the current position until the end.
     * @param {TubeMap} tubeMap  the tubes
     * @returns {Array} an array of the characters at each stop
     */
    travel(tubeMap) {
        const path = [];
        let val;
        while ((val = this.move(tubeMap)) !== null) {
            path.push(val);
        }
        return path;
    }
}

module.exports = {
    TubeMap: TubeMap,
    CoordinatePair: CoordinatePair,
    TURN: TURN,
    VERT: VERT,
    HORIZ: HORIZ,
    CHAR_REGEX: CHAR_REGEX,
    Packet: Packet,
    Offset: Offset
};