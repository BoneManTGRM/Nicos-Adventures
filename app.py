"""Nico's World Streamlit entrypoint."""

from __future__ import annotations

import streamlit as st

from activities import (
    animals,
    art_studio,
    badges,
    dinosaur_valley,
    game_arcade,
    memory_book,
    monster_habitats,
    monsters,
    parent_hub,
    pet_workshop,
    robo_lab,
    robot_home,
    story_castle,
    world_map,
)
from core.achievements import level_for_stars
from core.job_ui import install_functional_job_ui
from core.mecha_pack import install_mecha_pack, install_mecha_ui
from core.navigation import (
    NAV_KEY,
    NAV_WIDGET_KEY,
    prepare_navigation,
    sync_navigation_widget,
)
from core.profile import default_profile
from core.world2 import ensure_world2, repair_profile, snapshot
from core.world4 import ensure_world4
from ui.components import render_sidekick
from ui.mecha_art import apply_mecha_art
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
apply_mecha_art()

PAGES = [
    "Home",
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
]

if "profile" not in st.session_state:
    st.session_state.profile = default_profile()
profile = st.session_state.profile
ensure_world2(profile)
ensure_world4(profile)
repair_profile(profile)
prepare_navigation(st.session_state, PAGES)


def _sync_sidebar_navigation() -> None:
    sync_navigation_widget(st.session_state)


with st.sidebar:
    st.markdown("# 🤖 Nico's World 4")
    render_sidekick(profile)
    st.radio(
        "Adventure map",
        PAGES,
        key=NAV_WIDGET_KEY,
        on_change=_sync_sidebar_navigation,
    )
    st.divider()
    st.markdown(f"**⭐ {profile.get('stars', 0)} stars**")
    st.caption(
        f"Explorer level {level_for_stars(int(profile.get('stars', 0)))}"
    )
    world4 = profile.get("world4", {})
    st.caption(
        f"Memory: {len(profile.get('robots', []))} robots · "
        f"{len(profile.get('monsters', []))} monsters · "
        f"{len(world4.get('robot_pets', []))} pets · "
        f"{len(world4.get('artworks', []))} artworks"
    )
    st.caption(
        f"World stage {world4.get('living_world_stage', 1)}/7 · "
        f"{len(world4.get('campaign_completed', []))}/20 missions"
    )
    st.caption(
        f"{len(profile.get('discovered_animals', []))} animals · "
        f"{len(world4.get('dinosaurs_discovered', []))} dinosaurs · "
        f"{len(profile.get('world2', {}).get('stories', []))} stories"
    )
    st.caption(
        "Use Memory Book or Parent & Settings for a portable Version 5 backup."
    )

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
elif page == "Monster Habitats":
    monster_habitats.render(profile)
elif page == "Art Studio":
    art_studio.render(profile)
elif page == "Story Castle":
    story_castle.render(profile)
elif page == "Game Arcade":
    game_arcade.render(profile)
elif page == "Dinosaur Valley":
    dinosaur_valley.render(profile)
elif page == "Pet Workshop":
    pet_workshop.render(profile)
elif page == "Robot Home":
    robot_home.render(profile)
elif page == "Memory Book":
    memory_book.render(profile)
elif page == "Badge Book":
    badges.render(profile)
elif page == "Parent & Settings":
    parent_hub.render(profile)
