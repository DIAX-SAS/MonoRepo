import { test, expect } from '@playwright/test';
import { login, logout } from '../utils/test-helper';

test.describe('Authentication', () => {
  test('User can log in with valid credentials', async ({ page }) => {
    await login(page);await 
    await expect(page.locator('text=Sign Out')).toBeVisible();

  });

  test('User can log out', async ({ page }) => {
    await login(page);
    await logout(page);
    await expect(page.locator('text=Sign In')).toBeVisible();
  });
  
  test('Session error triggers sign out', async ({ page }) => {
    await page.route('/api/auth/session', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ error: "RefreshAccessTokenError" }),
      })
    );
  
    await page.goto('/');
  
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Sign In')).toBeVisible();
  });
});
