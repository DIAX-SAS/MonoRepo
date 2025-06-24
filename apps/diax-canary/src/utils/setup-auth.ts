import * as path from 'path';
import * as dotenv from 'dotenv';
import { chromium } from '@playwright/test';

dotenv.config({
    path: "apps/diax-canary/.env"
});

async function setupAuth() {
    const authFilePath = path.resolve(__dirname, '../../playwright/.auth/user.json');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Perform login steps here
    await page.goto(`${process.env.FQDN}/sign-in`);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill(process.env.COGNITO_TEST_USER);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.COGNITO_TEST_PASSWORD);
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.waitForURL(`${process.env.FQDN}/dashboard`); // Wait for the redirect to the home page
    // Save storage state
    await context.storageState({ path: authFilePath });
    console.log('Authentication file generated successfully.');

    await browser.close();
}

setupAuth().catch((error) => {
    console.error('Error during authentication setup:', error);
    process.exit(1);
});

