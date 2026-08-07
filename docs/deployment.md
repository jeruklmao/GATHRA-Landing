# Cloudflare Pages deployment

This project is a static Astro site. Deployment must not introduce a dependency on the GATHRA API
or home server.

## 1. Connect the private GitHub repository

In the Cloudflare dashboard:

1. Open **Workers & Pages**.
2. Select **Create application** → **Pages** → **Import an existing Git repository**.
3. Authorize the Cloudflare GitHub integration for the private repository
   `JerukLMAO/GATHRA-landing`.
4. Select the repository and begin setup.

Use these build settings:

| Setting                | Value                                              |
| ---------------------- | -------------------------------------------------- |
| Project name           | `gathra-landing` (or another available Pages slug) |
| Production branch      | `main`                                             |
| Root directory         | `/` (repository root)                              |
| Build command          | `npm run build`                                    |
| Build output directory | `dist`                                             |
| Environment variables  | None required                                      |

The repository's `.node-version` pins Node 24.19.0. Cloudflare Pages recognizes `.node-version` for
build runtime selection. Do not add secrets, API URLs, or Cloudflare tokens to the build.

Reference: [Cloudflare's Astro Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
and [build configuration documentation](https://developers.cloudflare.com/pages/configuration/build-configuration/).

## 2. Verify the `pages.dev` deployment

Before changing `gathra.my.id`, verify the generated Pages URL:

```bash
curl -I https://<project>.pages.dev
curl -I https://<project>.pages.dev/privacy
curl -I https://<project>.pages.dev/a-missing-page
```

Expected results:

- homepage and privacy return a successful response;
- an unknown route returns the custom 404 document;
- browser developer tools show no request to `api.gathra.my.id`;
- canonical metadata still points to `https://gathra.my.id` by design;
- `_headers` applies the content security, permissions, referrer, and MIME-sniffing policies;
- the development notice and OpenStreetMap attribution are visible.

## 3. Attach `gathra.my.id`

Only perform this step after the Pages deployment is verified.

1. Open the Pages project in **Workers & Pages**.
2. Open **Custom domains** and select **Set up a domain**.
3. Enter `gathra.my.id` and continue through activation.
4. Allow the dashboard flow to associate the hostname before altering DNS manually.
5. Confirm the certificate is active and the hostname resolves to the Pages project.

The hostname is the apex of the `gathra.my.id` zone. The zone must be available in the same
Cloudflare account as the Pages project. Cloudflare warns that manually pointing a CNAME to Pages
without first associating the hostname in the Pages dashboard can produce a 522 response.

Reference: [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

Do not modify `api.gathra.my.id`; it remains a separate service.

## 4. Post-cutover verification

Run:

```bash
curl -I https://gathra.my.id
curl -I https://gathra.my.id/privacy
curl -I https://gathra.my.id/a-missing-page
```

Then verify in a browser at mobile and desktop widths:

- navigation menu and skip link;
- hero and CTA visibility;
- safety notice prominence;
- privacy and custom 404 pages;
- Open Graph image and favicon;
- `robots.txt` and `sitemap-index.xml`;
- no horizontal overflow or mixed content;
- no request to the API origin.

## 5. Rollback

Cloudflare Pages retains deployments. If the production deployment is faulty, use the Pages
deployment history to roll back to the last verified deployment. If custom-domain activation itself
fails, keep the previous DNS target until the `pages.dev` deployment and domain association are both
healthy; do not improvise changes to the API hostname.
