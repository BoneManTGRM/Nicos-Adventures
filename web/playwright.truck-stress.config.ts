import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testMatch:['truck-stress.browser.ts'],testIgnore:[],timeout:720_000,fullyParallel:false,workers:1,retries:0,projects:base.projects!.filter(p=>['chromium-mobile-en','webkit-iphone-en'].includes(p.name!)),outputDir:'truck-stress-results',reporter:[['list'],['json',{outputFile:'truck-stress.json'}]],use:{...base.use,trace:'retain-on-failure',video:'off',screenshot:'only-on-failure'}});
