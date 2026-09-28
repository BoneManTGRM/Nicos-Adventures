# Learning Lab qualification checkpoint

Baseline: main `2edf1458813442756253c8b81369fa8a3b23ccb8`, clean initial checkout.
Branch: `feat/learning-lab-robot-rescue`. Baseline schema v4; supported Node >=22.12;
local test runtime Node 24.19.0; CI pins 22.12.0. No AGENTS.md found in repository.
The documented main-only deployment assumption proved false: Cloudflare deployed the
unmerged branch. The tutor flag remains off. See the incident and latest evidence below.

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
- No paid service, provider key, account or hosting upgrade was activated. Branch
  publishing unexpectedly triggered production deployment. Hosting costs were not inspected.

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

## Current verified candidate — 2026-09-28 01:15 UTC

Remote `b8f70259ef5fb404d7e29a7e8546e0c64fc43917`; local `7d5d01684ea2a68663bc8a6468cec484506ce062`; identical tree `74609239ad8ebe535aa4b8cc24b2e219534cc81f`.
All 13 GitHub Actions workflows completed successfully. Learning Lab run 36364508853,
job 108748133611: 458 unit tests /79 files and 16 Chromium/WebKit browser cases PASS.
Creative Studio regression and all existing triggered browser suites PASS. Local final
build/typechecks/release manifest/performance budgets PASS; main JS 131,202 B gzip,
main CSS 29,209 B gzip. These results supersede historical pending results above.

Cloudflare reports failed deployments for both b9160f01 and b8f70259. Latest live
release.json still identifies d4673aedea3a03b74328a7b45278a14c84c4cfaa. Exact Cloudflare
failure logs remain inaccessible; failure attribution to the guard is not proven.
No merge, hosted enabled preview, rollback or tutor activation occurred.

## Acceptance matrix

| Gate | Status | Evidence / remaining gate |
| --- | --- | --- |
| A1 Integration | BLOCKED | Preview route renders in both languages; complete navigation acceptance remains. |
| A2 Lessons | BLOCKED | All 48 literal answer checks pass; full six-mission rendered interaction coverage remains. |
| A3 Learning records | PASS | Assisted checks, historical independent results, transfer and idempotent rewards unit tested. |
| A4 Voice safety | PASS | Local selection, remote fallback, delayed voices, stale callbacks and stalled-engine browser checks pass; physical OS behavior is outside this evidence. |
| A5 Actual voice quality | NOT TESTED | Physical iPhone owner listening required in both languages. |
| A6 Data integrity | BLOCKED | Unit import/reset/quota/profile/stale/reward checks and browser reload pass; simultaneous-tab conflicts outstanding. |
| A7 Offline | BLOCKED | Chromium offline reload and WebKit stopped-origin/negative-control pass; physical iPhone offline voice remains untested. |
| A8 Privacy/cost | BLOCKED | Remote-only browser no-new-outbound check passes; full differential network and device offline tests pending. No new paid services activated. |
| A9 Accessibility | BLOCKED | Browser geometry, target sizes and language selector pass; text enlargement, keyboard and physical-device review incomplete. |
| A10 Engineering | PASS | 458 unit tests, 16 feature browser tests, build/typechecks and all 13 triggered CI workflows pass on identified candidate. |
| A11 Regressions | BLOCKED | All triggered existing suites pass; complete frozen baseline/candidate differential coverage remains. |
| A12 Release | BLOCKED | Unintended earlier production deployment; guard candidates failed deployment; dashboard inaccessible. No isolated enabled preview or authorized activation. |

## Next concrete work

Restore Cloudflare dashboard access through legitimate owner sign-in; inspect exact
build commands, branch triggers and failure logs. Restore the known-good deployment
with the documented data precaution, then configure the existing authorized preview
process. Do not remove the branch guard to make an unsafe deployment green. Finish
remaining acceptance evidence before requesting exact-target production approval.
The owner needs a phone-friendly preview for listening, not terminal work or secrets.

## Deployment incident and protective guard — 2026-09-28 UTC

Cloudflare deployed draft branch commit dece07ec898f5d80e0be0fd3ec48c8b47180b13f to nicos-world.com despite the documented main-only process. The Learning Lab flag remained off, but shared code changed. Dashboard access is blocked by a recurring human-verification challenge. No merge or activation was authorized or performed.

A repository prebuild guard now rejects Workers Builds unless WORKERS_CI_BRANCH is exactly main, including missing branch metadata. It uses the documented WORKERS_CI variables (https://developers.cloudflare.com/changelog/post/2025-06-10-default-env-vars/). Seven command-level tests failed before implementation and pass afterward. The actual npm build command with synthetic Workers feature-branch metadata exits 1 during prebuild, before assets are built. This is defense in depth, not proof of dashboard configuration, restoration, or preview isolation. Local/GitHub validation is allowed. Known-good rollback revision remains 2edf1458813442756253c8b81369fa8a3b23ccb8.

The guard must be observed stopping an actual Cloudflare branch build before further candidate publishing. Existing running builds are not canceled by this source change. Cloudflare account access is still needed to inspect triggers and restore a known-good deployment safely. Physical iPhone voice quality remains NOT TESTED.

### Follow-up verification and repairs

- Live release.json subsequently identified d4673aedea3a03b74328a7b45278a14c84c4cfaa. Do not infer that production is still at the initial leaked branch revision.
- Guard-only remote candidate: b9160f015aa6023f639020db154fb20127532463, tree 4984a0538bfd75b50f83e042c88c8cf547242bc7. No tutor activation.
- Local unit suite: 458 tests / 79 files PASS after integrating the seven guard tests into Vitest. App and e2e typechecks, build, release-manifest validation and unchanged performance budgets PASS.
- CI Creative Studio showed missing Pause control. Restored the existing control by default; tutor explicitly opts out and keeps Stop/Repeat. Existing browser regression retained for verification.
- CI lesson language selection timed out despite a visible combobox. Added explicit bilingual aria-label; the same exact-label test is retained.
- CI WebKit offline reload returned an internal engine error. Existing pet offline suite documents the same pinned WebKit limitation (Playwright #42775). Extracted its loopback-only stopped-origin helper for reuse; lesson test requires successful service-worker navigation with origin stopped and failed navigation in a separate context with workers blocked. Chromium retains browser offline mode. This is a test-mechanism correction with explicit limits, not physical offline certification. Browser rerun pending.

## Owner configuration evidence and continued qualification

Owner screenshots IMG_2969/IMG_2970 show production branch main but Version command
`npx wrangler deploy`. This explains why non-production builds could activate the
production Worker despite the main setting. Official Cloudflare deployment-management
documentation distinguishes deploy from versions upload. Owner reported saving
`npx wrangler versions upload` on September 27 around 20:40 Mexico City time.
This is owner-reported configuration, not an independent dashboard readback; shared
browser access still encounters human verification. Do not mislabel that report as
an executed preview or restored production. Preserve the source guard until a safe
preview path is qualified, including the second nicos-adventures integration.

Application candidate 48040adb passed all 13 GitHub workflows, 458 unit tests and
20 browser cases. The 20 cases include all six missions in both bands, both locales,
worked examples, hints, alternative explanations, retries, independent checks,
completion/reload and exact canonical star/completion totals without repeat grants.
New accessibility test candidate 4151fa09 adds keyboard Enter/Space interaction,
320px text-enlargement geometry and landscape checks; its result is pending.

Accessibility red run 36370860196: 20 prior cases passed, four enlarged-text cases
failed horizontal overflow. Failure screenshot showed the sticky world-header
language button extending beyond the narrow viewport; the lesson hero also needed
shrinkable grid tracks. Small repair scopes wrapping topbar controls, heading text,
voice selects and shrinkable hero columns to the Learning Lab; no overflow clipping
or acceptance threshold reduction. Same regression is retained for rerun.

## Version qualification path — September 28

Owner screenshots confirm nicos-world Version command `npx wrangler versions upload`.
Owner reports saving non-production builds OFF on the separate nicos-adventures Worker
(after IMG_2977 showed the unchecked setting awaiting Save). The source allowlist now
admits only main and feat/learning-lab-robot-rescue; all other/missing Workers branches
still fail closed. This intentionally supersedes the temporary main-only hold.

The tutor branch builds with a version-only runtime hostname check. Custom production
domains and the unprefixed Worker URL remain disabled even if this bundle is mistakenly
activated. Local explicitly enabled test builds keep their existing behavior. Wrangler
explicitly enables version URLs; name remains nicos-world. This uses the existing
versions-upload workflow to inspect a specific static version, not a new Worker or
resource-isolated environment. There are no Worker bindings in the repository config.
Cloudflare describes version URLs as sharing configured resources; no backend resource
is introduced here. Reference: https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/.

Red: approved branch rejected and hostname helper absent. Small change: exact branch
allowlist, Vite version flags and pure hostname boundary. Counterexamples: production
custom/Worker hostnames, unrelated hosts and deceptive suffixes. Focused checks: 10 pass.
Actual Workers-metadata build passes type/release/performance gates; main JS 131367 B
gzip, CSS 29209 B. Full unit results and uploaded revision follow in PR evidence.
A successful version upload and unchanged production release must still be checked.
No merge or production activation is authorized by this qualification step; physical
iPhone audio and offline listening remain pending. Shared Cloudflare dashboard still
requires human verification. No paid services activated.

## Owner listening feedback and presentation repair

Owner listened on iPhone and found Daniel en-GB and Rishi en-IN acceptable; other
tried voices were disliked. This is partial English listening evidence, not acceptance
of Spanish, offline audio, pacing or Stop/Replay. Owner requests a better en-US voice.
Apple settings voice list and actual Safari availability remain device-only evidence.
No voice is assumed installed or human-sounding based on its name.

Screenshot also shows dark supporting text against the dark page. Repair adds a
contrasting footer panel, moves speech controls above the exercise, and offers explicit
shortcuts only for browser-reported available local Daniel/Rishi or enhanced/premium
en-US voices. No automatic voice override or remote fallback. Authored counting,
comparison, arithmetic, pattern and debug values now have object/tile representations;
answer IDs, scoring, hints and progression remain unchanged. Count dots appear only
once visually. All 465 existing units passed before the final three diagram checks;
three focused diagram cases pass. Build/type/release/performance results are in PR.
No full redesign or owner approval is claimed. Previous version30fa7809 Learning Lab
CI36376924772 completed successfully. This presentation revision needs hosted review.

## Teaching and bilingual word rescue expansion

Owner requested more effective, playful English and Spanish teaching. Added Word
Rescue as the initial Lab activity: four authored words (robot/key/door/battery),
picture practice, and two distinct sentence checks, including a new robot-needs-a-
battery context. Both learning directions have separate bounded local records under
optional learningLab.languageRescue. No age, microphone, raw writing or service.
This small activity is vocabulary practice, not a complete language course or a
fluency assessment. Replay retains historical results, without new rewards.

Math retains all 48 items. Twelve three-step worked demonstrations and assisted
object/sequence/debug workspaces now support explanations. Opening a workspace
uses existing alternative-help transition before interaction; independent credit
cannot be earned from that assisted attempt. Disposable workspace marks are not
stored. Incorrect responses remain retryable; specific correct feedback now appears.

Separate read-only reviewer found wrong English 'second C' instruction and ambiguous
subtraction wording; both corrected to step-two symbol and total eighteen seats.
Reviewer also requested replay and interface-language voice controls; both added.
Voice narration continues in the learning target language with local voices only.
Voice controls default to existing behavior for other destinations.

Rollback precaution: old engine normalization drops the new languageRescue field.
Disable the activity/UI while retaining current normalization for data-compatible
rollback. Do not deploy an older parser after language progress exists without a
backup/preservation migration. Existing canonical backup/reset/profile boundaries
remain; simultaneous-tab last-write-wins limitation is unchanged.

## Arcade language practice — 2026-09-28

Added preview-only Word Match (eight bilingual words in two four-pair rounds) and Sentence Builder (four English/Mexican Spanish phrases). Touch and keyboard controls, useful mismatch feedback, optional examples, no timers or mandatory speech. Completion bests use existing canonical `arcadeScores` keys `learning:<game>:<target-language>`; round state is intentionally session-only. No new rewards, dependencies, network services, microphone, or paid resources. Existing Arcade games remain present.

Verification: red missing-module test, then three new deterministic engine tests green; full suite 476/476 across 84 files. Type checking caught an unsupported `saving` status; removed that branch to match the canonical store. Clean production build/type/release/performance checks passed: main JS 131876 gzip bytes, CSS 29209. An initial build saw stale duplicate output chunks; repeated clean output passed without changing budgets. Local browser execution blocked by missing Playwright browser executables (four launch failures, not application assertions); browser CI must run on the published candidate. Prior candidate ab0b831d had all 32 Learning Lab browser tests pass.

Owner says voices are still poor. A5 remains FAIL / not accepted. Arcade games require no speech; this does not resolve the tutor voice-quality gate. Production activation remains pending. Rollback: keep the existing feature disabled; additive score keys do not change profile schema or erase other games.

Separate read-only reviewer found score-table capacity loss, foreign word-card accessible language, and overly broad completion copy. Repair: refuse a new score key at the existing 100-key limit with an explicit session-only notice, preserve existing keys, label word/picture cards with correct language, and use game-specific completion. Capacity regression failed before helper implementation and passes afterward; full suite now 477/477. No capacity limit raised and no old score evicted.

Arcade candidate d82e495b: Learning Lab CI36413200367 passed all477 units and36 browser cases (Chromium and automated iPhone WebKit, both interfaces). Hosted preview dbb83ada verified. Separate pet regression CI36413200396 failed one touch-target assertion: measured43.61035px versus required44px immediately after a scene tap. Existing shared `.fw-app button:active` scales to .97; smallest repair disables that transform only for Pet Workshop buttons, preserving their existing44px hit areas and leaving test criteria unchanged. The unchanged browser regression must rerun on the new candidate. This is not a pet data-loss finding.

## Owner screenshot repair — September 28, 11:27 UTC
Owner rejected the presentation despite green CI. Sentence Builder placed settings and record explanations before the puzzle; Clubhouse sent bare numeric replies to unrelated FAQ fallback. Moved secondary Arcade records/instructions into an accessible disclosure below play, shortened the prompt/header, compacted phone controls. Learning Lab removes duplicate Word Rescue introduction, compacts hero/activity navigation, moves math audio settings after the activity, and no longer reports perpetual Saving for idle storage. Clubhouse routes exact authored choices to the current challenge; a bare number without a challenge offers context rather than calling it unsafe. General-world suggestions are in a disclosure. No unrestricted answer grading or cloud calls added.
477 existing unit tests and clean build/type/performance pass. Added browser regressions for bare numeric context and typed active numeric answer; execution on new published candidate pending. Voice naturalness remains rejected; these repairs improve interaction/layout, not voice synthesis.

## 2026-09-28 — Larger sentence bank and suggested Cambridge levels

- Expanded Sentence Builder from 4 to 80 original bilingual sentence pairs (20 four-item rounds). Round picker exposes all content; Another round advances within the selected pool. Existing best-round scores remain out of four; no schema or reward change.
- Added suggested English practice pools: Pre A1 Starters, A1 Movers, A2 Flyers, 16 pairs each. Spanish is translation practice, not a Cambridge Spanish qualification. These are independent activities, not an official course, full syllabus, placement test, or certification. Levels change by explicit choice and start a fresh round.
- Source guidance: Cambridge English Young Learners overview https://www.cambridgeenglish.org/exams-and-tests/qualifications/young-learners/paper/ and 2024 handbook https://www.cambridgeenglish.org/Images/357180-starters-movers-and-flyers-handbook-for-teachers-2024.pdf (indexed grammar excerpts: Movers comparisons/past simple; Flyers past continuous/present perfect/future). Full PDF retrieval exceeded tool size limit. Groupings are approximate; no teacher or native-speaker validation claimed.
- Content self-review covered all displayed translations and token sequences. Repeated identical tiles exposed identity-only grading: failing regression reproduced rejection of a valid sequence, then value-based comparison plus unique bounded tile IDs repaired it. Feedback now uses the same comparison. Invalid reused tiles remain rejected.
- Executed: bank expansion regression red (4 vs 48); repeated-word regression red; final 480 unit tests pass. Build includes application/e2e type checks, release and performance gates. Added browser coverage for switching level and round; execution awaits candidate CI.
- No voice, network, service, or deployment-setting change. Owner iPhone voice-quality gate remains unresolved. Production activation remains gated.

## 2026-09-28 — Owner removes tutor voices

Owner explicitly requested voice removal after rejecting quality. This supersedes the original tutor voice requirement: Learning Lab, Word Rescue and Learning Lab parent panel now have no narration hook, playback buttons or voice selection. Entering/exiting the Lab cancels shared narration. Text, visuals, lessons, scores and existing unrelated character speech remain intact. No migration or paid replacement.

Replaced tutor speech acceptance cases with absence-of-controls and no-speech-API lesson operation checks; shared speech-controller unit coverage retained for other app features. 480 unit tests and clean build/type/release/performance checks passed. Candidate browser checks remain pending. Voice naturalness is no longer a gate for this owner-requested text/visual tutor; other release gates and exact-target approval remain applicable. Not yet activated on production.
