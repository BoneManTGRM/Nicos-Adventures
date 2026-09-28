import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testIgnore:[],testMatch:'**/learning-lab.e2e.ts',webServer:{command:'VITE_LEARNING_LAB_PREVIEW=true npm run build && npm run preview -- --host 127.0.0.1',url:'http://127.0.0.1:4173',timeout:180000,reuseExistingServer:!process.env.CI},projects:base.projects?.filter(p=>/chromium-desktop|webkit-iphone/.test(p.name??''))});
