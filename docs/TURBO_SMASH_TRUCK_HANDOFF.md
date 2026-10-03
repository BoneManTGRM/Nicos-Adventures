# Turbo Smash Truck handoff

Status: stage 3 qualification. **Not merged or deployed.** No extra spending; no physical iPhone or independent reviewer. Use this document and current PR state on continuation.

## Source and release identity

Repository: BoneManTGRM/Nicos-Adventures only. Baseline main `aadc44cae98722894907f50caee3ee315fae1432`; canonical React canvas game is FullApp → Arcade → MonsterGarage → TruckDriveStage. Existing main Cloudflare `nicos-world` static SPA workflow remains. No new engine, dependencies, backend or currency.

Branch `mission/turbo-smash-truck`; [PR 159](https://github.com/BoneManTGRM/Nicos-Adventures/pull/159). This candidate advances `2c137339e283cbd99c2cc52616df6b9274e48ccb`; obtain the exact current head from PR159. Reused 15 files from existing PR157 source528502b4fce8d5739e200fbaa4d976b396a37ffc; original PR untouched. Game URL: https://nicos-world.com/?play=monster-garage (deep-link implementation is not yet deployed).

Production has not been verified for this mission. Historical Sept30 build/version identities are not current proof. The branch Workers Builds:nicos-world check fails (2c build f7ed1947-8931-413c-a8a3-97364eb1ea7c); authenticated Cloudflare build logs are unavailable. Protection read returns403 because the integration lacks administration scope. Use the normal protected merge API only after qualification, with the expected exact head; do not disable checks or remove infrastructure. A rejection is a release boundary, not permission to bypass it.

## Exact next action

1. Fetch current CI and all four creative qualification shards plus both ten-minute stress jobs. Fix real failures, then rerun affected evidence on the changed candidate.
2. Inspect the new blank-page versus game RAF measurements and reduced-resolution fallback; desktop WebKit previously measured about20FPS. The 30FPS fallback goal is not achieved/proven yet.
3. Inspect actual current captures (stack smash, diagonal warning/dodge, boosted jump/landing), finish second-pass self-review, inspect full PR diff/required checks, mark ready and use protected merge when satisfied.
4. Confirm merged revision and release.json on the actual domain. Existing production verifiers and the read-only returning-client observer must verify fresh and ordinary cached clients with preserved fixture saves. PENDING_NO_MERGE is not a pass.
5. Genuine iPhone/owner fun acceptance remains pending. Never require owner developer tools.

## Implemented frozen scope

Three sections reuse the existing course: forgiving opening, sky dodge from350m, combined stunt gauntlet from650m; normal run finishes1000m, practice continues. Original early four ramps remain. Starter truck has tuned power/traction/air recovery, rechargeable free turbo, familiar brake/reverse/gas/boost and existing optional tool/midair controls. Input ownership supports simultaneous pointers/keys, cancellation, blur/visibility cleanup. Camera and sky art share one transform.

Six original procedural smash types (crate stack, fence, non-explosive barrel, tires, inert robot scrap, brittle ice) use light/medium/heavy thresholds;18 bounded colliders, swept max-speed collisions, once-only cleared/paid IDs,8 decorative fragments with no colliders. Legacy saves clear newly inserted objects behind/overlapping the saved truck without paying.

Four seeded sky patterns: vertical junk, slower large boulder, diagonal crystal, two separately warned cartoon bolts. BOTH300m and20 active seconds;1.6–2.4s visible warnings; locked target/trajectory. Conservative unaided brake/gas escape with.35s reaction; wall/slope/landing rejection, quiet intervals, one active object and max32 attacks. Production fresh seeds vary; gameplay RNG is separate from cosmetics. Natural lead700 makes a warned coasting attack threatening while braking remains safe.

Health100, shield/repair once-only pickups, continuous-impact guards, checkpoint recovery with3s visible protection and nearby hazard clearing. Meaningful threatening close misses and clean boosted8m landings earn the existing bolts; combo max4/bonus10, total extra125 cap. Existing run sequence/paidThrough ledger banks exactly once; checkpoint/retry keeps prior paid distance/objects/action dedup. No grinding gate, no new shop/economy.

Compact bilingual EN/es-MX HUD, warning shape/path/arrow/action text, clean landing feedback, summary/free replay; local short WebAudio tones max4 with saved mute. Reduced motion removes cosmetic animation, essential warnings remain. RAF/resource diagnostic data attributes carry no personal data or production debug powers. 120Hz local ref simulation avoids app-wide per-frame updates.

Latest bounded fixes: retry one transient storage read; after repeated denied/corrupt reads block writes of temporary defaults until successful load. Isolated regression preserves wallet777 and saved vehicle. Pause/resume resets RAF timestamp/accumulator even if the animation loop was suspended; explicit60s suspension browser regression. Low-effects DPR reduced1.5→1 and reduced-motion mode usesDPR1; stress now measures blank-page cadence to distinguish rendering cost from environment scheduling.

## Evidence and acceptance limits

[2c qualification, input scripts and both real stress records](evidence/turbo-smash-2c-qualification.json) retains50 qualification seeds1001–1050, distinct tuning seeds1/7/42. Each actual Vitest replay checks30/60/120Hz plus bounded75ms stalls using the same120Hz accumulator; x tolerance1e-5/time1e-7. All50 finished1000m, health100, zero hits, all four patterns covered,51 actual brake events. Source2c CI37161484634/job111315657573: **686/686 unit tests, typecheck/build/asset budgets passed**. This is source2c evidence; new storage/resume/performance changes require current checks.

2c creative run37161484652: **334 passed/2 failed**; both iPad EN/es-MX full-course runs timed out at the unchanged90s limit, twice each (job111315657948). No failed gameplay assertion was reached. Next candidate retains exact fixture/viewport/input/criteria, reduces cosmetic DPR under reduced motion, and runs the full-course case in all eight projects in its own single-worker job. Do not call this matrix qualified. Both actual600s stress jobs passed: Chromium111315657786 (600520ms,14 navigations,23 rotations,45 pauses,32 resets); WebKit111315657941 (600489ms,13 navigations,21 rotations,40 pauses,29 resets). No uncaught game errors/essential asset failures; global listener count stayed29. Bounds:1 hazard/22 debris/150 history/18 colliders/8 fragments/4 voices. Actual sampled cumulative-counter deltas: Chromium60.00FPS, no >33.3ms frames, max16.8ms; WebKit19.97FPS,99.97%slow, max960ms. These measure this CI environment, not actual iPhone performance. Do not claim stable30/60FPS universally.

[Retained actual rendered captures](evidence/turbo-smash-2c1373/) identify source2c and tested merge e987af72778d6282394c05a35ecdd9849a974caf; self-reviewed coherent original art, readable warning previews under banner, unobstructed phone controls,14m boosted clean landing. Current exact candidate captures must also be inspected after changed behavior.

Acceptance mapping:
- A1 local route/start/pause/retry/exit/navigation covered; real-domain new-release checks pending.
- A2 original baseline12 cases already passed (historical ramp-power issue not reproduced); retained normal/checkpoint starter regression and actual ramp-two capture.
- A3 six types/collider removal/max-boost/once rewards/migration covered by unit and browser tests.
- A4–A6 four patterns, separate bolt warning pair, full three-section1000m run, shielding/repair/combo/near/stunt/checkpoint/dedup covered; pending current exact candidate results.
- A7 schema4/key nicos-world-local-save-v4 and legacy1/2/3 retained. Existing parts/builds/blueprints/wallet/profiles/settings preserved. Write quota browser test passed2c; denied-read regression/fix new candidate still needs actual CI.
- A8 multi-pointer cancellation/keyboard/blur/resize/safe areas and pause order covered in emulation; actual OS background/iPhone touch unverified; suspended-RAF regression new candidate.
- A9 EN/es-MX, mute/reduced motion and non-sound/non-color warning covered in browser matrix.
- A10 actual Chromium/WebKit captures inspected; child fun remains owner acceptance.
- A11 sustained stress and bounded counts passed2c; performance goal outstanding as above; rerun current candidate.
- A12 no release/returning cached-client proof yet.

Eight Playwright projects: Chromium desktop/Pixel7 and desktop WebKit iPhone13/iPad11, each EN/es-MX; additional375×667/430×932/390×844/844×390. These are emulations. No actual physical device session.

## Iteration, critique and reproduction

Method1: baseline ramp problem minimized before tuning; historical second-ramp failure not reproduced. Then actual route minimal slice ramp→smash→warning→brake/dodge→once bank/reload/retry qualified sourcec825862,200 browser passes. Six-type/save milestone455ab5e qualified248 passes. Related floating1.6s warning and Gas losing hold on Turbo focus were reproduced first.

Method2: fixed starter/course/seed/input/browser/viewport/simulation criteria retained. Timing waits now use each declared warning duration; old collision/dedup assertions remain. Coupled course/runway changes and natural lead460→700 are recorded in evidence/turbo-smash-full-model.json and evidence/turbo-smash-ts-qualification-b50.json. No lowered assertions or bit-identical unrelated-device claims.

Method3: **second-pass self-review**, no independent reviewer available. Minimized/fixed route2 rollover397.11m (air torque1.5), warning preview occlusion, paused HUD lag, initial live/save seed divergence, too-harmless natural coasting attack, read-failure autosave overwrite. New browser regressions address suspended animation resume; performance remains an explicit qualification issue.

Method4: input/physics→collisions→fair spawning→reward/save→art→broad browsers/stress/release. After two equivalent WebKit90s contention timeouts,4 shards/2 workers retained identical assertions/timeouts and fail-closed aggregate. Reordering isolated slow browser environment from product failures. Tested pause→resume→impact, impact→checkpoint/retry, navigation→return, language/reload, storage denial/reload.

Commands in web (Node22.12.0):
```sh
npm ci --no-audit --no-fund
npm test
npm run build
npx playwright test --config=playwright.creative-games.config.ts --shard=1/4 --workers=2 --grep-invert 'normal starter plays all three sections'
npx playwright test --config=playwright.creative-games.config.ts creative-games-turbo-course.e2e.ts --workers=1 --grep 'normal starter plays all three sections'
npx playwright test --config=playwright.truck-stress.config.ts --project=chromium-mobile-en
npx playwright test --config=playwright.truck-stress.config.ts --project=webkit-iphone-en
```
Run shards2/4–4/4 as well. Existing public Actions execute these because this tool environment has no local shell/browser runner. No game skills are installed. Firecrawl allowance was exhausted; no paid automation/generation calls used.

Changed scope: web/src/creativeGames modules/tests, shared storage boundary plus its safety regression, FullApp game link, e2e/config/workflows, this handoff and evidence. Inspect actual PR file list before release. Existing unrelated production unicorn movement issue156/detached-locator failure are historical and must not be misreported as truck regressions.

## Asset provenance and spending

New truck trim, six obstacles, four hazards, pickups, checkpoint flags, fragments and scenery adjustments are original procedural Canvas2D source. Brief original local WebAudio effects are generated in truckAudio.ts. No external downloaded assets, paid generators, subscriptions, voices, trackers, runtime AI or license obligations were added. Established Nico’s World art/custom parts remain; no franchise assets introduced. Screenshots are actual test renders, not generated mockups. Extra spending: **none**.
