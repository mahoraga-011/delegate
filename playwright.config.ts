import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  retries: 2,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "on",
  },
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: true,
  },
});
