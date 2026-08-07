import { expect, test } from '@playwright/test';

const title = 'GATHRA — Navigasi dengan Pertimbangan Risiko Banjir';
const description =
  'GATHRA membantu pengendara melihat area yang terindikasi banjir dan memilih rute dengan risiko lebih rendah berdasarkan data yang tersedia.';

test('publishes accurate title, canonical, social, and structured metadata', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(title);
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://gathra.my.id/',
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    'https://gathra.my.id/',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://gathra.my.id/og-image.png',
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );

  const schema = await page.locator('script[type="application/ld+json"]').textContent();
  expect(schema).not.toBeNull();
  expect(JSON.parse(schema ?? '{}')).toMatchObject({
    '@type': 'WebSite',
    name: 'GATHRA',
    url: 'https://gathra.my.id/',
    inLanguage: 'id-ID',
  });
});

test('renders one h1 and every required homepage section', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('GATHRA');

  for (const heading of [
    'Mengapa GATHRA dibutuhkan?',
    'Fitur utama',
    'Cara kerja GATHRA',
    'Lihat GATHRA bekerja',
    'Status pengembangan',
    'Teknologi di balik GATHRA',
    'Ikuti perkembangan GATHRA',
  ]) {
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
  }
});

test('keeps the development disclaimer and attribution prominent', async ({ page }) => {
  await page.goto('/');

  const developmentSection = page.locator('#status');
  await expect(developmentSection).toBeVisible();
  await expect(developmentSection).toContainText(
    'GATHRA masih berada pada tahap pengembangan dan pilot. Informasi banjir yang ditampilkan saat ini menggunakan data simulasi dan tidak boleh menjadi satu-satunya dasar dalam mengambil keputusan keselamatan.',
  );
  await expect(developmentSection).toContainText('Cakupan data dapat belum lengkap.');
  await expect(developmentSection).toContainText('Ingesti IoT produksi belum tersedia.');
  await expect(developmentSection).toContainText(
    'Selalu ikuti arahan resmi, petugas di lapangan, dan otoritas setempat.',
  );

  const attribution = page.getByRole('link', { name: 'OpenStreetMap contributors' });
  await expect(attribution).toBeVisible();
  await expect(attribution).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
});

test('describes privacy and enabled analytics honestly', async ({ page }) => {
  await page.goto('/privacy');

  await expect(page).toHaveTitle('Privasi — GATHRA');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://gathra.my.id/privacy',
  );
  await expect(
    page.getByRole('heading', { level: 1, name: 'Privasi di situs GATHRA' }),
  ).toBeVisible();
  await expect(
    page.getByText(/Landing page GATHRA menggunakan Cloudflare Web Analytics/),
  ).toBeVisible();
  await expect(page.getByText(/beacon ini tidak menggunakan cookie/)).toBeVisible();
  await expect(page.getByText(/tidak memasang piksel pemasaran/)).toBeVisible();
  await expect(page.getByText(/Landing page tidak meminta izin lokasi/)).toBeVisible();
  await expect(page.getByText(/Landing page GATHRA tidak memerlukan akun/)).toBeVisible();
});

test('serves the custom 404 for its route and unknown paths', async ({ page }) => {
  const directResponse = await page.goto('/404');
  expect(directResponse?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { level: 1, name: '404 — Halaman tidak ditemukan' }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');

  const fallbackResponse = await page.goto('/halaman-yang-tidak-ada');
  expect(fallbackResponse?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { level: 1, name: '404 — Halaman tidak ditemukan' }),
  ).toBeVisible();
});
