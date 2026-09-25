import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const origin = 'https://nicos-world.com';
function worker(cached) {
  const handlers = new Map(); let networkCalls = 0;
  const context = vm.createContext({
    URL, Response, Headers,
    self: { location: { origin }, addEventListener: (name, handler) => handlers.set(name, handler), skipWaiting() {}, clients: { claim() {} } },
    caches: { match: async key => key === '/index.html' ? cached : undefined },
    fetch: async () => { networkCalls++; throw new TypeError('Offline'); },
  });
  vm.runInContext(source, context);
  return {
    navigate(path = '/', mode = 'navigate') {
      let answer;
      handlers.get('fetch')({ request: { method: 'GET', url: origin + path, mode }, respondWith: value => { answer = value; } });
      return answer;
    }, calls: () => networkCalls,
  };
}
function shell({ redirected = true, status = 200, contentType = 'text/html; charset=utf-8' } = {}) {
  const response = new Response('<!doctype html><title>Pets</title>', { status, headers: {
    'content-type': contentType, 'cache-control': 'public, max-age=0, must-revalidate, no-transform',
    'referrer-policy': 'no-referrer', 'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'content-encoding': 'zstd', 'content-length': '18',
  } });
  // A production /index.html -> / redirect leaves this bit on the cached 200.
  Object.defineProperty(response, 'redirected', { value: redirected });
  return response;
}
test('a redirected cached document becomes a legal non-redirect navigation response', async () => {
  const answer = await worker(shell()).navigate();
  assert.equal(answer.status, 200); assert.equal(answer.redirected, false);
  assert.equal(await answer.text(), '<!doctype html><title>Pets</title>');
  assert.equal(answer.headers.get('cache-control'), 'public, max-age=0, must-revalidate, no-transform');
  assert.equal(answer.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(answer.headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=(), payment=()');
  assert.equal(answer.headers.get('content-encoding'), null);
  assert.equal(answer.headers.get('content-length'), null);
});
test('a direct cached document retains its existing response', async () => {
  const cached = shell({ redirected: false }); assert.equal(await worker(cached).navigate(), cached);
});
test('missing cached HTML fails closed', async () => {
  assert.equal((await worker(undefined).navigate()).type, 'error');
});
test('an error or non-HTML cache entry cannot become the offline document', async () => {
  assert.equal((await worker(shell({ status: 404 })).navigate()).type, 'error');
  assert.equal((await worker(shell({ contentType: 'application/json' })).navigate()).type, 'error');
});
test('store catalog never falls back to the cached game', async () => {
  const instance = worker(shell()); await assert.rejects(instance.navigate('/store-catalog.json', 'cors'), /Offline/);
  assert.equal(instance.calls(), 1);
});
