const {Component, Bridge, BridgeBuilder} = require('./moat');
const assert = require('assert');
const util = require('util');

describe('Component', () => {
    it('parse', () => {
        assert.deepStrictEqual(Component.parse("0/2"), new Component(0, 2));
        assert.deepStrictEqual(Component.parse("10/1"), new Component(10, 1));
    })
    it('parseAll', () => {
        assert.deepStrictEqual(Component.parseAll("0/2\n2/2\n2/3\n \n"), [new Component(0, 2), new Component(2, 2), new Component(2, 3)]);
    })
    it('accepts', () => {
        assert(new Component(2, 3).accepts(3));
        assert(new Component(2, 3).accepts(2));
        assert(!(new Component(2, 3).accepts(4)));
        assert(!(new Component(2, 3).accepts('h')));
        assert(!(new Component(2, 3).accepts()));
    })
    it('strength', () => {
        assert.equal(new Component(2, 3).strength(), 5);
        assert.equal(new Component(0, 1).strength(), 1);
    })
    it('other', () => {
        assert.equal(new Component(2, 3).other(2), 3);
        assert.equal(new Component(2, 2).other(2), 2);
    });
})

describe('Bridge', () => {
    it('append', () => {
        const b = Bridge.of([new Component(0, 2), new Component(2, 3), new Component(3, 4)]);
        b.append(new Component(6, 4));
        assert.equal(b.componentList.length, 4);
    })
    it('strength', () => {
        const b = Bridge.of([new Component(0, 2), new Component(2, 3), new Component(3, 4)]);
        assert.equal(b.strength(), 14);
    })
    it('accepts', () => {
        const b = Bridge.of([new Component(0, 2), new Component(2, 2)]);
        const c = new Component(2, 3);
        assert(b.accepts(c), util.format("%s should accept %s", b, c));
    })
})

describe(BridgeBuilder.name, () => {
    it('buildAll', () => {
        const bb = new BridgeBuilder();
        const components = Component.parseAll("0/2\n2/2\n2/3\n3/4\n3/5\n0/1\n10/1\n9/10");
        let count = 0;
        let maxStrength;
        let maxStrengthBridge;
        bb.buildAll(components, bridge => {
            assert(bridge.length() > 0, "any callback bridge must have length > 0");
            console.log(bridge.toString());
            count++;
            if (typeof maxStrength === 'undefined' || bridge.strength() > maxStrength) {
                maxStrength = bridge.strength();
                maxStrengthBridge = bridge;
            }
        }, (bridge, components) => {
            console.log(util.format("%s does not accept any from %s", bridge, components));
        });
        assert.equal(count, 11);
        assert.notEqual(typeof maxStrength, 'undefined');
        assert.notEqual(typeof maxStrengthBridge, 'undefined');
        assert.equal(maxStrengthBridge.toString(), '0/1--10/1--9/10');
    })
});