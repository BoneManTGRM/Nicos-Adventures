# Story Castle image-readiness correction — 2026-09-25

Scope: `BoneManTGRM/Nicos-Adventures` only. This is test maintenance after the
closed-store release in PRs #134/#135, not new game or sales functionality.
Base: `6225ecdbe13885a995b7d2c7693628f56d8f31af`.

## Defect and correction

The retained production trace and unchanged retry are documented at
https://github.com/BoneManTGRM/Nicos-Adventures/pull/135#issuecomment-5836598933 .
The Story Castle check sampled `img.complete && img.naturalWidth > 0` before
its successfully delivered image finished loading. Visibility alone is not
image readiness. Use bounded `expect.poll` for that exact predicate, retaining
visibility and all subsequent story, narration, persistence and layout checks.
No suite timeout, retry count, browser matrix or performance budget is raised.

The new test-only helper is exercised using actual browser image elements and
intercepted image responses: delayed valid PNG, missing 404, corrupt 200, and
stalled response. These isolated fixtures never contact an external server and
are not product or game assets. The existing dedicated creative workflow runs
the four cases on desktop Chromium, mobile Chromium and iPhone-sized WebKit;
its existing 24 creative cases remain enabled, for 36 cases in total.

## Recorded local checks

- Extracted immediate predicate: **1 expected failure / 3 passes**. The delayed
  response fails with `Expected: true; Received: false` at the readiness check.
- Polling correction: **4 passes** with the identical focused command.
- Mutation removing positive natural width: **2 expected failures / 2 passes**;
  the missing and corrupt image cases detect false acceptance. Mutation restored.
- Restored correction: **4 passes**; three repeats: **12 passes**, no retries.
- Complete unit suite: **381 passes in 67 files**. Build/type/release checks,
  public-store output validation and creative/performance budgets passed.
- Catalog remains empty, seller unset, sales disabled. No runtime source,
  artwork, dependency, workflow, public contact or payment configuration changed.

Local browser checks used installed Chromium 144.0.7559.96 with Playwright
1.62.1, isolated `setContent` fixtures, no local-server navigation, and no video
capture. Pinned browser downloads were unavailable locally (DNS failure).
This is not pinned Chromium/WebKit CI evidence or physical-iPhone testing.
The local-only configuration and logs are not application files. The build
retains its existing large-chunk warning; performance budgets were not changed.

## Release gate

Require exact-head CI and preserved pinned-browser results before normal merge,
then the exact-main production verification. Record implementation self-review
separately from any genuinely independent review. The PR's final receipt must
identify merge, deployment and production outcomes; this local record does not
claim them. The separate failing Cloudflare `nicos-adventures` target and the
missing approved real-product/seller launch inputs remain separate boundaries.

Official assertion guidance: https://playwright.dev/docs/test-assertions#expectpoll
