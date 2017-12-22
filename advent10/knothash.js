const fs = require('fs');

class Node {

    constructor(value, next, prev) {
        this.value = value;
        this.next = next;
        this.prev = prev;
    }

}

class CircularList {

    constructor() {
        this.length = 0;
    }

    add(value) {
        const node = new Node(value, this.head, this.tail);
        if (!this.head) {
            node.next = node;
            this.head = node;
        }
        this.head.prev = node;
        if (!this.tail) {
            node.prev = node;
        }
        const prevTail = this.tail;
        this.tail = node;
        if (prevTail) {
            prevTail.next = node;
        }
        this.length++;
    }

    size() {
        return this.length;
    }

    get(index) {
        if (index >= 0 && index < this.size()) {
            let node = this.head;
            for (let i = 0; i < index; i++) {
                node = node.next;
            }
            return node.value;
        } 
    }

    toArray() {
        const values = [];
        let node = this.head;
        for (let i = 0; i < this.size(); i++) {
            values.push(node.value);
            node = node.next;
        }
        return values;
    }
}

class Hasher {
    
}

module.exports = {
    CircularList: CircularList
};
