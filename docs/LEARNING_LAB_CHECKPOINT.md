# Learning Lab qualification checkpoint

Baseline: main `2edf1458813442756253c8b81369fa8a3b23ccb8`, clean initial checkout.
Branch: `feat/learning-lab-robot-rescue`. Baseline schema v4; supported Node >=22.12;
local test runtime Node 24.19.0; CI pins 22.12.0. No AGENTS.md found in repository.
Main remained at the baseline at the last remote check. Existing production deploys
from main through Cloudflare Workers Builds; this candidate does not enable production.

## Executed local evidence

- Baseline: 436 tests / 73 files passed. Isolated baseline build passed all release,
  type and unchanged size gates. Main JS gzip 122,466 B; main CSS gzip 29,209 B.
- Candidate: 451 tests / 78 files passed. TypeScript app and e2e checks passed.
- Preview build passed before final documentation; final candidate build is recorded
  by the commit/CI status. Measured preview main JS gzip 131,204 B (+8,738 B),
  main CSS unchanged. Content normalization is currently eager; UI/CSS is lazy.
- Browser test collection: 16 tests, desktop Chromium and automated iPhone WebKit,
  both languages. Collection is not an execution pass.
- Local Chromium install failed: downloaded browser archive was invalid/truncated.
  The cloud browser rejected the workspace localhost URL with ERR_BLOCKED_BY_CLIENT.
  No browser layout, network, offline or audible-success claim is based on these attempts.
- No paid service, provider key, account, hosting setting or production deployment
  was activated. Existing hosting/account costs were not inspected.

## Repair ledger

1. Missing slice → add engine and authored items → missing-module red → focused green.
2. Replaying help erased historical independent success after normalization → normalize
   historical flag consistently → explicit replay+reload test failed before and passed after.
3. Speech error left a valid queue token → invalidate/clear on error, guard utterance
   identity, watchdog → code review and ownership tests; browser fault injection pending.
4. Legacy direct speech bypassed owner → migrate to shared local hook → type/build and
   regression suite green; live cross-surface audio test pending.
5. Raw symbols → deterministic reviewed words → exact bilingual symbol tests pass.
6. New catalog destination broke old count assertion → count now 17 with explicit new
   ID assertion. This reflects an authorized added destination, not removed coverage.
7. Old-profile fixture expected unnormalized robot fields → preserve original fields
   with partial structural comparison (baseline normalization adds upgrades/optional keys).
8. Browser test imported JSON-bearing storage through Node → use browser-created
   synthetic profile fixture → test discovery collected all initial 12 cases; four delayed/stalled speech cases were then added.

9. Word hyphens sounded like subtraction → convert ASCII minus only between numbers →
   explicit four-step/arithmetic red-to-green regression.

Published draft PR: https://github.com/BoneManTGRM/Nicos-Adventures/pull/150.
Initial published commit: dece07ec898f5d80e0be0fd3ec48c8b47180b13f (tree identical
to local 1fd1122). Git transport push lacked credentials; authorized GitHub connector
published the same verified tree. CI run 36363290667 installed both browsers and
passed unit tests; browser execution was in progress at this checkpoint. Core CI, Toy Store and Cutout
Artwork workflows passed on the initial commit. Existing Cloudflare nicos-world
build was in progress; the legacy nicos-adventures service reported failure.
Cloudflare dashboard access remains blocked by its human-verification screen after
one reload; no challenge was bypassed and no hosting settings were changed.

## Acceptance matrix

| Gate | Status | Evidence / remaining gate |
| --- | --- | --- |
| A1 Integration | BLOCKED | Integrated nav and lazy route build; rendered browser verification pending. |
| A2 Lessons | BLOCKED | 48 literal answer checks pass; all content authored; complete rendered interaction run pending. |
| A3 Learning records | PASS | Assisted checks, historical independent results, transfer and idempotent rewards unit tested. |
| A4 Voice safety | BLOCKED | Local-only selection, shared ownership and fallback code/tests; hook/browser failure injection pending. |
| A5 Actual voice quality | NOT TESTED | Physical iPhone owner listening required in both languages. |
| A6 Data integrity | BLOCKED | Unit import/reset/quota/profile/stale/reward checks pass; browser and simultaneous-tab conflicts outstanding. |
| A7 Offline | NOT TESTED | Existing cache strategy retained; authored browser test not yet executed. |
| A8 Privacy/cost | BLOCKED | No new service/dependency/permission or paid activation; differential network and device offline tests pending. |
| A9 Accessibility | BLOCKED | Semantic controls, focus, 44px targets, responsive styles implemented; browser/physical checks pending. |
| A10 Engineering | BLOCKED | Local unit/type/preview build pass; CI and browser execution pending. |
| A11 Regressions | BLOCKED | All existing unit tests pass; rendered game/pet/profile/backup comparison pending. |
| A12 Release | BLOCKED | Default-off candidate; no merge, hosted preview, production activation, or deployed verification yet. |

## Next concrete work

Publish draft PR, inspect its exact candidate CI and existing preview checks. Execute
browser tests in CI if browser installation succeeds. Resolve findings before owner
listening. Hosted preview must explicitly set VITE_LEARNING_LAB_PREVIEW=true without
changing main/production. No physical iPhone is connected to this execution. Do not
ask the owner to approve production until there is a working phone preview and all
other release gates have evidence. Keep UI disabled and preserve additive data reader.

## Deployment incident and protective guard — 2026-09-28 UTC

Cloudflare deployed draft branch commit dece07ec898f5d80e0be0fd3ec48c8b47180b13f to nicos-world.com despite the documented main-only process. The Learning Lab flag remained off, but shared code changed. Dashboard access is blocked by a recurring human-verification challenge. No merge or activation was authorized or performed.

A repository prebuild guard now rejects Workers Builds unless WORKERS_CI_BRANCH is exactly main, including missing branch metadata. It uses the documented WORKERS_CI variables (https://developers.cloudflare.com/changelog/post/2025-06-10-default-env-vars/). Seven command-level tests failed before implementation and pass afterward. The actual npm build command with synthetic Workers feature-branch metadata exits 1 during prebuild, before assets are built. This is defense in depth, not proof of dashboard configuration, restoration, or preview isolation. Local/GitHub validation is allowed. Known-good rollback revision remains 2edf1458813442756253c8b81369fa8a3b23ccb8.

The guard must be observed stopping an actual Cloudflare branch build before further candidate publishing. Existing running builds are not canceled by this source change. Cloudflare account access is still needed to inspect triggers and restore a known-good deployment safely. Physical iPhone voice quality remains NOT TESTED.
