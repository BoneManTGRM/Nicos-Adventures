"""Interactive world map and connected mission board."""

from __future__ import annotations

import streamlit as st

from core.navigation import queue_navigation
from core.profile import active_robot
from core.world2 import (
    MISSIONS,
    complete_mission_if_ready,
    daily_adventure,
    ensure_world2,
    mission_progress,
    tr,
)
from ui.components import hero

LOCATIONS = (
    ("🤖", "Robo City", "Robo Lab", 0, "Build, customize, move, and upgrade robot friends."),
    ("🌳", "Animal Forest", "Animal Forest", 0, "Explore habitats, real photos, expeditions, and quizzes."),
    ("👾", "Monster Mountain", "Monster Lab", 0, "Invent and scan friendly monsters."),
    ("📖", "Story Castle", "Story Castle", 3, "Turn Nico's robots, animals, and monsters into stories."),
    ("🎮", "Game Arcade", "Game Arcade", 5, "Play memory, patterns, animal clues, and robot challenges."),
    ("🏠", "Robot Home", "Robot Home", 8, "Decorate the sidekick's room with earned treasures."),
    ("📚", "Memory Museum", "Memory Book", 0, "See the complete adventure timeline and save progress."),
    ("🏆", "Badge Observatory", "Badge Book", 0, "Track stars, levels, badges, and milestones."),
)


def _go(destination: str) -> None:
    queue_navigation(st.session_state, destination)


def render(profile: dict) -> None:
    state = ensure_world2(profile)
    robot = active_robot(profile)
    hero(
        "Nico's World 2.0",
        "One connected world where every robot, animal, monster, story, game, and mission matters.",
    )
    st.info(f"**{tr(profile, 'today')}:** {daily_adventure(profile)}")
    if robot:
        st.success(f"{robot['name']} is ready. {profile.get('sidekick_message', 'Choose our next adventure!')}")

    st.markdown(f"## 🗺️ {tr(profile, 'world_map')}")
    stars = int(profile.get("stars", 0))
    cols = st.columns(2)
    for index, (emoji, title, page, needed, description) in enumerate(LOCATIONS):
        unlocked = stars >= needed
        with cols[index % 2]:
            with st.container(border=True):
                st.markdown(f"### {emoji} {title}")
                st.write(description)
                if unlocked:
                    st.button(
                        f"Enter {title}",
                        key=f"map_{page}",
                        use_container_width=True,
                        on_click=_go,
                        args=(page,),
                    )
                else:
                    st.button(
                        f"🔒 Unlocks at {needed} stars",
                        key=f"locked_{page}",
                        disabled=True,
                        use_container_width=True,
                    )

    st.markdown(f"## 🎯 {tr(profile, 'missions')}")
    mission_ids = tuple(MISSIONS)
    active_id = state.get("active_mission", mission_ids[0])
    selected = st.selectbox(
        "Choose an adventure",
        mission_ids,
        index=mission_ids.index(active_id) if active_id in mission_ids else 0,
        format_func=lambda item: f"{MISSIONS[item]['emoji']} {MISSIONS[item]['title']}",
    )
    state["active_mission"] = selected
    mission = MISSIONS[selected]
    complete, total, rows = mission_progress(profile, selected)
    st.progress(complete / total, text=f"{complete} of {total} objectives complete")
    for label, done in rows:
        st.write(f"{'✅' if done else '⬜'} {label}")
    st.caption(f"Reward: ⭐ {mission['reward']} stars")
    if selected in state.get("completed_missions", []):
        st.success("Mission completed and saved in this adventure.")
    elif complete == total:
        if st.button("🏆 Claim Mission Reward", type="primary", use_container_width=True):
            complete_mission_if_ready(profile, selected)
            st.rerun()
    else:
        st.caption("Complete activities around the world to fill this mission automatically.")
