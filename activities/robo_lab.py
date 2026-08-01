"""The centerpiece robot-building activity."""

from __future__ import annotations

import html
import random
from typing import Any

import streamlit as st

from core.achievements import record_event
from core.catalog import ANIMATIONS, ROBOT_COLORS, ROBOT_PARTS
from core.memory import collection_counts, remember, robot_progress
from core.profile import (
    MAX_ROBOTS,
    active_robot,
    export_profile,
    import_profile,
    remove_robot,
    save_robot,
)
from core.robot import (
    build_robot,
    find_part,
    generate_robot_name,
    random_robot_parts,
    robot_phrase,
    unlocked_parts,
)
from ui.components import hero, robot_stage, show_new_badges

BUILD_KEYS = {
    "eyes": "build_eyes",
    "head": "build_head",
    "arms": "build_arms",
    "body": "build_body",
    "base": "build_base",
    "backpack": "build_backpack",
    "power": "build_power",
    "hat": "build_hat",
}


def _part_selector(label: str, category: str, stars: int, key: str) -> str:
    parts = unlocked_parts(category, stars)
    options = [part.id for part in parts]
    labels = {part.id: f"{part.emoji} {part.label}".strip() for part in parts}
    if st.session_state.get(key) not in options:
        st.session_state[key] = options[0]
    selected = st.selectbox(label, options=options, format_func=labels.get, key=key)
    locked = len(ROBOT_PARTS[category]) - len(parts)
    if locked:
        st.caption(f"{len(parts)} available · {locked} more unlock with stars")
    else:
        st.caption(f"All {len(parts)} options unlocked")
    return selected


def _randomize_builder(stars: int) -> None:
    seed = random.randint(0, 10_000_000)
    choices = random_robot_parts(stars, seed=seed)
    for category, key in BUILD_KEYS.items():
        st.session_state[key] = choices[category]
    st.session_state.build_color = choices["color"]
    st.session_state.build_name = generate_robot_name(seed)


def _load_active_builder(profile: dict[str, Any]) -> None:
    robot = active_robot(profile)
    if not robot:
        return
    for category, key in BUILD_KEYS.items():
        st.session_state[key] = robot.get(category, ROBOT_PARTS[category][0].id)
    st.session_state.build_color = robot.get("color", "Silver")
    st.session_state.build_name = f"{robot.get('name', 'BuddyBot')} II"[:24]


def _build_tab(profile: dict[str, Any]) -> None:
    stars = int(profile.get("stars", 0))
    st.markdown("### Build a robot friend")
    st.caption(
        f"Choose from {sum(len(parts) for parts in ROBOT_PARTS.values())} robot parts and "
        f"{len(ROBOT_COLORS)} colors. More combinations unlock as Nico earns stars."
    )
    if "build_name" not in st.session_state:
        st.session_state.build_name = generate_robot_name(seed=stars + len(profile.get("robots", [])))
    if st.session_state.get("build_color") not in ROBOT_COLORS:
        st.session_state.build_color = "Electric Blue"

    quick = st.columns(2)
    quick[0].button(
        "🎲 Surprise Robot",
        use_container_width=True,
        on_click=_randomize_builder,
        args=(stars,),
    )
    current = active_robot(profile)
    quick[1].button(
        "🧬 Build From My Sidekick",
        use_container_width=True,
        disabled=current is None,
        on_click=_load_active_builder,
        args=(profile,),
    )

    left, right = st.columns([1.1, 1], gap="large")
    with left:
        name = st.text_input("Robot name", max_chars=24, key="build_name")
        selectors = st.columns(2)
        with selectors[0]:
            head = _part_selector("🤖 Head", "head", stars, BUILD_KEYS["head"])
            eyes = _part_selector("👀 Eyes", "eyes", stars, BUILD_KEYS["eyes"])
            arms = _part_selector("💪 Arms", "arms", stars, BUILD_KEYS["arms"])
            body = _part_selector("🧰 Body", "body", stars, BUILD_KEYS["body"])
        with selectors[1]:
            base = _part_selector("🛞 Legs or wheels", "base", stars, BUILD_KEYS["base"])
            backpack = _part_selector("🎒 Backpack", "backpack", stars, BUILD_KEYS["backpack"])
            power = _part_selector("⚡ Special power", "power", stars, BUILD_KEYS["power"])
            hat = _part_selector("🎩 Hat", "hat", stars, BUILD_KEYS["hat"])
        color = st.selectbox("🎨 Color", options=list(ROBOT_COLORS), key="build_color")
        build_clicked = st.button("🤖 Build and Remember Robot", type="primary", use_container_width=True)

    preview = {
        "name": name,
        "head": head,
        "eyes": eyes,
        "arms": arms,
        "body": body,
        "base": base,
        "backpack": backpack,
        "color": color,
        "power": power,
        "hat": hat,
        "energy": 3,
        "mood": "Happy",
    }
    with right:
        st.caption("Live preview")
        robot_stage(preview)
        energy_full = min(5, 3 + (stars >= 8) + (stars >= 18))
        st.markdown(
            f"**Power:** {html.escape(find_part('power', power).label)}  \n"
            f"**Core:** {html.escape(find_part('body', body).label)}  \n"
            f"**Energy:** {'🔋' * energy_full}{'☆' * (5 - energy_full)}  \n"
            "**Mood:** Happy 😊"
        )

    if build_clicked:
        robot = build_robot(
            name=name,
            eyes=eyes,
            head=head,
            arms=arms,
            body=body,
            base=base,
            backpack=backpack,
            color=color,
            power=power,
            hat=hat,
            stars=stars,
        )
        save_robot(profile, robot)
        badges = record_event(profile, "robot_builds")
        remember(
            profile,
            kind="robot",
            title=f"Built {robot['name']}",
            detail=(
                f"A {color.lower()} robot with {find_part('eyes', eyes).label.lower()}, "
                f"{find_part('body', body).label.lower()}, and {find_part('power', power).label.lower()}."
            ),
            emoji="🤖",
            entity_id=robot["id"],
            unique_key=f"robot:{robot['id']}",
        )
        profile["sidekick_message"] = robot_phrase("built", robot["name"], seed=robot["id"])
        profile["last_animation"] = "celebrate"
        st.success(f"{robot['name']} is alive, remembered, and ready for adventures!")
        show_new_badges(badges)
        st.rerun()


def _move_tab(profile: dict[str, Any]) -> None:
    robot = active_robot(profile)
    if not robot:
        st.info("Build a robot first, then come back to make it move.")
        return

    st.markdown(f"### Play with {robot['name']}")
    status = st.columns(4)
    status[0].metric("Level", robot.get("level", 1))
    status[1].metric("Robot XP", robot.get("xp", 0))
    status[2].metric("Moves", robot.get("times_moved", 0))
    status[3].metric("Jobs", robot.get("jobs_completed", 0))
    robot_stage(robot, profile.get("last_animation", "idle"))
    cols = st.columns(4)
    for index, (action_id, (label, emoji)) in enumerate(ANIMATIONS.items()):
        with cols[index % 4]:
            if st.button(f"{emoji} {label}", key=f"move_{action_id}", use_container_width=True):
                profile["last_animation"] = action_id
                profile["sidekick_message"] = f"{robot['name']}: {label} sequence activated!"
                if action_id == "charge":
                    robot["energy"] = min(5, int(robot.get("energy", 3)) + 1)
                robot_progress(robot, moves=1, xp=10)
                badges = record_event(profile, "robot_moves")
                milestone = int(robot.get("times_moved", 0))
                if milestone in {1, 5, 10, 25, 50, 100}:
                    remember(
                        profile,
                        kind="robot",
                        title=f"{robot['name']} reached {milestone} moves",
                        detail=f"The latest move was {label.lower()}.",
                        emoji=emoji,
                        entity_id=robot["id"],
                        unique_key=f"robot-moves:{robot['id']}:{milestone}",
                    )
                show_new_badges(badges)
                st.rerun()

    st.markdown("### Robot jobs")
    jobs = {
        "Scout Animal Forest": "I found fresh paw prints near the panda trail!",
        "Scan Monster Lab": "Scan complete: the monsters are 97% silly.",
        "Recommend a Story": "I recommend a space adventure with a tiny dragon.",
        "Organize Memory Book": "Every robot, animal, and monster memory is in the right place!",
        "Charge the Workshop": "The Robo Lab has enough power for another amazing build.",
        "Find a Hidden Part": "I found a clue to the next unlock. Keep earning stars!",
    }
    job_cols = st.columns(3)
    for index, (job, result) in enumerate(jobs.items()):
        with job_cols[index % 3]:
            if st.button(job, key=f"job_{job}", use_container_width=True):
                profile["sidekick_message"] = f"{robot['name']}: {result}"
                robot["favorite_job"] = job
                robot_progress(robot, jobs=1, xp=15)
                badges = record_event(profile, "robot_jobs")
                milestone = int(robot.get("jobs_completed", 0))
                if milestone in {1, 3, 10, 25, 50}:
                    remember(
                        profile,
                        kind="robot",
                        title=f"{robot['name']} completed {milestone} jobs",
                        detail=f"Favorite recent job: {job}.",
                        emoji="🛠️",
                        entity_id=robot["id"],
                        unique_key=f"robot-jobs:{robot['id']}:{milestone}",
                    )
                show_new_badges(badges)
                st.rerun()


def _friends_tab(profile: dict[str, Any]) -> None:
    robots = profile.get("robots", [])
    if not robots:
        st.info("No robot friends yet. Build the first one in the Build tab.")
        return
    st.markdown("### Robot Friends")
    st.caption(f"Keep up to {MAX_ROBOTS} friends. Choose one to be the active sidekick.")
    for robot in robots:
        with st.container(border=True):
            a, b, c = st.columns([2.4, 1, 1])
            active = robot.get("id") == profile.get("active_robot_id")
            a.markdown(f"### 🤖 {robot.get('name', 'Robot')} {'⭐' if active else ''}")
            a.caption(
                f"Level {robot.get('level', 1)} · {robot.get('times_moved', 0)} moves · "
                f"{robot.get('jobs_completed', 0)} jobs · Power: "
                f"{find_part('power', str(robot.get('power', 'bubble'))).label}"
            )
            if b.button(
                "Make Sidekick",
                key=f"activate_{robot['id']}",
                disabled=active,
                use_container_width=True,
            ):
                profile["active_robot_id"] = robot["id"]
                profile["sidekick_message"] = f"{robot['name']}: Sidekick mode activated!"
                st.rerun()
            if c.button("Remove", key=f"remove_{robot['id']}", use_container_width=True):
                remove_robot(profile, robot["id"])
                st.rerun()


def _upgrades_tab(profile: dict[str, Any]) -> None:
    stars = int(profile.get("stars", 0))
    total_parts = sum(len(parts) for parts in ROBOT_PARTS.values())
    unlocked_total = sum(len(unlocked_parts(category, stars)) for category in ROBOT_PARTS)
    st.markdown("### Upgrade Workshop")
    st.write(f"You have **{stars} stars** and have unlocked **{unlocked_total} of {total_parts} parts**.")
    st.progress(unlocked_total / total_parts, text=f"{total_parts - unlocked_total} parts still to discover")
    for category, parts in ROBOT_PARTS.items():
        unlocked = unlocked_parts(category, stars)
        with st.expander(f"{category.title()} · {len(unlocked)}/{len(parts)} unlocked"):
            for part in parts:
                if part.unlock_stars <= stars:
                    st.write(f"✅ {part.emoji} **{part.label}**")
                else:
                    st.write(f"🔒 {part.label} · {part.unlock_stars} ⭐")


def _save_tab(profile: dict[str, Any]) -> None:
    st.markdown("### Complete Memory Save")
    counts = collection_counts(profile)
    st.write(
        "This save includes robot builds and progress, custom animals, discoveries, favorites, "
        "monsters, badges, stars, unlocks, settings, and the Memory Book timeline."
    )
    st.info(
        f"Current memory: {counts['robots']} robots · {counts['animals']} created animals · "
        f"{counts['discoveries']} discoveries · {counts['monsters']} monsters · "
        f"{counts['memories']} timeline memories"
    )
    st.download_button(
        "⬇️ Download Complete Memory Save",
        data=export_profile(profile),
        file_name="nicos-world-memory.json",
        mime="application/json",
        use_container_width=True,
    )
    uploaded = st.file_uploader("Upload a complete memory save", type=["json"], key="robo_memory_upload")
    if uploaded and st.button("Restore Complete Memory", type="primary", use_container_width=True):
        try:
            st.session_state.profile = import_profile(uploaded.getvalue())
        except ValueError as exc:
            st.error(str(exc))
        else:
            st.success("Adventure memory restored.")
            st.rerun()


def render(profile: dict[str, Any]) -> None:
    hero(
        "Robo Lab",
        "Build from dozens of parts, bring robots to life, and save their adventures to memory.",
    )
    tabs = st.tabs(
        ["🛠️ Build", "🎮 Move & Jobs", "🤖 Friends", "🔓 Upgrades", "💾 Memory Save"]
    )
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
