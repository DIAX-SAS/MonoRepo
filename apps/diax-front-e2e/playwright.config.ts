import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: "apps/diax-front-e2e/.env"
});

const FRONTEND_URL = process.env.FQDN || 'http://localhost:4000';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: {
    baseURL: FRONTEND_URL,
  },
  webServer: [],
  projects: [
    {
      name: 'setup-auth',
      testMatch: /.*\.setup-auth\.ts/,
      use: { storageState: path.resolve(__dirname, 'playwright/.auth/user.json') },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: path.resolve(__dirname, 'playwright/.auth/user.json') },
    }
  ],
  timeout: 10000,
  expect: {
    timeout: 5000, // 5 seconds
  },
  retries: process.env.CI ? 2 : 0, // Add retries for CI
});
