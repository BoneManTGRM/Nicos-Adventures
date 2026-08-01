"""Complete collection, timeline, and portable Version 5 memory activity."""

from __future__ import annotations

from typing import Any

import streamlit as st

from core.creative_art import ARTWORK_CSS, artwork_svg
from core.dinosaurs import DINOSAURS
from core.memory import collection_counts
from core.monster_art import MONSTER_ART_CSS, monster_card_html
from core.profile import PROFILE_VERSION, export_profile, import_profile
from core.robot import find_part
from core.world4 import (
    CAMPAIGN_MISSIONS,
    PET_SPECIES,
    ensure_world4,
)
from ui.components import hero, robot_html


def _part_label(category: str, part_id: str) -> str:
    try:
        return find_part(category, part_id).label
    except ValueError:
        return part_id.replace("_", " ").title()


def _timeline(profile: dict[str, Any]) -> None:
    memories = list(reversed(profile.get("memories", [])))
    if not memories:
        st.info(
            "Build, discover, create, or explore to start the Memory Book."
        )
    for memory in memories:
        with st.container(border=True):
            st.markdown(
                f"### {memory.get('emoji', '✨')} "
                f"{memory.get('title', 'Adventure memory')}"
            )
            if memory.get("detail"):
                st.write(memory["detail"])
            if memory.get("created_at"):
                st.caption(
                    str(memory["created_at"])
                    .replace("T", " ")
                    .replace("+00:00", " UTC")
                )


def _robots(profile: dict[str, Any]) -> None:
    robots = profile.get("robots", [])
    if not robots:
        st.info("No robot memories yet. Visit Robo Lab to build one.")
    for robot in robots:
        with st.container(border=True):
            left, right = st.columns([1, 2])
            with left:
                st.markdown(
                    robot_html(robot, compact=True),
                    unsafe_allow_html=True,
                )
            with right:
                active = robot.get("id") == profile.get("active_robot_id")
                st.markdown(
                    f"### {robot.get('name', 'Robot')} "
                    f"{'⭐ Sidekick' if active else ''}"
                )
                st.write(
                    f"Level **{robot.get('level', 1)}** · "
                    f"{robot.get('times_moved', 0)} moves · "
                    f"{robot.get('jobs_completed', 0)} jobs"
                )
                st.caption(
                    " • ".join(
                        [
                            _part_label(
                                "head",
                                str(robot.get("head", "box")),
                            ),
                            _part_label(
                                "eyes",
                                str(robot.get("eyes", "round")),
                            ),
                            _part_label(
                                "body",
                                str(robot.get("body", "classic_core")),
                            ),
                            _part_label(
                                "power",
                                str(robot.get("power", "bubble")),
                            ),
                        ]
                    )
                )


def _animals(profile: dict[str, Any]) -> None:
    if profile.get("discovered_animals"):
        st.markdown("### Animals Nico has discovered")
        st.write(
            " • ".join(
                f"🔎 {name}" for name in profile["discovered_animals"]
            )
        )
    else:
        st.info("No animal discoveries have been remembered yet.")
    if profile.get("custom_animals"):
        st.markdown("### Animals Nico created")
        for animal in profile["custom_animals"]:
            with st.container(border=True):
                st.markdown(
                    f"### {animal.get('emoji', '🐾')} "
                    f"{animal.get('name', 'Animal')}"
                )
                st.write(
                    f"**Habitat:** {animal.get('habitat', 'Unknown')}"
                )
                st.write(animal.get("fact", ""))


def _monsters(profile: dict[str, Any]) -> None:
    st.markdown(MONSTER_ART_CSS, unsafe_allow_html=True)
    monsters = profile.get("monsters", [])
    if not monsters:
        st.info("No monster friends have been saved yet.")
    cols = st.columns(2)
    habitats = profile.get("world4", {}).get("monster_habitats", {})
    for index, monster in enumerate(monsters):
        with cols[index % 2]:
            with st.container(border=True):
                st.markdown(
                    monster_card_html(monster),
                    unsafe_allow_html=True,
                )
                habitat = habitats.get(str(monster.get("id")))
                if habitat:
                    st.caption(
                        f"🏡 {habitat.get('theme')} · Friendship "
                        f"{habitat.get('friendship', 0)}/100 · "
                        f"{habitat.get('visits', 0)} visits"
                    )
                else:
                    st.caption("No habitat built yet.")


def _art_and_stories(profile: dict[str, Any]) -> None:
    st.markdown(ARTWORK_CSS, unsafe_allow_html=True)
    world4 = ensure_world4(profile)
    artworks = world4.get("artworks", [])
    stories = profile.get("world2", {}).get("stories", [])
    st.markdown("### Art Gallery")
    if not artworks:
        st.info("No artwork yet. Visit Art Studio to create the first poster.")
    cols = st.columns(2)
    for index, artwork in enumerate(artworks):
        with cols[index % 2]:
            st.markdown(
                artwork_svg(artwork, compact=True),
                unsafe_allow_html=True,
            )
    st.markdown("### Story Shelf")
    if not stories:
        st.info("No stories saved yet.")
    for story in reversed(stories):
        with st.expander(
            f"📖 {story.get('title', 'Story')} · "
            f"{story.get('language', 'English')}"
        ):
            st.write(story.get("text", ""))
            st.caption(
                f"{story.get('setting', '')} · "
                f"{story.get('hero', '')} · "
                f"{story.get('monster', '')}"
            )


def _pets_and_habitats(profile: dict[str, Any]) -> None:
    state = ensure_world4(profile)
    pets = state.get("robot_pets", [])
    if not pets:
        st.info("No robot pets have been built yet.")
    cols = st.columns(3)
    for index, pet in enumerate(pets):
        with cols[index % 3]:
            with st.container(border=True):
                active = pet.get("id") == state.get("active_pet_id")
                st.markdown(
                    f"<div style='font-size:5rem;text-align:center'>"
                    f"{PET_SPECIES.get(pet.get('species'), '🐾')}</div>",
                    unsafe_allow_html=True,
                )
                st.markdown(
                    f"### {pet.get('name', 'Pet')} "
                    f"{'⭐ Active' if active else ''}"
                )
                st.caption(
                    f"{pet.get('color')} · {pet.get('personality')} · "
                    f"{pet.get('accessory')}"
                )
                st.write(
                    f"Bond **{pet.get('bond', 0)}/100** · "
                    f"{pet.get('tricks', 0)} tricks · "
                    f"{pet.get('plays', 0)} visits"
                )
    st.markdown("### Habitat Village")
    habitats = state.get("monster_habitats", {})
    if not habitats:
        st.info("No monster habitats have been built yet.")
    monster_lookup = {
        str(item.get("id")): item for item in profile.get("monsters", [])
    }
    for monster_id, habitat in habitats.items():
        monster = monster_lookup.get(monster_id, {})
        with st.container(border=True):
            st.markdown(
                f"### {monster.get('face', '👾')} "
                f"{monster.get('name', 'Monster')}'s "
                f"{habitat.get('theme', 'Habitat')}"
            )
            st.caption(
                f"{habitat.get('food')} · {habitat.get('toy')} · "
                f"Friendship {habitat.get('friendship', 0)}/100"
            )


def _dinosaurs_and_campaign(profile: dict[str, Any]) -> None:
    state = ensure_world4(profile)
    discovered = state.get("dinosaurs_discovered", [])
    st.markdown("### Dinosaur Field Guide")
    if not discovered:
        st.info("No dinosaur expeditions have been completed yet.")
    cols = st.columns(3)
    for index, dinosaur_id in enumerate(discovered):
        dinosaur = DINOSAURS.get(dinosaur_id)
        if not dinosaur:
            continue
        with cols[index % 3]:
            with st.container(border=True):
                st.markdown(
                    f"### {dinosaur['emoji']} {dinosaur['name']}"
                )
                st.caption(
                    f"{dinosaur['period']} · {dinosaur['diet']}"
                )
                st.write(dinosaur["fact"])
    st.markdown("### Fossil Museum")
    if state.get("fossils"):
        st.write(
            " • ".join(f"🦴 {item}" for item in state["fossils"])
        )
    else:
        st.info("No fossils have been recovered yet.")
    completed = state.get("campaign_completed", [])
    st.markdown(
        f"### Campaign Progress · {len(completed)}/{len(CAMPAIGN_MISSIONS)}"
    )
    st.progress(
        len(completed) / len(CAMPAIGN_MISSIONS),
        text=f"Living world stage {state.get('living_world_stage', 1)}/7",
    )
    for mission_id, mission in CAMPAIGN_MISSIONS.items():
        st.write(
            f"{'✅' if mission_id in completed else '⬜'} "
            f"Chapter {mission['chapter']} · {mission['emoji']} "
            f"{mission['title']}"
        )


def _save_restore(profile: dict[str, Any]) -> None:
    st.markdown(f"### Complete Version {PROFILE_VERSION} Adventure Memory")
    st.write(
        "The portable save contains robots, animals, monsters, habitats, art, "
        "stories, pets, dinosaurs, fossils, campaign progress, stars, settings, "
        "decorations, and the timeline."
    )
    st.download_button(
        "⬇️ Download Complete Memory Save",
        data=export_profile(profile),
        file_name="nicos-world-4-memory.json",
        mime="application/json",
        use_container_width=True,
    )
    uploaded = st.file_uploader(
        "Upload a Nico's World memory file",
        type=["json"],
        key="memory_upload",
    )
    if uploaded and st.button(
        "Restore Complete Memory",
        type="primary",
        use_container_width=True,
    ):
        try:
            st.session_state.profile = import_profile(uploaded.getvalue())
        except ValueError as exc:
            st.error(str(exc))
        else:
            st.success("Memory restored. Every collection is back.")
            st.rerun()


def render(profile: dict[str, Any]) -> None:
    world4 = ensure_world4(profile)
    hero(
        "Memory Museum",
        "Every robot, animal, monster, habitat, artwork, pet, dinosaur, story, and mission is remembered.",
    )
    counts = collection_counts(profile)
    metrics = st.columns(7)
    metrics[0].metric("🤖 Robots", counts["robots"])
    metrics[1].metric("🐾 Animals", counts["discoveries"])
    metrics[2].metric("👾 Monsters", counts["monsters"])
    metrics[3].metric("🎨 Art", len(world4.get("artworks", [])))
    metrics[4].metric("🐕 Pets", len(world4.get("robot_pets", [])))
    metrics[5].metric(
        "🦕 Dinosaurs",
        len(world4.get("dinosaurs_discovered", [])),
    )
    metrics[6].metric("✨ Memories", counts["memories"])

    tabs = st.tabs(
        [
            "✨ Timeline",
            "🤖 Robots",
            "🐾 Animals",
            "👾 Monsters",
            "🎨 Art & Stories",
            "🐕 Pets & Habitats",
            "🦕 Dinosaurs & Campaign",
            "💾 Save & Restore",
        ]
    )
    with tabs[0]:
        _timeline(profile)
    with tabs[1]:
        _robots(profile)
    with tabs[2]:
        _animals(profile)
    with tabs[3]:
        _monsters(profile)
    with tabs[4]:
        _art_and_stories(profile)
    with tabs[5]:
        _pets_and_habitats(profile)
    with tabs[6]:
        _dinosaurs_and_campaign(profile)
    with tabs[7]:
        _save_restore(profile)
