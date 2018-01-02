const util = require('util');
const assert = require('assert');

class SpinLock {

    constructor(nodes, position) {
        this.nodes = nodes || [0];
        this.position = position || 0;
        this.nextLabel = this.nodes.length;
    }

    advance(steps) {
        assert(this.length() > 0, "cannot advance an empty lock");
        this.position = (this.position + steps) % this.length();
    }

    length() {
        return this.nodes.length;
    }

    insert() {
        const label = this.nextLabel;
        this.nextLabel++;
        this.position++;
        this.nodes.splice(this.position, 0, label);
    }

    iterate(steps, n) {
        assert(typeof steps === 'number');
        assert(typeof n === 'number');
        for (let i = 0; i < n; i++) {
            this.advance(steps);
            this.insert();
        }
    }

    render(hidePosition) {
        return this.nodes.map((n, i) => {
            return !hidePosition && this.position === i ? util.format("(%s)", n) : n.toString();
        }).join(" ");
    }

    current() {
        return this.nodes[this.position];
    }
}

module.exports = {
    SpinLock: SpinLock
};
