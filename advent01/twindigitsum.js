/**
 * 
 * @param {string} input the input sequence
 * @param {function} getTwin function that gets the value of the other digit to compare
 */
function computeSumOfTwinDigits(input, getTwin) {
    getTwin = getTwin || ((input, i) => (i + 1) % input.length); // default: next digit (part 1)
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
        const j = getTwin(input, i);
        if (input[i] === input[j]) {
            sum += parseInt(input[i], 10);
        }
    }
    return sum;
}

function getHalfwayAroundTwin(input, i) {
    if (input.length % 2 !== 0) throw 'input has odd length';
    return (i + input.length / 2) % input.length;
}

(function(testCases){
    testCases.forEach(testCase => {
        const sum = computeSumOfTwinDigits(testCase.sequence, testCase.getTwin);
        if (sum !== testCase.expected) {
            throw 'test case failure: expected ' + testCase.expected + ' but got ' + sum + ' from input ' + testCase.sequence;
        }
    });
    console.log("all test cases passed");
})([
    {sequence: '1122', expected: 3},
    {sequence: '1111', expected: 4},
    {sequence: '1234', expected: 0},
    {sequence: '91212129', expected: 9},
    {sequence: '1212', getTwin: getHalfwayAroundTwin, expected: 6},
    {sequence: '1221', getTwin: getHalfwayAroundTwin, expected: 0},
    {sequence: '123425', getTwin: getHalfwayAroundTwin, expected: 4},
    {sequence: '123123', getTwin: getHalfwayAroundTwin, expected: 12},
    {sequence: '12131415', getTwin: getHalfwayAroundTwin, expected: 4},
]);

const fs = require('fs');

const input = fs.readFileSync('input.txt', {encoding: 'ascii'}).trim();
console.log('input length is ' + input.length);
const answer1 = computeSumOfTwinDigits(input);
console.log('part 1 answer', answer1);
const answer2 = computeSumOfTwinDigits(input, getHalfwayAroundTwin);
console.log('part 2 answer', answer2);
