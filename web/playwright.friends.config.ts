import { defineConfig } from '@playwright/test';
import base from './playwright.config';
const names = new Set(['chromium-desktop-en', 'chromium-mobile-es', 'webkit-iphone-es']);
const production = process.env.NICO_PRODUCTION_URL;
export default defineConfig({
  ...base, testMatch: '**/playable-friends-map.e2e.ts', testIgnore: [], workers: 1, retries: 0,
  outputDir: 'friends-test-results', reporter: [['line'], ['html', { open: 'never', outputFolder: 'friends-report' }], ['json', { outputFile: 'friends-results.json' }]],
  use: { ...base.use, serviceWorkers: 'block', ...(production ? { baseURL: production } : {}) },
  webServer: production ? undefined : base.webServer,
  projects: base.projects?.filter(p => names.has(p.name ?? '')),
});
