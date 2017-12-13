'strict mode';

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

function computeSteps(square) {
    const rungAndMax = findRungAndMax(square);
    const rung = rungAndMax.rung, rungMax = rungAndMax.max;
    const midpoints = findMidpoints(rung, rungMax);
    let minMidpointDistance;
    for (let i = 0; i < midpoints.length; i++) {
        const distance = Math.abs(midpoints[i] - square);
        if ((typeof minMidpointDistance === 'undefined') || distance < minMidpointDistance) {
            minMidpointDistance = distance;
        }
    }
    return rung + minMidpointDistance;
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

(function testComputeSteps(testCases){
    testCases.forEach(tc => {
        const actual = computeSteps(tc.square);
        assert(actual === tc.steps, tc.steps, actual, 'square ' + tc.square);
    });
    console.log(testCases.length, 'tests passed computeSteps');
})([
    {square: 1, steps: 0},
    {square: 5, steps: 2},
    {square: 8, steps: 1},
    {square: 12, steps: 3},
    {square: 20, steps: 3},
    {square: 26, steps: 5},
    {square: 27, steps: 4},
    {square: 21, steps: 4},
    {square: 23, steps: 2},
    {square: 1024, steps: 31},
]);

const args = process.argv.slice(2);
if (args.length > 0) {
    const square = parseInt(args[0], 10);
    assert(!isNaN(square), 'a number', args[0], 'NaN');
    const steps = computeSteps(square);
    console.log('input', args[0], 'steps', steps);
}