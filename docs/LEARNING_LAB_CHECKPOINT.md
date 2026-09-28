# Learning Lab qualification checkpoint

Baseline: main `2edf1458813442756253c8b81369fa8a3b23ccb8`, clean initial checkout.
Branch: `feat/learning-lab-robot-rescue`. Baseline schema v4; supported Node >=22.12;
local test runtime Node 24.19.0; CI pins 22.12.0. No AGENTS.md found in repository.
Main remained at the baseline at the last remote check. Existing production deploys
from main through Cloudflare Workers Builds; this candidate does not enable production.

## Executed local evidence

- Baseline: 436 tests / 73 files passed. Isolated baseline build passed all release,
  type and unchanged size gates. Main JS gzip 122,466 B; main CSS gzip 29,209 B.
- Candidate: 450 tests / 78 files passed. TypeScript app and e2e checks passed.
- Preview build passed before final documentation; final candidate build is recorded
  by the commit/CI status. First measured preview main JS gzip 131,220 B (+8,754 B),
  main CSS unchanged. Content normalization is currently eager; UI/CSS is lazy.
- Browser test collection: 12 tests, desktop Chromium and automated iPhone WebKit,
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
   synthetic profile fixture → test discovery now collects all 12 cases.

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
