import { expect, test } from '@playwright/test';

test('renders the GATHRA landing page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('GATHRA — Navigasi dengan Pertimbangan Risiko Banjir');
  await expect(page.getByRole('heading', { level: 1, name: 'GATHRA' })).toBeVisible();
});
