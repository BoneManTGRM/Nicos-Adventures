# Nico's Adventures

**Nico's World** is a modular, kid-friendly Streamlit playground built around a robot
sidekick that Nico creates himself.

## Current experience

- **Robo Lab:** build robots from 96 parts across eight categories and 16 colors.
- **Robot Sidekick:** the active robot follows Nico throughout the app, levels up, completes jobs,
  and remembers important milestones.
- **Animal Forest:** discover animals, collect favorites, and add or remove kid-created entries.
- **Monster Lab:** make silly monsters, scan them with a robot, and keep a personal collection.
- **Memory Book:** see robots, animal discoveries, created animals, monsters, and timeline memories.
- **Badge Book:** earn stars, levels, unlocks, and achievement badges as the world grows.
- **Complete Memory Save:** download and restore one versioned JSON file containing all progress.
- **Modular architecture:** each activity is isolated in its own Python module.

No account, advertising service, analytics tracker, or external AI service is required.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

## Run tests

```bash
pip install -e '.[dev]'
pytest
ruff check .
```

The test suite includes pure state tests plus a Streamlit `AppTest` smoke test that renders every
activity page.

## Deploy on Streamlit Community Cloud

1. Push the repository to GitHub.
2. Create a Streamlit Community Cloud app.
3. Select `app.py` as the entrypoint.
4. Deploy. No secrets are required.

## How memory works

Progress is updated automatically in Streamlit session state while the app is open. The complete
Memory Save contains robots and their progress, created animals, discoveries, favorites, monsters,
badges, stars, unlocks, settings, and the Memory Book timeline. Download the save from **Memory
Book** or **Robo Lab** and upload it during a later visit to restore everything.

The versioned save loader safely migrates older Version 1 files into the new memory format.

## Add another activity

See [`docs/ADDING_AN_ACTIVITY.md`](docs/ADDING_AN_ACTIVITY.md).
