import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/desktop",
  timeout: 30000,
  expect: {
    timeout: 7000,
    toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.002 },
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
    timezoneId: "Asia/Dubai",
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
      testIgnore: /performance\.spec\.ts/,
    },
    {
      name: "firefox",
      use: { browserName: "firefox" },
      testIgnore: /performance\.spec\.ts/,
    },
    {
      name: "webkit",
      use: { browserName: "webkit" },
      testIgnore: /performance\.spec\.ts/,
    },
    {
      name: "performance",
      use: {
        browserName: "chromium",
        channel: "chromium",
        launchOptions: { args: ["--enable-gpu"] },
      },
      testMatch: /performance\.spec\.ts/,
    },
    {
      name: "phone",
      use: { ...devices["iPhone 13"], browserName: "webkit" },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: "pnpm start --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
