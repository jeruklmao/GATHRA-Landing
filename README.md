# GATHRA landing page

Official static landing page for **GATHRA**, an Indonesian flood-monitoring and navigation pilot
that presents sensor-backed conditions and route choices with flood context.

- Public website: <https://gathra.my.id>
- Public API: separate at `api.gathra.my.id`; the landing page never calls it from the browser.
- Language: Indonesian (`id`)
- Hosting target: Cloudflare Pages

## Product boundary

The website is informational only. It has no account, authentication, database, server-side
rendering, backend API calls, or location access. Cloudflare Web Analytics measures aggregate site
performance and usage without cookies or browser storage; no marketing pixels or additional
analytics services are included. The active pilot uses production IoT sensor observations in a
limited Jakarta–Tangerang area. Sensor-backed information is still a modeled observation and must
not be described as proof that an area or route is safe.

The homepage uses current Android screenshots selected from the immutable source captures under
`/home/fadhli/src/screenshot/`. Optimized WebP derivatives live in `public/images/app/`; the
original PNG files are not served by the website. The official logo comes from
`GATHRA-Android/design/source/logo-GATHRA.svg`, and the visible identity colors are GATHRA Blue
`#44B5F8`, GATHRA Orange `#FF751F`, and white.

## Stack

- Astro with static output
- TypeScript in strictest mode
- Scoped Astro CSS and shared CSS tokens
- ESLint and Prettier
- Playwright and axe-core for browser/accessibility checks
- Lighthouse for local quality thresholds

Astro 7.2.0 requires a modern Node runtime. The repository pins Node 24.19.0 in `.node-version` and
npm 11.17.0 in `package.json`.

## Local development

```bash
npm ci
npx playwright install chromium
npm run dev
```

Open the URL printed by Astro. No environment file is required.

Available commands:

| Command                   | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| `npm run dev`             | Start the Astro development server.                      |
| `npm run build`           | Generate the static site in `dist/`.                     |
| `npm run preview`         | Preview the Astro build locally.                         |
| `npm run check`           | Run Astro and TypeScript diagnostics.                    |
| `npm run lint`            | Run ESLint with zero warnings allowed.                   |
| `npm run format`          | Format supported project files with Prettier.            |
| `npm run format:check`    | Verify formatting without changing files.                |
| `npm run test`            | Build, start a static preview, and run browser tests.    |
| `npm run lighthouse`      | Build and enforce ≥95 in all four Lighthouse categories. |
| `npm run assets:generate` | Re-render the Open Graph PNG from its SVG source.        |

On minimal Linux hosts, Chromium may require OS libraries. This workspace keeps any extracted local
runtime libraries under ignored `.tools/`; they are never committed.

## Quality checks

Before publishing changes, run:

```bash
npm ci
npm audit
npm run format:check
npm run check
npm run lint
npm run build
npm run test
npm run lighthouse
git diff --check
```

Browser tests cover metadata, required content, the mandatory safety notice, OpenStreetMap
attribution, internal links, private/development reference scanning, the API network boundary,
mobile menu keyboard behavior, reduced motion, custom 404 behavior, privacy wording, rendered axe
checks, and horizontal overflow from 320 through 1440 px.

Review screenshots are generated under `docs/screenshots/` at 375×812, 768×1024, and 1440×900
viewports. They are documentation artifacts and are not copied to `public/`.

## Repository structure

```text
src/
├── assets/
├── components/
├── layouts/
├── pages/
└── styles/

public/
├── brand/
├── images/app/
├── _headers
├── favicon.svg
├── og-image.png
└── robots.txt

tests/
docs/screenshots/
```

## Deployment

Cloudflare Pages should build `main` with `npm run build` and publish `dist`. No Astro Cloudflare
adapter is required because this project produces static output.

See [docs/deployment.md](docs/deployment.md) for Git connection, custom-domain cutover, verification,
and rollback guidance.

---

Copyright © 2026 GATHRA Project. All rights reserved.

Source code and documentation in this repository are publicly viewable for inspection, academic review, and evaluation. No permission is granted to reproduce, redistribute, modify, commercialize, or create derivative works except where explicitly permitted by the repository's license or by written permission from the copyright holder.

If you use GATHRA in academic or research work, please provide appropriate attribution to the GATHRA Project and its associated publications.
