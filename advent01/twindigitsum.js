function computeSumOfTwinDigits(input) {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
        const j = (i + 1) % input.length;
        if (input[i] === input[j]) {
            sum += parseInt(input[i], 10);
        }
    }
    return sum;
}

(function(testCases){
    testCases.forEach(testCase => {
        const sum = computeSumOfTwinDigits(testCase.sequence);
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
]);

const fs = require('fs');

const input = fs.readFileSync('input.txt', {encoding: 'ascii'}).trim();
console.log('input length is ' + input.length);
const answer = computeSumOfTwinDigits(input);
console.log('answer', answer);