import { defineConfig, devices } from "@playwright/test";

const languages = [{ suffix: "en", locale: "en-US", language: "en" }, { suffix: "es", locale: "es-MX", language: "es-MX" }] as const;
const platforms = [
  { name: "desktop", use: { browserName: "chromium" as const, viewport: { width: 1440, height: 1000 } } },
  { name: "mobile", use: { ...devices["Pixel 7"], browserName: "chromium" as const } },
  { name: "iphone", use: { ...devices["iPhone 13"], browserName: "webkit" as const } },
];
export default defineConfig({
  testDir: "./e2e", testMatch: "store.e2e.ts", outputDir: "store-test-results",
  timeout: 45_000, expect: { timeout: 10_000 }, fullyParallel: true, workers: 2, retries: 0,
  reporter: [["json", { outputFile: "store-test-results/results.json" }], ["line"], ["html", { open: "never", outputFolder: "store-playwright-report" }]],
  use: { baseURL: process.env.STORE_BASE_URL || "http://127.0.0.1:4173", trace: "retain-on-failure", screenshot: "only-on-failure", serviceWorkers: "block" },
  webServer: process.env.STORE_BASE_URL ? undefined : { command: "npm run preview -- --host 127.0.0.1", url: "http://127.0.0.1:4173", timeout: 60_000, reuseExistingServer: !process.env.CI },
  projects: platforms.flatMap(platform => languages.map(language => ({ name: `${platform.name}-${language.suffix}`, use: { ...platform.use, locale: language.locale, reducedMotion: "reduce" as const }, metadata: { language: language.language } }))),
});
