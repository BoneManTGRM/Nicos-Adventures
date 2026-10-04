import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testMatch:['truck-performance.browser.ts'],testIgnore:[],timeout:180_000,fullyParallel:false,workers:1,retries:0,projects:base.projects!.filter(p=>['chromium-mobile-en','webkit-iphone-en'].includes(p.name!)),outputDir:'truck-performance-results',reporter:[['list']],use:{...base.use,trace:'off',video:'off',screenshot:'only-on-failure'}});
