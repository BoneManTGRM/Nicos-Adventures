"""Custom habitats, care routines, and friendship for saved monsters."""

from __future__ import annotations

from typing import Any

import streamlit as st

from core.memory import remember
from core.monster_art import MONSTER_ART_CSS, monster_html
from core.world4 import (
    HABITAT_FOODS,
    HABITAT_THEMES,
    HABITAT_TOYS,
    assign_monster_habitat,
    ensure_world4,
    interact_with_habitat,
)
from ui.components import hero

SCENES = {
    "Crystal Cave": "castle",
    "Cloud Nest": "space",
    "Jungle Hideaway": "forest",
    "Ocean Bubble": "lab",
    "Moon Pod": "space",
    "Candy Garden": "forest",
    "Volcano Workshop": "lab",
    "Royal Tower": "castle",
}


def render(profile: dict[str, Any]) -> None:
    state = ensure_world4(profile)
    monsters = profile.get("monsters", [])
    hero(
        "Monster Habitats",
        "Build homes, choose food and toys, and grow friendship with every monster.",
    )
    st.markdown(MONSTER_ART_CSS, unsafe_allow_html=True)
    if not monsters:
        st.info("Create a monster in Monster Lab before building a habitat.")
        return
    names = {
        str(item["id"]): str(item.get("name", "Monster"))
        for item in monsters
    }
    monster_id = st.selectbox(
        "Choose a monster friend",
        tuple(names),
        format_func=names.get,
    )
    monster = next(item for item in monsters if str(item["id"]) == monster_id)
    current = state.get("monster_habitats", {}).get(monster_id, {})
    left, right = st.columns([1.1, 1], gap="large")
    with left:
        theme = st.selectbox(
            "Habitat style",
            HABITAT_THEMES,
            index=(
                HABITAT_THEMES.index(current.get("theme"))
                if current.get("theme") in HABITAT_THEMES
                else 0
            ),
        )
        food = st.selectbox(
            "Favorite food",
            HABITAT_FOODS,
            index=(
                HABITAT_FOODS.index(current.get("food"))
                if current.get("food") in HABITAT_FOODS
                else 0
            ),
        )
        toy = st.selectbox(
            "Favorite toy",
            HABITAT_TOYS,
            index=(
                HABITAT_TOYS.index(current.get("toy"))
                if current.get("toy") in HABITAT_TOYS
                else 0
            ),
        )
        if st.button(
            "🏡 Build or Update Habitat",
            type="primary",
            use_container_width=True,
        ):
            was_new = monster_id not in state["monster_habitats"]
            habitat = assign_monster_habitat(
                profile,
                monster_id,
                theme,
                food,
                toy,
            )
            if was_new:
                remember(
                    profile,
                    kind="monster_habitat",
                    title=f"Built a home for {monster['name']}",
                    detail=(
                        f"A {habitat['theme'].lower()} with "
                        f"{habitat['food'].lower()} and a "
                        f"{habitat['toy'].lower()}."
                    ),
                    emoji="🏡",
                    entity_id=monster_id,
                    unique_key=f"monster-habitat:{monster_id}",
                )
            profile["sidekick_message"] = (
                f"{monster['name']}'s {habitat['theme']} is ready."
            )
            st.rerun()
    with right:
        preview = dict(monster)
        preview["mood"] = "Happy"
        st.markdown(
            monster_html(
                preview,
                animation="idle",
                compact=True,
                scene=SCENES[theme],
            ),
            unsafe_allow_html=True,
        )
        st.caption(f"{theme} · {food} · {toy}")

    habitat = state.get("monster_habitats", {}).get(monster_id)
    if habitat:
        st.markdown(f"## 💛 Friendship with {monster['name']}")
        st.progress(
            int(habitat.get("friendship", 0)) / 100,
            text=f"Friendship: {habitat.get('friendship', 0)}/100",
        )
        status = st.columns(3)
        status[0].metric("Visits", habitat.get("visits", 0))
        status[1].metric("Favorite food", habitat.get("food", ""))
        status[2].metric("Favorite toy", habitat.get("toy", ""))
        actions = (
            ("feed", "🍓 Feed", "enjoyed a favorite snack"),
            ("play", "🎾 Play", "played with its favorite toy"),
            ("rest", "💤 Rest", "took a peaceful rest"),
            ("decorate", "✨ Decorate", "helped decorate the habitat"),
        )
        cols = st.columns(4)
        for index, (action, label, message) in enumerate(actions):
            with cols[index]:
                if st.button(
                    label,
                    key=f"habitat_{monster_id}_{action}",
                    use_container_width=True,
                ):
                    previous = int(habitat.get("friendship", 0))
                    updated = interact_with_habitat(
                        profile,
                        monster_id,
                        action,
                    )
                    if updated:
                        profile.setdefault("counts", {})[
                            "monster_friendship"
                        ] = sum(
                            int(item.get("friendship", 0))
                            for item in state["monster_habitats"].values()
                        )
                        profile["sidekick_message"] = (
                            f"{monster['name']} {message}. Friendship is now "
                            f"{updated['friendship']}."
                        )
                        crossed = (
                            int(updated["friendship"]) // 25 > previous // 25
                        )
                        if crossed:
                            profile["stars"] = int(
                                profile.get("stars", 0)
                            ) + 1
                            st.success(
                                "Friendship milestone reached. One star earned."
                            )
                        st.rerun()

    st.markdown("## 🏘️ Habitat Village")
    if not state.get("monster_habitats"):
        st.info("Build the first habitat to begin the village.")
    cols = st.columns(2)
    monster_lookup = {str(item["id"]): item for item in monsters}
    for index, (saved_id, saved) in enumerate(
        state.get("monster_habitats", {}).items()
    ):
        saved_monster = monster_lookup.get(saved_id)
        if not saved_monster:
            continue
        with cols[index % 2]:
            with st.container(border=True):
                st.markdown(
                    f"### {saved_monster.get('face', '👾')} "
                    f"{saved_monster.get('name', 'Monster')}"
                )
                st.write(f"**{saved.get('theme')}**")
                st.caption(
                    f"Friendship {saved.get('friendship', 0)}/100 · "
                    f"{saved.get('visits', 0)} visits"
                )
