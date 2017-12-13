const Spiral = require('./spiral');
const Position = Spiral.Position;

const Midpoint = {
    SOUTH: 0,
    WEST: 1,
    NORTH: 2,
    EAST: 3
}

function decidePosition(square, rung, midpointArg, midpoint) {
    let rungCoordinate, offsetCoordinate, offsetFactor, rungFactor;
    switch (midpointArg) {
        case Midpoint.SOUTH:
            rungCoordinate = 'y';
            offsetCoordinate = 'x';
            offsetFactor = 1;
            rungFactor = -1;
            break;
        case Midpoint.WEST:
            rungCoordinate = 'x';
            offsetCoordinate = 'y';
            offsetFactor = -1;
            rungFactor = -1;
            break;
        case Midpoint.NORTH:
            rungCoordinate = 'y';
            offsetCoordinate = 'x';
            offsetFactor = -1;
            rungFactor = 1;
            break;
        case Midpoint.EAST:
            rungCoordinate = 'x';
            offsetCoordinate = 'y';
            offsetFactor = 1;
            rungFactor = 1;
            break;
    }
    const p = {};
    p[rungCoordinate] = rungFactor * rung;
    p[offsetCoordinate] = offsetFactor * (square - midpoint);
    return p;
}

function findPosition(square) {
    const rungAndMax = Spiral.findRungAndMax(square);
    const rung = rungAndMax.rung, rungMax = rungAndMax.max;
    const midpoints = Spiral.findMidpoints(rung, rungMax);
    let minMidpointDistance, midpointArg;
    for (let i = 0; i < midpoints.length; i++) {
        const distance = Math.abs(midpoints[i] - square);
        if ((typeof minMidpointDistance === 'undefined') || distance < minMidpointDistance) {
            minMidpointDistance = distance;
            midpointArg = i;
        }
    }
    var p = decidePosition(square, rung, midpointArg, midpoints[midpointArg]);
    return new Position(p.x, p.y);
}

class Grid {
    
    constructor() {
        this.cells = {};
    }

    put(x, y, value) {
        let column = this.cells[x];
        if (!column) {
            column = {};
            this.cells[x] = column;
        }
        const previous = column[y];
        column[y] = value;
        return previous;
    }

    get(x, y, dfault) {
        const column = this.cells[x];
        let value;
        if (column) {
            value = column[y];
        }
        return (typeof value === 'undefined') ? dfault : value;
    }

    neighborValues(x, y) {
        const values = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (!(dx === 0 && dy === 0)) {
                    const value = this.get(x + dx, y + dy, 0);
                    values.push(value);
                }
            }
        }
        return values;
    }

    sumNeighborValues(x, y) {
        const values = this.neighborValues(x, y);
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i];
        }
        return sum;
    }
}

(function testFindPosition(testCases) {
    testCases.forEach(tc => {
        const actual = findPosition(tc.square);
        if (!tc.position.equals(actual)) {
            throw 'expected ' + tc.position.toString() + ' for square ' + tc.square + ' but got ' + actual.toString();
        }
    })
})([
    {square: 1, position: new Position(0, 0)},
    {square: 5, position: new Position(-1, 1)},
    {square: 8, position: new Position(0, -1)},
    {square: 12, position: new Position(2, 1)},
    {square: 20, position: new Position(-2, -1)},
    {square: 26, position: new Position(3, -2)},
    {square: 27, position: new Position(3, -1)},
    {square: 21, position: new Position(-2, -2)},
    {square: 23, position: new Position(0, -2)},
]);

const args = process.argv.slice(2);
if (args.length > 0) {
    const puzzleInput = parseInt(args[0], 10);
    (function(threshold, maxTries) {
        const positions = new Spiral.PositionIterator();
        const grid = new Grid();
        grid.put(0, 0, 1);
        let p = positions.next(); // advance past (0, 0)
        let ok = false;
        for (let i = 0; i < maxTries && !ok; i++) {
           p = positions.next();
           const sum = grid.sumNeighborValues(p.x, p.y); 
           grid.put(p.x, p.y, sum);
           if (sum > threshold) {
               console.log("wrote value", sum, "larger than", threshold);
               ok = true;
           }
        }
        if (!ok) {
            console.warn("no value larger than", threshold, "written within max tries", maxTries);
        }
    })(puzzleInput, 1024);
}
