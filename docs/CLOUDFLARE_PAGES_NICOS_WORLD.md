# Deploy `nicos-world.com` on Cloudflare Pages

This project is a static React/Vite PWA. It does not require Pages Functions, Workers, FastAPI, Render, a database, runtime environment variables, or paid compute.

## Create the Pages project

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Select **Create application** → **Pages** → **Connect to Git**.
4. Authorize the GitHub repository `BoneManTGRM/Nicos-Adventures`.
5. Use these build settings:

| Setting | Value |
|---|---|
| Project name | `nicos-world` |
| Production branch | `main` |
| Framework preset | `Vite` |
| Root directory | `web` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variables | None |
| Pages Functions | None |

6. Deploy and confirm the generated `*.pages.dev` URL loads.

## Attach the apex domain

1. Add `nicos-world.com` to the same Cloudflare account as a website zone.
2. At the domain registrar, replace the current nameservers with the two nameservers Cloudflare assigns.
3. Wait until Cloudflare shows the zone as active.
4. Open **Workers & Pages** → `nicos-world` → **Custom domains**.
5. Select **Set up a domain** and enter `nicos-world.com`.
6. Allow Cloudflare to create the Pages DNS record and issue the SSL certificate.

Do not manually point the apex domain to the `pages.dev` hostname before associating it through the Pages custom-domain screen.

## Redirect `www`

After the apex domain is active:

1. Create a proxied DNS record for `www`:
   - Type: `A`
   - Name: `www`
   - IPv4 address: `192.0.2.1`
   - Proxy status: Proxied
2. In **Bulk Redirects**, create a 301 redirect:
   - Source: `www.nicos-world.com`
   - Target: `https://nicos-world.com`
   - Preserve query string
   - Enable subpath matching
   - Preserve path suffix

## Production verification

Verify all of these after DNS and TLS finish activating:

- `https://nicos-world.com/`
- `https://nicos-world.com/robots.txt`
- `https://nicos-world.com/sitemap.xml`
- direct refreshes on application routes
- English and Mexican Spanish switching
- creation of two separate local profiles
- progress remains after a browser refresh
- JSON backup export and import
- installation as a PWA
- offline reopening after one successful online load
- `https://www.nicos-world.com/anything` redirects to `https://nicos-world.com/anything`

## Local-save limitation

Progress belongs to the browser profile on that device. Clearing browser site data, private browsing, or resetting the device can erase local progress. Use the JSON backup control for important saves. No child data is uploaded by the static website.
