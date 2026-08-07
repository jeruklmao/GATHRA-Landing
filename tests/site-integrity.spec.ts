import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url));

async function collectTextFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectTextFiles(path);
      if (['.css', '.html', '.js', '.json', '.txt', '.xml'].includes(extname(path))) return [path];
      return [];
    }),
  );

  return paths.flat();
}

test('built output contains no private, development, or misleading references', async () => {
  const files = await collectTextFiles(distDirectory);
  const output = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n');

  for (const prohibited of [
    /api\.gathra\.my\.id/i,
    /localhost/i,
    /swagger/i,
    /\b10\.(?:\d{1,3}\.){2}\d{1,3}\b/,
    /\b192\.168\.(?:\d{1,3})\.(?:\d{1,3})\b/,
    /\b172\.(?:1[6-9]|2\d|3[01])\.(?:\d{1,3})\.(?:\d{1,3})\b/,
    /rute aman/i,
    /dijamin bebas banjir/i,
    /pasti terhindar dari banjir/i,
    /100% akurat/i,
  ]) {
    expect(output).not.toMatch(prohibited);
  }
});

test('the browser allows only the landing page and Cloudflare Web Analytics origins', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(requests.length).toBeGreaterThan(0);
  for (const request of requests) {
    expect(['http://127.0.0.1:4321', 'https://static.cloudflareinsights.com']).toContain(
      new URL(request).origin,
    );
  }
  expect(requests.some((request) => request.includes('api.gathra.my.id'))).toBe(false);
});

test('the security policy permits the Cloudflare analytics beacon without widening connections', async () => {
  const headers = await readFile(join(distDirectory, '_headers'), 'utf8');

  expect(headers).toContain("connect-src 'self'");
  expect(headers).toContain(
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  );
  expect(headers).not.toContain('api.gathra.my.id');
});

test('all internal page and fragment links resolve', async ({ page, request }) => {
  const routes = ['/', '/privacy', '/404'];
  const links = new Set<string>();

  for (const route of routes) {
    await page.goto(route);
    const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
      anchors
        .map((anchor) => new URL((anchor as HTMLAnchorElement).href))
        .filter((url) => url.origin === window.location.origin)
        .map((url) => `${url.pathname}${url.search}${url.hash}`),
    );
    for (const href of hrefs) links.add(href);
  }

  for (const href of links) {
    const url = new URL(href, 'http://127.0.0.1:4321');
    const response = await request.get(url.pathname);
    expect(response.status(), href).toBeLessThan(400);

    if (url.hash) {
      await page.goto(`${url.pathname}${url.hash}`);
      await expect(page.locator(url.hash)).toHaveCount(1);
    }
  }
});
