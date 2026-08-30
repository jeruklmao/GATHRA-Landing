import { test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';

const screenshotDirectory = fileURLToPath(new URL('../docs/screenshots/', import.meta.url));

const captures = [
  { name: 'home-mobile-375x812.png', width: 375, height: 812 },
  { name: 'home-tablet-768x1024.png', width: 768, height: 1024 },
  { name: 'home-desktop-1440x900.png', width: 1440, height: 900 },
];

for (const capture of captures) {
  test(`captures visual review at ${capture.width}×${capture.height}`, async ({ page }) => {
    await mkdir(screenshotDirectory, { recursive: true });
    await page.setViewportSize({ width: capture.width, height: capture.height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator('img[loading="lazy"]').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((element) => (element as HTMLImageElement).decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.screenshot({
      path: `${screenshotDirectory}${capture.name}`,
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
  });
}
