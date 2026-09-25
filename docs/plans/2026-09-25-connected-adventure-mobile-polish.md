# Connected Adventure & Mobile Polish Implementation Plan

> **For agentic workers:** Execute the four tasks inline. Preserve reviewed artwork and the completed toy-store release.

**Goal:** Make the existing adventure easier to enter, navigate and connect to saved creations on phones.

**Architecture:** Existing React/local-profile application, shared four-action navigation, a pure next-adventure resolver, and transient creation-opening intent. No profile schema change, backend, new content service, new artwork, or payment integration.

**Tech Stack:** Existing TypeScript/React/Vite, Vitest and Playwright, GitHub PR/Cloudflare release workflow.

## Global Constraints

Only BoneManTGRM/Nicos-Adventures. Base b2eff7afa7895880df78ce6fbc7a41533909280d, recovered from the exact CI source archive (SHA-256 95ab4da78dcf8848424728e41ab5afa48a074ef26d55b2d245976e7f383abeb5). No open PRs at recovery. Preserve English/es-MX, artwork, all destinations, local saves/rewards, backup/restore, offline games and zero-provider-request closed store. No new worlds, paid services, analytics, sales, external contact or schema migration. The local source checkout is isolated; GitHub DNS is unavailable locally, so commits use the authorized connector and pinned real-browser verification uses existing CI.

Baseline: npm test, 381 tests/67 files passed. Existing app has an indirect first mission action, icon-only mobile bottom navigation, and saved creations without direct return-home/open-exact-item actions.

## Task 1 — Direct adventure entry and first-screen hierarchy

- [ ] Add rendered UI tests proving the current first-player action and introductory copy need changing; observe assertion failures before implementation.
- [ ] Add next-adventure resolver with exhaustive step mapping: briefing starts via existing REVEAL_BRIDGE; preparation steps return to lab; repair steps open bridge; complete returns home. No progress/rewards are changed by the resolver.
- [ ] Lead WorldMap with one contextual adventure button plus Create and Explore. Keep existing illustrated map, mission entry, video and destination catalog available; use full-width destination grid and move secondary team/video below exploration.
- [ ] Unit-test every step and both locales, then browser-test fresh start, resume, completion and unchanged locks.

## Task 2 — Consistent navigation and mobile layout

- [ ] Replace common navigation with Explore/Create/Home/More labels, shared by compact play navigation and non-play bottom navigation. Keep gameplay scene free of fixed bottom chrome as today.
- [ ] Create/More open native modal dialogs with explicit close, Escape, focus return, readable choices, and no third-party data. Suspend existing movement controls when the navigation opens; do not automatically resume active games.
- [ ] Keep all 16 existing destination entries reachable. Move settings/collections/help into More. Update only existing test interactions that legitimately change (open More before Settings), retaining every original backup/restore assertion.
- [ ] Verify labeled 44px targets, narrow mobile widths, focus containment/return, keyboard routing and unchanged game geometry.

## Task 3 — Saved creations lead home

- [ ] Add a post-save artwork action to view the already-displayed work at home; never save twice or award duplicate stars on navigation.
- [ ] Add a saved-story return-home action and a small home bookshelf opening the exact saved story. Add exact-artwork editing from home and actionable empty pet/art states.
- [ ] Use optional initial item IDs and in-memory route intent, not a new storage schema. Missing/deleted IDs fall back to the existing new-item flow. Preserve legacy saved story pages/choices.
- [ ] Replace the unattainable two-robot goal in the current simplified Robo Lab UI by omitting that unclaimable goal; retain all prior completed-goal records and earned stars.
- [ ] Add compact preview/tools/gallery jump links and responsive art controls without hiding existing editable controls or changing images.

## Task 4 — Copy, qualification and release

- [ ] Replace developer-facing catalog language with child-facing bilingual verbs; keep canonical destination names/IDs and counts.
- [ ] Run focused and full unit/type/build/output/budget checks, browser matrix and unchanged regression workflows. Capture actual mobile/desktop screenshots; record self-review honestly.
- [ ] Publish one focused branch/PR, inspect pinned-browser results, merge only current verified head after relevant checks pass, then verify exact-main Cloudflare/domain and store/game checks.
- [ ] Record implemented/tested/merged/deployed separately. No physical child-testing or independent-review claim unless actually performed.

## Product decisions and exclusions

The approved recommendation determines these priorities. No new chapter, story-to-movie conversion, public sharing, monetization, invented photos or live catalog change is part of this release. Actual supervised child testing and physical-iPhone testing remain unperformed. Product/seller approvals still gate opening the separate store.
