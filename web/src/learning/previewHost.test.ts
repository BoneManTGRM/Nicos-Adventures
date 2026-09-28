import { describe, it, expect } from 'vitest';
import { isLearningVersionHost } from './previewHost';
describe('tutor version host boundary', () => {
  it('accepts the version and branch URL format for this Worker', () => {
    expect(isLearningVersionHost('a1b2c3d4-nicos-world.synthetic.workers.dev')).toBe(true);
    expect(isLearningVersionHost('feat-learning-lab-robot-rescue-nicos-world.synthetic.workers.dev')).toBe(true);
  });
  it('rejects production and unrelated hosts', () => {
    for (const host of ['nicos-world.com', 'www.nicos-world.com', 'nicos-world.synthetic.workers.dev', 'nicos-adventures.synthetic.workers.dev', 'a1b2-nicos-world.synthetic.workers.dev.evil.example', '', 'localhost']) {
      expect(isLearningVersionHost(host)).toBe(false);
    }
  });
});
