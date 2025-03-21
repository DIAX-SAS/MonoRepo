import { Page } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/');
  await page.click('text=Sign In');
  await page.fill('input[name="username"]', 'testuser');
  await page.click('button[type="submit"]');
  await page.fill('input[name="password"]', 'password123lññ');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

export async function logout(page: Page) {
  await page.click('text=Sign Out');
  await page.waitForURL('/');
}
