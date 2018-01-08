const structures = require('../common/structures');
const INFECTED = '#', CLEAN = '.', WEAKENED = 'W', FLAGGED = 'F';
const util = require('util');
const assert = require('assert');

class Offset {

    constructor(row, col) {
        this.row = row;
        assert.equal(typeof row, 'number');
        this.col = col;
        assert.equal(typeof col, 'number');
    }

    turn(t) {
        const row = t.at(0, 0) * this.row + t.at(0, 1) * this.col;
        const col = t.at(1, 0) * this.row + t.at(1, 1) * this.col;
        return new Offset(row, col);
    }

    toString() {
        return util.format("[%s, %s]", this.row, this.col);
    }

    copy() {
        return new Offset(this.row, this.col);
    }

    equals(other) {
        return other && this.row === other.row && this.col === other.col;
    }
}
const NORTH = new Offset(1, 0, 'north'), SOUTH = new Offset(-1, 0, 'south'), EAST = new Offset(0, 1, 'east'), WEST = new Offset(0, -1, 'west');

class Turn {
    
    constructor() {
        this.m = Array.prototype.map.call(arguments, x => x);
        this.name = arguments[4];
    }

    at(r, c) {
        if (typeof c === 'undefined') {
            return this.m[r];
        }
        return this.m[r * 2 + c];
    }

    toString() {
        return util.format("%s[[%s %s][%s %s]]", this.name, this.m[0], this.m[1], this.m[2], this.m[3]);
    }

}

const RIGHT = new Turn(0, -1, 1, 0, 'right'), LEFT = new Turn(0, 1, -1, 0, 'left');

class Position extends Offset {
    constructor(row, col) {
        super(row, col);
    }

    translate(offset) {
        this.row += offset.row;
        this.col += offset.col;
        return this;
    }

}

class Grid {

    constructor() {
        this.cells = new structures.Table();
        this.minRow = null;
        this.maxRow = null;
        this.minCol = null;
        this.maxCol = null;
    }

    getStatus(position) {
        assert(position instanceof Position, "expected instance of position");
        return this.cells.get(position.row, position.col) || CLEAN;
    }

    isInfected(position) {
        return this.getStatus(position) === INFECTED;
    }

    expand(position) {
        if (this.minRow === null || position.row < this.minRow) {
            this.minRow = position.row;
        }
        if (this.minCol === null || position.col < this.minCol) {
            this.minCol = position.col;
        }
        if (this.maxCol === null || position.col > this.maxCol) {
            this.maxCol = position.col;
        }
        if (this.maxRow === null || position.row > this.maxRow) {
            this.maxRow = position.row;
        }
    }

    setStatus(position, status) {
        assert(position instanceof Position, "first arg must be Position");
        this.expand(position);
        this.cells.put(position.row, position.col, status);
    }

    dump() {
        const keys = Array.from(this.cells.rowKeys());
        for (let k of keys) {
            console.log(util.format("row %s: %O", k, this.cells.rows.get(k)));
        }
    }

    render(virus, minRow, maxRow, minCol, maxCol) {
        const rows = [];
        minRow = typeof minRow === 'undefined' ? this.minRow : minRow;
        minCol = typeof minCol === 'undefined' ? this.minCol : minCol;
        maxCol = typeof maxCol === 'undefined' ? this.maxCol : maxCol;
        maxRow = typeof maxRow === 'undefined' ? this.maxRow : maxRow;
        for (let r = maxRow; r >= minRow; r--) {
            const rowChars = [];
            for (let c = minCol; c <= maxCol; c++) {
                let fmt = " %s ";
                if (virus && r === virus.position.row && c === virus.position.col) {
                    fmt = "[%s]";
                }
                const ch = util.format(fmt, this.cells.get(r, c) || CLEAN);
                rowChars.push(ch);
            }
            rows.push(rowChars);
        }
        return rows.map(r => r.join('')
                .replace(/[ ]+/g, ' ')
                .replace(/ \[[#\.]\] /g, c => c.trim())
            ).join("\n");
    }

    static parse(text) {
        const cells = [];
        text.split(new RegExp("[\r\n]+", 'g')).filter(line => !!(line.trim())).forEach(line => {
            cells.push(line.split(''));
        });
        assert.equal(cells.length, cells[0].length, 'expected square grid');
        assert.equal(cells.length % 2, 1, 'expected odd number of cells in row');
        const delta = parseInt(Math.floor(cells.length / 2));
        const grid = new Grid();
        for (let r = 0; r < cells.length; r++) {
            for (let c = 0; c < cells.length; c++) {
                let row = r - delta, col = c - delta;
                grid.cells.put(-row, col, cells[r][c]); // vertically mirror
            }
        }
        grid.minRow = -delta;
        grid.maxRow = delta;
        grid.minCol = -delta;
        grid.maxCol = delta;
        return grid;
    }
}

class MoveSummary {

    constructor(turn, status, previous) {
        this.turn = turn;
        this.infectedness = status;
        this.previous = previous;
        this.description = util.format("turn %s; %s->%s", turn.name, previous, status);
    }

    describe() {
        return this.description;
    }

    toString() {
        return this.describe();
    }
}

class Virus {

    constructor(position) {
        this.position = position || new Position(0, 0);
        assert(this.position instanceof Position);
        this.direction = new Offset(1, 0);
        this.numInfections = 0;
    }

    transition(fromStatus) {
        switch (fromStatus) {
            case CLEAN:
                return INFECTED;
            case INFECTED:
                return CLEAN;
        }
        throw 'unhandled transition from ' + fromStatus;
    }

    move(grid) {
        let turn;
        if (grid.isInfected(this.position)) {
            turn = RIGHT;
        } else {
            turn = (LEFT);
        }
        this.direction = this.direction.turn(turn);
        const previousStatus = grid.getStatus(this.position);
        const status = this.transition(previousStatus);
        grid.setStatus(this.position, status);
        if (status === INFECTED) {
            this.numInfections++;
        }
        assert(!(this.direction.row === 0 && this.direction.col === 0), util.format("direction is [0, 0]: %s", this.direction));
        this.position.translate(this.direction);
        return new MoveSummary(turn, status, previousStatus);
    }
}

class PartTwoVirus extends Virus {

    transition(fromStatus) {
        switch (fromStatus) {
            case CLEAN:
                return WEAKENED;
            case WEAKENED: 
                return INFECTED;
            case INFECTED:
                return FLAGGED;
            case FLAGGED:
                return CLEAN;
        }
        throw 'unhandled transition from ' + fromStatus;
    }

}

module.exports = {
    NORTH: NORTH,
    EAST: EAST,
    SOUTH: SOUTH,
    WEST: WEST,
    RIGHT: RIGHT,
    LEFT: LEFT,
    Offset: Offset,
    Position: Position,
    Turn: Turn,
    Grid: Grid,
    Virus: Virus
};