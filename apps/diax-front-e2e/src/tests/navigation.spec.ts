import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('Header contains navigation elements', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('404 redirects to /redirect', async ({ page }) => {
    await page.goto('/non-existent-page');
    await expect(page).toHaveURL('/');
  });

  test('Redirect page sends user to home', async ({ page }) => {
    await page.goto('/redirect');
    await expect(page).toHaveURL('/');
  });
});
