(function() {

    class Position {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    
        equals(other) {
            return other && this.x === other.x && this.y === other.y;
        }
    
        toString() {
            return JSON.stringify(this);
        }

        isCorner() {
            return Math.abs(this.x) === Math.abs(this.y);
        }

        isMax() {
            return this.isCorner() && this.x >= 0 && this.y <= 0;
        }

        isNewRung() {
            const west = new Position(this.x - 1, this.y);
            return west.isMax();
        }
    }

    function PositionIterator() {

        let current = new Position(0, 0)

        function Delta() {
            let sx = 1, sy = 0;

            function w(z) {
                switch (z) {
                    case 0: return 0;
                    case 1: return 1;
                    case 2: return 0; 
                    case 3: return -1;
                }
            }

            this.turn = function() {
                sx = (sx + 1) % 4;
                sy = (sy + 1) % 4;
            };

            this.x = function() {
                return w(sx);
            };

            this.y = function() {
                return w(sy);
            };

        }

        const delta = new Delta();

        const advance = function() {
            const previous = current;
            const newRung = previous.isNewRung(), corner = previous.isCorner(), max = previous.isMax();
            if (newRung || (corner && !max)) {
                delta.turn();
            }
            current = new Position(previous.x + delta.x(), previous.y + delta.y());
        };

        const me = this;

        this.next = function() {
            const p = current;
            advance();
            return p;
        };

        this.generate = function(n) {
            const positions = [];
            for (let i = 0; i < n; i++) {
                const p = me.next();
                positions.push(p);
            }
            return positions;
        };

    }

    function rungMax(n) {
        if (n === 0) {
            return 1;
        }
        return rungMax(n - 1) + 8 * n;
    }
    
    const MAX_RUNGS = 4096;
    
    function findRung(square) {
        return findRungAndMax(square).rung;
    }
    
    function findRungAndMax(square) {
        let prev = 1, curr;
        for (let n = 0; n <= MAX_RUNGS; n++) {
            curr = prev + 8 * n;
            if (square <= curr) {
                return {
                    rung: n,
                    max: curr
                };
            }
            prev = curr;
        }
        if (n > MAX_RUNGS) {
            throw 'max rungs exceeded';
        }
    }
    
    // get midpoints in order: SOUTH, WEST, NORTH, EAST
    function findMidpoints(rung, rungMax) {
        if (rung === 0) {
            return [rungMax];
        }
        const sideLength = 2 * rung + 1;
        const squares = [
            rungMax - (sideLength - 1) / 2,
        ];
        squares[1] = squares[0] - (sideLength - 1) * 1;
        squares[2] = squares[0] - (sideLength - 1) * 2;
        squares[3] = squares[0] - (sideLength - 1) * 3;
        return squares;
    }
    
    function toString(thing) {
        if (typeof thing === 'undefined') {
            return 'undefined';
        }
        if (thing === null) {
            return 'null';
        }
        if (thing instanceof Object) {
            return JSON.stringify(thing);
        }
        return thing.toString();
    }
    
    function assert(evaluation, expected, actual, message) {
        if (!evaluation) {
            throw 'expected ' + toString(expected) + ' but got ' + toString(actual) + '; ' + toString(message);
        }
    }
    
    function arrayEquals(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    module.exports = {
        'findMidpoints': findMidpoints,
        'findRungAndMax': findRungAndMax,
        'assert': assert,
        'arrayEquals': arrayEquals,
        'toString': toString,
        'Position': Position,
        'PositionIterator': PositionIterator
    };

    (function testFindMidpoints(testCases){
        testCases.forEach(tc => {
            const midpoints = findMidpoints(tc.rung, tc.rungMax);
            assert(arrayEquals(midpoints, tc.midpoints), tc.midpoints, midpoints, 'rung ' + tc.rung + ' with max ' + tc.rungMax);
        });
        console.log(testCases.length, 'tests passed findMidpoints');
    })([
        {rung: 0, rungMax: 1, midpoints: [1]},
        {rung: 1, rungMax: 9, midpoints: [8, 6, 4, 2]},
        {rung: 2, rungMax: 25, midpoints: [23, 19, 15, 11]},
    ]);
    
    (function testFindRung(testCases){
        testCases.forEach(tc => {
            const rung = findRung(tc.square);
            assert(rung === tc.rung, tc.rung, rung, 'square ' + tc.square);
        });
        console.log(testCases.length, 'tests passed findRung');
    })([
        {square: 1, rung: 0},
        {square: 5, rung: 1},
        {square: 8, rung: 1},
        {square: 12, rung: 2},
        {square: 20, rung: 2},
        {square: 26, rung: 3},
        {square: 27, rung: 3},
        {square: 21, rung: 2},
        {square: 47, rung: 3},
        {square: 50, rung: 4},
        {square: 23, rung: 2},
    ]);
    
    (function testPositionIterator(){
        const expected = [
            new Position(0, 0), 
            new Position(1, 0),
            new Position(1, 1),
            new Position(0, 1),
            new Position(-1, 1),
            new Position(-1, 0),
            new Position(-1, -1),
            new Position(0, -1),
            new Position(1, -1),
            new Position(2, -1),
            new Position(2, 0),
            new Position(2, 1),
            new Position(2, 2),
            new Position(1, 2),
            new Position(0, 2),
            new Position(-1, 2),
            new Position(-2, 2),
            new Position(-2, 1),
            new Position(-2, 0),
            new Position(-2, -1),
            new Position(-2, -2),
            new Position(-1, -2),
            new Position(0, -2),
            new Position(1, -2),
            new Position(2, -2),
            new Position(3, -2),
            new Position(3, -1),
            new Position(3, 0),
            new Position(3, 1),
            new Position(3, 2),
            new Position(3, 3),
            new Position(2, 3),
            new Position(1, 3),
            new Position(0, 3),
            new Position(-1, 3),
            new Position(-2, 3),
            new Position(-3, 3),
            new Position(-3, 2),
            new Position(-3, 1),
            new Position(-3, 0),
            new Position(-3, -1),
            new Position(-3, -2),
            new Position(-3, -3),
            new Position(-2, -3),
            new Position(-1, -3), 
            new Position(0, -3),
            new Position(1, -3),
            new Position(2, -3),
            new Position(3, -3),
            new Position(4, -3),
            new Position(4, -2),
            new Position(4, -1),
            new Position(4, 0),
            new Position(4, 1),
        ];
        const iterator = new PositionIterator();
        const actual = iterator.generate(expected.length);
        assert(actual instanceof Array, "array", typeof actual, "acutal is not an array");
        actual.forEach(a => {
            assert(a instanceof Position, "Position instance", typeof a, "actual[i] is not a Position instance");
        });        
        assert(expected.length === actual.length, expected.length, actual.length, "length mismatch");
        for (let i = 0; i < expected.length; i++) {
            assert(expected[i].equals(actual[i]), expected[i], actual[i], "mismatch at " + i + ": " + expected[i].toString() + " != " + actual[i].toString());
        }
        console.log("1 test passed by PositionIterator");
    })();
})();

