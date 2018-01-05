const util = require('util');
const assert = require('assert');

class Particle {
    
    constructor(p, v, a) {
        this.p = p;
        this.v = v;
        this.a = a;
    }

    /**
     * 
     * @param {Array} from [x, y, z] position 
     */
    distance(from) {
        return Math.abs(this.p[0] - from[0]) + Math.abs(this.p[1] - from[1]) + Math.abs(this.p[2] - from[2]);
    }

    /**
     * 
     * @param {string} line 
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
}

module.exports = {
    Particle: Particle
};