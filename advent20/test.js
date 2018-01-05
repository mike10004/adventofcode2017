const util = require('util');
const assert = require('assert');
const particles = require('./particles');
const Particle = particles.Particle;

describe('parseParticle', () => {
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
})
