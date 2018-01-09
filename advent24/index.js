const assert = require('assert');
const util = require('util');
const args = process.argv.slice(2);
const {Component, BridgeBuilder} = require('./moat');
const inputText = require('fs').readFileSync(args[0], 'utf-8');
const components = Component.parseAll(inputText);
let maxStrength, maxStrengthBridge;
const maxFinderCallback = bridge => {
    if (typeof maxStrength === 'undefined' || bridge.strength() > maxStrength) {
        maxStrength = bridge.strength();
        maxStrengthBridge = bridge;
    }
};

const bb = new BridgeBuilder();
bb.buildAll(components, maxFinderCallback);
console.log(util.format("max strength %d in bridge %s", maxStrength, maxStrengthBridge));
