import { Page } from '@playwright/test';

export async function logout(page: Page) {
  await page.getByTestId('PersonIcon').locator('path').click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.getByRole('img', { name: 'Widgets' }).click();
}
