# Nico's World 4

Nico's World is a private, bilingual, kid-friendly creative playground built around robots, animals, monsters, stories, art, pets, dinosaurs, games, missions, memories, Nico's Clubhouse, and short local movies.

The project does not require child accounts, advertising, analytics, open chat, external generative AI, or cloud storage of child content.

## Product principles

- local-first profiles and creations
- English and Mexican Spanish (`es-MX`)
- large touch-friendly controls
- keyboard, focus, and reduced-motion support
- installable offline-capable PWA
- manual JSON profile backup and restore
- no video uploads or video blobs in localStorage

## React PWA

The primary portable client lives in `web/` and is deployed as static assets.

### Application foundation

The React client mounts through one `AppShell` and one canonical local-profile provider. The world, Nico guide, Clubhouse, Showtime, and synchronized Nico surfaces consume the same store instead of creating independent browser-state owners.

Browser profiles use schema v4. The profile includes explicit active robot, pet, and displayed-artwork IDs; strict bounded import normalization; newest-first reward-history retention; backup timestamps; and lightweight Nico wardrobe slots.

See [`docs/PROFILE_SCHEMA_V4.md`](docs/PROFILE_SCHEMA_V4.md).

### Nico's Clubhouse

- **Ask Nico:** a bounded bilingual answer library stored inside the app. Questions are not sent to an AI service.
- **Nico's Real Wardrobe:** one persistent Nico body with nine independent wearable slots: headwear, eyewear, top, outerwear, bottoms, shoes, backpack, badge, and handheld prop. A child drags the garment itself onto Nico, or taps/uses the keyboard. The wardrobe supports remove, replace, undo, redo, reset, randomize, and 26 editable profession presets.
- **Showtime Studio:** select one to three owned characters, choose poses and a scene, add a caption, preview locally, and create a four- to eight-second WebM video with `canvas.captureStream()` and `MediaRecorder`.
- **My Little Movies:** stores only project instructions so a movie can be recreated later. The full video remains in the browser session until downloaded.

The same saved layered Nico is rendered in the persistent guide, Clubhouse header, Ask Nico, World Map, Robot Home, live Showtime preview, and recorded video frames.

See [`docs/NICO_LAYERED_WARDROBE.md`](docs/NICO_LAYERED_WARDROBE.md).

### Core destinations

The web PWA includes:

- World Map
- Robo Lab
- Animal Forest
- Monster Lab
- Monster Habitats
- Art Studio
- Story Castle
- Game Arcade
- Dinosaur Valley
- Robot Pet Workshop
- Robot Home
- Memory Museum
- Badge Observatory
- Parent and Settings
- Nico's Clubhouse

Each browser stores separate local profiles. Saves do not automatically sync between devices and can be erased by private browsing, browser-data cleanup, or device reset. Important progress should be exported from Parent and Settings.

## Streamlit client

The Streamlit app remains the richer session-state experience for the original World 4 activities, including the large robot and monster builders, living campaign, animal library, habitats, stories, art, games, dinosaurs, pets, Robot Home, Memory Museum, badges, and parent tools.

Streamlit includes a privacy explanation and link to the web Showtime Studio. It does not upload Streamlit profile content into the web client.

The Streamlit and web profile formats remain intentionally separate. The web migration rules are documented in [`docs/PROFILE_SCHEMA_V4.md`](docs/PROFILE_SCHEMA_V4.md); intentional client differences remain documented until the dual-client consolidation phase.

## Shared catalogs and architecture

Canonical JSON catalogs are used where practical for professions, Showtime options, local Ask Nico knowledge, and other shared data. The system-wide school-showcase program is tracked in [issue #40](https://github.com/BoneManTGRM/Nicos-Adventures/issues/40).

The active delivery order is:

1. platform reliability and schema-v4 foundation
2. true one-body layered Nico wardrobe
3. asset/media pipeline and browser-level tests
4. World Map campaign and destination depth
5. safe contextual Ask Nico and Showtime polish
6. School Showcase Mode
7. dual-client consolidation

## Local privacy

- Profiles are stored in browser localStorage in the web PWA.
- Ask Nico exchanges remain in React memory and are not uploaded.
- Speech uses the browser's local Speech Synthesis API.
- Showtime recording happens in the browser.
- Movie video blobs are never written to localStorage or exported in profile JSON.
- No analytics or advertising SDK is included.

## Run Streamlit locally

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e '.[dev]'
streamlit run app.py
```

## Run the web PWA locally

The supported Node version is pinned in `.node-version`, `.nvmrc`, and `web/.nvmrc`. Web dependencies are exact-pinned in `web/package-lock.json`.

```bash
cd web
npm ci
npm run dev
```

## Validation

```bash
ruff check .
pytest
python -m compileall app.py activities api core ui
cd web
npm ci
npm test
npm run build
```

The web build runs Cloudflare routing validation, release-contract validation, schema and layered-wardrobe validation, TypeScript, and Vite before creating `web/dist`.

## Production deployment

Production uses a **Cloudflare Worker with static assets**, not a child-data backend.

```text
Production branch: main
Root directory: /
Build command: npm install --prefix web && npm run build --prefix web
Deploy command: npx wrangler deploy --assets=web/dist --name nicos-world --compatibility-date=2026-08-01
```

The authoritative SPA fallback is in `wrangler.jsonc`. Do not add a catch-all index rewrite to `_redirects`; Cloudflare rejects the duplicate as an infinite loop.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for complete build, dry-run, cache, and troubleshooting instructions.

## Showtime technical notes

See [`docs/SHOWTIME_STUDIO.md`](docs/SHOWTIME_STUDIO.md) for the local recording architecture, project metadata contract, browser support, and privacy boundary.

## Add an activity

See [`docs/ADDING_AN_ACTIVITY.md`](docs/ADDING_AN_ACTIVITY.md).
