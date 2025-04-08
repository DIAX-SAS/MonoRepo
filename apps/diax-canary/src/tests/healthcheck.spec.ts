import { test, expect } from '@playwright/test';
import { login, logout } from '../utils/test-helper';

test.describe('Authentication', () => {
  test('User can log in with valid credentials', async ({ page }) => {
    await login(page);
    await expect(page.getByText('Information')).toBeVisible();
    await expect(page.getByText('Indicadores')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Calidad0Piezas \(Unidades\)Time$/ }).locator('span')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Disponibilidad0Piezas \(Unidades\)Time$/ }).locator('span')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Rendimiento0Piezas \(Unidades\)Time$/ }).locator('span')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Energía$/ }).first()).toBeVisible();
    await expect(page.getByText('Mold Mounting')).toBeVisible();
    await expect(page.getByText('Material', { exact: true })).toBeVisible();
    await expect(page.getByText('Molde', { exact: true })).toBeVisible();
    await expect(page.getByText('Ciclos por PIMM')).toBeVisible();
  });
});
