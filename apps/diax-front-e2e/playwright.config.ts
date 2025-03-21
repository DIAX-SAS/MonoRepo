import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';

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
});
