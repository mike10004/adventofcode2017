const assert = require('assert');
const util = require('util');
const {Multimap} = require('../common/structures');
const args = process.argv.slice(2);
const {Component, BridgeBuilder} = require('./moat');
const inputText = require('fs').readFileSync(args[0], 'utf-8');
const components = Component.parseAll(inputText);
let maxLength, bestBridge;
let bridgesByLength = new Multimap();
const MIN_LENGTH = 39; // acquired through experimentation
const collector = bridge => {
    const length = bridge.length();
    if (length >= MIN_LENGTH) {
        bridgesByLength.put(length, bridge);
    }
};

const bb = new BridgeBuilder();
bb.buildAll(components, collector);
const lengths = Array.from(bridgesByLength.keys());
lengths.sort((a, b) => b - a);
const greatestLength = lengths[0];
console.log(util.format("bridge lengths: %s", lengths));
const bridgesWithGreatestLength = bridgesByLength.get(greatestLength);
console.log(util.format("%d bridges with length %d", bridgesWithGreatestLength.length, greatestLength));
assert.notEqual(bridgesWithGreatestLength.length, 0);
bridgesWithGreatestLength.sort((a, b) => b.strength() - a.strength());
const winner = bridgesWithGreatestLength[0];
console.log(util.format("strength %d for bridge %s", winner.strength(), winner));