import { test } from 'vitest';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const run = (overrides) => spawnSync(process.execPath, ['scripts/validate-deployment-boundary.mjs'], { cwd: import.meta.dirname + '/..', env: { PATH: process.env.PATH, ...overrides }, encoding: 'utf8' });
for (const branch of ['feat/learning-lab-robot-rescue', '', 'refs/heads/main', 'MAIN']) {
  test(`Workers build rejects unapproved branch ${JSON.stringify(branch)}`, () => {
    const result = run({ WORKERS_CI: '1', WORKERS_CI_BRANCH: branch });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Deployment boundary/);
  });
}
test('Workers main build passes', () => assert.equal(run({ WORKERS_CI: '1', WORKERS_CI_BRANCH: 'main' }).status, 0));
test('local and GitHub validation builds pass', () => {
  assert.equal(run({}).status, 0);
  assert.equal(run({ CI: 'true', GITHUB_ACTIONS: 'true' }).status, 0);
});
test('other Workers metadata fails closed without branch', () => assert.match(run({ WORKERS_CI_BUILD_UUID: 'synthetic-build' }).stderr, /Deployment boundary/));
