"""Collection and portable-memory activity."""

from __future__ import annotations

from typing import Any

import streamlit as st

from core.memory import collection_counts
from core.profile import export_profile, import_profile
from core.robot import find_part
from ui.components import hero, robot_html


def _part_label(category: str, part_id: str) -> str:
    try:
        return find_part(category, part_id).label
    except ValueError:
        return part_id.replace("_", " ").title()


def render(profile: dict[str, Any]) -> None:
    hero("Memory Book", "Robots, animals, monsters, and special moments are remembered together.")
    counts = collection_counts(profile)
    metrics = st.columns(5)
    metrics[0].metric("🤖 Robots", counts["robots"])
    metrics[1].metric("🐾 Created animals", counts["animals"])
    metrics[2].metric("🔎 Discoveries", counts["discoveries"])
    metrics[3].metric("👾 Monsters", counts["monsters"])
    metrics[4].metric("✨ Memories", counts["memories"])

    tabs = st.tabs(["✨ Timeline", "🤖 Robots", "🐾 Animals", "👾 Monsters", "💾 Save & Restore"])

    with tabs[0]:
        memories = list(reversed(profile.get("memories", [])))
        if not memories:
            st.info("Build a robot, remember an animal, or create a monster to start the Memory Book.")
        for memory in memories:
            with st.container(border=True):
                st.markdown(f"### {memory.get('emoji', '✨')} {memory.get('title', 'Adventure memory')}")
                if memory.get("detail"):
                    st.write(memory["detail"])
                if memory.get("created_at"):
                    st.caption(memory["created_at"].replace("T", " ").replace("+00:00", " UTC"))

    with tabs[1]:
        robots = profile.get("robots", [])
        if not robots:
            st.info("No robot memories yet. Visit Robo Lab to build one.")
        for robot in robots:
            with st.container(border=True):
                left, right = st.columns([1, 2])
                with left:
                    st.markdown(robot_html(robot, compact=True), unsafe_allow_html=True)
                with right:
                    active = robot.get("id") == profile.get("active_robot_id")
                    st.markdown(f"### {robot.get('name', 'Robot')} {'⭐ Sidekick' if active else ''}")
                    st.write(
                        f"Level **{robot.get('level', 1)}** · "
                        f"{robot.get('times_moved', 0)} moves · "
                        f"{robot.get('jobs_completed', 0)} jobs"
                    )
                    st.caption(
                        " • ".join(
                            [
                                _part_label("head", str(robot.get("head", "box"))),
                                _part_label("eyes", str(robot.get("eyes", "round"))),
                                _part_label("body", str(robot.get("body", "classic_core"))),
                                _part_label("power", str(robot.get("power", "bubble"))),
                            ]
                        )
                    )

    with tabs[2]:
        if profile.get("discovered_animals"):
            st.markdown("### Animals Nico has discovered")
            st.write(" • ".join(f"🔎 {name}" for name in profile["discovered_animals"]))
        else:
            st.info("No animal discoveries have been remembered yet.")
        if profile.get("custom_animals"):
            st.markdown("### Animals Nico created")
            for animal in profile["custom_animals"]:
                with st.container(border=True):
                    st.markdown(f"### {animal.get('emoji', '🐾')} {animal.get('name', 'Animal')}")
                    st.write(f"**Habitat:** {animal.get('habitat', 'Unknown')}")
                    st.write(animal.get("fact", ""))

    with tabs[3]:
        monsters = profile.get("monsters", [])
        if not monsters:
            st.info("No monster friends have been saved yet.")
        for monster in monsters:
            with st.container(border=True):
                st.markdown(f"### {monster.get('face', '👾')} {monster.get('name', 'Monster')}")
                st.write(
                    f"**{monster.get('color', 'Purple')} · {monster.get('body', 'Fluffy')}**  \n"
                    f"{monster.get('eyes', 'Googly eyes')}  \n"
                    f"*{monster.get('personality', 'Curious and polite')}*"
                )
                st.caption(f"Power: {monster.get('power', 'Make everyone giggle')}")

    with tabs[4]:
        st.markdown("### Complete Adventure Memory")
        st.write(
            "Every change is remembered automatically while this browser session is open. "
            "Download this file to keep all robots, animals, monsters, badges, unlocks, and memories for another visit."
        )
        st.download_button(
            "⬇️ Download Complete Memory Save",
            data=export_profile(profile),
            file_name="nicos-world-memory.json",
            mime="application/json",
            use_container_width=True,
        )
        uploaded = st.file_uploader("Upload a Nico's World memory file", type=["json"], key="memory_upload")
        if uploaded and st.button("Restore Complete Memory", type="primary", use_container_width=True):
            try:
                st.session_state.profile = import_profile(uploaded.getvalue())
            except ValueError as exc:
                st.error(str(exc))
            else:
                st.success("Memory restored. All collections are back.")
                st.rerun()
