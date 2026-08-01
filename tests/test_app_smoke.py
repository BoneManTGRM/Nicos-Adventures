from streamlit.testing.v1 import AppTest


def test_every_activity_renders_without_exception() -> None:
    app = AppTest.from_file("app.py", default_timeout=20).run()
    assert not app.exception

    for page in ("Robo Lab", "Animal Forest", "Monster Lab", "Memory Book", "Badge Book", "Home"):
        app.radio(key="_nav_widget").set_value(page).run(timeout=20)
        assert not app.exception, f"{page} failed: {[item.value for item in app.exception]}"
