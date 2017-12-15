const fs = require('fs');
const assert = require('assert');
const args = process.argv.slice(2);

class Node {
    constructor(name, weight, children) {
        this.name = name;
        this.weight = weight;
        this.children = children;
    }

    equals(other) {
        return other && this.name === other.name && this.weight === other.weight && JSON.stringify(this.children) === JSON.stringify(other.children);
    }

    toString() {
        return JSON.stringify(this);
    }
}

function parseNode(line) {
    const m = /^(\w+)\s+\((\d+)\)(\s*->\s*.*)?$/.exec(line.trim());
    const name = m[1], weight = parseInt(m[2], 10);
    let children;
    if (m[3]) {
        children = m[3].split(/\W+/).filter(token => token && !!token.trim());
    } else {
        children = [];
    }
    return new Node(name, weight, children);
}

(function testParseNode(testCases){
    testCases.forEach(tc => {
        const actual = parseNode(tc.line);
        assert.deepEqual(actual, tc.expected, 'unexpected parse result ' + actual + ' from ' + tc.line);
    });
})([
    {line: 'ktlj (57)', expected: new Node('ktlj', 57, [])},
    {line: 'tknk (41) -> ugml, padx, fwft', expected: new Node('tknk', 41, ['ugml', 'padx', 'fwft'])},
]);

(function(inputFile){
    if (!inputFile) {
        console.error("must specify input file as argument");
        process.exit(1);
    }
    const text = fs.readFileSync(inputFile, {encoding: 'utf-8'});
    const lines = text.split('\n');
    const nodes = {};
    lines.forEach(line => {
        if (line.trim()) { // skip empty
            const node = parseNode(line);
            nodes[node.name] = node;
        }
    });
    Object.values(nodes).forEach(node => {
        node.children.forEach(childName => {
            nodes[childName].parent = nodes[node.name];
        });
    });
    Object.values(nodes).filter(node => !node.parent)
        .forEach(node => console.log("parentless node", node.toString()));
})(args[0]);
