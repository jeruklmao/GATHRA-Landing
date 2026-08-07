import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

const source = fileURLToPath(new URL('../src/assets/og-image.svg', import.meta.url));
const output = fileURLToPath(new URL('../public/og-image.png', import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

await page.goto(pathToFileURL(source).toString());
await page.screenshot({ path: output, animations: 'disabled' });
await browser.close();

console.log('Generated public/og-image.png (1200×630).');
