const fs = require('fs');
const assert = require('assert');
const util = require('util');

class CircularList {

    constructor(values) {
        this.values = values || [];
    }

    add(value) {
        this.values.push(value);
    }

    size() {
        return this.values.length;
    }

    mod(index) {
        return ((index % this.values.length) + this.values.length) % this.values.length;
    }

    get(index) {
        return this.values[this.mod(index)];
    }

    toArray() {
        return this.values.concat([]);
    }

    slice(pos, length) {
        const s = [];
        for (let i = pos; i < (pos + length); i++) {
            s.push(this.get(i));
        }
        return s;
    }

    set(index, value) {
        this.values[this.mod(index)] = value;
    }

    reverse(pos, length) {
        assert(length <= this.size(), util.format("length %s > size %s", length, this.size()));
        for (let i = 0; i < parseInt(length / 2); i++) {
            const k = pos + i;
            const z = pos + length - (i + 1);
            const kv = this.get(k), zv = this.get(z);
            this.set(z, kv);
            this.set(k, zv);
        }
    }
}

class Hasher {
    
    constructor(ringSize) {
        this.pos = 0;
        this.skipSize = 0;
        const values = [];
        for (let i = 0; i < ringSize; i++) {
            values.push(i);
        }
        this.list = new CircularList(values);
    }

    hash(lengths, callback) {
        callback = callback || () => {};
        for (let i = 0; i < lengths.length; i++) {
            callback(i);
            const length = lengths[i];
            this.list.reverse(this.pos, length);
            this.pos = list.mod(this.pos + length + this.skipSize);
            this.skipSize++;
        }
    }

    digest() {
        return this.list.toArray();
    }

    toString() {
        const values = this.list.toArray();
        values[this.pos] = util.format("[%s]", values[this.pos]);
        return util.format("State{%s, skipSize=%s}", values.join(" "), this.skipSize);
    }
}

module.exports = {
    CircularList: CircularList,
    Hasher: Hasher
};
