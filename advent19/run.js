const util = require('util');
const {TubeMap, Packet, CHAR_REGEX} = require('./tubes');
const assert = require('assert');
const args = process.argv.slice(2);
if (typeof args[0] === 'undefined') {
    console.error("must specify input text file as argument");
    process.exit(1);
}
const text = require('fs').readFileSync(args[0], 'utf8');
const tubeMap = TubeMap.parse(text);
const packet = new Packet();
const path = packet.travel(tubeMap);
const pathStr = path.filter(ch => CHAR_REGEX.test(ch)).join('');
console.log(util.format("path: %s (%d steps)", pathStr, path.length));
