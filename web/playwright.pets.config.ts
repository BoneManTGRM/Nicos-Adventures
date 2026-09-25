import { defineConfig } from '@playwright/test';
import base from './playwright.connected.config';
export default defineConfig({ ...base,
  testMatch: ['**/playable-pet-workshop.e2e.ts'], testIgnore: [],
  outputDir: 'pet-test-results',
  reporter: [['line'], ['html', { open: 'never', outputFolder: 'pet-report' }], ['json', { outputFile: 'pet-results.json' }]],
});
