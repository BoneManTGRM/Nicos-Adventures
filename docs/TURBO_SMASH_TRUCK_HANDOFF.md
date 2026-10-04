# Turbo Smash Truck handoff

**f5f60b behavior qualified; sustained WebKit rendering goal remains open; release pending.** No merge/deploy or extra spending has occurred. No physical iPhone or child-fun acceptance. Read this file and current [PR159](https://github.com/BoneManTGRM/Nicos-Adventures/pull/159) before continuing.

## Identity and next action

Only BoneManTGRM/Nicos-Adventures. Branch `mission/turbo-smash-truck`; PR159. Baseline/main `aadc44cae98722894907f50caee3ee315fae1432`. Fully tested game code source **5952de339697e6536920e061f17a02f85971fba5**, tested merge e3db9b7262d8511e72ca0ab07d4795ae7683acbc. The newest candidate adds capped24 static-wheel Canvas2D faces (live rotation/suspension retained, cleared on stage cleanup) and settles every body/wheel/sky impact in the fixed step before awarding a clean stunt. Main canvas is opaque; adaptive low-effects/DPR1 is latched for each run after61 loaded frames. Prior5952 evidence remains historical; changed behavior must rerun qualification. Obtain exact current head from PR159; server checks still apply to that head.

Game URL: https://nicos-world.com/?play=monster-garage. Canonical React canvas route FullApp→Arcade→MonsterGarage→TruckDriveStage; existing main Cloudflare nicos-world static SPA. No new engine/dependencies/backend/currency. Existing PR157 reused15files at528502b4fce8d5739e200fbaa4d976b396a37ffc; original PR untouched.

**Next:** read current flat-fill versus full-artwork/CSS-paint-effects-off controls. Actual f5f60b source /9de592b tested merge passes695 units/build, all50 avoidance replays and8 full-course projects. Both untraced600s resource/error tests pass, but WebKit sustained24.45FPS/low median25.02 (Chrome60.00) remains below the goal; short warmed32.4 was insufficient. See evidence/turbo-smash-f5f60b-qualification.json. One native fill keeps a continuously painted canvas while suppressing detailed raster; effects-off preserves artwork but removes browser paint effects test-only. Use their evidence to distinguish composition versus detailed art before another bounded product fix. Preserve all acceptance criteria. All352 browser cases now pass (4×86+8), zero failures/skips; aggregate111332150013 succeeds. Exact Actions37166123262 and captures will be retained. No merge/deploy yet; normal protected release and cached-save proof remain.

Cloudflare branch check fails (5952 check111319387665; authenticated build logs unavailable). Protection endpoint returns403; public rulesets collection is empty, which does not prove absence of legacy protection. Do not bypass checks, force-push or remove infrastructure. A normal merge rejection is a demonstrated release boundary. Production baseline was actually fetched Oct3 23:23:29Z by observer111315657850: app3.2.0/schema4/commit aadc44c, build2026-09-30T00:39:39.538Z, buildHash sha256:e865902dc869c476766784cd6f7450874559c32d264b73335559d1eb2f4dd7a9. That observer warmed both cached clients but was superseded before release; it is baseline evidence only.

## Implemented scope

Existing course now has forgiving smash introduction, sky dodge350–650m, and combined stunt gauntlet650–1000m. Normal finish1000m, practice continues. Original early ramps retained; starter power/traction/air recovery tuned; free rechargeable boost and familiar gas/brake-reverse/boost, useful existing tool/midair controls. Simultaneous pointer/key ownership, cancellation/blur/visibility cleanup, pause snapshots and suspended-RAF clock reset.

Six distinct original smash types: crate stack, fence, non-explosive barrel, tires, inert robot scrap, brittle ice. Light/medium/heavy thresholds,18 bounded swept colliders, blocking collider removed on break, once-only cleared/paid IDs,8 non-colliding fragments. Legacy resume clears newly inserted behind/overlapping objects without rewards.

Four seeded patterns: vertical junk, slow large boulder, diagonal crystal, two separately warned cartoon bolts. BOTH300m/20active seconds;1.6–2.4s shape/path/arrow/action warnings; locked target/trajectory. Conservative unaided gas/brake escape with.35s reaction, wall/slope/landing rejection and quiet stretches. One active/max32 attacks; separate gameplay/cosmetic randomness, varied production seeds, recorded test scripts.

Health100, once-only shield/repair pickups/impact guards, checkpoints with3s visible recovery protection and nearby hazard clearing. Existing bolts ledger banks once; checkpoint/retry preserves paid distance/object/action dedup. Genuine threatening close misses and clean boosted8m landings earn capped rewards/combo(max4/bonus10). Existing profiles, parts, vehicles, blueprints, wallets/settings/schema4 and legacy1/2/3 boundary retained. Transient denied reads retry; repeated denied/corrupt reads block temporary-default autosave until a successful load. Quota/read-failure fixtures preserve good saves.

Coherent original Canvas2D truck/scenery/obstacles/hazards/pickups/flags, compact EN/es-MX HUD, short local WebAudio(max4/mute), reduced-motion warnings retained, free checkpoint/replay/summary. Local120Hz ref simulation; no app-wide per-frame updates. Low/reduced-motion rendering usesDPR1. Asset provenance: original source/local generated tones only; no downloads, franchises, paid generator, voices, trackers or runtime AI.

## Qualification evidence and limits

[Exact5952 qualification, input scripts, stress summaries](evidence/turbo-smash-5952-qualification.json). CI37162694310/job111319244611: **688/688 units + typecheck/build/asset budgets**. Creative37162694330: **352/352 browser cases,0failures/0skips** (4×86 +8 full-course), aggregate111322543226 success. Normal starter full-course passes all8projects on1worker in13.4–36s under the unchanged90s test limit.

50 qualification seeds1001–1050 (tuning1/7/42 separate) record actual avoidance inputs then replay30/60/120Hz and bounded75ms stalls on120Hz simulation; tolerance x1e-5/time1e-7. All finish1000m, health100/zero hits, all4patterns,51 brake events. Do not claim bit-identical unrelated devices.

Both actual ten-minute traced stress runs pass on5952: Chromium111319244756 600082ms/14navigations/23rotations/45pauses/32resets; WebKit111319244836 600858ms/13navigations/21rotations/40pauses/29resets. No uncaught game errors/essential asset failures; global listeners29constant. Bounds1hazard/22debris/150history/18colliders/8fragments/4voices. Measured Chromium60.00FPS/0slow/max33.3ms; WebKit20.99FPS/99.20%slow/max914ms. Blank pages measured about60FPS in both engines. **WebKit performance goal not achieved/proven in traced measurement.** 603968 controlled12s trace-on/off pairs falsified observer overhead (WebKit25.1/29.3 untraced vs26.1 traced; Chromium~60). Both untraced600s runs passed bounds/error checks; full measurements retained in Actions37164021360 jobs111323143522/111323143732. Next isolate native raster vs opaque canvas vs layer clipping using test-only instrumentation, with unmodified default as control.

[Inspected actual5952 captures](evidence/turbo-smash-5952/): crate stack/impact, diagonal warning/dodge,14m boosted clean landing, course summary. Source/merge/project metadata retained. Chromium desktop/Pixel7, desktop WebKit iPhone13/iPad11, EN/es-MX; extra375×667/430×932/390×844/844×390, touch cancel/resize/safe areas, mute/reduced motion, read/quota failures,60s suspended-frame pause/resume. These are browser emulations, **not real-iPhone proof**.

A1–A10 passed on5952; the new wheel-cache and clean-landing-order changes require current browser/unit/capture reruns. A11 previous resource/error bounds pass but performance qualification remains; A1/A12 actual new production route/cache update/save verification remain. Real iPhone background/touch/performance and owner/child fun acceptance remain unverified. After deployment, one phone-only check: open the game, smash, dodge a warned attack, clear ramp2, pause/resume, return and confirm saved progress. No developer tools.

## Iteration and critique

Method1: original main12 frozen normal/checkpoint ramp cases already pass; historical ramp2 power failure was not reproduced. Regression-first minimized floating1.6s warning and Gas losing hold on Turbo focus; complete actual minimal slice ramp→smash→warning/brake dodge→once bank/reload/retry qualified200cases atc825862. Six-type/save milestone455ab5e qualified248cases.

Method2: starter/course/seeds/scripts/simulation/browser/viewport/criteria frozen per comparison. Declared warning durations replaced incorrect fixed waits while exact original reward/collider assertions stayed. Air torque1.5 minimizes route2 rollover397.11m; natural lead460→700 makes coasting attacks threatening while unaided brake escapes pass. Coupled later course runway spacing avoids wall/landing traps. Detailed historical evidence in turbo-smash-full-model.json, hazard-engagement.json, ts-qualification-b50.json, 2c-qualification.json.5952 tests reran changed behavior.

Method3: **second-pass self-review**, no independent reviewer. Reproduced/fixed rollover, warning preview occlusion, paused HUD lag, initial live/save seed divergence, too-safe coasting warning, denied-read autosave overwrite, suspended animation resume. 5952 assertions pass; WebKit measured slowdown remains explicit. Later second-pass model falsified clean stunt reward on damaging750/1000vy landing: bonus previously awarded before impact. Small regression fixture preserved, event-order fix now awaiting actual TS/browser rerun.

Method4: input/physics→collisions→fair spawning→rewards/save→art→browsers/stress/release. After equivalent WebKit contention timeouts,4shards/2workers; same full-course scenario now separate1worker acrossall8projects with unchanged90s assertions. It passes. New reordering tests tracing cost before accepting FPS; preserves original traced evidence and reruns the full600s measurement without trace screenshots. Pause→resume→impact, impact→checkpoint/retry, navigation→return, language/reload, denied-storage/reload sequences covered.

## Reproduction and scope

Node22.12.0 in web:
```sh
npm ci --no-audit --no-fund
npm test
npm run build
npx playwright test --config=playwright.creative-games.config.ts --shard=1/4 --workers=2 --grep-invert 'normal starter plays all three sections'
npx playwright test --config=playwright.creative-games.config.ts creative-games-turbo-course.e2e.ts --workers=1 --grep 'normal starter plays all three sections'
npx playwright test --config=playwright.truck-performance.config.ts --project=webkit-iphone-en
npx playwright test --config=playwright.truck-stress.config.ts --project=webkit-iphone-en
```
Run shards2/4–4/4 and Chromium stress/performance project too. Existing public Actions execute commands; no local shell/browser runner/game skills are available in this tool environment. Firecrawl allowance exhausted, no paid automation/top-ups used.

Scoped changed files: creativeGames modules/tests, FullApp link, shared storage safety boundary/regression, e2e/config/workflows and this handoff/evidence. Inspect PR file list before merge. Existing unrelated unicorn production movement issue156/detached locator and old nicos-adventures Worker failure are historical; no unrelated redesign or infrastructure deletion. Extra spending: **none**.

Latest rendering diagnosis: a599dc source / dd81e1e tested merge, Actions37164842893 performance jobs111325772349(WebKit)/111325772412(Chromium). Default Chrome60.00FPS; WebKit24.93. Tiny wheel-face cache is the single rendering variable under comparison; landing event order is a separate correctness repair with its own fixture. No warnings, physics timestep, course or performance target were removed. Raw603 untraced600s summaries: Chrome60.00FPS, WebKit23.20FPS/95.06%slow/max295ms, all resource/error bounds passed. New candidate results are pending.

Extended second-pass critique:1dcde1 actual3 landing tests passed, but a smaller ordering variation (y335,vy750) in the V8 model still got+5 after earlier body damage. Preserved in evidence/turbo-smash-1dcde1-render-and-order.json. Payment is now deferred until all collisions resolve and requires unchanged damage ledger/parts/no end; five actual TS cases are pending. Native-raster diagnosis is not physical-device evidence. Current candidate must qualify rather than inherit changed proof.

Current f5f60b actual unit proof: CI37166123252/job111329251522,695/695 including5 landing-overlap and2 stable-quality cases;50 seeds1001–1050 still health100/zero hits/all1000m/4patterns/51 brake events. Actual stress jobs111329510961(WebKit)/111329511024(Chrome)600859/600928ms, no errors/assets, bounds1hazard/150history/18colliders/8fragments/2voices/11art faces/listeners29. WebKit slow82.03%,max938ms,low intervalp05=19.79/median25.02/p95=29.59FPS; actual30FPS sustained goal remains explicit. New diagnostic changes test-only, so f5f60b behavior proof stays tied to its source; server checks still apply to currenthead.
