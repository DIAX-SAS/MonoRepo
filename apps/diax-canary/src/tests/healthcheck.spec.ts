import { test, expect } from '@playwright/test';
import { login, logout } from '../utils/test-helper';

test.describe('Authentication', () => {
  test('User can log in with valid credentials', async ({ page }) => {
    await login(page);
    await expect(page.getByText('Configuración')).toBeVisible();
    await page.getByRole('checkbox', { name: 'Live Live' }).check();
    await expect(page.getByTestId("Disponibilidad-factor"))
      .not.toHaveAttribute("aria-valuenow", "0", { timeout: 30000 });
    await expect(page.getByTestId("Rendimiento-factor"))
      .not.toHaveAttribute("aria-valuenow", "0",);

    await logout(page);
  });

});
