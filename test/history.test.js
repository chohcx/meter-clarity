const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeHtml, normalizeHistory } = require('../src/history.js');

function record(overrides = {}) {
    return {
        id: 1,
        date: '2026/8/19',
        billTotal: 100,
        totalUsage: 10,
        unitPrice: 10,
        details: [{ name: 'A', prev: 0, curr: 10, usage: 10, cost: 100 }],
        ...overrides
    };
}

test('migrates legacy electricity records and preserves water records', () => {
    const history = normalizeHistory([
        record(),
        record({ id: 2, utility: 'water' })
    ]);

    assert.equal(history[0].utility, 'electricity');
    assert.equal(history[1].utility, 'water');
});

test('escapes imported text before HTML rendering', () => {
    assert.equal(
        escapeHtml('<img src=x onerror="alert(1)">'),
        '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
    );
});

test('rejects malformed or unsupported backup records', () => {
    assert.throws(() => normalizeHistory({}));
    assert.throws(() => normalizeHistory([record({ utility: 'gas' })]));
    assert.throws(() => normalizeHistory([record({ utility: '' })]));
    assert.throws(() => normalizeHistory([record({ id: 'not-an-id' })]));
    assert.throws(() => normalizeHistory([record({ note: 123 })]));
    assert.throws(() => normalizeHistory([record({ details: [] })]));
    assert.throws(() => normalizeHistory([record({ billTotal: -1 })]));
    assert.throws(() => normalizeHistory([record({
        details: [{ name: 'A', prev: 10, curr: 5, usage: -5, cost: 100 }]
    })]));
});
