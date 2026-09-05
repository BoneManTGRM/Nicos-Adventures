import { defineConfig } from '@playwright/test';
import base from './playwright.friends.config';
export default defineConfig({ ...base, testMatch: '**/playable-rooms.e2e.ts', outputDir: 'rooms-test-results', reporter: [['line'], ['html', { open: 'never', outputFolder: 'rooms-report' }], ['json', { outputFile: 'rooms-results.json' }]] });
