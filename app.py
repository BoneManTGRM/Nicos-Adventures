"""Nico's World Streamlit entrypoint."""

from __future__ import annotations

import streamlit as st

from activities import animals, badges, home, monsters, robo_lab
from core.achievements import level_for_stars
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

if "profile" not in st.session_state:
    st.session_state.profile = default_profile()
if "nav" not in st.session_state:
    st.session_state.nav = "Home"

profile = st.session_state.profile
PAGES = ["Home", "Robo Lab", "Animal Forest", "Monster Lab", "Badge Book"]

with st.sidebar:
    st.markdown("# 🤖 Nico's World")
    render_sidekick(profile)
    st.radio("Adventure map", PAGES, key="nav")
    st.divider()
    st.markdown(f"**⭐ {profile.get('stars', 0)} stars**")
    st.caption(f"Explorer level {level_for_stars(int(profile.get('stars', 0)))}")
    st.caption("Progress stays in this session. Download a save from Robo Lab to keep it.")

page = st.session_state.nav
if page == "Home":
    home.render(profile)
elif page == "Robo Lab":
    robo_lab.render(profile)
elif page == "Animal Forest":
    animals.render(profile)
elif page == "Monster Lab":
    monsters.render(profile)
elif page == "Badge Book":
    badges.render(profile)
