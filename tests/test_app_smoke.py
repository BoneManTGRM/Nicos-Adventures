from pathlib import Path

from streamlit.testing.v1 import AppTest


APP_ENTRYPOINT = Path(__file__).resolve().parents[1] / "app.py"


def test_every_activity_renders_without_exception() -> None:
    app = AppTest.from_file(APP_ENTRYPOINT, default_timeout=30).run()
    assert not app.exception

    pages = (
        "Robo Lab",
        "Animal Forest",
        "Monster Lab",
        "Monster Habitats",
        "Art Studio",
        "Story Castle",
        "Game Arcade",
        "Dinosaur Valley",
        "Pet Workshop",
        "Robot Home",
        "Memory Book",
        "Badge Book",
        "Parent & Settings",
        "Home",
    )
    for page in pages:
        app.radio(key="_nav_widget").set_value(page).run(timeout=30)
        assert not app.exception, (
            f"{page} failed: {[item.value for item in app.exception]}"
        )
