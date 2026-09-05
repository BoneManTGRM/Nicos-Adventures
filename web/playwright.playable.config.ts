import { defineConfig } from '@playwright/test';
import base from './playwright.config';
const names = new Set(['chromium-desktop-en', 'chromium-mobile-es', 'webkit-iphone-es']);
export default defineConfig({
  ...base,
  testMatch: '**/playable-world.e2e.ts',
  retries: 0,
  workers: 1,
  projects: base.projects?.filter(project => names.has(project.name ?? '')).map(project => ({
    ...project,
    use: { ...project.use, ...(project.name?.startsWith('chromium') ? { launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } } : {}) },
  })),
});
