'strict mode';

const Spiral = require('./spiral');

function computeSteps(square) {
    const rungAndMax = Spiral.findRungAndMax(square);
    const rung = rungAndMax.rung, rungMax = rungAndMax.max;
    const midpoints = Spiral.findMidpoints(rung, rungMax);
    let minMidpointDistance;
    for (let i = 0; i < midpoints.length; i++) {
        const distance = Math.abs(midpoints[i] - square);
        if ((typeof minMidpointDistance === 'undefined') || distance < minMidpointDistance) {
            minMidpointDistance = distance;
        }
    }
    return rung + minMidpointDistance;
}

(function testComputeSteps(testCases){
    testCases.forEach(tc => {
        const actual = computeSteps(tc.square);
        Spiral.assert(actual === tc.steps, tc.steps, actual, 'square ' + tc.square);
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
    Spiral.assert(!isNaN(square), 'a number', args[0], 'NaN');
    const steps = computeSteps(square);
    console.log('input', args[0], 'steps', steps);
}