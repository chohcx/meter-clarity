const test = require('node:test');
const assert = require('node:assert/strict');
const { allocateBill } = require('../src/allocation.js');

test('allocates the complete bill without losing rounding dollars', () => {
    const result = allocateBill(100, [
        { name: 'A', prev: 0, curr: 1 },
        { name: 'B', prev: 0, curr: 1 },
        { name: 'C', prev: 0, curr: 1 }
    ]);

    assert.deepEqual(result.details.map((room) => room.cost), [34, 33, 33]);
    assert.equal(result.details.reduce((sum, room) => sum + room.cost, 0), 100);
});

test('allocates proportionally and keeps zero-usage rooms at zero', () => {
    const result = allocateBill(300, [
        { name: 'A', prev: 10, curr: 10 },
        { name: 'B', prev: 10, curr: 20 },
        { name: 'C', prev: 20, curr: 40 }
    ]);

    assert.equal(result.totalUsage, 30);
    assert.deepEqual(result.details.map((room) => room.cost), [0, 100, 200]);
});

test('rejects invalid bills and meter readings', () => {
    assert.throws(() => allocateBill(0, [{ name: 'A', prev: 0, curr: 1 }]));
    assert.throws(() => allocateBill(100, [{ name: 'A', prev: -2, curr: -1 }]));
    assert.throws(() => allocateBill(100, [{ name: 'A', prev: 2, curr: 1 }]));
    assert.throws(() => allocateBill(100, [{ name: 'A', prev: 1, curr: 1 }]));
});
