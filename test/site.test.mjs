// Run with: node --test test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const html = readFileSync(path.join(dist, 'index.html'), 'utf8');

test('every local src/href in index.html points to an existing file', () => {
  const refs = [...html.matchAll(/\b(?:src|href)\s*=\s*"([^"]+)"/g)]
    .map((m) => m[1])
    .filter((ref) => !/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(ref))
    .map((ref) => ref.split(/[?#]/)[0]);

  assert.ok(refs.length > 0, 'expected to find local references');

  const missing = refs.filter((ref) => !existsSync(path.join(dist, ref)));
  assert.deepEqual(missing, [], `missing files: ${missing.join(', ')}`);
});

test('coaches photo uses the assets/ path (regression for 0afd59b)', () => {
  assert.match(html, /src="\.\/assets\/ProfeYohan\.jpeg"/);
  assert.doesNotMatch(html, /src="ProfeYohan\.jpeg"/);
});

test('config.js exposes whatsapp number and a directions link, with no published prices', () => {
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(path.join(dist, 'config.js'), 'utf8'), sandbox);
  const config = sandbox.window.TOP_DOGS;

  assert.match(config.whatsapp, /^\d{8,15}$/);
  assert.match(config.mapsUrl, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/);
  assert.equal(config.monthlyPrice, undefined);
  assert.equal(config.privatePrice, undefined);
});

test('element ids are unique and there is one section per coach', () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual(dupes, [], `duplicate ids: ${dupes.join(', ')}`);
  assert.match(html, /id="profesores"/);
  assert.match(html, /id="profesor-oscar"/);
});
