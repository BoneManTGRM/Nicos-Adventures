import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules(); });
for (const [hostname, expected] of [
  ['nicos-world.com', false],
  ['nicos-world.synthetic.workers.dev', false],
  ['a1b2c3d4-nicos-world.synthetic.workers.dev', true],
] as const) {
  it(`version build visibility at ${hostname}`, async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_LEARNING_LAB_PREVIEW', 'true');
    vi.stubEnv('VITE_LEARNING_LAB_VERSION_BUILD', 'true');
    vi.stubGlobal('location', { hostname });
    expect((await import('./enabled')).learningLabEnabled).toBe(expected);
  });
}
it('default production build stays disabled at a version URL', async () => {
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_LEARNING_LAB_PREVIEW', undefined);
  vi.stubEnv('VITE_LEARNING_LAB_VERSION_BUILD', undefined);
  vi.stubGlobal('location', { hostname: 'a1b2c3d4-nicos-world.synthetic.workers.dev' });
  expect((await import('./enabled')).learningLabEnabled).toBe(false);
});
