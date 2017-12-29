const util = require('util');

class Promenade {
    constructor() {

    }

    go(name) {
        return util.format("Hello %s", name);
    }
}

module.exports = {
    Promenade: Promenade
}