import { test, expect } from '@playwright/test';
import { login, logout } from '../utils/test-helper';

test.describe('Authentication', () => {
  test('Indicators are not 0s', async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(10000); 
    for (const id of [
      'indicador-eficiencia',
      'indicador-calidad',
      'indicador-rendimiento',
      'indicador-availability',
    ]) {
      const locator = page.getByTestId(id);
  
      await expect(locator).toHaveText(/^\d+(\.\d+)?$/);
    
      const text = await locator.textContent();
      const value = Number(text);
    
      expect(value).toBeGreaterThan(0);
    }
    
    
  });
});
