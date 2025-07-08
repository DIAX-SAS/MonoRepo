import { test, expect } from '@playwright/test';
test.describe('Navigation', () => {
  test('Header contains navigation elements', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('PersonIcon')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Navigation' })).toBeVisible();
    await expect(page.getByTestId('mock-navigation').locator('div').first()).toBeVisible();
  });
  test("Navigation is available", async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Start Navigation' }).click();
    await expect(page.getByRole('link', { name: 'Navigation Item' })).toBeVisible();
    await page.getByRole('link', { name: 'logo' }).click();
    await expect(page.getByRole('button', { name: 'Start Navigation' })).toBeVisible();
  })
  test("components of dashboard are visible", async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Indicadores' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Equipos de Inyeccion' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Calidad' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Disponibilidad' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Energia' })).toBeVisible();
    await page.getByRole('heading', { name: 'Ciclos' }).click();
    await page.getByRole('heading', { name: 'Material', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Material', exact: true })).toBeVisible();
  })
  test('404 is expected', async ({ page }) => {
    await page.goto(`/non-existing-page`);
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });
  test('Redirect page sends user to home', async ({ page }) => {
    await page.goto('/redirect');
    await expect(page).toHaveURL('/dashboard');
  });
});
