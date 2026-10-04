# Turbo Smash Truck handoff

**Product qualified; broader workflow correction and release pending.** No merge/deploy or extra spending. No physical iPhone or child-fun acceptance. Only BoneManTGRM/Nicos-Adventures.

## Identity / exact next action

[PR159](https://github.com/BoneManTGRM/Nicos-Adventures/pull/159), branch `mission/turbo-smash-truck`. Read current PR head/base and this handoff before continuing; never overwrite another session. Baseline main/public: `aadc44cae98722894907f50caee3ee315fae1432`. Qualified product source: `9f7edb1c89f1591e342862eb5ce01b2b3c453a59`; tested pull merge `e6b8e3cbf4546ad6b49f067259576b890f0a13b1`. New checkpoint changes workflow/evidence/docs and the read-only production verifier only; product code unchanged. The verifier now exercises the actual shared URL, pause/resume, protected checkpoint retry, fresh restart and Arcade exit before its four browser/language sky/save scenarios. These checks are pending actual deployment; never report them passed from local proof. Exit preserves the Arcade section and removes the query in existing Arcade.closeGame; the subsequent root visit therefore waits for the Arcade garage card, not the fresh-home continue control. This source-verified ordering assumption was corrected before release.

**Next:** qualify Golden Adventure's eight-shard split, exact-head CI and other required checks; then normal protected merge, confirm actual merged main SHA and real-domain release. Inspect Cloudflare failure through authorized logs if needed; do not infer its cause or bypass checks. Existing returning-client observer waits40min with cached Chromium/WebKit contexts for merged release. It must report VERIFIED before A12.

URL: https://nicos-world.com/?play=monster-garage. Canonical FullApp→Arcade→MonsterGarage→TruckDriveStage; existing React Canvas2D engine. Main publishes through Cloudflare Workers Builds `nicos-world`, rootwrangler assets `web/dist`; GitHub production jobs verify the domain. PR157 reused15 relevant files at528502b4fce8d5739e200fbaa4d976b396a37ffc; original PR untouched. No new engine/dependencies/backend/currency or expanded catalog.

Cloudflare branch check111336269377 failed instantly with no exposed error text/annotations; [build443105df-f440-4825-9dd4-05355591a86a](https://dash.cloudflare.com/709a803ff6ece7a05781bd85a0c1b6cd/workers/services/view/nicos-world/production/builds/443105df-f440-4825-9dd4-05355591a86a). Main baseline has failed historically too. No authenticated Cloudflare tool available. Public rulesets[] does not establish no legacy protection; protection endpoint403. Normal merge enforces protections; no bypass/force push/infrastructure deletion.

## Completed scope

Three sections in existing course: smash intro, sky dodge350–650m, gauntlet650–1000m, clear/replay. Original early ramps retained; starter acceleration/traction/air recovery improved, later runway and flat escape stretches added. Gas/brake-reverse/free boost, useful existing air/tools controls; simultaneous source-owned key/pointer holds, cancel/blur/visibility cleanup.

Six original visually distinct smash types: crate stack/fence/inert barrel/tires/robot scrap/ice. Light/medium/heavy thresholds,18 swept colliders, remove blocker and pay once;8 noncolliding fragments. Legacy resumes clear newly inserted behind/overlapping blockers without paying.

Four seeded patterns: vertical junk/slow boulder/diagonal crystal/two separately warned cartoon bolts. BOTH300m and20active seconds;1.6–2.4s visible locked paths/markers/action warnings, .35s reaction with unaided gas/brake escapes, wall/slope/landing rejection and quiet stretches. One active/max32 primary attacks; separate cosmetic RNG.

Health100, once-only shield/repair/impact guards, checkpoints90/1350/4290/7890 with3s visible protection/nearby hazards cleared. Existing bolts receipt ledger preserves paid distance and IDs across recovery/reload; capped real near-miss/stunt/combo rewards. All body/wheel/sky impacts settle before clean-stunt payment. No beginner grind.

Original coherent truck/scenery/suspension/rolling-wheel art, compact EN/es-MX HUD, summary/replay; short local original WebAudio(max4/mute). Reduced motion suppresses shake/fragments but retains warning shapes. Assets/provenance: original source and generated local tones only; no paid/unlicensed assets, voices, trackers or runtimeAI.

Fixed120Hz ref simulation/local10Hz HUD, bounded history150/debris22/fragments8/colliders18/hazard1/audio4/wheel-face-cache24. Live wheel rotation retained/cache cleared on exit. Opaque canvas and stable low-effects/DPR1 fallback. Pause resets frame clock. Scoped CSS hides already occluded page chrome during fixed truck playfield and restores on exit; art/rounded clipping/control/warning unchanged.

## Actual qualification and limitations

[9f7edb1 exact evidence](evidence/turbo-smash-9f7edb1-qualification.json), [inspected captures](evidence/turbo-smash-9f7edb1/).
CI37168413352/web111336150216: **695 units + typecheck/build/asset budgets**.
Creative37168413428/aggregate111338566079: **352/352 browser cases, zero failures/skips** (4×86 +8 full-course). Full-course all8projects14.7–45.3s, unchanged90s limit.
50 seeds1001–1050: all1000m/health100/zero sky hits/all4patterns/51 brake responses; separate tuning1/7/42. Starts rotate normal/sky5600/gauntlet8050. Recorded input replays30/60/120Hz plus75ms bounded stalls on120Hz simulation; x tolerance1e-5/time1e-7, no bit-identical-device claim.

Both actual ten-minute chaos/reset/navigation tests passed, trace/video off, no mocked clock/retries:
- Chromium111336223025:600946ms,32resets/14nav/23rotations/45pauses;60.0006FPS,0slow,max33.3ms.
- WebKit111336222830:600585ms,30resets/13nav/22rotations/42pauses;33.7239FPS,14.61%slow (>33.33ms),max801ms. Low-effects34.6453FPS; intervalmedian35.6816/p0529.0780/p9539.1978.
- No game errors/failed essential assets. Observed max1hazard/150history/18colliders/8fragments/11art faces/29constant global listeners/≤2voices. Declared debris22 cap not exercised by these no-detachment samples. Blank page near60FPS.

Coverage: Linux GitHub-hosted Chromium desktop/Pixel7 and **desktop WebKit** iPhone13/iPad11, EN/es-MX, small/large375×667/430×932/390×844/844×390, touch/cancel/resize/safe areas, mute/reduced motion, quota/read failures,60s suspended-frame resume. These are emulations, not real iPhone. Actual source captures inspect stack/impact, diagonal warning/dodge, boosted jump/14m landing and summary. A1 local route/navigation and A2–A11 technical scenarios passed; **A1 new public route/A12 release-cache-save proof and real-device/fun acceptance remain open**. Around30FPS fallback supported in this environment; no physical-device60FPS claim.

Broader Golden Adventure shard4/job111336189673 hit20min at103/110 started cases; no individual assertion failure observed. This is an introduced workload blocker, not a passed test. Eight shards retain all440 cases,20min job/120s test limits,2workers, retries and assertions. Exact-head rerun required; six preexisting Golden skips remain honestly reported.

## Save / production continuity

Schema4/key`nicos-world-local-save-v4` unchanged, legacy1/2/3 read-only; profiles/vehicles/parts/blueprints/bolts/goals/settings preserved. Denied/corrupt read retries once then blocks temporary-default autosave until successful load. Quota/read fixtures protect previous good save. Isolated fixtures only, no real data clearing.

SWv29 network-first HTML/assets, updateViaCache:none registration/update. Returning observer uses same browser/cache contexts, isolated777-bolt/blueprint/profile fixtures, ordinary root navigation, no bypass query/site-data erase. Superseded pre-merge observers are baseline only. Actual Oct3 23:23:29Z public baseline: app3.2.0/schema4/aadc44c/build2026-09-30T00:39:39.538Z/buildHash sha256:e865902dc869c476766784cd6f7450874559c32d264b73335559d1eb2f4dd7a9. Build/deploy notices alone do not prove A12.

## Iteration / critique decisions

Minimal: baseline12 normal/checkpoint ramp tests already passed; historical ramp2 power failure not reproduced. Regression-first fixed1.6s float edge and Gas losing hold on Turbo focus. Actual route slice ramp→smash→warning/brake→once-bank/reload/retry200cases(c825862), then six-type/save248(455ab5e).

Fixed conditions: unchanged starter/course/seeds/scripts/browser/viewport/criteria per comparison. Air torque1.5 minimized route2 rollover397.11m; warning lead700 restored threatening coast/unaided brake; coupled later runway avoided landing traps. Never weakened reward/collider/90s assertions.

**Second-pass SELF-review; no independent reviewer.** Reproduced/fixed/retested rollover, occluded warning preview, paused HUD lag, live/save seed divergence, unthreatening coast, denied-read overwrite, suspended-frame resume and overlapping damaging landing bonus. Evidence keeps old failures labeled historical.

Reordered input/physics→collisions→fairness→save→art→browsers/release. Equivalent contention timeouts led4shards/2workers plus full-course1worker/all8projects unchanged. Trace overhead and local shadow/layer/clip hypotheses falsified. Wheel cache then underlay comparison54.28 vs warmed41.53FPS; final restored-underlay34.63 vs default-repeat46.11; sustained33.72 vs f5f60b24.45. Preserve art/criteria. Golden timeout now gets smaller eight-shard workloads. Pause→resume→impact, impact→checkpoint/retry, navigation→return and language→reload covered.

Historical raw/model/TS/visual/render evidence remains in docs/evidence (baseline/slice/full/2c/5952/603968/a599dc/1dcde1/f5f60b/dad1248/35fb098/5e37283). Reuse only still-valid source-tied evidence.

## Reproduction / scope / owner check

Node22.12.0, fromweb:
```sh
npm ci --no-audit --no-fund
npm test
npm run build
npx playwright test --config=playwright.creative-games.config.ts --shard=1/4 --workers=2 --grep-invert 'normal starter plays all three sections'
npx playwright test --config=playwright.creative-games.config.ts creative-games-turbo-course.e2e.ts --workers=1 --grep 'normal starter plays all three sections'
npx playwright test --config=playwright.truck-performance.config.ts --project=webkit-iphone-en
npx playwright test --config=playwright.truck-stress.config.ts --project=webkit-iphone-en
npm run test:e2e -- --shard=1/8
```
Run all other shards/Chromium when invalidated. Actual public Actions provide shell/browsers; none locally available. No relevant installed game skill. Firecrawl allowance exhausted; no metered automation/top-ups used.
Scoped files: creativeGames modules/tests/art/CSS, FullApp link, narrow shared input/storage fixes, e2e/config/workflows and handoff/evidence; exact PR file list inspected. Unrelated unicorn production issue156/detached locator and old nicos-adventures Worker failure remain historical. No protections bypassed or infrastructure removed. Extra spending: **none**.

After real deployment, phone-only owner check: open game, smash, dodge a warned attack, clear ramp2, pause/resume, then return and confirm saved progress. No developer tools.
