# Turbo Smash Truck mission handoff

Status: **stage 1 minimal slice qualified; stage 2 mechanics implementation in progress; NOT release-ready**. Full owner brief remains frozen. Repository only BoneManTGRM/Nicos-Adventures. No spending, paid/billable browser calls, merge, deployment, force push or real-save modification.

## Current identity and next action
- Baseline main aadc44cae98722894907f50caee3ee315fae1432, tree608e62340258a8cd33d736dc3c98ce24904fb91c.
- Existing PR157 branch feat/truck-sky-obstacles at528502b4fce8d5739e200fbaa4d976b396a37ffc left untouched; its15 files reused.
- Mission branch mission/turbo-smash-truck, draft PR159 https://github.com/BoneManTGRM/Nicos-Adventures/pull/159.
- Last gameplay source93be193541db38192c550a892644f6c68c9bdd98; tested merge1a7b585b879faae7c8821af9782fbb886bdbc96d. This documentation/qualification change does not alter gameplay.
- Current production is baseline main, NOT mission. Historical Sept30 nicos-world build dc044d49-f0f6-4d7a-8f66-b418b3dec20c/version60ec9506-8b08-40f5-a312-07ee73e6cfe6 is not fresh-domain proof. Branch Workers Builds check fails with no accessible Cloudflare build logs yet; do not bypass it or remove infrastructure.
- Exact intended URL https://nicos-world.com/?play=monster-garage. New fresh-deep-link fix is not deployed.
- **Next:** fetch exact-head unit/build and 248-case dedicated browser results for this six-type/course/camera candidate, inspect the logged six obstacle renders, fix any failure, then integrate survival and the four fair seeded patterns. The c825 minimal slice gate passed200/200; changed physics/rendering must pass fresh checks. Do not stop at another checkpoint.

## Evidence and known failures
- docs/evidence/turbo-smash-baseline.json:12/12 current-main starter model ramps pass, unchanged routes0/1/2, wheels11/12, x90/1350, held gas120Hz25s, live grounded x>1990 and|angle|<.7. Historical low-power issue not reproduced; cosmetic parts detach on early landings. The actual-source TypeScript annotations were explicitly erased for V8 probing: model evidence, not npm/browser/device proof.
- Same12 conditions pass reused candidate and one-crate slice; docs/evidence/turbo-smash-initial-checks.json and turbo-smash-slice-model.json. Three actual model braking replays dodge a locked drop. No50-seed qualification yet.
- Gate minimized at350m/t19.99; regression56d03f9 before fix. Both300m and20 active seconds now required, preserving existing generous grace. Nine boundary cases recorded.
- Input focus failure: Gas captured pointer released when Turbo focus caused Gas blur. Pointer-ID set/key hold separation fixes it. Browser captured-pointer focus/cancel test passes broader matrix; genuine multitouch/background qualification pending.
- First fixes81ce062 CI37151789789 passed. Dedicated37151789814:181passed/1failed/2flaky. Exact192-step warning age1.5999999999999968 failed original falling assertion. Regression1b0fee6 before repair0e54a83:1e-9s compare tolerance plus immediate phase snapshot; original1600ms assertion retained. docs/evidence/turbo-smash-warning-threshold.json. Precision-only Chromium shards passed; superseded full matrix not counted.
- Current93be193 CI37153375042 passed:601 unit tests, TypeScript/build/budgets, Python/root dry-run. Broad browser37153375016 passed:270passed/18skipped across4shards (111291694236,111291694228,111291694295,111291693999). Skips do not prove omitted behavior.
- Dedicated37153374995/job111291711146 hit25min limit; multiple90s WebKit es/iPad natural-warning/slice timeouts occurred twice. No completed reporter detail. Artifact11285625403 SHA256 aa9001ce038527aea641e4aa354e37debcb06ce1c8303a0c092bab1b33e3713e preserves118MB evidence. Cause not proven. Changed workload to4shards/2workers, identical tests/assertions/90s limit, with immediate failure JSON logs and fail-closed games aggregate. This is a new test environment; record exact new revision/results.
- docs/evidence/turbo-smash-slice-qualification.json maps sources/results and6 captured JPEGs under docs/evidence/turbo-smash-93be193/. Actually inspected real Chromium mobile and desktop WebKit iPhone-emulation renders: crate reward, grounded ramp2, committed warning. No physical iPhone evidence.
- Second-pass SELF-review (not independent): tall portrait wastes ground below action (medium); cosmetic starter parts detach on ordinary mandatory ramps (medium); warning clear but target offscreen and large banner, full approaching/diagonal fairness pending (blocking scope). Three requested finished memorable moments not yet produced.
- Old failures preserved: English-WebKit unicorn production movement issue156; production verifier detached locator; unrelated obsolete nicos-adventures Worker check. Do not call these introduced truck regressions.

## Implementation and save boundary
Canonical React PWA: web/src/main.tsx → AppShell → FullApp → world/Arcade → creativeGames/MonsterGarage → TruckDriveStage; Cloudflare nicos-world static Worker, main Workers Builds, wrangler.jsonc SPA fallback. No second engine, dependency upgrades or unrelated redesign.
Changed existing carPhysics/save/carArt/TruckDriveStage/skyObjects/controls/FullApp; new smashObjects/smashArt and regression e2e/unit modules; existing PR157 sky/art/tests reused. Original procedural crate art and six decorative fragments require no external assets/license credits. Reduced motion suppresses fragment movement.
Slice: held pedal clears unchanged ramp2, swept one-crate contact gives3bolts once and removes collider; one natural20s/300m warning, brake avoids it; bank/reload ledger retains vehicles and prevents duplicate bank. Fresh link start/pause/resume/exit covered in broad matrix. Dedicated matrix must complete before promoting the slice.
Schema/key remain v4/nicos-world-local-save-v4; legacy v1/v2/v3 read-only. Preserve profiles, owned parts, fitted parts, blueprints, bolts, best/goals, language/settings. finishDrive uses sequence/paidThrough; smash joins existing payout, practice0. normalizeDrive bounds clearedID1 and derives3bolts; no second currency. Fixtures are isolated browser contexts. Current checkpoint callback saves run only, not spatial recovery.
Sky remains ONE vertical behavior/3skins,1.6s warning, committed target,8s cooldown and100–160m interval; NOT four patterns/reachable escape/seeded production variation. Existing turbo recharge reused.

## Iteration and qualification
Method1: baseline ramp probe; minimal gate and pointer failures repaired regression-first; actual real-route slice and renders tested. Method2: frozen course/starter/input/120Hz/source identities; no terrain flattening or assertion weakening. Method3: labeled self-review; current failures remain visible. Method4: input/gate/HUD/floating threshold before content; now workload reordering distinguishes browser wall-clock limit from product faults before expansion. Pause→reload→impact covered existing fixture; new full checkpoint/health orders pending.
Commands with Node22.12.0 and lockfile:
```sh
cd web
npm ci --no-audit --no-fund
npm test
npm run build
npx playwright install --with-deps chromium webkit
npx playwright test --config playwright.creative-games.config.ts --shard=1/4 --workers=2
```
Run all4shards, not only1. CI emits TRUCK_TEST_FAILURE and bounded TRUCK_VISUAL JPEG JSON. Fetch completed job logs and parse records; image({type:'image',data:record.image,mimeType:'image/jpeg'}) in functions.exec gives actual visual inspection. Never print base64 as text.
Tools expose GitHub Git APIs/Actions; no local shell/game skill/browser runner. Firecrawl allowance remainingCredits=-1000, plan1000 periodSept16–Oct16; no calls/top-up. Browser evidence via existing public repo Actions is now proven; this is no longer a screenshot boundary. No frame-time or resource measurements made; gzip budgets are not FPS.

## Outstanding frozen acceptance
A1 slice entry/start/pause/resume/exit tested broader matrix; complete retry/nav/public pending.
A2 fresh slice starter ramp tested; useful spatial-checkpoint runway pending.
A3 one crate only; fence/barrel/tires/robot scrap/ice distinct behavior and boost collision pending.
A4 four patterns, seeded scheduling, reachable response/trap rejection, approach markers pending.
A5 three escalating sections pending.
A6 health/shield/repair/near-miss/combo/stunt/spatial recovery/protection pending.
A7 new slice payout/save covered broader matrix; complete backward/storage-failure/overlap qualification pending.
A8 focus/cancel tested; genuine simultaneous touch, rotate/background/listener proof pending.
A9 existing en/es-MX/reduced motion tested; coherent audio/mute/full labels pending.
A10 six inspected slice images retained; obstacle-stack/diagonal-dodge/boosted clean landing finished images pending.
A11 50 seeded input replays (qualification separate),10min stress, measured frame/object/load/listeners pending.
A12 full exact-candidate checks, safe merge/deploy and fresh plus normal cached return/save verification pending.
Actual iPhone/owner fun acceptance unverified. No production release or technical-full-pass claim authorized by this evidence.

## Stage 1 completed; six-type/course candidate (parent c825862)
Minimal gate source c82586202e0adb4705afb9a25728b1567fb1a719, tested merge d9c23d5b29d07da889a3e95a40e96fdccb63a7d1: CI37155274934 passed; dedicated37155274935 all4shards50/50 each, aggregate games111299265312 success, 200passed/0skipped. This distinguishes resource/timeouts from game failures without changing assertions/timeouts. Existing warnings and slice browser journey passed in en/es Chromium desktop/mobile and desktop WebKit iPhone/iPad emulation. No phone-device acceptance.
This candidate expands smashObjects/smashArt to18 fixed objects spanning six distinct types (crate/fence/barrel/tires/inert scrap/ice), thresholds45/65/110/140/180/80, and fixed once-only reward from recognized cleared IDs. All blocking state cleared on break;8 decorative fragments on the latest impact for.75simulation seconds; no debris colliders. Original procedural stacked-crate/fence/banded barrel/tires/inert robot/ice art, no assets spending/licensing.
New courseLayout.ts keeps original opening throughx4280, level sky stretch4280–7880, remaps existing repeated ramps in gauntlet above7880. This explicitly changes later course layout, not baseline opening criteria. shared truckCamera.ts centers action vertically across terrain/sky/boost; art ramp anchors and nextRampDistance use the same course layout. A1–A2/A3/A9–A10 must rerun on changed source.
Long-course critique preserved existing held-gas route2 loss around397m. Isolated practice replay still failed new level stretch at397.11m/24.533s. Frozen120Hz/60s/three routes: air restoring torque tested0/1.5/3/4.5; smallest1.5 passed all at950m, signed gas/brake air control remains. Cosmetic impact threshold470→560 prevents normal ~483–519 early damage, while severe fracture stays. docs/evidence/turbo-smash-six-types-model.json preserves comparison and12/12 original early ramps from normal/checkpoint starts with both wheels. No browser/presentation/performance qualification inherited for this changed candidate.
Test additions: smashCourse.test.ts six swept maximum-speed/duplicate-normalization/payment cases, courseLayout.test.ts exact original anchors/level middle/all3starter practice-course replays, creative-games-smash-types.e2e.ts actual six sprites/colliders/momentum/bank/reload across8projects. Slice content assertions now require all8 actually encountered IDs and31bolts on unchanged route0 gas/warning/brake journey; initial-ramp crate test expects first crate+fence6bolts. This records new content, not relaxed success criteria. Opening terrain, landed>x1990 threshold, warning gate/timing/dodge and ledger assertions intact.
Pending survival.ts draft is NOT integrated in source yet; health/shield/repair/checkpoint/combo/stunt/near-miss, allfour seeded attacks,10minute stress/50qualificationreplays/audio/release still incomplete. Continue from current branch. Tools currently store draft code but durable source only counts when committed; do not infer survival from uncommitted drafts.

## Six-type candidate failure and compatibility repair
Source8da012f7c5e62f59fe2ec72b5f547846f0304146, merge2e934e3f513c162c1912cde08bb84da07caad975: CI37156514960 web111300891079 had613passed/1failed of614. skyCollisionResume stationary x4450 fixture displaced90px because the new crate actually blocks that location. Required fixed-hit assertions remain; unit/e2e stationary fixture moves to clear level x5600. New smashMigration.test.ts separately reproduces real old-save x4450 overlap and verifies migration clears newly introduced behind/overlapping colliders without awarding currency, preserving prior crate3bolts and ownership/once-only settlement. New runs initialize version1; normalize old runs only adds paid/cleared IDs. Paid IDs exclude migration/recovery clears from earned bolts. Bounded schema-v4 optional fields, no profile/settings/currency erasure.
Exact next action: fetch repaired candidate build/browser results, inspect six logged render captures, then integrate pending four-pattern and survival drafts. Avoid interpreting a working test fixture as old-save proof; the dedicated migration regression supplies it. Git inline tree/utf8 blob writes timed out twice; changing to base64 blob upload + SHA-only tree succeeded. No write boundary remains.
