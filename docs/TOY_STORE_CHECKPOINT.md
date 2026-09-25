# Toy store checkpoint — 2026-09-25

Scope: `BoneManTGRM/Nicos-Adventures`, branch `feat/nicos-toy-store`, route `/store`.
Continue PR **#134**: https://github.com/BoneManTGRM/Nicos-Adventures/pull/134.
Never change the separate `BoneManTGRM/NICO` assessment project.

## Implemented, not open for real orders

Separate lazy bilingual storefront before the child-profile provider; Store/Tienda navigation;
validated, allowlisted public catalog and metadata-checked content-addressed photos;
adult-approved email/WhatsApp enquiries; fresh catalog and expiry checks;
no automatic sending, payments, child-profile data, tracking, customer database or public admin panel.
See `docs/TOY_STORE.md` for the phone-friendly product-update workflow.
The real catalog remains empty, `salesEnabled: false`, `seller: null`.

## Verified history

- Original main: `ba0cab4a00664426848c34747f7377e59492f56a`.
- RED commit `6a76ab6fe20757df979e294aa7a830a2a69978c6`, run `36149239002`:
  all 300 baseline unit tests and build passed; six browser tests failed because
  `/store` still rendered World Map. This was an expected missing-feature failure.
- Implementation `29132725a3364a52ca4c216c3e30b0739eae6623`, run `36152961435`:
  359 unit tests/build passed; store 36 passed / 30 failed; existing selected game
  browser suites 26 passed / 6 intentional pre-existing configuration skips;
  Python and root Cloudflare build/packaging checks passed.
- Corrective commit `a14f6ba75f92ee15cfdb7dc36bea21ab56310898`:
  explicit select text label; correct native option and textarea assertions;
  manually injected unavailable-variant rejection; accurate network-failure wording;
  percent-encoded email recipient and strict local/domain validation.
  Recipient regression observed 4 failing assertions before correction, all 7 pass after.
  Full local unit suite 366 passes and build passes, without relaxed budgets.
- Run `36156693247`, immediate artifact `10874640502`, confirms **64 store
  browser passes, 2 failures, 0 skips, 0 retries** on a14f. Only the iPhone WebKit
  service-worker navigation tests fail with `WebKit encountered an internal error`.
  All bilingual request journeys, in-page offline disabling, failed-photo behavior,
  unpublished/sold-out states, exact routing and child-data isolation checks pass.
- Actual a14f mobile/desktop screenshots were opened and reviewed for the closed
  catalog, synthetic enquiry, and unchanged world header. No overlapping controls
  or horizontal overflow was observed in those captures. Synthetic products are
  explicitly marked and exist only in tests, never in the production catalog.

## Browser-harness correction under qualification

Upstream https://github.com/microsoft/playwright/issues/42775 reports WebKit
`setOffline(true)` rejecting even literal service-worker navigation responses.
The observed a14f failure is consistent with that report; no precise internal
browser cause is claimed. Do not change pinned dependencies or suppress errors.

The revised test serves the actual build on a test-owned ephemeral origin, waits
for the actual worker and shell cache, stops that origin and verifies a clean
no-worker context fails. The controlled page must then return HTTP 200 from the
actual service worker, render the store, reject catalog fetches and order actions,
and return to the cached game. This is a **real origin-outage control**, not a claim
that it proves physical iPhone airplane-mode behavior. The six-project in-page
offline/reconnect transaction tests remain unchanged and required.
The harness serving/shutdown check passes locally; the full local unit suite is
now **367 passes**. Remote run **36158808882**, artifact **10874723524**, checked
head `d2a5a9c3fcf28a60fec1b5fb40315f644d03f72b` via GitHub's PR merge candidate
`690187e6ae7036c1253f53fa649d101453e27eb6`: **66 browser passes, 0 failures,
0 skips, 0 retries**. The actual iPhone Spanish outage screenshot was reviewed;
its shell remains available while catalog retrieval and ordering fail closed.

The final verification addition runs only on main pushes: it compares the exact
live release commit, worker bytes, compiled catalog and lazy store script/style
with the checked-out build, then checks the real production site in six
browser-language combinations. It never submits an order, charge or message.
That production check has not run yet; its result is required for deployment
acceptance. All ordinary pre-merge checks remain enabled.

## Review and production boundaries

The first PR-creation action was blocked. A normal same-tool retry after the
continuation succeeded: PR #134 is open and draft. That blocker is cleared;
there was no direct main push or alternative PR-creation bypass.

A live public fetch at 2026-09-25 approximately 15:55 UTC found `/store` showing
the closed empty shop and `/release.json` advertising **29132725...**, while
GitHub main remained **ba0cab4a...**. The deployment mechanism behind this mismatch
is not established. Do not infer that the corrected branch is deployed or that
main is the only production source. Verify final live revision and artifacts.

Review so far is **self-review**, not independent review. No separate reviewer
has been engaged. Existing PR workflows must reach terminal success before the
normal merge/release path; no approval, security check or required test may be bypassed.
Local managed Chromium denied loopback navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`;
that policy was not changed. Browser evidence comes from normal GitHub Actions.
Local Python collection lacks Streamlit; remote CI Python results are authoritative.

## Remaining owner information

Real product photos/listings, price and currency, options/dimensions/material/care,
preparation and fulfillment, adult-approved public business contact, sales territory,
product-specific commercial rights and safety review, and seller/privacy/return terms
are still absent. Never infer them from private connected accounts. These block
opening sales, not testing or releasing the explicitly closed store.

## Next verification

Read the current branch/PR before editing. Run the unchanged unit/build/output checks,
the full store browser matrix and existing game workflows. Inspect fresh screenshots.
Record exact head, run results, self/independent-review status and deployed revision.
Keep implemented / tested / merged / deployed / orders-enabled separate in the handoff.
