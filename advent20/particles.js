const structures = require('../common/structures');
const util = require('util');
const assert = require('assert');
const X = 0, Y = 1, Z = 2;
const DIM = 3;
const ZERO = [0, 0, 0];

/**
 * Adds component-wise vector v to vector u. Vector v remains unchanged.
 * @param {Array} u target vector
 * @param {Array} v addition vector
 * @returns vector u
 */
function add(u, v) {
    assert.equal(u.length, v.length, "vectors must be congruent");
    for (let i = 0; i < u.length; i++) {
        u[i] += v[i];
    }
    return u;
}

/**
 * Returns a new array that is the component-wise sum of two vectors.
 * @param {Array} u 
 * @param {Array} v 
 */
function sumOf(u, v, w) {
    assert.equal(u.length, v.length, "vectors must be congruent");
    const z = u.concat([]);
    add(z, v);
    if (typeof w !== 'undefined') {
        assert.equal(u.length, w.length, "vectors must be congruent");
        add(z, w);
    }
    return z;
}

/**
 * 
 * @param {Array} u a vector
 * @param {number} k a scalar
 * @returns {Array} a new array that is the scalar product of u * k
 */
function productOf(u, k) {
    const v = [];
    for (let i = 0; i < u.length; i++) {
        v.push(u[i] * k);
    }
    return v;
}

function accelerationFactor(n) {
    if (n <= 1) {
        return n;
    }
    // return 1 + ((n - 1) * (n - 1) + 3 * (n - 1)) / 2;
    return n * (n + 1) / 2;
}

class Particle {
    
    /**
     * Constructs an instance of the class. Each argument must be an array of numbers [x, y, z].
     * This instance retains a copy of each argument array at moment of construction.
     * @param {Array} p position
     * @param {Array} v velocity
     * @param {Array} a acceleration
     */
    constructor(p, v, a) {
        this.p = (p || ZERO).concat([]);
        this.v = (v || ZERO).concat([]);
        this.a = (a || ZERO).concat([]);
    }

    /**
     * Calculates distance of this instance from a given position.
     * @param {Array} from [x, y, z] position 
     */
    distance(from) {
        return Math.abs(this.p[0] - from[0]) + Math.abs(this.p[1] - from[1]) + Math.abs(this.p[2] - from[2]);
    }

    /**
     * Creates an instance from a line of text. The text is expected
     * to be in the format `p=<-3787,-3683,3352>, v=<41,-25,-124>, a=<5,9,1>`.
     * 
     * @param {string} line 
     * @returns {Particle} a particle
     */
    static parse(line) {
        // p=<-3787,-3683,3352>, v=<41,-25,-124>, a=<5,9,1>
        line = line.replace(/</g, '[');
        line = line.replace(/>/g, ']');
        line = line.replace(/=/g, ':');
        line = line.replace(/([pva])/g, x => '"' + x + '"');
        const obj = JSON.parse('{' + line + '}');
        return Object.assign(new Particle, obj);
    }

    toString() {
        return JSON.stringify(this);
    }

    copy() {
        return new Particle(this.p, this.v, this.a);
    }

    tick(n) {
        if (typeof n === 'undefined') {
            add(this.v, this.a);
            add(this.p, this.v);
            // this.v[X] += this.a[X];
            // this.v[Y] += this.a[Y];
            // this.v[Z] += this.a[Z];
            // this.p[X] += this.v[X];
            // this.p[Y] += this.v[Y];
            // this.p[Z] += this.v[Z];
        } else {
            this.p = sumOf(this.p, productOf(this.v, n), productOf(this.a, accelerationFactor(n)));
            this.v = sumOf(this.v, productOf(this.a, n));
        }
        return this;
    }
    
    /**
     * 
     * @param {Array} particles 
     */
    static removeCollisions(particles) {
        const particlesByPosition = new structures.Multimap();
        for (let i = 0; i < particles.length; i++) {
            const q = particles[i];
            particlesByPosition.put(JSON.stringify(q.p), q);
        }
        const indices = [];
        particlesByPosition.keys().forEach(pj => {
            const values = particlesByPosition.get(pj);
            if (values.length > 1) {
                const removed = particlesByPosition.remove(pj);
                removed.forEach(q => {
                    indices.push(particles.indexOf(q));
                });
            }
        });
        indices.sort((a, b) => a - b);
        indices.reverse();
        for (let i = 0; i < indices.length; i++) {
            particles.splice(indices[i], 1);
        }
    }
}

module.exports = {
    Particle: Particle,
    accelerationFactor: accelerationFactor,
    Vectors: {
        add: add,
        sumOf: sumOf,
        productOf: productOf
    }
};