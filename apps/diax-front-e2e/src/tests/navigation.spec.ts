import { test, expect } from '@playwright/test';
import { login, logout } from '../utils/test-helper';
test.describe('Navigation', () => {
  test('Header contains navigation elements', async ({ page }) => {
    await (login(page));
    await expect(page.getByTestId('PersonIcon')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Navigation' })).toBeVisible();
    await expect(page.getByTestId('mock-navigation').locator('div').first()).toBeVisible();
  });
  test("Navigation is available", async ({ page }) => {
    await (login(page));
    await page.getByRole('button', { name: 'Start Navigation' }).click();
    await expect(page.getByRole('link', { name: 'Navigation Item' })).toBeVisible();
    await page.getByRole('link', { name: 'logo' }).click();
    await expect(page.getByRole('button', { name: 'Start Navigation' })).toBeVisible();
  })
  test("components of dashboard are visible", async ({ page }) => {
    await (login(page));
    await expect(page.getByText('Information')).toBeVisible();
    await expect(page.getByText('Indicadores')).toBeVisible();
    await expect(page.getByText('Energía', { exact: true })).toBeVisible();
    await expect(page.getByText('Material', { exact: true })).toBeVisible();
    await expect(page.getByText('Molde', { exact: true })).toBeVisible();
    await expect(page.getByText('Ciclos por PIMM')).toBeVisible();
  })
  test('404 is expected', async ({ page }) => {
    await page.goto('http://localhost:4000/non-existing-page');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });
  test('Redirect page sends user to home', async ({ page }) => {
    await page.goto('/redirect');
    await expect(page).toHaveURL('/');
  });
});
