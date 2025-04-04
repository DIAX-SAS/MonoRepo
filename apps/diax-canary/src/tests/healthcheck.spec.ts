import { test, expect } from '@playwright/test';
import { login, logout } from '../utils/test-helper';

test.describe('Authentication', () => {
  test('User can log in with valid credentials', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('button', { name: 'Start Navigation' })).toBeVisible();
    await page.getByTestId('PersonIcon').locator('path').click();
    await expect(page.getByRole('menuitem')).toContainText('Sign out');
    await page.locator('.MuiBackdrop-root').click();
    await expect(page.getByRole('main')).toContainText('Settings');
  });
});
