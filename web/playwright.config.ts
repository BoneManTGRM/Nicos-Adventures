import { defineConfig, devices } from "@playwright/test";

const languageProjects = [
  { suffix: "en", locale: "en-US" },
  { suffix: "es", locale: "es-MX" },
] as const;

const platforms = [
  {
    prefix: "chromium-desktop",
    use: { browserName: "chromium" as const, viewport: { width: 1440, height: 900 } },
  },
  {
    prefix: "chromium-mobile",
    use: { ...devices["Pixel 7"], browserName: "chromium" as const },
  },
  {
    prefix: "webkit-iphone",
    use: { ...devices["iPhone 13"], browserName: "webkit" as const },
  },
  {
    prefix: "webkit-ipad",
    use: { ...devices["iPad Pro 11"], browserName: "webkit" as const },
  },
] as const;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  outputDir: "test-results",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    serviceWorkers: "allow",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: platforms.flatMap((platform) => languageProjects.map((language) => ({
    name: `${platform.prefix}-${language.suffix}`,
    use: {
      ...platform.use,
      locale: language.locale,
      reducedMotion: platform.prefix === "webkit-iphone" && language.suffix === "es" ? "reduce" as const : "no-preference" as const,
    },
    metadata: { language: language.suffix === "es" ? "es-MX" : "en" },
  }))),
});
