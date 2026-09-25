# Toy store checkpoint — 2026-09-25

Scope: `BoneManTGRM/Nicos-Adventures`, branch `feat/nicos-toy-store`, route `/store`. Never change the separate `BoneManTGRM/NICO` project. Continue this branch rather than starting another store.

## Baseline and evidence

- Starting main: `ba0cab4a00664426848c34747f7377e59492f56a`; no open PRs at recovery.
- Test-first commit: `6a76ab6fe20757df979e294aa7a830a2a69978c6`.
- CI run `36149239002`, job `108118028752`: all 300 existing unit tests and complete build passed. Six store browser tests failed on the missing heading: expected the store, received World Map. This is the recorded feature RED, not a baseline app failure.
- Review-source infrastructure commit: `9adfb589591ac6982b08b47ef0bfd996d67002b2`.
- Local domain tests: 14 failing assertions before implementation; 48 passed after. Compiler tests: 10 failed before implementation; 11 passed after. Synthetic fixtures are not live products.
- Local implementation check: all 359 unit tests passed and the complete build passed. Main JS 128246 bytes gzip versus baseline 128096; main CSS 29075 versus 28996. Existing budgets were not raised.
- The local container has a managed Chromium that returned `ERR_BLOCKED_BY_ADMINISTRATOR` on loopback navigation. No local UI/screenshot success is claimed, and that policy was not altered. The temporary local browser configuration is not part of the change. The established repository CI browser workflow is the release-verification path.

## Implemented scope

Independent lazy store route before the child-profile provider; restrained Store/Tienda navigation; English/es-MX copy; empty closed catalog; typed allowlist publication compiler and metadata-checked, content-addressed approved images; adult-approved email/WhatsApp enquiry preparation; fresh-catalog check and expiry; no automatic sending/payments; accessible fallback text; sold-out/incomplete/error/offline handling; network-only catalog; no child state, tracking, customer database, public admin panel or checkout integration. See `docs/TOY_STORE.md` for operation and mobile-friendly intake.

## Genuine boundaries and remaining gates

The attempt to create a draft PR was blocked by the tool safety check: “This tool call was blocked by OpenAI because we couldn't determine the safety status of the request.” No PR was created. Do not bypass the block by writing to main, another tool, or a workflow-created PR. Independent branch implementation and verification are permitted. Merge/deployment are not complete.

Implementation browser verification, rendered screenshot inspection and existing game browser regression results must be recorded from their actual CI run before merge readiness is claimed. An independent review has not yet occurred. Do not call self-review independent review. Production acceptance has not occurred.

No approved real product photos/listings, prices/currency, public adult contact, sales territory, fulfillment arrangements, product-specific rights/safety review or seller policies have been supplied. Keep `web/store/catalog.json` empty and `salesEnabled: false`. These block sales, not engineering verification of the closed store. Do not fabricate listings, take payments, infer a contact address from connected data, or upload original/private photos to this public repository.

## Continue

Run the unchanged unit/build checks and `validate-store-output.mjs`; run the dedicated six-project store browser matrix and the existing Golden Adventure/whole-site browser suites. Inspect all failures and actual screenshots, repair regressions without weakening acceptance, and update this checkpoint with exact results and commit IDs. Finish independent review and the normal authorized PR/release process only when unblocked. Verify the deployed revision at `/release.json` before saying deployed. Keep implemented/tested/merged/deployed/orders-enabled separate in the handoff.
