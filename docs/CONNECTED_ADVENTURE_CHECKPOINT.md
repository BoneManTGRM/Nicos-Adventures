# Connected Adventure & Mobile Polish — 2026-09-25

Repository: BoneManTGRM/Nicos-Adventures. Continue PR #137 and branch
`feat/connected-adventure-mobile-polish`; do not restart the completed store
or change the separate NICO assessment repository.

## Implemented and preserved

The first commit `1e677796a22eefcf6c7feb40174d8694980528d7` adds direct contextual
adventure entry, three clear opening choices, shared labeled navigation,
Create/More dialogs, exact saved-art/story links through Robot Home, useful
empty states and child-facing English/es-MX copy. The initial tree exactly
matched the locally tested source. All illustrations, 16 destination entries,
profile schema, save/reward logic and the empty sales-disabled store remain.

## Evidence and critique corrections

Baseline: 381 unit tests. Initial implementation: 413 passed in 68 files;
complete type/build/release/public-output and unchanged performance budgets
passed. Test-first rendered cases and compatibility findings are recorded in
PR #137. No local browser-navigation success or independent review is claimed.

The initial Connected Adventure CI run `36178453346`, job `108214701899`,
completed with 24 passed and 12 failed. Artifact `10883367815` was downloaded
and verified: SHA-256
`30533e757225e9f154a5893ffedc14fd46598d2edae1b16dcb9cc3980e51a495`.
All six browser/language profiles exposed two issues: Tab escaped the menu
boundary, and the caption textarea lacked an explicit label association.
Do not erase or describe this attempt as green. All nine existing workflows
passed, including the 66-case store matrix (artifact `10883576932`, SHA-256
`57741861a9061690fe31a7aa023835f26c5735dc28163c14e599ce7a92c5af3d`).

The follow-up retains the same assertions and corrects application behavior:
wrap Tab/Shift+Tab at dialog boundaries, deliberately focus the opening button
for reliable return on touch browsers, and name the caption through a distinct
label span. Keyboard coverage also checks reverse traversal. Actual iPhone
screenshots revealed the floating guide overlapping a secondary first-screen
card description; the mobile layout omits redundant secondary descriptions
while retaining the visible choice titles and guide. Geometry checks reject
any overlap between the three choice buttons and the guide.

Review also found unchanged service-worker bytes would leave returning
browsers on the previous precache despite new lazy feature chunks. Three
actual-worker lifecycle tests failed before the v25-to-v26 cache-generation
change and passed after it. The worker's privacy, fetch and profile behavior
are otherwise unchanged. These are lifecycle-boundary tests, not physical
phone offline-upgrade certification.

Follow-up local checks: 416 unit tests in 69 files passed. Complete build,
public-store output and creative budgets passed. Main JavaScript 126486 bytes
gzip, main CSS 29925 bytes; existing limits were not increased. The existing
large-chunk build warning remains. Local build receipt uses the isolated
snapshot commit; only CI can establish the actual candidate release identity.

## Remaining release gates

Require the corrected exact-head 36-case browser matrix, all relevant existing
workflows, actual rendered screenshot inspection and recorded review before
normal expected-head guarded merge. Then verify the exact main revision on
Cloudflare nicos-world and run the live connected and store/game checks.
The newest PR receipt must state committed, merged and deployed separately.
Review is implementation self-review unless an independent reviewer actually
participates. Physical-phone and parent-supervised child testing are unperformed.

No product photos, prices, adult public contact or sales permissions were
invented. Store launch still requires those owner inputs. The separate failing
Cloudflare nicos-adventures service is not repaired or bypassed by this release.
