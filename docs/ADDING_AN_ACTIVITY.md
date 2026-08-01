# Adding an Activity

Nico's World keeps game rules separate from Streamlit screens.

1. Add pure, testable logic under `core/` if the activity needs new data or rules.
2. Add a `render(profile)` function under `activities/`.
3. Add the page label to `PAGES` in `app.py`.
4. Add a navigation branch in `app.py`.
5. Add tests for new rules under `tests/`.
6. Award an existing event or add a new event in `core/achievements.py`.
7. Update the active robot's message so the sidekick reacts to the activity.

Avoid collecting a child's full name, location, contact details, or other unnecessary
personal information. Prefer local/session progress and portable save files.
