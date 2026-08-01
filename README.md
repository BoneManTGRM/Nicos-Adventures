# Nico's World 4

**Nico's World** is a private, kid-friendly Streamlit adventure playground built around a
custom robot sidekick and an expanding world of animals, monsters, art, stories, pets,
dinosaurs, games, missions, and memories.

The project does not require a child account, advertising service, analytics tracker, open chat,
or external generative-AI service.

## Current Streamlit experience

- **Living World Map:** a seven-stage world that visibly grows as Nico creates, explores, and
  completes a twenty-mission campaign.
- **Robo Lab:** build and edit robot friends from more than 220 physical choices across fourteen
  categories, with colors, patterns, finishes, personalities, voices, jobs, XP, and memories.
- **Mecha Art V3:** layered inline-SVG robots with five body frames, mechanical joints, armor,
  reactors, wings, thrusters, materials, lighting, and animations.
- **Animal Forest:** explore habitats, wildlife photographs, field guides, quizzes, expeditions,
  discoveries, favorites, and kid-created animal entries.
- **Monster Lab:** build monsters from 120 physical choices across ten categories, plus eighteen
  colors, patterns, textures, powers, personalities, editing, animation, and safe old-save
  migration.
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
- **Robot Home:** a layered headquarters with eighteen visible decorations, six room themes,
  weather and lighting controls, robot interactions, a featured-art gallery, and a companion
  corner.
- **Memory Museum:** review the complete timeline and every major collection, including robots,
  animals, monsters, habitats, artwork, stories, pets, dinosaurs, fossils, and campaign progress.
- **Badge Observatory:** track stars, explorer levels, badges, and milestones.
- **Parent & Settings:** language, local browser read-aloud, reduced motion, diagnostics, bounded
  recovery snapshots, three in-session save slots, and private backups.

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

Progress is maintained in Streamlit session state while the app is open. The **Version 5 Complete
Memory Save** stores:

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
currently requires downloading the private JSON save and restoring it later. True automatic cloud
saving would require a separately configured database or storage provider.

## Local read-aloud

Story and educational narration uses the browser's local Speech Synthesis API. Text is not sent to
an external narration provider by this project.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e '.[dev]'
streamlit run app.py
```

## Run validation

```bash
ruff check .
pytest
python -m compileall app.py activities api core ui
```

The test suite includes pure state and rendering tests, save migration and round-trip tests, API
tests, artwork and campaign tests, plus a Streamlit `AppTest` smoke test that renders every
activity page.

## Deploy on Streamlit Community Cloud

1. Push the repository to GitHub.
2. Create or open the Streamlit Community Cloud app.
3. Select `app.py` as the entrypoint.
4. Deploy or reboot the app after changes reach `main`.

No secrets are required for the current account-free Streamlit experience.

## React and API foundation

The repository also contains a separate React/Vite progressive-web-app foundation under `web/`
and a FastAPI foundation under `api/`. They are validated in CI but do not replace the deployed
Streamlit application.

## Add another activity

See [`docs/ADDING_AN_ACTIVITY.md`](docs/ADDING_AN_ACTIVITY.md).
