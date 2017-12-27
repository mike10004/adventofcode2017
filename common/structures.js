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

module.exports = {
    Multimap: Multimap,
    Queue: Queue,
    TreeNode: TreeNode,
    breadthFirstTreeTraversal: breadthFirstTreeTraversal,
    QSet: QSet
};

