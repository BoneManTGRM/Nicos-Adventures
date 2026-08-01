"""A persistent home and reward display for Nico's active robot."""

from __future__ import annotations

import streamlit as st

from core.profile import active_robot
from core.world2 import DECORATIONS, decorate_home, ensure_world2
from ui.components import hero, robot_stage


def render(profile: dict) -> None:
    state = ensure_world2(profile)
    robot = active_robot(profile)
    hero(
        "Robot Home",
        "A personal room where earned decorations, memories, and robot progress become visible.",
    )
    if not robot:
        st.info("Build a robot in Robo Lab before opening Robot Home.")
        return

    st.markdown(f"## 🏠 {robot['name']}'s Room")
    left, right = st.columns([1, 1.2])
    with left:
        robot_stage(robot, profile.get("last_animation", "idle"))
        st.write(f"**Level:** {robot.get('level', 1)}")
        st.write(f"**Energy:** {'🔋' * int(robot.get('energy', 3))}")
        st.write(f"**Favorite job:** {robot.get('favorite_job') or 'Still deciding'}")
    with right:
        active = set(state.get("active_decorations", []))
        room_items = [label for item_id, label, _ in DECORATIONS if item_id in active]
        with st.container(border=True):
            st.markdown("### Room display")
            if room_items:
                for item in room_items:
                    st.markdown(f"- {item}")
            else:
                st.write("The room is ready for its first decoration.")
            st.caption(
                f"Memories: {len(profile.get('memories', []))} · "
                f"Animals: {len(profile.get('discovered_animals', []))} · "
                f"Monsters: {len(profile.get('monsters', []))}"
            )

    st.markdown("## 🛠️ Decoration Workshop")
    stars = int(profile.get("stars", 0))
    cols = st.columns(2)
    for index, (item_id, label, cost) in enumerate(DECORATIONS):
        owned = item_id in state.get("decorations", [])
        placed = item_id in state.get("active_decorations", [])
        with cols[index % 2]:
            with st.container(border=True):
                st.markdown(f"### {label}")
                st.caption(f"Unlock requirement: {cost} stars")
                if placed:
                    st.success("Placed in the room")
                elif owned or stars >= cost:
                    if st.button("Place Decoration", key=f"decorate_{item_id}", use_container_width=True):
                        decorate_home(profile, item_id)
                        profile["sidekick_message"] = f"{robot['name']}: My room looks better already!"
                        st.rerun()
                else:
                    st.button(
                        f"🔒 Need {cost - stars} more stars",
                        key=f"decor_locked_{item_id}",
                        disabled=True,
                        use_container_width=True,
                    )

    st.markdown("## 🏆 Trophy Shelf")
    shelf = st.columns(3)
    shelf[0].metric("Badges", len(profile.get("badges", [])))
    shelf[1].metric("Robot Jobs", robot.get("jobs_completed", 0))
    shelf[2].metric("Arcade Wins", profile.get("counts", {}).get("arcade_wins", 0))
