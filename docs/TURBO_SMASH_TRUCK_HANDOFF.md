# Turbo Smash Truck mission handoff

Status: stage 1 minimal slice implementation in progress; NOT release-ready.
Mission PR #159: https://github.com/BoneManTGRM/Nicos-Adventures/pull/159. First fixes candidate 81ce062ef98e78c7f9adbf54f1b1512c8fa2d20e; Actions CI run 37151789789 (Python/web/root build) passed, Creative Games run 37151789814 still pending at slice preparation. Fetch exact current-head results before reusing evidence. Full frozen owner brief remains in force.
Repository: BoneManTGRM/Nicos-Adventures only. No NICO/SARA edits, purchases, paid assets, new services, dependency upgrades or production writes.

## Identities and preserved state
- Baseline main: aadc44cae98722894907f50caee3ee315fae1432; tree 608e62340258a8cd33d736dc3c98ce24904fb91c.
- Existing draft PR #157: feat/truck-sky-obstacles at 528502b4fce8d5739e200fbaa4d976b396a37ffc. Left untouched.
- Isolated branch: mission/turbo-smash-truck. Reuses all 15 files from #157 with current main; no second engine. Integration/regression commit: 56d03f9534bcfebcc0bced1720f2ed4581359af1.
- Public entry: https://nicos-world.com/?play=monster-garage; the current FullApp only auto-selects Arcade for number-dash. A fresh World Map previously needed an Arcade visit. The slice candidate now selects Arcade once for the existing monster-garage deep link and removes it when navigating away; fresh-route/start/pause/exit/save browser regression added, pending proof.
- Canonical chain: web/src/main.tsx → AppShell → FullApp → world/Arcade → creativeGames/MonsterGarage → TruckDriveStage.
- Production: Cloudflare nicos-world static Worker, main via existing Workers Builds; wrangler.jsonc SPA fallback. No hosting infrastructure removed.
- Last observed historical successful baseline build: dc044d49-f0f6-4d7a-8f66-b418b3dec20c, version 60ec9506-8b08-40f5-a312-07ee73e6cfe6. Historical logs observed exact public aadc44c on Sept 30. This is NOT an Oct 3 fresh-domain verification.

## Baseline evidence and findings
- docs/evidence/turbo-smash-baseline.json: 12 current-main model ramp cases pass, with unchanged course, starter engine, wheel IDs 11/12, routes 0/1/2, starts x=90/1350, held gas, fixed 120 Hz, live grounded landing x>1990, |angle|<0.7 within 25 s. Some cosmetic parts detach. No original ramp power failure reproduced on this baseline.
- Execution used functions V8 and explicitly erased TypeScript annotations from fetched production physics/turbo source. Arithmetic unchanged; JSON clone injected. This is a model probe, NOT tsc/npm/browser/device proof.
- Existing Vitest/browser ramp regressions remain enabled. Historical actual public checks (job 109684710902, run 36650952015) passed ramp two/rewards in Chromium en/es-MX and WebKit es-MX. English WebKit failed later on unicorn movement (pre-existing issue #156); no truck-wide pass inferred.
- Other old failures: baseline production-verification job 109684711219 failed on detached locator in verify-playable-production.mjs:36. Separate obsolete nicos-adventures Worker check failed. These are not introduced regressions; no infrastructure changes made.
- Prior #157 creative-games run 36603828050 job 109527651106: 176 passed, tested PR merge ref 16f8fca1129faa35a50852c89156d844ded26e1f. Artifact 11050694599, SHA256 d48a14a4761666c519d60e02608511fdfc7033f5165024fcf1350820654124a4. Logs read; ZIP/screenshots NOT inspected in this session, and prior evidence does not qualify new behavior.
- Mission-blocking fairness gap minimized: #157 tickSkyObjects starts warning at distance=350, t=19.99. Gate regression preserved before repair in 56d03f9. Fix adds t>=20 AND the existing distance/legacy grace checks. docs/evidence/turbo-smash-initial-checks.json records 9 gate cases and fresh model ramps/dodges after fix.
- Input defect: HoldButton onPointerDown focuses Turbo, Gas onBlur unconditionally releases its captured pointer. Fix retains each button's active pointer IDs across focus, clears keyboard hold on blur, and clears pointers on up/cancel/lost capture/disabled. Actual captured-pointer focus/cancel browser regression added; it still needs CI verification and full multitouch qualification.

## Save and architecture boundary
Current schema remains v4 and local key nicos-world-local-save-v4. Read-only old v1/v2/v3 keys remain. Preserve profile/owned parts/blueprints/bolts/best/goals, language/settings and kingdom fields. All browser fixtures use disposable contexts; no real user storage read or erased.
normalizeDrive/normalizeGames bound persisted run state; finishDrive uses sequence/paidThrough for one settlement. Current onCheckpoint saves the in-progress run rather than a spatial recovery checkpoint. New smash rewards must enter this ledger, not a second wallet. Existing turbo is bounded/rechargeable.
Current sky system is ONE vertical object with three skins, 1.6 s warning, committed target, 8 s cooldown and 100–160 m interval. It is NOT four distinct patterns, reachable-escape validation, or seeded varied runs.

## Changes and iteration record
Reused #157: carPhysics/save/TruckDriveStage, SkyAlert/skyObjects/skyArt/sky CSS, sky tests/e2e, browser config and production verifier/workflow, original sky specification. Added skyIntroduction.test.ts, creative-games-truck-input.e2e.ts, evidence and this handoff. Scoped edits: skyObjects gate, controls pointer ownership, elapsed DOM observation, updated active-time fixture/natural-warning assertion.
Method 1: old ramp issue tested; current minimal failure is sky time gate. One original procedural crate now has swept blocking contact, momentum break, six decorative fragments, visible +3 reward, and persisted cleared ID/reward through the existing run ledger. Unit tests, fresh deep-link coverage and a real-route browser journey were added; the slice has NOT yet passed/been visually inspected.
Method 2: frozen numerical conditions in JSON, explicit source revisions; no course flattening/assertion lowering. No 50-seed qualification claimed.
Method 3: second-pass SELF-review, not independent review: source inspection found simultaneous-pointer/focus release and truck deep-link entry gap; classified as blockers, with reproduction above. Cosmetic starter part loss needs landing/health critique. Hazard reachability/trap proof absent.
Method 4: changed order to inspect quota/tool boundaries and existing PR/production failures before rendering work; minimized time gate then pointer ownership before content expansion. This avoided duplicating unreleased sky code. State-order browser tests already cover warning→pause→reload→impact, but new complete checkpoint/health overlaps remain untested.

## Verification commands and exact next action
Use Node 22.12.0, committed dependencies:
```sh
cd web
npm ci --no-audit --no-fund
npm test
npm run build
npx playwright install --with-deps chromium webkit
npx playwright test --config playwright.creative-games.config.ts
```
PR's existing CI includes Python lint/tests/compile, full web tests/build, root build/Wrangler dry-run and the Chromium/WebKit matrix. Inspect exact branch-head checks, logs and artifacts; do not assume green. Current candidate results belong on the mission PR. No protections bypassed or merge attempted.

Next: read this handoff and branch/PR state; fetch current candidate CI and resolve any failure. The new creative-games-smash-slice.e2e.ts emits bounded JPEG screenshots as TRUCK_VISUAL JSON log records for Chromium mobile English and WebKit iPhone English. Fetch completed GitHub job logs, parse these records in functions.exec, and return image({type:'image',data:record.image,mimeType:'image/jpeg'}) to inspect actual rendered output without a paid browser service. Then finish/inspect the real minimal slice on the canonical route BEFORE expansion. Reuse still-valid baseline evidence. Continue all frozen features and acceptance; do not treat these two fixes as the completed mission.

## Outstanding acceptance
A1 canonical deep-link selection repaired in slice candidate; fresh route/start/pause/exit/save regression pending. Retry/unrelated navigation need complete qualification.
A2 current-main model 12/12; old browser evidence; fresh candidate and usable spatial checkpoint pending.
A3 one crate integration slice implemented, with swept contact and one persisted +3 award; browser proof and remaining five types pending.
A4 time gate repaired in candidate; four distinct trajectories, fair escape/rejection and production variety seed: pending.
A5 three escalating sections: pending.
A6 health/shield/repair/near-miss/combo/stunt/spatial recovery checkpoints: pending; preserve current turbo and run payout.
A7 compatibility/storage-failure coverage exists; full new-reward resume/retry overlaps pending.
A8 focus/cancel regression added; genuine simultaneous touch, resize/background and listener/resource qualification pending.
A9 bilingual/mute/reduced-motion/audio completion pending.
A10 three real rendered memorable moments and screenshot inspection pending.
A11 10-minute chaos/reset/navigation stress + 50 reproducible seeded input runs, measured frame/object counts pending.
A12 merge/deploy/exact public release, fresh and normal cached return preserving saves pending.
Physical iPhone and child/owner fun acceptance unverified. Desktop WebKit/phone emulation cannot replace it.

## Demonstrated external boundary
Tool inventory exposes GitHub file/Git APIs and logs, but no local shell, filesystem reader, image viewer, Playwright runner, or game skill catalog. The available Firecrawl browser service's current allowance returned remainingCredits=-1000, planCredits=1000, period Sept 16–Oct 16. No Firecrawl/TinyFish browser calls, top-ups, or billable alternatives made. Existing GitHub Actions Chromium/WebKit runs execute the browser tests within this public repository. TinyFish explicitly describes metered wallet usage and was not used. GitHub public-repository existing checks can run headlessly; screenshot ZIP references cannot be extracted with the current tools. A bounded screenshot-in-job-logs alternative is implemented for the slice, but still needs a successful run and actual image inspection. This may resolve the browser-artifact boundary; do not prematurely declare it unavoidable. Do not claim live play, fresh screenshots, performance, deployment, or iPhone proof.

Slice asset provenance: smashObjects.ts/smashArt.ts use original procedural canvas art written for this repository. No downloaded/paid/generative assets or license credits required. Smash fragments are fixed six per frame for at most one simulation second, and never own collision/damage state.

## Timing prerequisite and CI history
First fixes head 81ce062ef98e78c7f9adbf54f1b1512c8fa2d20e: CI passed; Creative Games run 37151789814: 181 passed, one failed, two flaky, with natural warning expected falling/received warning. Exact-threshold arithmetic reproduced age 1.5999999999999968 after 192 steps; docs/evidence/turbo-smash-warning-threshold.json preserves it. Regression commit 1b0fee68763cdc7a175f64b6fb99e4e7a51c3b3d. Repair head 0e54a83c6e2500d2ae78c0ad198d54e924296b3e publishes phase transitions immediately and compares the 1.6-second threshold with 1e-9-second tolerance. Original timing/collision assertions intact. CI run 37152960725 passed; browser results still pending when this slice is prepared. Do not count this as a passing matrix. Original slice model ramp evidence must be rerun if gameplay arithmetic changes; HUD/tiny comparison correction does not change early ramps but the new complete slice still needs exact-candidate CI.
A pre-existing flaky WebKit fixture read a null local store before initial write; the slice's truck-upgrade enter helper now waits for that actual save boundary. Ownership/payout/load assertions are intact; no good save is deleted or overwritten by a workaround.

Timing repair Chromium shards 111290482814 and 111290482981 passed, including unchanged natural-warning assertions. WebKit/complete matrix remained pending when integrating the slice; the slice changes physics/save/navigation and must run fresh full checks. No merged/deployed mission revision exists. Parse screenshot log records only from the exact slice candidate; no rendered screenshots have yet been inspected.
