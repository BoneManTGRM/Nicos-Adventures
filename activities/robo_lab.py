"""The centerpiece robot-building activity."""

from __future__ import annotations

import html
from typing import Any

import streamlit as st

from core.achievements import record_event
from core.catalog import ANIMATIONS, ROBOT_COLORS, ROBOT_PARTS
from core.profile import (
    active_robot,
    export_profile,
    import_profile,
    remove_robot,
    save_robot,
)
from core.robot import build_robot, generate_robot_name, robot_phrase, unlocked_parts
from ui.components import hero, robot_stage, show_new_badges


def _part_selector(label: str, category: str, stars: int, key: str) -> str:
    parts = unlocked_parts(category, stars)
    labels = {part.id: f"{part.emoji} {part.label}".strip() for part in parts}
    return st.selectbox(label, options=list(labels), format_func=labels.get, key=key)


def _build_tab(profile: dict[str, Any]) -> None:
    stars = int(profile.get("stars", 0))
    st.markdown("### Build a robot friend")
    left, right = st.columns([1, 1.15], gap="large")
    with left:
        suggested = generate_robot_name(seed=stars + len(profile.get("robots", [])))
        name = st.text_input("Robot name", value=suggested, max_chars=24)
        head = _part_selector("🤖 Head", "head", stars, "build_head")
        eyes = _part_selector("👀 Eyes", "eyes", stars, "build_eyes")
        arms = _part_selector("💪 Arms", "arms", stars, "build_arms")
        base = _part_selector("🛞 Legs or wheels", "base", stars, "build_base")
        color = st.selectbox("🎨 Color", options=list(ROBOT_COLORS), key="build_color")
        power = _part_selector("⚡ Special power", "power", stars, "build_power")
        hat = _part_selector("🎩 Hat", "hat", stars, "build_hat")
        build_clicked = st.button("🤖 Build Robot", type="primary", use_container_width=True)

    preview = {
        "name": name,
        "head": head,
        "eyes": eyes,
        "arms": arms,
        "base": base,
        "color": color,
        "power": power,
        "hat": hat,
        "energy": 3,
        "mood": "Happy",
    }
    with right:
        st.caption("Live preview")
        robot_stage(preview)
        power_label = next(part.label for part in ROBOT_PARTS["power"] if part.id == power)
        energy_full = min(5, 3 + (stars >= 8) + (stars >= 18))
        st.markdown(
            f"**Power:** {html.escape(power_label)}  \n"
            f"**Energy:** {'🔋' * energy_full}{'☆' * (5 - energy_full)}  \n"
            "**Mood:** Happy 😊"
        )

    if build_clicked:
        robot = build_robot(
            name=name,
            eyes=eyes,
            head=head,
            arms=arms,
            base=base,
            color=color,
            power=power,
            hat=hat,
            stars=stars,
        )
        save_robot(profile, robot)
        badges = record_event(profile, "robot_builds")
        profile["sidekick_message"] = robot_phrase("built", robot["name"], seed=robot["id"])
        profile["last_animation"] = "flash"
        st.success(f"{robot['name']} is alive and ready for adventures!")
        show_new_badges(badges)
        st.rerun()


def _move_tab(profile: dict[str, Any]) -> None:
    robot = active_robot(profile)
    if not robot:
        st.info("Build a robot first, then come back to make it move.")
        return

    st.markdown(f"### Play with {robot['name']}")
    robot_stage(robot, profile.get("last_animation", "idle"))
    cols = st.columns(4)
    for index, (action_id, (label, emoji)) in enumerate(ANIMATIONS.items()):
        with cols[index % 4]:
            if st.button(f"{emoji} {label}", key=f"move_{action_id}", use_container_width=True):
                profile["last_animation"] = action_id
                profile["sidekick_message"] = f"{robot['name']}: {label} sequence activated!"
                badges = record_event(profile, "robot_moves")
                show_new_badges(badges)
                st.rerun()

    st.markdown("### Robot jobs")
    jobs = {
        "Scout Animal Forest": "I found fresh paw prints near the panda trail!",
        "Scan Monster Lab": "Scan complete: the monsters are 97% silly.",
        "Recommend a Story": "I recommend a space adventure with a tiny dragon.",
    }
    job_cols = st.columns(3)
    for col, (job, result) in zip(job_cols, jobs.items(), strict=True):
        with col:
            if st.button(job, key=f"job_{job}", use_container_width=True):
                profile["sidekick_message"] = f"{robot['name']}: {result}"
                badges = record_event(profile, "robot_jobs")
                show_new_badges(badges)
                st.rerun()


def _friends_tab(profile: dict[str, Any]) -> None:
    robots = profile.get("robots", [])
    if not robots:
        st.info("No robot friends yet. Build the first one in the Build tab.")
        return
    st.markdown("### Robot Friends")
    st.caption("Keep up to eight friends. Choose one to be the active sidekick.")
    for robot in robots:
        with st.container(border=True):
            a, b, c = st.columns([2, 1, 1])
            active = robot.get("id") == profile.get("active_robot_id")
            a.markdown(f"### 🤖 {robot.get('name', 'Robot')} {'⭐' if active else ''}")
            a.caption(f"Power: {robot.get('power', 'bubble').replace('_', ' ').title()} • Mood: {robot.get('mood', 'Happy')}")
            if b.button("Make Sidekick", key=f"activate_{robot['id']}", disabled=active, use_container_width=True):
                profile["active_robot_id"] = robot["id"]
                profile["sidekick_message"] = f"{robot['name']}: Sidekick mode activated!"
                st.rerun()
            if c.button("Remove", key=f"remove_{robot['id']}", use_container_width=True):
                remove_robot(profile, robot["id"])
                st.rerun()


def _upgrades_tab(profile: dict[str, Any]) -> None:
    stars = int(profile.get("stars", 0))
    st.markdown("### Upgrade Workshop")
    st.write(f"You have **{stars} stars**. Play activities to unlock more parts.")
    for category, parts in ROBOT_PARTS.items():
        st.markdown(f"#### {category.title()}")
        chips = []
        for part in parts:
            if part.unlock_stars <= stars:
                chips.append(f"✅ {part.emoji} {part.label}")
            else:
                chips.append(f"🔒 {part.label} · {part.unlock_stars} ⭐")
        st.write("  •  ".join(chips))


def _save_tab(profile: dict[str, Any]) -> None:
    st.markdown("### Adventure Save")
    st.write("Download Nico's progress, then upload the same file on another visit or device.")
    st.download_button(
        "⬇️ Download Adventure Save",
        data=export_profile(profile),
        file_name="nicos-world-save.json",
        mime="application/json",
        use_container_width=True,
    )
    uploaded = st.file_uploader("Upload an adventure save", type=["json"])
    if uploaded and st.button("Restore Adventure", type="primary"):
        try:
            st.session_state.profile = import_profile(uploaded.getvalue())
        except ValueError as exc:
            st.error(str(exc))
        else:
            st.success("Adventure restored.")
            st.rerun()


def render(profile: dict[str, Any]) -> None:
    hero("Robo Lab", "Build a robot, bring it to life, and make it Nico's sidekick everywhere.")
    tabs = st.tabs(["🛠️ Build", "🎮 Move & Jobs", "🤖 Friends", "🔓 Upgrades", "💾 Adventure Save"])
    with tabs[0]:
        _build_tab(profile)
    with tabs[1]:
        _move_tab(profile)
    with tabs[2]:
        _friends_tab(profile)
    with tabs[3]:
        _upgrades_tab(profile)
    with tabs[4]:
        _save_tab(profile)
