import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
 ...base,
 testMatch: ['creative-games.e2e.ts','creative-games-receipts.e2e.ts'],
 testIgnore: [],
 timeout: 90_000,
 fullyParallel: true,
 workers: process.env.CI ? 4 : 2,
 retries: process.env.CI ? 1 : 0,
 // Preserve failure evidence promptly instead of repeating a broken shared setup across every device.
 maxFailures: process.env.CI ? 6 : undefined,
 outputDir: 'creative-games-test-results',
 reporter: [['list'],['json',{outputFile:'creative-games-results.json'}],['html',{outputFolder:'creative-games-report',open:'never'}]],
});
