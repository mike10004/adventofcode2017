const structures = require('../common/structures');
const util = require('util');
const assert = require('assert');

function makeGraphFromMultimap(mm) {
    const g = new structures.UndirectedGraph();
    mm.keys().forEach(key => {
        mm.get(key).forEach(value => {
            g.addEdge(key, value);
        });        
    });
    return g;
}

function parseMultimap(text) {
    const r = /(\d+) <-> ((?:\d+)(, (\d+))*)/g;
    const mm = new structures.Multimap();
    let m;
    while ((m = r.exec(text)) !== null) {
        const key = parseInt(m[1], 10);
        let values = m[2].split(/,\s*/);
        values = values.map(token => parseInt(token, 10));
        mm.putAll(key, values);
    }
    return mm;
}

(function test_parseMultimap(testCases){
    let mm = parseMultimap("3 <-> 1465, 1568\n" +
        "4 <-> 359, 1047, 1215, 1580, 1969\n" +
        "5 <-> 613\n" +
        "6 <-> 49, 617, 1213");
    assert.equal(mm.keyCount(), 4);
    assert.equal(mm.valueCount(), 11);
})(
    
);

function findReachable(g, vertex) {
    const reachable = new Set();
    let visitedCount = 0;
    g.traverseDepthFirst(vertex, p => {
        reachable.add(p);
        visitedCount++;
    });
    return reachable;
}

(function test() {
    const mm = new structures.Multimap([
        [0, [2]],
        [1, [1]],
        [2, [0, 3, 4]],
        [3, [2, 4]],
        [4, [2, 3, 6]],
        [5, [6]],
        [6, [4, 5]],
    ]);
    const g = makeGraphFromMultimap(mm);
    const reachableFrom0 = findReachable(g, 0);
    console.log(util.format("%d programs reachable from %s: %s", reachableFrom0.size, 0, Array.from(reachableFrom0)));
    assert.equal(6, reachableFrom0.size);
})();

const args = process.argv.slice(2);
if (args.length > 0) {
    const inputText = require('fs').readFileSync(args[0], 'utf8');
    const g = makeGraphFromMultimap(parseMultimap(inputText));
    const vertices = g.vertexSet();
    let numGroups = 0;
    for (let v of vertices) {
        const reachable = findReachable(g, v);
        console.log(util.format("%d programs reachable from %d", reachable.size, v));
        for (let u of reachable) {
            vertices.delete(u);
        }
        numGroups++;
    }
    console.log(util.format("%d groups found", numGroups));
}