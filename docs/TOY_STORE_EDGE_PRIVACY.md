# Production privacy correction — 2026-09-25

This is the bounded production closeout for the store delivered by PR #134. It does not restart the storefront, introduce a provider, change game content, enable sales, or change the separate NICO repository.

## Evidence and remaining acceptance

PR #134 merged as `61f590bdf6f9bb253d80e84e10766ba203253ba1`. All nine PR workflows passed, the merged revision passed 66 store browser cases, and Cloudflare deployed the exact revision. The first live verification timed out before deployment; its historical receipt remains in PR #134.

The second production attempt, job `108161435171` in run `36161091939`, verified the exact live commit, worker, catalog and store chunks, then all six real-site browser/language checks failed because the response included a request to `https://static.cloudflareinsights.com/beacon.min.js/...`. Production artifact `10876426865`, SHA-256 `f62a7ff5846fb56c7b2ded1b6b306574309307a90f7090c3d42e5293f3214af1`, preserves those results and screenshots. Do not relabel these as privacy passes.

## Bounded correction

Add `Cache-Control: public, max-age=0, must-revalidate, no-transform` to the canonical `/`, `/index.html`, `/store` and `/store/` HTML response rules. Cloudflare documents that `public, no-transform` prevents automatic Web Analytics beacon injection:

- https://developers.cloudflare.com/web-analytics/get-started/
- https://developers.cloudflare.com/workers/static-assets/headers/

Both the store entrypoints and the shared offline shell need protection. Restrict navigation-cache replacement to same-origin canonical HTML entries so an arbitrary SPA fallback cannot overwrite the protected shell with transformed content. Advance the service-worker cache from v24 to v25 to replace previously cached HTML without modifying local profiles or saves. Preserve the existing immutable asset and no-store catalog policies.

Keep the existing zero-external-request browser assertions; do not whitelist the injected analytics script. Strengthen the live probe to check actual no-transform response headers as well. Extend only the deployment-arrival polling window from eight to fifteen minutes: the observed main deployment completed more than ten minutes after merge. The exact revision, artifact hashes, catalog, privacy and all six browser/language checks remain mandatory, and the existing twenty-minute job timeout still bounds execution.

## Test-first record

`npm test -- --run src/store/edgePrivacy.test.ts` first produced **8 failed / 6 passed** against the deployed source: four absent HTML policies, three unsafe navigation-cache replacements and one non-HTML cache replacement. After the correction, the identical command produced **14 passed**. The tests execute the actual service-worker fetch handler and inspect its cache writes at the network/cache boundary.

The complete local unit suite then passed **381 tests in 67 files**. A separately executed complete build and `validate-store-output.mjs` passed. Main JavaScript remains 128244 bytes gzip, main CSS 29075 bytes, store JavaScript 8411 bytes and store CSS 1917 bytes; no budgets were raised. A combined test/build shell exceeded the local tool duration limit during Vite rendering; the build was rerun to successful completion instead of treating the interrupted invocation as passed.

## Continuation gate

Submit this focused correction through the normal PR process, run the unchanged browser/game checks and inspect their evidence, merge only under the existing rules, then verify the new main revision on the actual domain. This document records local verification, not a claim that the correction is already deployed or production-verified. The corrective PR's final receipt is the authoritative lifecycle update.

The actual catalog is still empty, seller null and sales disabled. Product photos and factual listings, adult public contact, fulfillment territory/terms, commercial rights and product-specific safety/market review remain owner-input gates. No real message, order, charge or checkout integration is enabled. Review remains implementation self-review unless a genuinely independent review is recorded.
