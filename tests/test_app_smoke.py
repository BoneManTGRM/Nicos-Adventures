from streamlit.testing.v1 import AppTest


def test_every_activity_renders_without_exception() -> None:
    app = AppTest.from_file("app.py", default_timeout=25).run()
    assert not app.exception

    pages = (
        "Robo Lab",
        "Animal Forest",
        "Monster Lab",
        "Story Castle",
        "Game Arcade",
        "Robot Home",
        "Memory Book",
        "Badge Book",
        "Parent & Settings",
        "Home",
    )
    for page in pages:
        app.radio(key="_nav_widget").set_value(page).run(timeout=25)
        assert not app.exception, f"{page} failed: {[item.value for item in app.exception]}"
