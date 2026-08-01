"""Nico's World Streamlit entrypoint."""

from __future__ import annotations

import streamlit as st

from activities import animals, badges, home, memory_book, monsters, robo_lab
from core.achievements import level_for_stars
from core.navigation import NAV_KEY, NAV_WIDGET_KEY, prepare_navigation, sync_navigation_widget
from core.profile import default_profile
from ui.components import render_sidekick
from ui.theme import apply_theme

st.set_page_config(
    page_title="Nico's World",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)
apply_theme()

PAGES = ["Home", "Robo Lab", "Animal Forest", "Monster Lab", "Memory Book", "Badge Book"]

if "profile" not in st.session_state:
    st.session_state.profile = default_profile()
prepare_navigation(st.session_state, PAGES)

profile = st.session_state.profile


def _sync_sidebar_navigation() -> None:
    sync_navigation_widget(st.session_state)


with st.sidebar:
    st.markdown("# 🤖 Nico's World")
    render_sidekick(profile)
    st.radio(
        "Adventure map",
        PAGES,
        key=NAV_WIDGET_KEY,
        on_change=_sync_sidebar_navigation,
    )
    st.divider()
    st.markdown(f"**⭐ {profile.get('stars', 0)} stars**")
    st.caption(f"Explorer level {level_for_stars(int(profile.get('stars', 0)))}")
    st.caption(
        f"Memory: {len(profile.get('robots', []))} robots · "
        f"{len(profile.get('custom_animals', []))} created animals · "
        f"{len(profile.get('monsters', []))} monsters"
    )
    st.caption("Download a complete memory save from Memory Book to keep progress between visits.")

page = st.session_state[NAV_KEY]
if page == "Home":
    home.render(profile)
elif page == "Robo Lab":
    robo_lab.render(profile)
elif page == "Animal Forest":
    animals.render(profile)
elif page == "Monster Lab":
    monsters.render(profile)
elif page == "Memory Book":
    memory_book.render(profile)
elif page == "Badge Book":
    badges.render(profile)
