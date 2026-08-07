# GATHRA landing page

Official static landing page for **GATHRA**, an Indonesian Android navigation pilot that presents
route choices with flood-risk context based on available data.

- Public website: <https://gathra.my.id>
- Public API: separate at `api.gathra.my.id`; the landing page never calls it from the browser.
- Language: Indonesian (`id`)
- Hosting target: Cloudflare Pages

## Product boundary

The website is informational only. It has no account, authentication, database, server-side
rendering, backend API calls, location access, or analytics. Current flood information in the
GATHRA pilot is simulation-based and must not be described as proof that a route is safe.

The interface previews on the homepage are original illustrations of verified Android flows. They
are intentionally labeled as illustrations and are not presented as current literal screenshots.

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
