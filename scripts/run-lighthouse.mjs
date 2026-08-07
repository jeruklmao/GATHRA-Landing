import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, URL } from 'node:url';
import { chromium } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse, { generateReport } from 'lighthouse';

const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
const reportDirectory = fileURLToPath(new URL('../lighthouse-report/', import.meta.url));
const port = 4322;
const url = `http://127.0.0.1:${port}/`;
const threshold = 0.95;

const preview = spawn(process.execPath, ['scripts/serve-dist.mjs'], {
  cwd: projectDirectory,
  env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
  stdio: ['ignore', 'pipe', 'inherit'],
});

async function waitForPreview() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The local server is still starting.
    }

    await delay(100);
  }

  throw new Error(`Static preview did not become ready at ${url}.`);
}

let chrome;

try {
  await waitForPreview();
  chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
    logLevel: 'silent',
  });

  const result = await lighthouse(url, {
    port: chrome.port,
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });

  if (!result) throw new Error('Lighthouse returned no result.');

  await mkdir(reportDirectory, { recursive: true });
  await Promise.all([
    writeFile(`${reportDirectory}report.html`, generateReport(result.lhr, 'html')),
    writeFile(`${reportDirectory}report.json`, JSON.stringify(result.lhr, null, 2)),
  ]);

  const scores = Object.fromEntries(
    Object.entries(result.lhr.categories).map(([key, category]) => [key, category.score ?? 0]),
  );

  for (const [category, score] of Object.entries(scores)) {
    console.log(`${category}: ${Math.round(score * 100)}`);
  }

  const failures = Object.entries(scores).filter(([, score]) => score < threshold);
  if (failures.length > 0) {
    throw new Error(
      `Lighthouse threshold failed: ${failures
        .map(([category, score]) => `${category} ${Math.round(score * 100)}`)
        .join(', ')}`,
    );
  }
} finally {
  chrome?.kill();
  preview.kill('SIGTERM');
}
