import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = ['/', '/privacy', '/404'];

for (const route of pages) {
  test(`has no automated accessibility violations on ${route}`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test('preserves a logical heading order', async ({ page }) => {
  await page.goto('/');

  const levels = await page
    .locator('h1, h2, h3, h4, h5, h6')
    .evaluateAll((headings) =>
      headings
        .filter((heading) => heading.getAttribute('aria-hidden') !== 'true')
        .map((heading) => Number.parseInt(heading.tagName.slice(1), 10)),
    );

  expect(levels[0]).toBe(1);
  for (let index = 1; index < levels.length; index += 1) {
    expect((levels[index] ?? 1) - (levels[index - 1] ?? 1)).toBeLessThanOrEqual(1);
  }
});

test('exposes a keyboard skip link', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Lewati ke konten utama' });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);
});
