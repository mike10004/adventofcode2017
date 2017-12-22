const {Hasher} = require('./knothash');
const util = require('util');

// the puzzle input
const lengths = [187,254,0,81,169,219,1,190,19,102,255,56,46,32,2,216];

const hasher = new Hasher(256);
hasher.hash(lengths);
const hash = hasher.digest();
console.log(util.format("product of first two elements %s and %s = %s", hash[0], hash[1], hash[0] * hash[1]));
