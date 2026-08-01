"""Template-driven, child-safe Story Castle."""

from __future__ import annotations

import streamlit as st

from core.memory import remember
from core.profile import active_robot
from core.world2 import add_story, ensure_world2
from ui.components import hero

SETTINGS = ("Animal Forest", "Moon Base", "Cloud Kingdom", "Underwater City", "Monster Mountain")
PROBLEMS = (
    "a glowing map has lost its final piece",
    "the town's laughter machine has stopped",
    "a baby dragon cannot find its family",
    "the stars are disappearing one by one",
    "a mysterious door will only open for a kind hero",
)
OBJECTS = ("crystal compass", "talking backpack", "rainbow key", "tiny rescue drone", "book of brave ideas")
ENDINGS = (
    "everyone works together and discovers a new friendship",
    "the hero solves the mystery by listening carefully",
    "the robot invents a surprising but gentle solution",
    "the monster reveals that it was trying to help all along",
)


def _choices(profile: dict) -> tuple[list[str], list[str], list[str]]:
    robot_names = [item.get("name", "Robot") for item in profile.get("robots", [])] or ["Robo Guide"]
    animals = list(profile.get("discovered_animals", [])) or ["Red Panda", "Axolotl", "Lion"]
    monsters = [item.get("name", "Giggle Monster") for item in profile.get("monsters", [])] or ["Giggle Monster"]
    return robot_names, animals, monsters


def render(profile: dict) -> None:
    state = ensure_world2(profile)
    hero(
        "Story Castle",
        "Create safe, original adventures starring Nico's own robots, animals, and monsters.",
    )
    robots, animals, monsters = _choices(profile)
    with st.form("story_builder"):
        title = st.text_input("Story title", value="The Great Nico's World Adventure", max_chars=60)
        cols = st.columns(2)
        hero_name = cols[0].selectbox("Robot hero", robots)
        animal = cols[1].selectbox("Animal friend", animals)
        cols2 = st.columns(2)
        monster = cols2[0].selectbox("Monster character", monsters)
        setting = cols2[1].selectbox("Setting", SETTINGS)
        problem = st.selectbox("Adventure problem", PROBLEMS)
        special_object = st.selectbox("Special object", OBJECTS)
        ending = st.selectbox("Ending", ENDINGS)
        language = st.radio("Story language", ("English", "Spanish", "Bilingual"), horizontal=True)
        submitted = st.form_submit_button("📖 Create and Remember Story", type="primary")

    if submitted:
        clean_title = title.strip()[:60] or "Nico's Adventure"
        english = (
            f"In {setting}, {hero_name} and {animal} discovered that {problem}. "
            f"They asked {monster} for help and found a {special_object}. After testing a few ideas, "
            f"{ending}. {hero_name} said, ‘Every problem is a new adventure when friends help.’"
        )
        spanish = (
            f"En {setting}, {hero_name} y {animal} descubrieron que {problem}. "
            f"Pidieron ayuda a {monster} y encontraron un {special_object}. Después de probar varias ideas, "
            f"{ending}. {hero_name} dijo: ‘Cada problema es una nueva aventura cuando los amigos ayudan.’"
        )
        text = english if language == "English" else spanish if language == "Spanish" else f"{english}\n\n{spanish}"
        story = {
            "title": clean_title,
            "hero": hero_name,
            "animal": animal,
            "monster": monster,
            "setting": setting,
            "language": language,
            "text": text,
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
        profile["sidekick_message"] = f"{robot['name'] if robot else 'Robo Guide'}: Our new story is saved!"
        st.session_state.latest_story = story
        st.success("Story created and saved in Nico's World memory.")

    latest = st.session_state.get("latest_story")
    if latest:
        st.markdown(f"## {latest['title']}")
        st.write(latest["text"])
        st.download_button(
            "Download Story",
            data=f"{latest['title']}\n\n{latest['text']}",
            file_name=f"{latest['title'].replace(' ', '_')}.txt",
            mime="text/plain",
            use_container_width=True,
        )

    st.markdown("## 📚 Saved Story Shelf")
    stories = list(reversed(state.get("stories", [])))
    if not stories:
        st.info("Create the first story to begin the shelf.")
    for story in stories:
        with st.expander(f"📖 {story.get('title', 'Story')} · {story.get('setting', '')}"):
            st.write(story.get("text", ""))
            st.caption(f"Starring {story.get('hero', 'a robot')} and {story.get('animal', 'an animal')}")
