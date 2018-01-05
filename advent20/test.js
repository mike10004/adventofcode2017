const util = require('util');
const assert = require('assert');
const {Particle, accelerationFactor, Vectors} = require('./particles');

describe('Vector arithmetic', () => {
    xit('sumOf', () => {
        // todo
    })
    xit('add', () => {
        // todo
    })
    xit('productOf', () => {
        // todo
    })
})

describe('globals', () => {
    it('accelerationFactor', () => {
        const values = [0, 1, 3, 6, 10, 15, 21];
        values.forEach((expected, i) => {
            assert.equal(accelerationFactor(i), expected, "n = " + i);
        });
    });
})

describe('Particle', () => {
    it('parse', () => {
        const line = 'p=<-3787,-3683,3352>, v=<41,-25,-124>, a=<5,9,1>';
        const p = Particle.parse(line);
        const expected = new Particle([-3787, -3683, 3352], [41, -25, -124], [5, 9, 1]);
        assert.deepEqual(p, expected);
    })
    it('distance', () => {
        const p = new Particle([-3787, -3683, 3352], [41, -25, -124], [5, 9, 1]);
        assert.equal(p.distance([0, 0, 0]), 3787 + 3683 + 3352);
    })
    it('tick()', () => {
        const q = new Particle([2, 3, 5], [7, 11, 13], [17, 19, 23]);
        q.tick();
        assert.deepEqual(q.p, [26, 33, 41]);
        assert.deepEqual(q.v, [24, 30, 36]);
    });
    it('tick(1)', () => {
        const q = new Particle([2, 3, 5], [7, 11, 13], [17, 19, 23]);
        q.tick(1);
        assert.deepEqual(q.p, [26, 33, 41], "position");
        assert.deepEqual(q.v, [24, 30, 36], "velocity");
    });
    it('tick(n)', () => {
        const q = new Particle([2, 3, 5], [7, 11, 13], [17, 19, 23]);
        const z = q.copy();
        const MAX = 16;
        for (let k = 0; k < MAX; k++) {
            for (let j = 0; j < k; j++) {
                q.tick();
            }
            z.tick(k);
            assert.deepStrictEqual(z, q, "at k = " + k);
        }
    });
    it('removeCollisions', () => {
        const input = [
            new Particle([0, 1, 2]),
            new Particle([0, 1, 2]),
            new Particle([0, 0, 0]),
            new Particle([0, -1, 2]),
            new Particle([0, -1, 2]),
            new Particle([0, -1, 2]),
            new Particle([0, 3, 2]),
            new Particle([0, 1, 6]),
        ];
        const expected = [
            new Particle([0, 0, 0]),
            new Particle([0, 3, 2]),
            new Particle([0, 1, 6]),
        ];
        Particle.removeCollisions(input);
        assert.deepStrictEqual(input, expected);
    })
})
