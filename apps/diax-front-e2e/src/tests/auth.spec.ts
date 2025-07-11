import { test, expect } from '@playwright/test';
import { logout } from '../utils/test-helper';

test.describe('Authentication', () => {

  test('User can log in with valid credentials', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Start Navigation' })).toBeVisible();
    await page.getByTestId('PersonIcon').locator('path').click();
    await expect(page.getByRole('menuitem')).toContainText('Sign out');
  });
  test('User can log out', async ({ page }) => {
    await page.goto('/dashboard');
    await logout(page);
    await expect(page.getByRole('link', { name: 'logo' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Widgets' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible({timeout:30000});
  });
});
