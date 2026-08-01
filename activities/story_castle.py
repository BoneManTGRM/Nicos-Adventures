"""Template-driven, child-safe Story Castle with illustrations and narration."""

from __future__ import annotations

from typing import Any

import streamlit as st

from core.creative_art import ARTWORK_CSS, artwork_svg
from core.memory import remember
from core.profile import active_robot
from core.world2 import add_story, ensure_world2
from core.world4 import PET_SPECIES, ensure_world4
from ui.components import hero
from ui.narration import narration_button

SETTINGS = (
    "Animal Forest",
    "Moon Base",
    "Cloud Kingdom",
    "Underwater City",
    "Monster Mountain",
    "Dinosaur Valley",
    "Crystal Castle",
    "Robot Home",
)
PROBLEMS = (
    "a glowing map has lost its final piece",
    "the town's laughter machine has stopped",
    "a baby dragon cannot find its family",
    "the stars are disappearing one by one",
    "a mysterious door will only open for a kind hero",
    "a dinosaur fossil is sending a secret signal",
    "a robot pet has discovered a hidden trail",
)
OBJECTS = (
    "crystal compass",
    "talking backpack",
    "rainbow key",
    "tiny rescue drone",
    "book of brave ideas",
    "friendly fossil scanner",
    "pocket-sized star machine",
)
ENDINGS = (
    "everyone works together and discovers a new friendship",
    "the hero solves the mystery by listening carefully",
    "the robot invents a surprising but gentle solution",
    "the monster reveals that it was trying to help all along",
    "the whole team repairs the world and celebrates together",
)


def _choices(
    profile: dict[str, Any],
) -> tuple[list[str], list[str], list[str], list[str]]:
    robot_names = [
        item.get("name", "Robot") for item in profile.get("robots", [])
    ] or ["Robo Guide"]
    animals = list(profile.get("discovered_animals", [])) or [
        "Red Panda",
        "Axolotl",
        "Lion",
    ]
    monsters = [
        item.get("name", "Giggle Monster")
        for item in profile.get("monsters", [])
    ] or ["Giggle Monster"]
    pets = [
        f"{PET_SPECIES.get(item.get('species'), '🐾')} "
        f"{item.get('name', 'Pet')}"
        for item in profile.get("world4", {}).get("robot_pets", [])
    ] or ["🐾 Helpful Robot Pet"]
    return robot_names, animals, monsters, pets


def _artwork_options(
    state: dict[str, Any],
) -> tuple[list[str], dict[str, str]]:
    ids = [""]
    labels = {"": "No illustration"}
    for item in state.get("artworks", []):
        artwork_id = str(item.get("id", ""))
        if artwork_id:
            ids.append(artwork_id)
            labels[artwork_id] = str(item.get("title", "Artwork"))
    return ids, labels


def render(profile: dict[str, Any]) -> None:
    story_state = ensure_world2(profile)
    world4 = ensure_world4(profile)
    hero(
        "Story Castle",
        "Create illustrated, bilingual adventures starring Nico's own world and characters.",
    )
    st.markdown(ARTWORK_CSS, unsafe_allow_html=True)
    robots, animals, monsters, pets = _choices(profile)
    artwork_ids, artwork_labels = _artwork_options(world4)
    with st.form("story_builder"):
        title = st.text_input(
            "Story title",
            value="The Great Nico's World Adventure",
            max_chars=60,
        )
        cols = st.columns(2)
        hero_name = cols[0].selectbox("Robot hero", robots)
        animal = cols[1].selectbox("Animal friend", animals)
        cols2 = st.columns(2)
        monster = cols2[0].selectbox("Monster character", monsters)
        pet = cols2[1].selectbox("Robot pet companion", pets)
        cols3 = st.columns(2)
        setting = cols3[0].selectbox("Setting", SETTINGS)
        artwork_id = cols3[1].selectbox(
            "Gallery illustration",
            artwork_ids,
            format_func=artwork_labels.get,
        )
        problem = st.selectbox("Adventure problem", PROBLEMS)
        special_object = st.selectbox("Special object", OBJECTS)
        ending = st.selectbox("Ending", ENDINGS)
        language = st.radio(
            "Story language",
            ("English", "Spanish", "Bilingual"),
            horizontal=True,
        )
        submitted = st.form_submit_button(
            "📖 Create and Remember Story",
            type="primary",
        )

    if submitted:
        clean_title = title.strip()[:60] or "Nico's Adventure"
        english = (
            f"In {setting}, {hero_name}, {animal}, and {pet} discovered that "
            f"{problem}. They asked {monster} for help and found a "
            f"{special_object}. After testing a few careful ideas, {ending}. "
            f"{hero_name} said, ‘Every problem becomes an adventure when "
            "friends help one another.’"
        )
        spanish = (
            f"En {setting}, {hero_name}, {animal} y {pet} descubrieron que "
            f"{problem}. Le pidieron ayuda a {monster} y encontraron un "
            f"{special_object}. Después de probar varias ideas con cuidado, "
            f"{ending}. {hero_name} dijo: ‘Cada problema se convierte en una "
            "aventura cuando los amigos se ayudan.’"
        )
        if language == "English":
            text = english
        elif language == "Spanish":
            text = spanish
        else:
            text = f"{english}\n\n{spanish}"
        story = {
            "title": clean_title,
            "hero": hero_name,
            "animal": animal,
            "monster": monster,
            "pet": pet,
            "setting": setting,
            "language": language,
            "text": text,
            "artwork_id": artwork_id,
        }
        add_story(profile, story)
        remember(
            profile,
            kind="story",
            title=f"Wrote {clean_title}",
            detail=text[:240],
            emoji="📖",
        )
        robot = active_robot(profile)
        profile["sidekick_message"] = (
            f"{robot['name'] if robot else 'Robo Guide'}: "
            "Our illustrated story is saved!"
        )
        st.session_state.latest_story = story
        st.success("Story created and saved in Nico's World memory.")

    latest = st.session_state.get("latest_story")
    if latest:
        st.markdown(f"## {latest['title']}")
        artwork = next(
            (
                item
                for item in world4.get("artworks", [])
                if item.get("id") == latest.get("artwork_id")
            ),
            None,
        )
        if artwork:
            st.markdown(
                artwork_svg(artwork, compact=True),
                unsafe_allow_html=True,
            )
        st.write(latest["text"])
        narration_button(
            profile,
            latest["text"],
            language=latest.get("language"),
            key=f"latest-story-{latest.get('title')}",
        )
        st.download_button(
            "Download Story",
            data=f"{latest['title']}\n\n{latest['text']}",
            file_name=f"{latest['title'].replace(' ', '_')}.txt",
            mime="text/plain",
            use_container_width=True,
        )

    st.markdown("## 📚 Saved Story Shelf")
    stories = list(reversed(story_state.get("stories", [])))
    if not stories:
        st.info("Create the first story to begin the shelf.")
    for index, story in enumerate(stories):
        with st.expander(
            f"📖 {story.get('title', 'Story')} · "
            f"{story.get('setting', '')}"
        ):
            artwork = next(
                (
                    item
                    for item in world4.get("artworks", [])
                    if item.get("id") == story.get("artwork_id")
                ),
                None,
            )
            if artwork:
                st.markdown(
                    artwork_svg(artwork, compact=True),
                    unsafe_allow_html=True,
                )
            st.write(story.get("text", ""))
            st.caption(
                f"Starring {story.get('hero', 'a robot')}, "
                f"{story.get('animal', 'an animal')}, and "
                f"{story.get('monster', 'a monster')}"
            )
            narration_button(
                profile,
                story.get("text", ""),
                language=story.get("language"),
                key=f"saved-story-{index}",
            )
