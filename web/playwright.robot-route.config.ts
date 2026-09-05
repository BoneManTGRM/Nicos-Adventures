import { defineConfig } from '@playwright/test';
import base from './playwright.config';
const production = process.env.NICO_PRODUCTION_URL;
const names = new Set(['chromium-desktop-en', 'chromium-mobile-es', 'webkit-iphone-en', 'webkit-iphone-es']);
export default defineConfig({
  ...base, testMatch: '**/playable-robot-route.e2e.ts', testIgnore: [], workers: 1, retries: 0, timeout: 90000,
  outputDir: 'robot-route-results',
  reporter: [['line'], ['html', { open: 'never', outputFolder: 'robot-route-report' }], ['json', { outputFile: 'robot-route-results.json' }]],
  use: { ...base.use, serviceWorkers: 'block', ...(production ? { baseURL: production } : {}) },
  webServer: production ? undefined : base.webServer,
  projects: base.projects?.filter(p => names.has(p.name ?? '')),
});
