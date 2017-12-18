const fs = require('fs');
const assert = require('assert');
const args = process.argv.slice(2);

class Node {
    constructor(name, weight, children) {
        this.name = name;
        this.weight = weight;
        this.children = children;
        this.load = 0; // load is sum of weights of all descendents
    }

    equals(other) {
        return other && this.name === other.name && this.weight === other.weight && JSON.stringify(this.children) === JSON.stringify(other.children);
    }

    toString() {
        const d = this.depth();
        return this.name + '(depth=' + d + ', freight=' + this.freight + ')';
    }

    depth() {
        let node = this;
        let d = 0;
        while (node.parent) {
            node = node.parent;
            d++;
        }
        return d;
    }
    
    parentToRootPath() { // excludes this node
        let node = this;
        const path = [];
        while (node.parent) {
            path.push(node.parent);
            node = node.parent;
        }
        return path;
    }

    siblings() {
        if (!this.parent) {
            return [];
        }
        return this.parent.children.filter(n => n !== this);
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

function Queue() {
    const items = [];
    const self = this;
    
    this.push = function(item) {
        items.push(item);
    }

    this.pop = function() {
        return items.splice(0, 1)[0];
    }

    this.isEmpty = function() {
        return items.length === 0;
    }
}

function breadthFirstTraversal(root, callback) {
    const queue = new Queue();
    queue.push(root);
    let lastDepth;
    while (!queue.isEmpty()) {
        const node = queue.pop();
        const depth = node.depth();
        callback(node, depth, lastDepth);
        lastDepth = depth;
        node.children.forEach(queue.push);
    }
}

class Multimap {

    constructor() {
        this.data = new Map();
    }

    put(key, value) {
        this.get(key).push(value);
    }

    get(key) {
        if (!this.data.has(key)) {
            this.data.set(key, []);
        }
        return this.data.get(key);
    }

    has(key) {
        return this.data.has(key);
    }

    keys() {
        return Array.from(this.data.keys());
    }

}

(function(inputFile){
    if (!inputFile) {
        console.error("must specify input file as argument");
        process.exit(1);
    }
    const text = fs.readFileSync(inputFile, {encoding: 'utf-8'});
    const lines = text.split('\n');
    const nodes = new Map();
    lines.forEach(line => {
        if (line.trim()) { // skip empty
            const node = parseNode(line);
            nodes.set(node.name, node);
        }
    });
    console.log(nodes.size, "nodes");
    for (let node of nodes.values()) {
        node.children.forEach(childName => {
            nodes.get(childName).parent = nodes.get(node.name);
        });
        node.children = node.children.map(name => nodes.get(name));
    }    
    const roots = Array.from(nodes.values()).filter(node => !node.parent);
    assert.equal(roots.length, 1, "expect exactly 1 root node");
    const root = roots[0];
    console.log("root", root.toString());
    for (let node of nodes.values()) {
        node.parentToRootPath().forEach(p => {
            p.load += node.weight;
        });
    }
    for (let node of nodes.values()) {
        node.freight = node.weight + node.load;
    };
    const nodesByDepth = new Multimap();
    breadthFirstTraversal(root, (node, depth, lastDepth) => {
        if (depth !== lastDepth) {
            process.stdout.write('\n');
        }
        nodesByDepth.put(depth, node);
        process.stdout.write(node.toString() + ' ');
    });
    process.stdout.write('\n\n');
    const nodesSortedByDepth = Array.from(nodes.values());
    nodesSortedByDepth.sort((a, b) => {
        return a.depth() - b.depth();
    });
    nodesSortedByDepth.reverse();
    let foundUnique = false;
    for (let node of nodesSortedByDepth) {
        const siblingFreights = new Set();
        node.siblings().forEach(sibling => siblingFreights.add(sibling.freight));
        if (siblingFreights.size === 1) {
            const siblingFreight = siblingFreights.values().next().value;
            if (node.freight !== siblingFreight) {
                console.log("highest node with unique freight among siblings", node.toString(), "should be", siblingFreight);
                foundUnique = true;
                break;
            }
        }
    }
    if (!foundUnique) {
        console.log("no node with unique freight found");
    }
})(args[0]);
