import { expect, test } from '@playwright/test';

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('opens, closes, and restores focus with the keyboard', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('[data-menu-button]');
    const navigation = page.getByRole('navigation', { name: 'Navigasi utama' });

    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAccessibleName('Buka menu navigasi');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation).not.toBeVisible();

    await menuButton.focus();
    await page.keyboard.press('Enter');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(menuButton).toHaveAccessibleName('Tutup menu navigasi');
    await expect(navigation).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toHaveAccessibleName('Buka menu navigasi');
    await expect(menuButton).toBeFocused();
    await expect(navigation).not.toBeVisible();
  });

  test('closes after selecting a menu destination', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: 'Buka menu navigasi' });
    await menuButton.click();
    await page
      .getByRole('navigation', { name: 'Navigasi utama' })
      .getByRole('link', { name: 'Fitur' })
      .click();

    await expect(page).toHaveURL(/#fitur$/);
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('heading', { level: 2, name: 'Fitur utama' })).toBeVisible();
  });
});

test('shows horizontal navigation on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Buka menu navigasi' })).not.toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navigasi utama' })).toBeVisible();
});

test('respects reduced-motion preferences', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1024, height: 768 },
  });
  const page = await context.newPage();
  await page.goto('/');

  const animationDuration = await page
    .locator('.hero-visual__route')
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration) * 1000);
  expect(animationDuration).toBeLessThanOrEqual(0.02);

  await context.close();
});

for (const viewport of [
  { width: 320, height: 720 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
]) {
  test(`has no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}
