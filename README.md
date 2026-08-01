# Nico's Adventures

**Nico's World** is a modular, kid-friendly Streamlit playground built around a robot
sidekick that Nico creates himself.

## Version 1

- **Robo Lab:** choose parts, name robots, unlock upgrades, and animate seven actions.
- **Robot Sidekick:** the active robot follows Nico throughout the app and reacts to play.
- **Animal Forest:** explore animals, collect favorites, and add kid-created entries.
- **Monster Lab:** make silly monsters and let the robot scan them.
- **Badge Book:** earn stars and achievement badges as the world grows.
- **Portable progress:** download and restore a small JSON adventure save file.
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

## Deploy on Streamlit Community Cloud

1. Push the repository to GitHub.
2. Create a Streamlit Community Cloud app.
3. Select `app.py` as the entrypoint.
4. Deploy. No secrets are required.

## How progress works

Progress is stored in Streamlit session state while the app is open. Nico can use
**Robo Lab → Adventure Save** to download a save file and restore it later. This avoids
requiring a child account or storing personal information on a server.

## Add another activity

See [`docs/ADDING_AN_ACTIVITY.md`](docs/ADDING_AN_ACTIVITY.md).
