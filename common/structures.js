const assert = require('assert');

class Node {

    constructor() {

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

}

class TreeNode extends Node {
    
    constructor(children) {
        super();
        this.children = children || [];
    }

    siblings() {
        if (!this.parent) {
            return [];
        }
        return this.parent.children.filter(n => n !== this);
    }
}

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

function breadthFirstTreeTraversal(root, callback) {
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

    constructor(entries) {
        this.data = new Map();
        this._numValues = 0;
        if (entries) {
            entries.forEach(entry => {
                this.data.set(entry[0], entry[1]);
                this._numValues += entry[1].length;
            });
        }
    }

    putAll(key, valueArray) {
        valueArray.forEach(value => {
            this.put(key, value);
        });
    }

    put(key, value) {
        this.get(key).push(value);
        this._numValues++;
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

    keyCount() {
        return this.data.size;
    }

    valueCount() {
        return this._numValues;
    }
}

class QSet {

    constructor(keyFactory) {
        this.items = new Map();
        this.keyFactory = keyFactory || (item => JSON.stringify(item));
    }

    add(item) {
        const key = this.keyFactory(item);
        if (!this.items.has(key)) {
            this.items.set(key, item);
            return true;
        }
        return false;
    }

    remove(item) {
        const key = this.keyFactory(item);
        return this.items.delete(key);
    }

    iterator() {
        return this.items.values();
    }
}

class Labeled {
    constructor(label) {
        this.label = label;
    }
}

class Vertex extends Labeled {
    constructor(label) {
        super(label);
    }
}

class Table {

    constructor() {
        this.rows = new Map();
        this.rowLabels = new Set();
        this.columnLabels = new Set();
        this.allLabels = new Set();
    }

    put(row, col, value) {
        this.rowLabels.add(row);
        this.columnLabels.add(col);
        this.allLabels.add(row);
        this.allLabels.add(col);
        let colMap = this.rows.get(row);
        if (!colMap) {
            colMap = new Map();
            this.rows.set(row, colMap);
        }
        colMap.set(col, value);
    }

    get(row, col) {
        const colMap = this.rows.get(row);
        if (colMap) {
            return colMap.get(col);
        }
    }

    columnMap(row) {
        return new Map(this.rows.get(row) || new Map());
    }

    rowMap(col) {
        const m = new Map();
        for (let e of this.rows) {
            const row = e[0], colMap = e[1];
            if (colMap.has(col)) {
                m.set(row, colMap.get(col));
            }
        }
        return m;
    }
}

function getSorter(value) {
    if (typeof value === 'number') {
        return (a, b) => a - b;
    } else if (typeof value === 'string') {
        return (a, b) => (a < b) ? -1 : (a === b ? 0 : 1); // String.prototype.localeCompare.call
    }
}

class SymmetricTable extends Table {
    
    constructor() {
        super();
    }

    normalize(row, col) {
        const coordinates = [row, col];
        coordinates.sort(getSorter(row));
        return coordinates;
    }

    put(row, col, value) {
        const coordinates = this.normalize(row, col);
        return super.put(coordinates[0], coordinates[1], value);
    }

    get(row, col) {
        const coordinates = this.normalize(row, col);
        return super.get(coordinates[0], coordinates[1]);
    }
}

class UndirectedGraph {

    constructor() {
        this.matrix = new SymmetricTable();
    }

    normalizeEdgeLabel(label) {
        return typeof label === 'undefined' ? true : label;
    }

    addEdge(v1, v2, label) {
        this.matrix.put(v1, v2, this.normalizeEdgeLabel(label));
    }

    adjacent(v) {
        const rowMap = this.matrix.rowMap(v), colMap = this.matrix.columnMap(v);
        const rowKeys = Array.from(rowMap.keys());
        const colKeys = Array.from(colMap.keys());
        const all = rowKeys.concat(colKeys);
        return all;
    }

    traverseDepthFirst(root, callback) {
        const visited = new Set();
        const g = this;
        const doTraverse = function(v) {
            if (!visited.has(v)) {
                visited.add(v);
                callback(v);
                const neighbors = g.adjacent(v);
                neighbors.forEach(neighbor => {
                    doTraverse(neighbor, callback);
                });
            }
        };
        doTraverse(root);
    }
}

module.exports = {
    Multimap: Multimap,
    Queue: Queue,
    TreeNode: TreeNode,
    breadthFirstTreeTraversal: breadthFirstTreeTraversal,
    QSet: QSet,
    UndirectedGraph: UndirectedGraph,
    Table: Table,
    SymmetricTable: SymmetricTable
};

