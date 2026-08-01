from core.navigation import (
    NAV_KEY,
    NAV_WIDGET_KEY,
    PENDING_NAV_KEY,
    prepare_navigation,
    queue_navigation,
    sync_navigation_widget,
)

PAGES = ["Home", "Robo Lab", "Animal Forest"]


def test_queued_navigation_is_applied_before_widget_creation() -> None:
    state: dict[str, object] = {}
    prepare_navigation(state, PAGES)
    queue_navigation(state, "Robo Lab")

    destination = prepare_navigation(state, PAGES)

    assert destination == "Robo Lab"
    assert state[NAV_KEY] == "Robo Lab"
    assert state[NAV_WIDGET_KEY] == "Robo Lab"
    assert PENDING_NAV_KEY not in state


def test_sidebar_widget_selection_updates_canonical_navigation() -> None:
    state: dict[str, object] = {NAV_KEY: "Home", NAV_WIDGET_KEY: "Animal Forest"}

    sync_navigation_widget(state)

    assert state[NAV_KEY] == "Animal Forest"


def test_invalid_queued_destination_is_ignored() -> None:
    state: dict[str, object] = {NAV_KEY: "Home", NAV_WIDGET_KEY: "Home"}
    queue_navigation(state, "Missing Page")

    destination = prepare_navigation(state, PAGES)

    assert destination == "Home"
    assert state[NAV_WIDGET_KEY] == "Home"
