import { defineConfig } from '@playwright/test';
import base from './playwright.config';
const production=process.env.NICO_PRODUCTION_URL;
export default defineConfig({...base,
 testMatch:'**/playable-connected-polish.e2e.ts',testIgnore:[],workers:2,retries:0,timeout:60000,
 outputDir:'connected-test-results',reporter:[['line'],['html',{open:'never',outputFolder:'connected-report'}],['json',{outputFile:'connected-results.json'}]],
 use:{...base.use,serviceWorkers:'block',...(production?{baseURL:production}:{})},
 webServer:production?undefined:base.webServer,
 projects:base.projects?.filter(p=>!p.name?.includes('ipad')),
});
