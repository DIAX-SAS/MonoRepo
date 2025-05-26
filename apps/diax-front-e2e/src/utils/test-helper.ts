import { Page } from '@playwright/test';

export async function login(page: Page) {
  await page.goto(`${process.env.FQDN}/sign-in`);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Sign in with Cognito' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(process.env.COGNITO_TEST_USER);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.COGNITO_TEST_PASSWORD);
  await page.getByRole('button', { name: 'submit' }).click();
  await page.goto(`${process.env.FQDN}/dashboard`);
}

export async function logout(page: Page) {
  await page.getByTestId('PersonIcon').locator('path').click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.getByRole('img', { name: 'Widgets' }).click();
}
