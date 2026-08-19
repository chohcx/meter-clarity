const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const page = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('page offers both electricity and water workflows', () => {
    assert.match(page, /value="electricity"/);
    assert.match(page, /value="water"/);
    assert.match(page, /src="src\/allocation\.js"/);
    assert.match(page, /src="src\/history\.js"/);
    assert.match(page, /onclick="addRoom\(\)"/);
    assert.match(page, /onclick="removeRoom\(\)"/);
    assert.match(page, /maxlength="30" id="name_/);
    assert.match(page, /escapeHtml\(room\.name\)/);
    assert.match(page, /template=usage_feedback\.yml/);
});

test('inline application script is valid JavaScript', () => {
    const inlineScripts = [...page.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
    assert.ok(inlineScripts.length > 0);
    assert.doesNotThrow(() => new Function(inlineScripts.at(-1)[1]));
});
