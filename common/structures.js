class TreeNode {
    constructor(children) {
        this.children = children || [];
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

module.exports = {
    Multimap: Multimap,
    Queue: Queue,
    TreeNode: TreeNode,
    breadthFirstTreeTraversal: breadthFirstTreeTraversal
};

