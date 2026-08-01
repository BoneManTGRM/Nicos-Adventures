"""Animal Forest activity and builder mode."""

from __future__ import annotations

import random
import re
from typing import Any

import streamlit as st

from core.achievements import record_event
from core.catalog import DEFAULT_ANIMALS
from core.profile import MAX_CUSTOM_ANIMALS, active_robot
from core.robot import robot_phrase
from ui.components import hero, show_new_badges


def _clean(value: str, limit: int) -> str:
    return re.sub(r"[<>]", "", value).strip()[:limit]


def render(profile: dict[str, Any]) -> None:
    hero("Animal Forest", "Discover surprising creatures and help the forest grow.")
    animals = list(DEFAULT_ANIMALS) + list(profile.get("custom_animals", []))
    names = [animal["name"] for animal in animals]
    selected_name = st.selectbox("Choose an animal", names)
    animal = next(item for item in animals if item["name"] == selected_name)

    with st.container(border=True):
        left, right = st.columns([1, 4])
        left.markdown(f"# {animal.get('emoji', '🐾')}")
        right.markdown(f"## {animal['name']}")
        right.write(f"**Habitat:** {animal['habitat']}")
        right.write(animal["fact"])

    is_favorite = animal["name"] in profile.get("favorites", [])
    if st.button("⭐ Add to Favorites" if not is_favorite else "⭐ Favorite Saved", disabled=is_favorite):
        profile.setdefault("favorites", []).append(animal["name"])
        badges = record_event(profile, "animal_favorites")
        robot = active_robot(profile)
        profile["sidekick_message"] = robot_phrase("animal", robot["name"] if robot else "Robo Guide", seed=animal["name"])
        show_new_badges(badges)
        st.rerun()

    robot = active_robot(profile)
    if robot and st.button(f"🔎 Send {robot['name']} Scouting"):
        found = random.choice(animals)
        profile["sidekick_message"] = f"{robot['name']}: I found a {found['name']}! {found['fact']}"
        badges = record_event(profile, "robot_jobs")
        show_new_badges(badges)
        st.rerun()

    st.divider()
    st.markdown("### 🧰 Builder Mode: Add an animal")
    st.caption("Nico's contribution becomes part of this adventure save.")
    with st.form("add_animal", clear_on_submit=True):
        name = st.text_input("Animal name", max_chars=40)
        emoji = st.text_input("Animal emoji", value="🐾", max_chars=4)
        habitat = st.text_input("Where does it live?", max_chars=60)
        fact = st.text_area("Write one fun fact", max_chars=180)
        submitted = st.form_submit_button("Add to Animal Forest", type="primary")
    if submitted:
        clean_name = _clean(name, 40)
        clean_habitat = _clean(habitat, 60)
        clean_fact = _clean(fact, 180)
        if not clean_name or not clean_habitat or not clean_fact:
            st.error("Please complete the name, habitat, and fun fact.")
        elif len(profile.get("custom_animals", [])) >= MAX_CUSTOM_ANIMALS:
            st.error("The forest save is full. Remove an older custom animal before adding another.")
        elif clean_name.casefold() in {item["name"].casefold() for item in animals}:
            st.error("That animal is already in the forest.")
        else:
            profile.setdefault("custom_animals", []).append(
                {"name": clean_name, "emoji": emoji[:4] or "🐾", "habitat": clean_habitat, "fact": clean_fact}
            )
            badges = record_event(profile, "custom_animals")
            profile["sidekick_message"] = f"New forest entry detected: {clean_name}!"
            show_new_badges(badges)
            st.rerun()

    if profile.get("favorites"):
        st.markdown("### Nico's favorites")
        st.write(" • ".join(f"⭐ {name}" for name in profile["favorites"]))
