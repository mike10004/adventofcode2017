const X = 0, Y = 1, Z = 2;
const util = require('util');
const fs = require('fs');
const args = process.argv.slice(2);
const part = args[0];
if (['part1', 'part2'].indexOf(args[0]) == -1) {
    console.error("must specify exactly one argument: 'part1' or 'part2'");
    process.exit(1);
}
const assert = require('assert');
const text = fs.readFileSync("input.txt", 'utf-8');
const lines = text.split(/[\r\n]+/);
const {Particle} = require('./particles');
const particles = lines.map(line => Particle.parse(line));
particles.forEach(p => console.log(p.toString()));
console.log(util.format("%d particles parsed", particles.length));

if (part == 'part1') {
    let maxAccMag, maxIndex;
    let minAccMag, minIndex;
    
    function computeAccMag(p) {
        const vx = Math.abs(p.v[X]), vy = Math.abs(p.v[Y]), vz = Math.abs(p.v[Z]);
        const ax = Math.abs(p.a[X]), ay = Math.abs(p.a[Y]), az = Math.abs(p.a[Z]);
        return vx * ax * ax + vy * ay * ay + vz * az * az;
    }
    const structures = require('../common/structures');
    for (let i = 0; i < particles.length; i++) {
        const q = particles[i];
        const accMag = computeAccMag(q);
        if (!(maxAccMag > accMag)) {
            maxAccMag = accMag;
            maxIndex = i;
        }
        if (!(minAccMag < accMag)) {
            minAccMag = accMag;
            minIndex = i;
        }
    }
    console.log(util.format("particle %d has maximum accelerative magnitude %s (%s)", maxIndex, maxAccMag, particles[maxIndex])); // what I first thought was the answer, mistakenly
    console.log(util.format("particle %d has minimum accelerative magnitude %s (%s)", minIndex, minAccMag, particles[minIndex])); // actual answer to part one
} else {
    /**
     * This is a brute-force technique that doesn't produce a conclusive answer.
     * We tick through many iterations (up to maxIterations) looking for stretches 
     * where no collisions are found over the last N iterations (where N = noChangesMin),
     * and if we find one, we report it and terminate.
     * 
     * This is not a conclusive technique because (a) if we terminate when we find a stretch
     * of N iterations without a collision, there might have been a collision at N+1; and 
     * (b) if we don't find any such stretches of iterations without a collision, that
     * might just mean we need to raise maxIterations.
     * 
     * In practice -- meaning it's verified that we have the correct answer -- the last 
     * occurs at around the 10000th iteration.
     */
    const maxIterations = parseInt(args[1]) || (10 * 1000 * 1000);
    const noChangesMin = 10000;
    let brokeDueToNoChanges = false;
    let noChanges = 0, previousLength = -1;
    console.log("checking for collisions...");
    const reportInterval = 10000;
    for (let i = 0; i < maxIterations; i++) {
        if (i > 0 && i % reportInterval === 0) {
            console.log(util.format("iteration %d", i));
        }
        Particle.removeCollisions(particles);
        if (previousLength !== particles.length) {
            noChanges = 0;
        } else {
            noChanges++;
            if (noChanges >= noChangesMin) {
                console.log(util.format("at iteration %d, no changes in %d iterations; terminating with %d particles remaining", i, noChanges, particles.length));
                brokeDueToNoChanges = true;
                break;
            }
        }
        previousLength  = particles.length;
        particles.forEach(p => p.tick());
    }
    if (!brokeDueToNoChanges) {
        console.warn(util.format("kept finding collisions over %d iterations", maxIterations));
    }
}

