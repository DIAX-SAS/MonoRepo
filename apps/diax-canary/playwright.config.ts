import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import * as dotenv from 'dotenv';
import path = require('path');

dotenv.config({
  path: "apps/diax-canary/.env"
});

const FRONTEND_URL = process.env.FQDN || 'http://localhost:4000';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
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
  retries:3
});
