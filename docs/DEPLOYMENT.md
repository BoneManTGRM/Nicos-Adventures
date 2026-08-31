# Nico's World deployment

The primary production deployment is a **Cloudflare Worker with static assets**. The React PWA remains a fully static site; the Worker only serves `web/dist` and provides SPA routing.

## Required runtime

- Node.js `22.12.0` or newer
- npm from the committed lockfiles
- no runtime secrets
- no database, account service, analytics, or child-data API

The repository includes `.node-version` and `.nvmrc` files so Cloudflare and local tools select the supported Node release.

## Cloudflare Workers Builds

Use these project settings:

```text
Production branch: main
Root directory: /
Build command: npm install --prefix web && npm run build --prefix web
Deploy command: npx wrangler deploy --assets=web/dist --name nicos-world --compatibility-date=2026-08-01
```

`wrangler.jsonc` is the authoritative static-assets configuration:

- asset directory: `./web/dist`
- not-found handling: `single-page-application`

Do not add a catch-all `/* /index.html 200` rule to `web/public/_redirects`. Wrangler already provides the SPA fallback and Cloudflare rejects the duplicate rule as an infinite loop.

## Repository-root build shim

The root build also supports hosts that run only `npm run build`:

```bash
npm ci
npm run build
```

That command installs from `web/package-lock.json`, runs release validation, TypeScript, and Vite, then copies the output to both `web/dist` and root `dist`.

## Pre-deployment validation

```bash
cd web
npm ci
npm test
npm run build
cd ..
npx wrangler deploy --dry-run --assets=web/dist --name nicos-world --compatibility-date=2026-08-01
```

The normal GitHub Actions workflow also runs Python lint/tests/compile, the web suite, the repository-root Cloudflare build, output checks, and Wrangler dry-run packaging.

## Cache and update behavior

The PWA service worker uses an explicit release cache version. When the version changes it removes older caches, takes control, and reloads once through `ServiceWorkerRefresh`.

After a successful production deployment, mobile Safari users may need to close all Nico's World tabs and reopen the site so the new service worker can take control.

## Privacy boundary

The deployed static site does not upload profiles, questions, artwork, or videos. Browser profiles and lightweight movie project metadata remain local. Showtime video blobs exist only in the current browser session until the user downloads them.

The footer's optional visitor counter is the only shared metric. It calls the restricted
`register_site_visit` Neon Data API function and stores one aggregate integer. The browser
uses a local flag to count itself once; the database table stores no profiles, child activity,
IP addresses, user agents, artwork, stories, or identifiers. The idempotent database definition
is tracked in `database/neon-visitor-counter.sql`.
