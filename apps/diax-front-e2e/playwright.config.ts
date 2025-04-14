import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import * as dotenv from 'dotenv';

dotenv.config({
  path: "apps/diax-front-e2e/.env"
});

const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:4000';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
  },
  webServer: [],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  expect:{
    timeout: 180 * 1000,
  },
  timeout: 180 * 1000,
});
