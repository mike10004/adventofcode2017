const X = 0, Y = 1, Z = 2;
const util = require('util');
const fs = require('fs');
const args = process.argv.slice(2);
const text = fs.readFileSync(args[0], 'utf-8');
const lines = text.split(/[\r\n]+/);
const {Particle} = require('./particles');
const particles = lines.map(line => Particle.parse(line));
particles.forEach(p => console.log(p.toString()));
console.log(util.format("%d particles parsed", particles.length));

let maxAccMag, maxIndex;
let minAccMag, minIndex;

function computeAccMag(p) {
    const vx = Math.abs(p.v[X]), vy = Math.abs(p.v[Y]), vz = Math.abs(p.v[Z]);
    const ax = Math.abs(p.a[X]), ay = Math.abs(p.a[Y]), az = Math.abs(p.a[Z]);
    return vx * ax * ax + vy * ay * ay + vz * az * az;
}

for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const accMag = computeAccMag(p);
    if (!(maxAccMag > accMag)) {
        maxAccMag = accMag;
        maxIndex = i;
    }
    if (!(minAccMag < accMag)) {
        minAccMag = accMag;
        minIndex = i;
    }
}
console.log(util.format("particle %d has maximum accelerative magnitude %s (%s)", maxIndex, maxAccMag, particles[maxIndex]));
console.log(util.format("particle %d has maximum accelerative magnitude %s (%s)", minIndex, minAccMag, particles[minIndex]));
// not 762
// not 955
