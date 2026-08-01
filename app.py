"""Nico's World Streamlit entrypoint."""

from __future__ import annotations

import streamlit as st

from activities import (
    animals,
    badges,
    game_arcade,
    memory_book,
    monsters,
    parent_hub,
    robo_lab,
    robot_home,
    story_castle,
    world_map,
)
from core.achievements import level_for_stars
from core.job_ui import install_functional_job_ui
from core.mecha_pack import install_mecha_pack, install_mecha_ui
from core.navigation import NAV_KEY, NAV_WIDGET_KEY, prepare_navigation, sync_navigation_widget
from core.profile import default_profile
from core.world2 import ensure_world2, repair_profile, snapshot
from ui.components import render_sidekick
from ui.theme import apply_theme

install_mecha_pack()
install_mecha_ui()
install_functional_job_ui()

st.set_page_config(
    page_title="Nico's World",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)
apply_theme()

PAGES = [
    "Home",
    "Robo Lab",
    "Animal Forest",
    "Monster Lab",
    "Story Castle",
    "Game Arcade",
    "Robot Home",
    "Memory Book",
    "Badge Book",
    "Parent & Settings",
]

if "profile" not in st.session_state:
    st.session_state.profile = default_profile()
profile = st.session_state.profile
ensure_world2(profile)
repair_profile(profile)
prepare_navigation(st.session_state, PAGES)


def _sync_sidebar_navigation() -> None:
    sync_navigation_widget(st.session_state)


with st.sidebar:
    st.markdown("# 🤖 Nico's World 2")
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
        f"{len(profile.get('discovered_animals', []))} animals · "
        f"{len(profile.get('monsters', []))} monsters · "
        f"{len(profile.get('world2', {}).get('stories', []))} stories"
    )
    active_mission = profile.get("world2", {}).get("active_mission", "jungle_crystal")
    st.caption(f"Active mission: {active_mission.replace('_', ' ').title()}")
    st.caption("Use Memory Book or Parent & Settings for a portable backup.")

page = st.session_state[NAV_KEY]
profile["world2"]["last_safe_page"] = page
snapshot(profile, page)

if page == "Home":
    world_map.render(profile)
elif page == "Robo Lab":
    robo_lab.render(profile)
elif page == "Animal Forest":
    animals.render(profile)
elif page == "Monster Lab":
    monsters.render(profile)
elif page == "Story Castle":
    story_castle.render(profile)
elif page == "Game Arcade":
    game_arcade.render(profile)
elif page == "Robot Home":
    robot_home.render(profile)
elif page == "Memory Book":
    memory_book.render(profile)
elif page == "Badge Book":
    badges.render(profile)
elif page == "Parent & Settings":
    parent_hub.render(profile)
