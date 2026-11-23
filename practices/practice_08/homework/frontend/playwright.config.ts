import { defineConfig, devices } from '@playwright/test';

const webkit = process.env.PW_BROWSER === 'webkit';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5189',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: webkit ? 'webkit' : 'chromium', use: { ...devices[webkit ? 'Desktop Safari' : 'Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- --port 5189 --strictPort',
    url: 'http://127.0.0.1:5189',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
