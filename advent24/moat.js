const assert = require('assert');
const util = require('util');

class Component {
    constructor() {
        this.ports = Array.from(arguments);
        this.ports.forEach(p => assert(!isNaN(p), "every port must be defined by a number of pins"));
    }
    strength() {
        return this.ports.reduce((a, b) => a + b, 0);
    }
    toString() {
        return this.ports.join('/');
    }
    accepts(pins) {
        return this.ports.indexOf(pins) >= 0;
    }
    static parse(text) {
        const m = /^\s*(\d+)\s*\/\s*(\d+)\s*/.exec(text);
        return new Component(parseInt(m[1], 10), parseInt(m[2]));
    }

    static parseAll(textWithLineBreaks) {
        const lines = textWithLineBreaks.split("\n").map(line => line.trim()).filter(line => !!line);
        return lines.map(line => Component.parse(line));
    }
    other(pins) {
        assert(this.ports.indexOf(pins) >= 0, "this component does not have a port with pins = " + pins);
        for (let p of this.ports) {
            if (p !== pins) {
                return p;
            }
        }
        return this.ports[0]; // all equal
    }
}

class Bridge {
    
    constructor() {
        this.componentList = [];
        this.portList = [];
        this.componentMap = new Map(); // map of component to [a, b] array specifying ordering of components
    }
    
    toString() {
        return this.componentList.map(c => c.toString()).join("--");
    }

    length() {
        return this.componentList.length;
    }

    strength() {
        return this.componentList.reduce((a, b) => a + b.strength(), 0);
    }
    
    accepts(component) {
        if (this.componentList.length === 0) {
            return component.accepts(0);
        }
        if (this.componentMap.has(component)) {
            return false;
        }
        const lastPortOrder = this.portList[this.portList.length - 1];
        const lastComponent = this.componentList[this.componentList.length - 1];
        const openPortPins = lastPortOrder[1];
        return component.accepts(openPortPins);
    }
    
    append(component) {
        assert(this.accepts(component), "illegal argument: bridge does not accept " + component.toString());
        const openPortPins = this.componentList.length === 0 ? 0 : this.portList[this.portList.length - 1][1];
        const otherPins = component.other(openPortPins);
        assert.equal(typeof otherPins, 'number');
        const portOrder = [openPortPins, otherPins];
        this.portList.push(portOrder);
        this.componentList.push(component);
        this.componentMap.set(component, portOrder);
        assert(this.componentList.length === this.componentMap.size && this.componentList.length === this.portList.length);
    }
    
    static of(components) {
        const b = new Bridge();
        components.forEach(c => {
            b.append(c);
        });
        return b;
    }
    
    copy() {
        return Bridge.of(this.componentList);
    }
}

const NOOP = () => {};

const helpBuild = function(bridge, components, callback, failback) {
    callback = callback || NOOP;
    failback = failback || NOOP
    let anyAccepted = false;
    for (let c of components) {
        if (bridge.accepts(c)) {
            anyAccepted = true;
            const copy = bridge.copy();
            copy.append(c);
            callback(copy);
            helpBuild(copy, components, callback);
        }
    }
    if (!anyAccepted) {
        failback(bridge, components);
    }
};

class BridgeBuilder {

    constructor() {

    }

    buildAll(components, callback, failback) {
        helpBuild(new Bridge(), components, callback, failback);
    }
}

module.exports = {
    Component: Component,
    Bridge: Bridge,
    BridgeBuilder: BridgeBuilder
};