"""Safe navigation helpers for Streamlit session state."""

from __future__ import annotations

from collections.abc import MutableMapping, Sequence
from typing import Any

NAV_KEY = "nav"
NAV_WIDGET_KEY = "_nav_widget"
PENDING_NAV_KEY = "_pending_nav"


def queue_navigation(state: MutableMapping[str, Any], destination: str) -> None:
    """Queue a destination without mutating an already-created widget key."""
    state[PENDING_NAV_KEY] = destination


def prepare_navigation(
    state: MutableMapping[str, Any], pages: Sequence[str], default: str = "Home"
) -> str:
    """Apply queued navigation before Streamlit creates the sidebar widget."""
    valid_pages = tuple(pages)
    if not valid_pages:
        raise ValueError("Navigation requires at least one page.")

    fallback = default if default in valid_pages else valid_pages[0]
    current = state.get(NAV_KEY, fallback)
    if current not in valid_pages:
        current = fallback

    pending = state.get(PENDING_NAV_KEY)
    if PENDING_NAV_KEY in state:
        del state[PENDING_NAV_KEY]
    if pending in valid_pages:
        current = pending

    state[NAV_KEY] = current
    widget_value = state.get(NAV_WIDGET_KEY)
    if pending is not None or widget_value not in valid_pages:
        state[NAV_WIDGET_KEY] = current
    return current


def sync_navigation_widget(state: MutableMapping[str, Any]) -> None:
    """Copy the sidebar widget selection to the app's canonical page key."""
    destination = state.get(NAV_WIDGET_KEY)
    if isinstance(destination, str):
        state[NAV_KEY] = destination
