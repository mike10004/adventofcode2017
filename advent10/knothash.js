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
        ringSize = ringSize || 256;
        this.pos = 0;
        this.skipSize = 0;
        const values = [];
        for (let i = 0; i < ringSize; i++) {
            values.push(i);
        }
        this.list = new CircularList(values);
    }

    hash(lengths, callback) {
        callback = callback || (() => {});
        for (let i = 0; i < lengths.length; i++) {
            callback(i);
            const length = lengths[i];
            this.list.reverse(this.pos, length);
            this.pos = this.list.mod(this.pos + length + this.skipSize);
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

    xor(nums) {
        let h = 0; 
        for (let i = 0; i < nums.length; i++) {
            h = (h ^ nums[i]);
        }
        return h;
    }

    makeDense(hash, unitSize) {
        unitSize = unitSize || 16;
        assert(hash.length > 0);
        const units = [];
        let unit = [];
        for (let i = 0; i < hash.length; i++) {
            unit.push(hash[i]);
            if (unit.length === unitSize) {
                units.push(unit);
                unit = [];
            }
        }
        const x = this.xor;
        return units.map(u => x(u));
    }

    hashFull(input, rounds) {
        rounds = rounds || 64;
        const lengths = new Encoder().encode(input);
        for (let i = 0; i < rounds; i++) {
            this.hash(lengths);
        }
        const denseHash = this.makeDense(this.digest());
        return new Buffer(denseHash).toString('hex');
    }
}

class Encoder {
    
    constructor(suffix) {
        this.suffix = suffix || [17, 31, 73, 47, 23];
    }

    encode(input) {
        const lengths = [];
        for (let i = 0; i < input.length; i++) {
            lengths.push(input.charCodeAt(i));
        }
        return lengths.concat(this.suffix);
    }
}

module.exports = {
    CircularList: CircularList,
    Hasher: Hasher,
    Encoder: Encoder
};
