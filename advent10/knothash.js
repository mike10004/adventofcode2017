const fs = require('fs');

class CircularList {

    constructor() {
        this.values = [];
    }

    add(value) {
        this.values.push(value);
    }

    size() {
        return this.values.length;
    }

    get(index) {
        return this.values[index];
    }

    toArray() {
        return this.values.concat([]);
    }
}

class Hasher {
    
}

module.exports = {
    CircularList: CircularList
};
