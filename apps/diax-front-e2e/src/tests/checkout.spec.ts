import { test, expect } from '@playwright/test';
import { login } from '../utils/test-helper';

export async function ensureNoSubscription(page) {
  await page.goto('/');
  // eslint-disable-next-line playwright/no-wait-for-selector
  await page.waitForSelector('#portal-button, #checkout-button', { state: 'visible' });
  const portalButton = page.locator('#portal-button');
  while (await portalButton.isVisible()) {
    await portalButton.click();
    await page.locator('[data-test="cancel-subscription"]').click();
    await page.getByTestId('confirm').click();
    await page.getByTestId('cancellation_reason_cancel').click();
    await page.getByTestId('return-to-business-link').click();
  }
}

test.describe.serial('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await ensureNoSubscription(page);
  });

  test('User can initiate checkout', async ({ page }) => {
    await page.click('#checkout-button');
    await expect(page).toHaveURL(/https:\/\/checkout\.stripe\.com\/c\/pay\//);
  });
  
  test('Order cancellation displays message', async ({ page }) => {
    await page.goto('/?canceled=true');
    await expect(page.locator('text=Order canceled')).toBeVisible();
  });
  
  test('No subscription shows product selection', async ({ page }) => {
    await expect(page.locator('text=Monthly Lññ Game Server 1GB Subscription')).toBeVisible();
  });

  test('User can toggle Subscribe', async ({ page }) => {
    await page.click('#checkout-button');
    await page.getByTestId('card-accordion-item').click();
    await page.getByRole('textbox', { name: 'Card number' }).fill('4242 4242 4242 4242');
    await page.getByRole('textbox', { name: 'Expiration' }).fill('01 / 42');
    await page.getByRole('textbox', { name: 'CVC' }).fill('420');
    await page.getByRole('textbox', { name: 'Cardholder name' }).fill('Test User');
    await page.getByTestId('hosted-payment-submit-button').click();
    await page.waitForURL(/http:\/\/localhost:4000\/redirect\?success=true&session_id=.*/);
    await expect(page.locator('h3')).toHaveText('Subscription to starter plan Active!');
    await ensureNoSubscription(page);
  });
  
});
