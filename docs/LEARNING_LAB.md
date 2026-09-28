# Nico’s Learning Lab — preview implementation

## Scope and entry

Robot Rescue is an authored, deterministic adventure in the existing React app.
Six missions have two bands and four distinct items per band: two practice items,
a check, and a transfer check. No chat, microphone, account, paid model, or backend
was added. `web/src/learning/lessons.ts` is the bilingual content contract. Stable
IDs are `mission:band:position`; positions 2 and 3 are the independent checks.
Constrained answer IDs, not translated labels or option position, determine grading.
Every distractor has feedback and each item has two hints and another explanation.
The Spanish received implementer semantic review, not native-speaker certification.

`VITE_LEARNING_LAB_PREVIEW=true` enables a preview build. Development also enables
it. Ordinary production builds leave navigation and the lesson screen disabled.
Entry: World Map destination or More → Nico’s Learning Lab. Parent & Settings
contains summaries, voice preview, and confirmed tutor-only reset. The existing
parent settings are accessible navigation, **not authenticated parental access**.
No production setting or hosting account was changed by this implementation.

## State and records

Canonical schema v4 has an optional additive `learningLab` object with its own
`version: 1`. Missing old records stay missing until use. Imports normalize known
mission/item IDs, bounds, phases, results and rewards; arbitrary imported content
is not rendered. Existing backup/restore includes this object. No raw answers,
conversation, audio, timestamps per answer, or unrestricted history is stored;
`lastAnswer` is a bounded authored option ID for resuming current feedback.

The state machine uses introduction → attempt/check → hint/feedback → retry/next
→ completion. Difficulty selection changes the **next** item. Changing language
does not change the item ID, accepted answer or progress. Attempts are capped at 99.
A wrong attempt, hint or alternate explanation marks that item assisted. Successful
unassisted check flags are historical evidence from these activities and remain
recorded when a later replay uses help. Two distinct checks in the same mission
and band, including transfer, are needed for the bounded “demonstrated” label.
This is not validated educational assessment or a claim of general mastery.

Profile-ID and progress-fingerprint guards reject stale and duplicate actions.
Completion uses existing `completeOnce` plus a bounded tutor reward ledger. Reset
preserves both ledger and existing stars so replay cannot award again. The provider
continues to report save errors; the Lab explicitly says session only/not saved.
Existing storage-event synchronization remains in use. It is not transactional
multi-tab merging: use one active editing tab. Simultaneous-tab conflict acceptance
is still outstanding, and no cross-device synchronization is claimed.

## Speech boundary

All active narration uses the existing hook plus a shared engine owner. A new
narrator cancels the prior owner. Every utterance receives an explicit browser
voice object with `localService === true`, rechecked before use. Spanish defaults
only to es-MX; another Spanish locale requires a labeled selection. English uses
local English voices. No browser default/remote fallback is sent text.

Only explicit Repeat/Preview starts Lab audio. Navigation, profile/language change,
page hiding, reset, new playback and errors invalidate old callbacks. Each chunk
has a 30-second watchdog and no automatic retry. Stop/Replay is exposed; the former
Pause control is removed. Authored symbols have explicit spoken equivalents.
Voice preferences retain the existing browser-local preference store and rate
bounds. They are device preferences, not claimed to travel with profile backups.
The historical unused CreativeWorld StoryCastle speech path now uses the same hook.

Browser metadata does not certify OS behavior or voice quality. Actual iPhone
English/Spanish listening and offline audio remain unverified. Text-only fallback
is not acceptance of the requested natural voice quality.

## Privacy, performance and offline

No new dependencies, service calls, permissions, or paid resources. Existing visitor
counter traffic is a baseline exception; a full baseline/candidate network comparison
is still required. No zero-hosting-cost claim is made. Lesson UI/CSS is lazy loaded;
small bounded content is currently included with persistence normalization, adding
to the main bundle rather than being entirely lazy. Existing budgets are unchanged.
The current service worker caches delivered assets and the generated offline manifest.
First-load and offline speech limits are shown in the UI. Offline browser acceptance
must execute before release.

## Verification and release gate

See LEARNING_LAB_CHECKPOINT.md. Tests cover all 48 literal expected answers, state
transitions, assisted/independent outcomes, stale profiles, duplicate completion,
reset/replay reward behavior, imports, quota errors and fixed-seed action permutations.
`playwright.learning.config.ts` owns the enabled-preview browser matrix; the normal
browser suite retains a disabled production feature. The Learning Lab workflow uses
existing GitHub CI, read-only permissions and synthetic test profiles.

Do not enable production until browser, privacy, accessibility, offline, current CI,
physical-device listening and applicable owner approval gates have passed. No new
paid service or hosting upgrade is authorized.

## Recovery

Known-good revision: `2edf1458813442756253c8b81369fa8a3b23ccb8`.
Preferred rollback: keep this additive storage reader and build without the preview
flag. This hides the UI without deleting records. **Do not roll back storage.ts to
the pre-feature normalizer after users save tutor data**: the old allowlist drops
unknown fields on its next save. A full older-code rollback requires preserving a
current profile backup and/or retaining the additive normalizer first. Backup/import
and UI-disable retention are unit checked; hosted rollback is not exercised yet.

## Owner listening checklist (only after a hosted preview exists)

1. Open the preview on iPhone Safari. In the Lab open Voice & reading, choose a
   labeled local English voice, and tap Preview then Repeat on a lesson.
2. Switch to Español de México. Confirm the actual voice locale; explicitly choose
   another region only if desired. Listen for understandable numbers and instructions.
3. Check Stop immediately silences narration and Repeat starts only when tapped.
4. After loading, try airplane mode and repeat; record text and audio separately.
5. Repeat in the installed home-screen app. Judge whether each voice sounds natural
   enough. Report the locale and any issue; no code debugging is requested.
