# Nico’s Toy Shop / La Tiendita de Nico

The store lives at `/store` in **Nicos-Adventures**, not the NICO assessment repository. It is a separate physical-product page; games and browser-local child profiles are not connected to ordering. The initial production catalog is deliberately empty and `salesEnabled` is false.

## Updating products from a phone

Send the actual product photos in the working chat, with the toy’s name, price **and currency**, colors/options, dimensions, material, care, preparation time and delivery/pickup options. Short messages are sufficient; details that are unknown stay unpublished or unorderable. State which photos and business contact details may be made public. A clear main image and two additional angles are useful. Never submit payment credentials.

The implementation agent can prepare the catalog change and its tests from that information. Review the proposed listing and pull request in the phone browser before publication. This does not require a terminal, a new seller dashboard, or a child account. Alternatively, use GitHub’s browser file editor for `web/store/catalog.json`, on a branch, and the normal reviewed release workflow. Do not edit production by bypassing review or test gates.

This repository is public. **Never commit private drafts, original camera files, private addresses, family photos, or unapproved contact information.** Build filtering is not a way to make a public Git repository private. Supply originals privately for processing first. Only deliberately public, reviewed catalog text and sanitized images belong in the repository.

## Data and publication

`web/store/catalog.json` is the single source; it is read by the build plugin, never imported into browser code. Its initial contents are:

```json
{"version":1,"salesEnabled":false,"seller":null,"products":[]}
```

Types and validation are in `web/src/store/types.ts` and `model.ts`. Both `en` and `es-MX` are required for public names, descriptions, alt text, variant labels and supplied informational text. Identifiers use lowercase letters, digits and hyphens. A product has `publication`, `saleEnabled`, `name`, `description`, `photos`, `price`, `variants`, `availability`, `dimensions`, `material`, `care`, `preparation`, `fulfillment`, `safety`, and `approvals`.

A published listing needs an approved name/description and at least one approved actual-product photograph. A missing price or other optional detail is not invented. Ordering additionally requires all product safety, commercial-rights and fulfillment approvals, the required product details, a valid price, and an available selection. Approval flags record real adult decisions; they are not automatic legal certification. The compiler fails an explicitly published malformed entry instead of quietly substituting content.

Prices are positive integer **minor units** plus an explicit supported currency. Currency decimal precision is used for display and multiplication; the application does not assume that all currencies have two decimals. No currency, delivery territory or preparation time is selected by default. The request quantity limit of 10 is an input-size limit, not a stock count or capacity promise. There is no real-time inventory synchronization.

Unpublished entries and unknown fields are excluded by an allowlist projection. Only referenced, approved photographs are emitted; draft and orphaned images are not copied. Do not put product images in `web/public` or import them into client source: those paths can publish assets independently of the catalog.

## Real photographs

After the adult has approved the subject and background, orient the original correctly, convert its colors to sRGB, resize without distortion to at most 1600 pixels on either side, and export a still WebP under 2,000,000 bytes. Remove EXIF/GPS, XMP, embedded profiles and other metadata **after** color conversion. Preserve true color, proportions, texture and printing imperfections. No AI replacement products, renders presented as photos, or cosmetic changes that misrepresent what is sold.

Store only the sanitized derivative in `web/store/images/` with a lowercase slug filename. The catalog refers to `/store-images/<filename>.webp` and includes actual width, height, bilingual alt text, `actualProduct: true`, and `publicApproved: true` only after genuine approval. The build validates the WebP container, bounded dimensions and absence of metadata/animation, then emits a hashed URL. Browser decoding and human visual review are still required; the compiler cannot establish that an image depicts a real product or is safe to publish.

The test fixtures simulate approvals solely to exercise the code. They are conspicuously synthetic, excluded from production output, and must never be copied into the live catalog.

## Seller and order-request setup

Before enabling sales, an adult must approve public seller display name, business contact, seller information, territory, delivery terms, return terms and privacy information in both languages. `seller.publicApproved`, `adultManaged`, `marketReviewApproved`, and `contact.publicApproved` cannot be inferred from linked accounts or user history.

For the intended destination market, record current official product-safety, labeling and seller-information requirements, the source and review date, product-specific small-part or breakage concerns, and the commercial-use permissions for each design. The destination market and real product details are not yet supplied; that review is unresolved. Do not invent an age rating or claim that a disclaimer removes obligations. Keep sales off until the necessary decisions and compliance work are completed.

The first version supports an approved business email address (`contact.kind: "email"`) or an international WhatsApp number containing digits only (`"whatsapp"`). It constructs only a fixed `mailto:` or `https://wa.me/` destination. Other protocols, injected checkout URLs, unapproved contact details and payment fields are rejected or excluded.

A grown-up chooses a valid option/quantity, acknowledges the adult reminder and prepares a request. The application refreshes the catalog before preparing text. It includes the canonical product, option, quantity, listed prices, preparation and fulfillment information. It explicitly asks the adult seller to confirm availability, applicable charges/taxes, delivery and the final total. This is **not a confirmed order or payment**. Opening an app is not proof of sending; a copyable-text fallback is available. No message is sent automatically. Actual delivery to a real business contact must be tested with owner approval before sales open.

The reminder is not age or identity verification. There are no child-profile fields, customer accounts, tracking SDKs, card inputs, payment callbacks, purchase rewards, shopping popups or order queues. The store never reads child profiles. There is no cart, customer database or automatic inventory service.

Hosted checkout is intentionally **not implemented or enabled**. Adding it requires separate approval of an adult-owned provider account, current official provider documentation, exact product/variant/price/currency/fulfillment mapping and successful non-chargeable tests. Never put secrets or client-authoritative payment amounts into this application.

## Offline and freshness

The service worker keeps the existing offline games but treats `/store-catalog.json` as network-only. The JSON response uses `Cache-Control: no-store`; it is not in the offline precache. Product images use content-addressed URLs. No customer or checkout responses are cached. Catalog information retained in page memory is clearly marked unavailable or stale when it cannot be refreshed. Prepared links expire after 60 seconds and disappear on selection, language, connectivity or catalog changes. Reconnection refreshes the catalog; it never replays requests.

To pause new requests, change `salesEnabled` to false through the reviewed release process. An already-open page is not a live inventory connection: it rechecks on preparation/focus/reconnection, and prepared links are short-lived. The adult seller must still confirm every request. Pausing the catalog does not cancel messages someone already sent.

## Validation and release

Use the pinned dependencies and the existing commands:

```sh
cd web
npm ci
npm test
npm run build
node scripts/validate-store-output.mjs
npx playwright install --with-deps chromium webkit
npx playwright test --config playwright.store.config.ts
npx playwright test --config playwright.config.ts golden-adventure.e2e.ts whole-site-playtest.e2e.ts
```

The store matrix has desktop Chromium, mobile Chromium and iPhone-sized WebKit in English/es-MX. Mocked synthetic catalog tests block service workers; a separate test explicitly enables the actual worker and exercises offline routing. The existing game tests remain separate and unchanged. The output check inspects built artifacts and source maps for test-data leakage, excludes source/draft assets and checks the lazy store bundle budget.

Run the existing Python checks and root Cloudflare build/dry-run as well. Inspect actual store and game screenshots and test logs. Distinguish self-review from independent review. Do not describe unexecuted environments or skipped tests as passed.

Only merge under the existing review rules. Production uses the existing Cloudflare Worker static-assets deployment from `main`; the authoritative SPA fallback remains in `wrangler.jsonc`. Do not add a duplicate catch-all redirect or clear users’ local saves. Verify the production `/release.json` revision, direct `/store` route, assets and configured adult order flow after deployment. A built branch is not a deployed store, and an empty closed catalog is not ready to accept orders.
