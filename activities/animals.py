"""Animal Forest activity and builder mode."""

from __future__ import annotations

import random
import re
from typing import Any

import streamlit as st

from core.achievements import record_event
from core.catalog import DEFAULT_ANIMALS
from core.memory import mark_discovered, new_id, remember, utc_now
from core.profile import MAX_CUSTOM_ANIMALS, active_robot, remove_custom_animal
from core.robot import robot_phrase
from ui.components import hero, show_new_badges


def _clean(value: str, limit: int) -> str:
    return re.sub(r"[<>]", "", value).strip()[:limit]


def _remember_animal(profile: dict[str, Any], animal: dict[str, Any], *, source: str) -> list[Any]:
    badges: list[Any] = []
    if mark_discovered(profile, animal["name"]):
        badges.extend(record_event(profile, "animal_discoveries"))
    remember(
        profile,
        kind="animal",
        title=f"Discovered {animal['name']}",
        detail=f"{animal['fact']} Habitat: {animal['habitat']}.",
        emoji=animal.get("emoji", "🐾"),
        entity_id=animal.get("id") or animal["name"],
        unique_key=f"animal-discovery:{animal['name'].casefold()}",
    )
    robot = active_robot(profile)
    profile["sidekick_message"] = robot_phrase(
        "animal",
        robot["name"] if robot else "Robo Guide",
        seed=f"{source}:{animal['name']}",
    )
    return badges


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

    discovered = animal["name"].casefold() in {
        str(name).casefold() for name in profile.get("discovered_animals", [])
    }
    favorite = animal["name"].casefold() in {
        str(name).casefold() for name in profile.get("favorites", [])
    }
    actions = st.columns(2)
    with actions[0]:
        if st.button(
            "✅ Discovery Remembered" if discovered else "🔎 Remember This Discovery",
            disabled=discovered,
            use_container_width=True,
        ):
            show_new_badges(_remember_animal(profile, animal, source="manual"))
            st.rerun()
    with actions[1]:
        favorite_label = "⭐ Remove Favorite" if favorite else "⭐ Add to Favorites"
        if st.button(favorite_label, use_container_width=True):
            favorites = profile.setdefault("favorites", [])
            if favorite:
                profile["favorites"] = [
                    name for name in favorites if str(name).casefold() != animal["name"].casefold()
                ]
            else:
                favorites.append(animal["name"])
                badges = record_event(profile, "animal_favorites")
                badges.extend(_remember_animal(profile, animal, source="favorite"))
                show_new_badges(badges)
            st.rerun()

    robot = active_robot(profile)
    if robot and st.button(f"🔎 Send {robot['name']} Scouting", use_container_width=True):
        found = random.choice(animals)
        badges = _remember_animal(profile, found, source="scout")
        profile["sidekick_message"] = f"{robot['name']}: I found a {found['name']}! {found['fact']}"
        badges.extend(record_event(profile, "robot_jobs"))
        robot["jobs_completed"] = int(robot.get("jobs_completed", 0)) + 1
        robot["xp"] = int(robot.get("xp", 0)) + 15
        robot["level"] = min(100, robot["xp"] // 50 + 1)
        show_new_badges(badges)
        st.rerun()

    st.divider()
    st.markdown("### 🧰 Builder Mode: Add an animal")
    st.caption("Nico's contribution is stored in the complete Memory Save.")
    with st.form("add_animal", clear_on_submit=True):
        name = st.text_input("Animal name", max_chars=40)
        emoji = st.text_input("Animal emoji", value="🐾", max_chars=8)
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
            st.error("The forest memory is full. Remove an older custom animal before adding another.")
        elif clean_name.casefold() in {item["name"].casefold() for item in animals}:
            st.error("That animal is already in the forest.")
        else:
            custom_animal = {
                "id": new_id("animal"),
                "name": clean_name,
                "emoji": _clean(emoji, 8) or "🐾",
                "habitat": clean_habitat,
                "fact": clean_fact,
                "created_at": utc_now(),
            }
            profile.setdefault("custom_animals", []).append(custom_animal)
            mark_discovered(profile, clean_name)
            badges = record_event(profile, "custom_animals")
            badges.extend(record_event(profile, "animal_discoveries"))
            remember(
                profile,
                kind="animal",
                title=f"Created {clean_name}",
                detail=f"{clean_fact} Habitat: {clean_habitat}.",
                emoji=custom_animal["emoji"],
                entity_id=custom_animal["id"],
                unique_key=f"custom-animal:{custom_animal['id']}",
            )
            profile["sidekick_message"] = f"New forest memory saved: {clean_name}!"
            show_new_badges(badges)
            st.rerun()

    if profile.get("favorites"):
        st.markdown("### Nico's favorites")
        st.write(" • ".join(f"⭐ {name}" for name in profile["favorites"]))

    if profile.get("custom_animals"):
        st.markdown("### Nico's created animals")
        for custom in profile["custom_animals"]:
            with st.container(border=True):
                left, right = st.columns([4, 1])
                left.markdown(f"**{custom.get('emoji', '🐾')} {custom.get('name', 'Animal')}**")
                left.caption(f"{custom.get('habitat', '')} · {custom.get('fact', '')}")
                if right.button(
                    "Remove",
                    key=f"remove_animal_{custom.get('id', custom.get('name'))}",
                    use_container_width=True,
                ):
                    remove_custom_animal(profile, str(custom.get("id", "")))
                    st.rerun()
