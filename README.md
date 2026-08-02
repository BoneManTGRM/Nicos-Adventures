# Nico's World 4

**Nico's World** is a private, kid-friendly adventure playground built around a custom robot
sidekick and an expanding world of animals, monsters, art, stories, pets, dinosaurs, games,
missions, and memories.

The project does not require a child account, advertising service, analytics tracker, open chat,
or external generative-AI service.

## Static bilingual website

The React/Vite progressive web app under `web/` is now a fully static, local-first website:

- no FastAPI, Render, server process, database, Cloudflare Function, or paid compute is required
- all fourteen destinations have English and Mexican Spanish names, descriptions, activities, and
  controls
- each browser automatically stores independent player progress in local storage
- multiple named player profiles can share one device
- each friend who opens the same public URL receives a separate save in that friend's browser
- stars, destination visits, mission completion, language, robot level, and profile settings save
  after every change
- player profiles support JSON download and import for manual backup or transfer
- the service worker provides an installable, offline-ready PWA after the first successful load

Local browser saves do not sync between devices and can be erased by private browsing, browser-data
cleanup, or device reset. Important progress should be downloaded from the Parent screen.

### Cloudflare Pages deployment

Use a static Cloudflare Pages project, not Pages Functions:

- root directory: `web`
- build command: `npm run build`
- output directory: `dist`
- production branch: `main`

The included `web/public/_redirects` file provides the SPA fallback. The included `_headers` file
adds security and cache headers. Static deployment requires no runtime environment variables.

## Current Streamlit experience

- **Living World Map:** a seven-stage world that visibly grows as Nico creates, explores, and
  completes a twenty-mission campaign.
- **Robo Lab:** build and edit robot friends from more than 220 physical choices across fourteen
  categories, with colors, patterns, finishes, personalities, voices, jobs, XP, and memories.
- **Mecha Art V3:** layered inline-SVG robots with five body frames, mechanical joints, armor,
  reactors, wings, thrusters, materials, lighting, and animations.
- **Animal Forest:** explore 64 built-in animals balanced across eight habitats, with wildlife
  photographs, field guides, quizzes, expeditions, discoveries, favorites, and kid-created entries.
- **Monster Lab:** build monsters from 120 physical choices across ten categories, plus eighteen
  colors, patterns, textures, powers, personalities, editing, animation, and safe old-save
  migration.
- **Monster Art V2:** adds ten inferred creature families, stronger silhouettes, expression layers,
  highlights, shadows, family ornaments, atmospheric particles, scene lighting, and polished
  collection cards without changing saved monster parts.
- **Monster Habitats:** create themed homes, choose food and toys, record visits, and grow a
  persistent friendship level with each monster.
- **Art Studio:** make original illustrated posters from backgrounds, frames, subjects, captions,
  and stickers; display them in Robot Home or attach them to stories.
- **Story Castle:** create illustrated English, Spanish, or bilingual stories starring saved
  robots, animals, monsters, and robot pets.
- **Game Arcade:** six replayable learning games covering animals, patterns, robot memory,
  dinosaurs, navigation, and arithmetic.
- **Dinosaur Valley:** complete expeditions, discover twelve prehistoric animals, recover fossils,
  use team abilities, and play field-guide challenges.
- **Robot Pet Workshop:** customize eight kinds of companions, choose colors and accessories,
  build bonds, train tricks, and select an active pet.
- **Pet Art V2:** replaces emoji cards with eight distinct layered SVG species, mechanical anatomy,
  expressive faces, accessories, energy cores, scene lighting, bond displays, and action-specific
  animations.
- **Robot Home:** a layered headquarters with eighteen visible decorations, six room themes,
  weather and lighting controls, robot interactions, a featured-art gallery, and an illustrated
  companion corner.
- **Memory Museum:** review the complete timeline and every major collection, including robots,
  animals, monsters, habitats, artwork, stories, illustrated pets, dinosaurs, fossils, and campaign
  progress.
- **Badge Observatory:** track stars, explorer levels, badges, and milestones.
- **Parent & Settings:** language, local browser read-aloud, reduced motion, diagnostics, bounded
  recovery snapshots, three in-session save slots, and private backups.

## Shared responsive layout

Every Streamlit destination uses one alignment system for page width, spacing, columns, cards,
forms, metrics, buttons, tabs, preview stages, desktop layouts, tablet wrapping, and phone stacking.
The monster, pet, robot, artwork, and room stages share consistent visual bounds so controls and
previews align more predictably across the app.

## Connected progression

Customization choices now affect adventure readiness. Existing robot parts and monster traits are
used to infer abilities such as:

- scanner
- translator
- aquatic travel
- strength
- flight
- repair
- creativity
- monster magic
- teamwork

The twenty campaign missions use progress from across the entire app rather than operating as
isolated checklists. A built-in seasonal event rotates by calendar season without requiring a
paid content service.

## Memory and privacy

Progress in the Streamlit version is maintained in session state while the app is open. The
**Version 5 Complete Memory Save** stores:

- robots, customization, XP, jobs, and memories
- animals, discoveries, and favorites
- monsters, customization, play history, habitats, and friendship
- artwork and featured Robot Home art
- stories and attached illustrations
- robot pets, bond, tricks, and active companion
- dinosaurs and fossils
- campaign, living-world, seasonal, arcade, decoration, badge, and settings state

The Parent page also provides three in-session recovery slots. These slots are useful for undo and
recovery during the current Streamlit session.

**Streamlit session state is not cloud storage.** Reliable cross-session or cross-device use
currently requires downloading the private JSON save and restoring it later.

## Local read-aloud

Story and educational narration uses the browser's local Speech Synthesis API. Text is not sent to
an external narration provider by this project.

## Run Streamlit locally

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e '.[dev]'
streamlit run app.py
```

## Run the static website locally

```bash
cd web
npm install
npm run dev
```

## Run validation

```bash
ruff check .
pytest
python -m compileall app.py activities api core ui
cd web
npm install
npm run build
```

The test suite includes pure state and rendering tests, save migration and round-trip tests, API
tests, artwork, creature-art, responsive-layout, and campaign tests, plus a Streamlit `AppTest`
smoke test that renders every activity page. The web build performs TypeScript validation before
creating the production Vite bundle.

## Deploy Streamlit Community Cloud

1. Push the repository to GitHub.
2. Create or open the Streamlit Community Cloud app.
3. Select `app.py` as the entrypoint.
4. Deploy or reboot the app after changes reach `main`.

No secrets are required for the account-free Streamlit experience.

## API foundation

The repository retains a FastAPI foundation under `api/` for possible future cloud-sync or shared
online features. The static website does not call it and does not require it to run.

## Add another activity

See [`docs/ADDING_AN_ACTIVITY.md`](docs/ADDING_AN_ACTIVITY.md).
