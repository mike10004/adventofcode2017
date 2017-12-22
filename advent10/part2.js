const {Hasher} = require('./knothash');
const util = require('util');

// the puzzle input
const input = "187,254,0,81,169,219,1,190,19,102,255,56,46,32,2,216";
const hasher = new Hasher(256);
const denseHash = hasher.hashFull(input);
console.log(denseHash);
