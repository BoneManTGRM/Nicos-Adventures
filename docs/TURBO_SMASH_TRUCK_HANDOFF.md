# Turbo Smash Truck handoff

**DEPLOYED — IPHONE PLAY ACCEPTANCE PENDING.** All scoped technical acceptance has evidence; actual iPhone and child-fun acceptance remain unverified. No extra spending. Only BoneManTGRM/Nicos-Adventures.

## Release identity / exact next action

Game: https://nicos-world.com/?play=monster-garage. [Merged PR159](https://github.com/BoneManTGRM/Nicos-Adventures/pull/159). Baseline main/public `aadc44cae98722894907f50caee3ee315fae1432`; exact qualified head `a4d928988164e34cb38bcc127d18e214ddeb4a0d`, tested pull merge `3c221b09701ae68e94e2d77f4e5b150c34cefba3`. **Merged/live main `d9a5878124628326140a3ee201cca7f39e273669`**, tree `fa1431274f9482a0dfb1b7f2f763ae055f747d51`, matches the candidate tree. Normal merge at2026-10-04T02:34:49Z, exact expected head, no bypass/admin/force flags. Main still D9 when audited.

Canonical Cloudflare Workers Builds **nicos-world**: build `6c7891a8-cab5-4643-8e40-cfe3d956d687`, version `a430e0a4-1aa6-4c38-8613-ba2ff40d5576`, successful check111345533573. Actual public release.json: app3.2.0/schema4/D9, built2026-10-04T02:36:57.639Z, buildHash `sha256:75d2405cd21bcb5a294f0e877fe6a78ed24e01b4a6c523f5c555e55aa95dbabc`. Full hashes in [final release evidence](evidence/turbo-smash-a4d9289-release.json).

Product source has not changed since `9f7edb1c89f1591e342862eb5ce01b2b3c453a59`; subsequent candidate changes were workflow/evidence/docs/read-only production verification. This **post-release audit commit on mission/turbo-smash-truck is docs/evidence only**, not a new deployment. Captures in main remain valid; latest handoff/evidence live on the task branch. Read this document and current refs before any continuation; do not overwrite another session.

**Next action:** owner phone-only play check below. No remaining scoped technical release step. If phone feedback exposes a defect, minimize it against D9, fix on a new isolated candidate, rerun affected proof and use the existing protected release workflow. No unattended work promised.

## Completed scope / preserved architecture

Existing React Canvas2D route FullApp→Arcade→MonsterGarage→TruckDriveStage, Cloudflare main assets web/dist. No engine/dependency/backend/currency replacement. PR157's relevant driving work reused; original PR untouched.

Three sections within the existing 1000m course: forgiving smash intro, sky dodge350–650m, combined gauntlet650–1000m. Early ramps retained, starter acceleration/traction/air recovery improved; later inter-ramp runway and flat escape stretches added. Gas, brake/reverse, one rechargeable boost plus existing useful midair/tools controls; source-owned simultaneous keys/pointers, up/cancel/lostcapture/blur/visibility cleanup.

Six original types: crate stacks, fences, inert barrels, tire stacks, robot scrap, ice walls. Light/medium/heavy momentum thresholds;18 swept blockers, collider removal/pay once,8 decorative noncolliding fragments. Legacy resumed positions clear newly inserted behind/overlapping blockers without payment.

Four seeded attacks: vertical junk, slower boulder, diagonal crystal, two separately warned cartoon bolts. Both300m and20active seconds required;1.6–2.4s visible locked paths/markers/action cues, .35s conservative reaction with unaided gas/brake escape; reject walls/slopes/mandatory landing traps and allow quiet stretches. One active, max32 primary attacks, separate cosmetic RNG.

Health100; once-only shield/repair/impact settlement; checkpoints90/1350/4290/7890 restore runway with3s visible protection and clear nearby hazards. Existing bolts and receipt ledger preserve paid distance/IDs over recovery/reload. Genuine threatening near-misses and clean stunts pay once; modest capped combos. All body/wheel/sky collisions settle before clean-stunt payment. No starter upgrade gate or grind.

Original coherent truck/suspension/rolling-wheel/scenery art; compact EN/es-MX HUD, warnings, summary/replay and safe-area controls. Original local brief WebAudio(max4/mute), no voices. Reduced motion suppresses shake/fragments while preserving warning shapes. **Asset provenance:** original source/procedural art and local tones, no paid/unlicensed assets or additional credit obligations.

Fixed120Hz ref simulation, local10Hz HUD, bounded history150/debris22/fragments8/blockers18/hazard1/audio4/wheel-art-cache24. Cache clears on exit. Opaque canvas/stable low-effects DPR1 fallback; pause resets frame clock. Scoped CSS hides already occluded page chrome only during the fixed truck playfield and restores on exit; art/clipping retained.

## Acceptance / exact candidate proof

[Final release JSON](evidence/turbo-smash-a4d9289-release.json) retains identities, jobs, all50 input scripts, current stress/counterfactual measurements, public/cache results, changed files and known unrelated failures. [Inspected rendered captures](evidence/turbo-smash-9f7edb1/) and [earlier source qualification](evidence/turbo-smash-9f7edb1-qualification.json) remain historical evidence.

- **A1:** Actual shared public link opens/starts/pauses/resumes/checkpoint-recovers/fresh-restarts/exits to Arcade. Production script exercises correct exit→root Arcade ordering, not an assumed fresh-home screen.
- **A2:** Starter normal/checkpoint ramps including ramp two and normal full course passed in all8 browser projects. Baseline12 early-ramp cases already passed; historical ramp-two power failure was not reproduced.
- **A3–A6:** Six types including max-boost swept collision/destruction/pay-once; four locked/fair warned attacks; all3 course sections; health/boost/shield/repair/near-miss/combo/checkpoints/retry/overlapping landing settlement passed.
- **A7–A9:** Schema4 and legacy save fixtures/owned parts/vehicles/blueprints/bolts/settings survive; denied/corrupt reads and quota errors preserve good save. Simultaneous touch/cancellation/resize/rotation/background-resume and60s suspended-frame regression pass. EN/es-MX, mute/reduced motion and warning shapes pass.
- **A10:**12 actual final-product captures inspected: stack smash/impact, diagonal warning/path/dodge, boost jump/14m clean landing and summary. Structured SELF-review, not independent review or proof of child enjoyment.
- **A11:** Two actual600s chaos/reset/navigation runs, no trace/video/retries or accelerated clock; no uncaught game errors/failed essential assets/listener accumulation. Bounded counts and measured fallback below.
- **A12:** Real-domain merged identity and both fresh and normal cached returning-client paths pass; isolated saves preserved without bypass query or site-data erasure.

Exact A4 head CI37170346727/job111341881709: **695/695 units (105 files), typecheck/build/budgets**. Creative37170346684/aggregate111344636523: **352/352**, no failures/skips (four×86 +8 full-course, unchanged90s limit). Golden37170346769: **422 passed/18 preexisting skips/0 failed**,440 total, eight shards. Three unchanged project-filtered scenarios each skip six of eight projects: two in signal-run.e2e.ts, one in whole-site-playtest.e2e.ts. Prior four-shard job111336189673 timed out20min at103/110 started cases; smaller eight-shard workloads retained cases/limits/workers/retries/assertions and passed. Earlier claim of six skips was inaccurate and is corrected here.

50 qualification seeds1001–1050, separate tuning1/7/42: all1000m/health100/zero sky hits/all4 patterns/51 braking responses. Starts rotate normal/sky5600/gauntlet8050; **not50 all-normal courses**. Actual input replays30/60/120Hz plus75ms bounded stalls on120Hz simulation; position tolerance1e-5/time1e-7, no bit-identical-device claim.

Actual600s stress on tested merge3c:
- Chromium111341942159:600011ms,548 iterations/32 resets/14 navigations/23 rotations/45 pauses; **59.9041FPS**,0.0115%slow (>33.33ms), max366.6ms.
- WebKit111341942210:600660ms,508 iterations/30 resets/13 navigations/22 rotations/42 pauses; **33.4950FPS**,15.58%slow, max880ms. Low-effects34.3306FPS; intervalmedian35.2250/p0528.3883/p9539.1773.
- Observed maxima1hazard/150history/18blockers/8fragments/11art faces/29constant global listeners/≤2voices. No detachable debris observed, so its22cap is not empirically exercised by these samples. Blank cadence near60FPS. Around30FPS fallback supported here; individual stalls retained and real-phone performance unverified.

Coverage: Linux GitHub-hosted Playwright Chromium desktop/Pixel7 and **desktop WebKit** iPhone13/iPad11 emulation, EN/es-MX, small/large375×667/430×932/390×844/844×390 plus actual effective stress viewports recorded in JSON. **No physical iPhone session, owner acceptance or child-fun evidence.**

## Real production / cache / save continuity

Fresh live Actions37171492271/job111345162025: all4 Chromium/WebKit×EN/es-MX pass exactD9, starter-only, first warning440–444m, avoided attack/no sky hit, rewards325–327 persisted; shared link/pause/recovery/restart/exit passes.

Returning observer37170346696/job111341890284 warmed actualbaseline at02:14:03Z; same Chromium/WebKit390×844 touch browser contexts kept SWv29/cache/oldindex-pOsOsCQ2.js across merge. Ordinary root return, **no bypass or erase**, verifiedD9/new health/warning at02:38:09Z, same profile/owned parts/blueprints/777bolts preserved, then1072bolts banked and reload preserved. No errors. SWunchanged, network-first HTML/assets, registration updateViaCache:none. This proves normal cached navigation, **not automatic replacement of an already open in-memory tab**.

Save key nicos-world-local-save-v4/schema4 unchanged; legacy1/2/3 read-only. Failed reads retry then block temporary-default autosave until successful load. Fixtures only; no real data cleared.

## Critique / iteration / remaining unrelated failures

All four delivery stages completed. Minimal slice ramp→smash→warn/brake→once-bank/reload/retry passed200cases(c825862), then six-type/save248(455ab5e). Regression-first minimized1.6s float boundary and Gas losing hold on Turbo focus. Fixed starter/course/seeds/scripts/viewports/criteria per comparison; no weakened reward/collider/90s assertions.

**Second-pass SELF-review; no independent reviewer.** Reproduced/fixed/retested rollover, occluded warning preview, paused HUD lag, seed divergence, unthreatening coast, denied-read overwrite, suspended-frame damage and overlapping damaged landing bonus. Reordered input/physics→collision→fair spawning→save→art→broad play/release. Equivalent contention failures split jobs; trace-overhead and local shadow/layer/clip hypotheses were falsified. Wheel cache plus hidden already-occluded underlay restored sustainable WebKit fallback without removing art. Pause→resume→impact, impact→checkpoint/retry, navigation→return, language→reload covered. Historical failures/evidence retained in docs/evidence.

Merged main checks audited: scoped CI/creative/stress/performance/Golden/truck-live/canonical deploy green. Three **known non-truck red checks are not hidden**:
1. Connected production job111345162010:10 destination-count failures Expected16/Received17. Baseline aadc run36650952039/job109684711096 has the identical10 failures onSept30. Learning enablement/WorldMap/catalogs/test byte-identical to baseline; existing optional LearningLab destination explains preview/production mismatch. Decision: preserve navigation/flags/assertions; not a truck regression or reason to alter another feature.
2. Creative production111345162335: Unicorn movement failure also present on baseline36650952015/job109684710902 and [issue156](https://github.com/BoneManTGRM/Nicos-Adventures/issues/156). Root cause remains unproven; truck-specific live4contexts pass. Do not call the entire two-game workflow green.
3. Old noncanonical nicos-adventures Worker111345357820 failed; canonical nicos-world succeeded and actual domain proven. Do not delete infrastructure or infer the old failure cause.

## Reproduction / files / owner check

Node22.12.0 from web:
```sh
npm ci --no-audit --no-fund
npm test
npm run build
npx playwright test --config=playwright.creative-games.config.ts --shard=1/4 --workers=2 --grep-invert 'normal starter plays all three sections'
npx playwright test --config=playwright.creative-games.config.ts creative-games-turbo-course.e2e.ts --workers=1 --grep 'normal starter plays all three sections'
npx playwright test --config=playwright.truck-stress.config.ts --project=webkit-iphone-en
npm run test:e2e -- --shard=1/8
EXPECTED_SHA=d9a5878124628326140a3ee201cca7f39e273669 node scripts/verify-truck-sky-production.mjs
```
Run remaining shards/Chromium when affected evidence is invalidated. Public Actions supplied actual shell/browser execution; no local shell/browser runner or relevant installed game skill was available. Firecrawl allowance exhausted, no metered continuation/top-ups. Extra spending **none**.

Scoped files: creativeGames physics/course/sky/smash/survival/art/controls/audio/save/CSS/tests; FullApp shared link; narrow storage guard; focused e2e/config/scripts/workflows and docs/evidence. Full117-file PR list in final JSON (including retained historical proof/captures). No unrelated game redesign, broad dependency upgrade or protection bypass.

**Phone-only check:** open the game, smash obstacles, dodge a warned attack, clear ramp two, pause/resume, then return and confirm saved progress. No developer tools.
