(function() {

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
        'toString': toString
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
    
})();

