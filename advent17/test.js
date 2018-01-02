const {SpinLock, findValueAfterZero} = require('./spinlock');
const assert = require('assert');

describe('example', () => {
    it('construction', () => {
        const lock = new SpinLock();
        assert.equal(lock.length(), 1);
        assert.equal(lock.render(), '(0)');
    });

    describe('iterate()', () => {
        [
            '(0)',
            '0 (1)',
            '0 (2) 1',
            '0 2 (3) 1',
            '0  2 (4) 3  1',
            '0 (5) 2  4  3  1',
            '0  5  2  4  3 (6) 1',
            '0  5 (7) 2  4  3  6  1',
            '0  5  7  2  4  3 (8) 6  1',
            '0 (9) 5  7  2  4  3  8  6  1',
        ].forEach((rendering, n) => {
            rendering = rendering.replace(/\s+/g, ' ');
            it("after " + n + " 3-step moves", () => {
                const lock = new SpinLock();
                lock.iterate(3, n);
                assert.equal(lock.render(), rendering, "after " + n + " 3-step moves");
            });
        });
    });

    it("after 2017 insertions", () => {
        const lock = new SpinLock();
        lock.iterate(3, 2017);
        const slice = lock.nodes.slice(lock.position - 3, lock.position + 4);
        assert.equal(new SpinLock(slice).render(true), '1512 1134 151 2017 638 1513 851')
    });
});

describe.only('findValueAfterZero', () => {
    const steps = 3;
    [
        0, 1, 2, 2, 2, 5, 5, 5, 5, 9
    ].forEach((expected, n) => {
        it("after " + n + " insertions", () => {
            const lock = new SpinLock();
            lock.iterate(steps, n);
            const actual = findValueAfterZero(steps, n);
            assert.equal(actual, expected, "state: " + lock.render());
        });
    });
});