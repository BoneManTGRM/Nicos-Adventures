import { defineConfig } from '@playwright/test';
import base from './playwright.config';
const names=new Set(['chromium-desktop-en','chromium-mobile-es','webkit-iphone-es']);
const production=process.env.NICO_PRODUCTION_URL;
export default defineConfig({
  ...base,testMatch:'**/playable-cutouts.e2e.ts',testIgnore:[],workers:1,retries:0,
  outputDir:'cutout-test-results',reporter:[['line'],['html',{open:'never',outputFolder:'cutout-report'}]],
  use:{...base.use,...(production?{baseURL:production}:{})},
  webServer:production?undefined:base.webServer,
  projects:base.projects?.filter(project=>names.has(project.name??'')),
});
