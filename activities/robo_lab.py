"""The centerpiece robot-building and customization activity."""

from __future__ import annotations

import html
import random
from typing import Any

import streamlit as st

from core.achievements import record_event
from core.catalog import (
    ANIMATIONS,
    ROBOT_COLORS,
    ROBOT_EYE_GLOWS,
    ROBOT_FINISHES,
    ROBOT_MOODS,
    ROBOT_PARTS,
    ROBOT_PATTERNS,
    ROBOT_PERSONALITIES,
    ROBOT_PRESETS,
    ROBOT_SIZES,
    ROBOT_VOICES,
)
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
    ROBOT_PART_DEFAULTS,
    ROBOT_STYLE_DEFAULTS,
    build_robot,
    customize_robot,
    find_part,
    generate_robot_name,
    preset_customization,
    random_robot_parts,
    random_robot_style,
    robot_phrase,
    unlocked_parts,
)
from ui.components import hero, robot_stage, show_new_badges

PART_LABELS: dict[str, str] = {
    "head": "🤖 Head",
    "eyes": "👀 Eyes",
    "mouth": "😄 Mouth",
    "antenna": "📡 Antenna",
    "ears": "🎧 Ears",
    "shoulders": "🦾 Shoulders",
    "arms": "💪 Arms",
    "body": "🧰 Body",
    "chest": "🏅 Chest badge",
    "base": "🛞 Legs or wheels",
    "backpack": "🎒 Backpack",
    "companion": "🐾 Mini companion",
    "power": "⚡ Special power",
    "hat": "🎩 Hat",
}

PART_GROUPS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("Face & Head", ("head", "eyes", "mouth", "antenna", "ears")),
    ("Body & Arms", ("shoulders", "arms", "body", "chest")),
    ("Gear & Movement", ("base", "backpack", "companion", "power", "hat")),
)


def _key(prefix: str, field: str) -> str:
    return f"{prefix}_{field}"


def _part_selector(label: str, category: str, stars: int, key: str) -> str:
    parts = unlocked_parts(category, stars)
    options = [part.id for part in parts]
    labels = {part.id: f"{part.emoji} {part.label}".strip() for part in parts}
    if st.session_state.get(key) not in options:
        st.session_state[key] = options[0]
    selected = st.selectbox(label, options=options, format_func=labels.get, key=key)
    locked = len(ROBOT_PARTS[category]) - len(parts)
    if locked:
        st.caption(f"{len(parts)} available · {locked} unlock with stars")
    else:
        st.caption(f"All {len(parts)} options unlocked")
    return selected


def _set_editor_values(prefix: str, values: dict[str, Any], *, name: str | None = None) -> None:
    for category, fallback in ROBOT_PART_DEFAULTS.items():
        st.session_state[_key(prefix, category)] = str(values.get(category, fallback))
    for field, fallback in ROBOT_STYLE_DEFAULTS.items():
        st.session_state[_key(prefix, field)] = str(values.get(field, fallback))
    st.session_state[_key(prefix, "catchphrase")] = str(values.get("catchphrase", ""))
    if name is not None:
        st.session_state[_key(prefix, "name")] = name[:24]


def _ensure_editor_defaults(prefix: str, *, name_seed: int | str) -> None:
    defaults = {
        **ROBOT_PART_DEFAULTS,
        **ROBOT_STYLE_DEFAULTS,
        "catchphrase": ROBOT_PERSONALITIES[ROBOT_STYLE_DEFAULTS["personality"]],
    }
    for field, value in defaults.items():
        st.session_state.setdefault(_key(prefix, field), value)
    st.session_state.setdefault(_key(prefix, "name"), generate_robot_name(seed=name_seed))


def _randomize_editor(prefix: str, stars: int, mode: str) -> None:
    seed = random.randint(0, 10_000_000)
    values = random_robot_style(seed) if mode == "style" else random_robot_parts(stars, seed=seed)
    if mode == "parts":
        values = {category: values[category] for category in ROBOT_PARTS}
    current = {
        field: st.session_state.get(_key(prefix, field), fallback)
        for field, fallback in {
            **ROBOT_PART_DEFAULTS,
            **ROBOT_STYLE_DEFAULTS,
            "catchphrase": "",
        }.items()
    }
    _set_editor_values(
        prefix,
        {**current, **values},
        name=(
            generate_robot_name(seed)
            if mode == "all"
            else str(st.session_state.get(_key(prefix, "name"), "BuddyBot"))
        ),
    )


def _apply_preset(prefix: str, stars: int) -> None:
    preset_name = str(st.session_state.get(_key(prefix, "preset"), "Classic Buddy"))
    values = preset_customization(preset_name, stars)
    _set_editor_values(
        prefix,
        {**values, "mood": "Excited"},
        name=str(
            st.session_state.get(
                _key(prefix, "name"),
                generate_robot_name(preset_name),
            )
        ),
    )


def _load_active_builder(profile: dict[str, Any]) -> None:
    robot = active_robot(profile)
    if robot:
        _set_editor_values("build", robot, name=f"{robot.get('name', 'BuddyBot')} II")


def _available_presets(stars: int) -> list[str]:
    return [
        name
        for name, values in ROBOT_PRESETS.items()
        if int(values.get("unlock_stars", 0)) <= stars
    ]


def _customization_fields(prefix: str, stars: int) -> tuple[str, dict[str, str], dict[str, str]]:
    name = st.text_input("Robot name", max_chars=24, key=_key(prefix, "name"))
    sections = st.tabs(["🧩 Parts", "🎨 Paint & Style", "💬 Personality"])
    parts: dict[str, str] = {}

    with sections[0]:
        group_tabs = st.tabs([group_name for group_name, _ in PART_GROUPS])
        for tab, (_, categories) in zip(group_tabs, PART_GROUPS, strict=True):
            with tab:
                columns = st.columns(2)
                for index, category in enumerate(categories):
                    with columns[index % 2]:
                        parts[category] = _part_selector(
                            PART_LABELS[category],
                            category,
                            stars,
                            _key(prefix, category),
                        )

    with sections[1]:
        colors = st.columns(2)
        with colors[0]:
            primary = st.selectbox(
                "Primary color",
                options=list(ROBOT_COLORS),
                key=_key(prefix, "color"),
            )
        with colors[1]:
            secondary = st.selectbox(
                "Secondary color",
                options=list(ROBOT_COLORS),
                key=_key(prefix, "secondary_color"),
            )
        style_cols = st.columns(2)
        with style_cols[0]:
            finish = st.selectbox(
                "Surface finish",
                options=list(ROBOT_FINISHES),
                key=_key(prefix, "finish"),
            )
            pattern = st.selectbox(
                "Paint pattern",
                options=list(ROBOT_PATTERNS),
                key=_key(prefix, "pattern"),
            )
        with style_cols[1]:
            eye_glow = st.selectbox(
                "Eye glow",
                options=list(ROBOT_EYE_GLOWS),
                key=_key(prefix, "eye_glow"),
            )
            size = st.selectbox(
                "Robot size",
                options=list(ROBOT_SIZES),
                key=_key(prefix, "size"),
            )

    with sections[2]:
        personality_cols = st.columns(2)
        with personality_cols[0]:
            voice = st.selectbox(
                "Voice",
                options=list(ROBOT_VOICES),
                key=_key(prefix, "voice"),
            )
            personality = st.selectbox(
                "Personality",
                options=list(ROBOT_PERSONALITIES),
                key=_key(prefix, "personality"),
            )
        with personality_cols[1]:
            mood = st.selectbox(
                "Mood",
                options=list(ROBOT_MOODS),
                key=_key(prefix, "mood"),
            )
            catchphrase = st.text_input(
                "Catchphrase",
                max_chars=90,
                key=_key(prefix, "catchphrase"),
                placeholder=ROBOT_PERSONALITIES[
                    st.session_state[_key(prefix, "personality")]
                ],
            )

    style = {
        "color": primary,
        "secondary_color": secondary,
        "finish": finish,
        "pattern": pattern,
        "eye_glow": eye_glow,
        "size": size,
        "voice": voice,
        "personality": personality,
        "mood": mood,
        "catchphrase": catchphrase,
    }
    return name, parts, style


def _preview(name: str, parts: dict[str, str], style: dict[str, str], stars: int) -> dict[str, Any]:
    return {
        "name": name,
        **parts,
        **style,
        "energy": min(5, 3 + (stars >= 8) + (stars >= 18)),
    }


def _quick_customization_controls(
    prefix: str,
    stars: int,
    *,
    allow_clone: bool = False,
    profile: dict[str, Any] | None = None,
) -> None:
    st.markdown("#### Quick customization")
    random_cols = st.columns(3)
    random_cols[0].button(
        "🎲 Randomize All",
        key=_key(prefix, "random_all"),
        use_container_width=True,
        on_click=_randomize_editor,
        args=(prefix, stars, "all"),
    )
    random_cols[1].button(
        "🧩 Randomize Parts",
        key=_key(prefix, "random_parts"),
        use_container_width=True,
        on_click=_randomize_editor,
        args=(prefix, stars, "parts"),
    )
    random_cols[2].button(
        "🎨 Randomize Style",
        key=_key(prefix, "random_style"),
        use_container_width=True,
        on_click=_randomize_editor,
        args=(prefix, stars, "style"),
    )

    presets = _available_presets(stars)
    preset_cols = st.columns([2, 1])
    with preset_cols[0]:
        st.selectbox("Theme preset", options=presets, key=_key(prefix, "preset"))
    with preset_cols[1]:
        st.button(
            "Apply Theme",
            key=_key(prefix, "apply_preset"),
            use_container_width=True,
            on_click=_apply_preset,
            args=(prefix, stars),
        )

    if allow_clone and profile is not None:
        current = active_robot(profile)
        st.button(
            "🧬 Copy My Sidekick Into Builder",
            key=_key(prefix, "clone_sidekick"),
            use_container_width=True,
            disabled=current is None,
            on_click=_load_active_builder,
            args=(profile,),
        )


def _build_tab(profile: dict[str, Any]) -> None:
    stars = int(profile.get("stars", 0))
    total_parts = sum(len(parts) for parts in ROBOT_PARTS.values())
    _ensure_editor_defaults("build", name_seed=stars + len(profile.get("robots", [])))

    st.markdown("### Build a completely unique robot")
    st.caption(
        f"Mix {total_parts} physical parts across {len(ROBOT_PARTS)} categories, "
        f"{len(ROBOT_COLORS)} colors, {len(ROBOT_PATTERNS)} patterns, "
        f"{len(ROBOT_FINISHES)} finishes, {len(ROBOT_VOICES)} voices, and "
        f"{len(ROBOT_PERSONALITIES)} personalities."
    )
    _quick_customization_controls(
        "build",
        stars,
        allow_clone=True,
        profile=profile,
    )

    left, right = st.columns([1.2, 1], gap="large")
    with left:
        name, parts, style = _customization_fields("build", stars)
        build_clicked = st.button(
            "🤖 Build and Remember Robot",
            type="primary",
            use_container_width=True,
        )

    preview = _preview(name, parts, style, stars)
    with right:
        st.caption("Live preview")
        robot_stage(preview)
        st.markdown(
            f"**Power:** {html.escape(find_part('power', parts['power']).label)}  \n"
            f"**Look:** {html.escape(style['pattern'])} · {html.escape(style['finish'])}  \n"
            f"**Personality:** {html.escape(style['personality'])}  \n"
            f"**Voice:** {html.escape(style['voice'])}"
        )

    if build_clicked:
        robot = build_robot(name=name, stars=stars, **parts, **style)
        save_robot(profile, robot)
        badges = record_event(profile, "robot_builds")
        remember(
            profile,
            kind="robot",
            title=f"Built {robot['name']}",
            detail=(
                f"A {style['pattern'].lower()} {style['color'].lower()} and "
                f"{style['secondary_color'].lower()} robot with a "
                f"{style['personality'].lower()} personality."
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


def _load_selected_editor(profile: dict[str, Any]) -> None:
    selected_id = st.session_state.get("edit_robot_choice")
    robot = next(
        (item for item in profile.get("robots", []) if item.get("id") == selected_id),
        None,
    )
    if robot:
        _set_editor_values("edit", robot, name=str(robot.get("name", "BuddyBot")))
        st.session_state["_edit_loaded_robot"] = selected_id


def _edit_tab(profile: dict[str, Any]) -> None:
    robots = profile.get("robots", [])
    if not robots:
        st.info(
            "Build a robot first. Then this workshop can change its look "
            "without erasing its level or memories."
        )
        return

    stars = int(profile.get("stars", 0))
    robot_ids = [str(robot["id"]) for robot in robots]
    robot_names = {str(robot["id"]): str(robot.get("name", "Robot")) for robot in robots}
    if st.session_state.get("edit_robot_choice") not in robot_ids:
        st.session_state.edit_robot_choice = (
            profile.get("active_robot_id")
            if profile.get("active_robot_id") in robot_ids
            else robot_ids[0]
        )

    st.markdown("### Customize an existing robot")
    st.caption(
        "Change any part, paint, voice, or personality. The robot keeps its ID, "
        "level, XP, moves, jobs, and memories."
    )
    selected_id = st.selectbox(
        "Choose a robot",
        options=robot_ids,
        format_func=robot_names.get,
        key="edit_robot_choice",
        on_change=_load_selected_editor,
        args=(profile,),
    )
    robot = next(item for item in robots if item["id"] == selected_id)
    if st.session_state.get("_edit_loaded_robot") != selected_id:
        _load_selected_editor(profile)

    _quick_customization_controls("edit", stars)
    left, right = st.columns([1.2, 1], gap="large")
    with left:
        name, parts, style = _customization_fields("edit", stars)
        save_clicked = st.button(
            "💾 Save Robot Customization",
            type="primary",
            use_container_width=True,
        )
    with right:
        st.caption(f"Editing {robot_names[selected_id]}")
        robot_stage(_preview(name, parts, style, stars))
        st.info(
            f"Level {robot.get('level', 1)} · {robot.get('xp', 0)} XP · "
            f"{robot.get('times_moved', 0)} moves · "
            f"{robot.get('jobs_completed', 0)} jobs will be preserved."
        )

    if save_clicked:
        updated = customize_robot(
            robot,
            stars=stars,
            changes={"name": name, **parts, **style},
        )
        save_robot(profile, updated)
        badges = record_event(profile, "robot_customizations")
        remember(
            profile,
            kind="robot",
            title=f"Customized {updated['name']}",
            detail=(
                f"Installed {style['pattern'].lower()} paint, "
                f"{style['finish'].lower()} finish, and a "
                f"{style['personality'].lower()} personality."
            ),
            emoji="🎨",
            entity_id=updated["id"],
        )
        profile["sidekick_message"] = robot_phrase(
            "customized",
            updated["name"],
            seed=updated["customized_at"],
        )
        profile["last_animation"] = "celebrate"
        show_new_badges(badges)
        st.success(f"{updated['name']} has a new look and kept all progress.")
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
    if robot.get("catchphrase"):
        st.info(f"{robot['name']}: “{robot['catchphrase']}”")

    cols = st.columns(4)
    for index, (action_id, (label, emoji)) in enumerate(ANIMATIONS.items()):
        with cols[index % 4]:
            if st.button(
                f"{emoji} {label}",
                key=f"move_{action_id}",
                use_container_width=True,
            ):
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
                f"{robot.get('jobs_completed', 0)} jobs · {robot.get('pattern', 'Solid')} · "
                f"{robot.get('personality', 'Curious Explorer')}"
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
    st.write(
        f"You have **{stars} stars** and have unlocked "
        f"**{unlocked_total} of {total_parts} physical parts**."
    )
    st.progress(
        unlocked_total / total_parts,
        text=f"{total_parts - unlocked_total} parts still to discover",
    )
    st.info(
        f"Style library: {len(ROBOT_COLORS)} colors · {len(ROBOT_PATTERNS)} patterns · "
        f"{len(ROBOT_FINISHES)} finishes · {len(ROBOT_EYE_GLOWS)} eye glows · "
        f"{len(ROBOT_VOICES)} voices · {len(ROBOT_PERSONALITIES)} personalities."
    )
    for category, parts in ROBOT_PARTS.items():
        unlocked = unlocked_parts(category, stars)
        with st.expander(
            f"{PART_LABELS.get(category, category.title())} · "
            f"{len(unlocked)}/{len(parts)} unlocked"
        ):
            for part in parts:
                if part.unlock_stars <= stars:
                    st.write(f"✅ {part.emoji} **{part.label}**")
                else:
                    st.write(f"🔒 {part.label} · {part.unlock_stars} ⭐")

    st.markdown("### Theme presets")
    for name, preset in ROBOT_PRESETS.items():
        unlocked_at = int(preset.get("unlock_stars", 0))
        status = "✅ Available" if unlocked_at <= stars else f"🔒 {unlocked_at} ⭐"
        st.write(f"**{name}** · {status}")


def _save_tab(profile: dict[str, Any]) -> None:
    st.markdown("### Complete Memory Save")
    counts = collection_counts(profile)
    st.write(
        "This save includes robot builds, every customization, robot progress, custom animals, "
        "discoveries, favorites, monsters, badges, stars, unlocks, settings, and the Memory Book timeline."
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
    uploaded = st.file_uploader(
        "Upload a complete memory save",
        type=["json"],
        key="robo_memory_upload",
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
            st.success("Adventure memory restored.")
            st.rerun()


def render(profile: dict[str, Any]) -> None:
    hero(
        "Robo Lab",
        "Build, repaint, restyle, and reprogram robots without losing their memories.",
    )
    tabs = st.tabs(
        [
            "🛠️ Build",
            "🎨 Customize",
            "🎮 Move & Jobs",
            "🤖 Friends",
            "🔓 Unlocks",
            "💾 Memory Save",
        ]
    )
    with tabs[0]:
        _build_tab(profile)
    with tabs[1]:
        _edit_tab(profile)
    with tabs[2]:
        _move_tab(profile)
    with tabs[3]:
        _friends_tab(profile)
    with tabs[4]:
        _upgrades_tab(profile)
    with tabs[5]:
        _save_tab(profile)
