"""A deep monster-building, editing, collection, and play activity."""

from __future__ import annotations

import random
from typing import Any

import streamlit as st

from core.achievements import record_event
from core.memory import remember, robot_progress
from core.monster import (
    MONSTER_ANIMATIONS,
    MONSTER_COLORS,
    MONSTER_DEFAULTS,
    MONSTER_MOODS,
    MONSTER_PARTS,
    MONSTER_PATTERNS,
    MONSTER_PERSONALITIES,
    MONSTER_POWERS,
    MONSTER_PRESETS,
    MONSTER_SIZES,
    MONSTER_TEXTURES,
    build_monster,
    customize_monster,
    monster_summary,
    normalize_monster,
    preset_monster,
    random_monster,
    save_monster,
)
from core.monster_art import MONSTER_ART_CSS, monster_card_html, monster_html
from core.profile import MAX_MONSTERS, active_robot, remove_monster
from core.robot import robot_phrase
from ui.components import hero, show_new_badges

PART_LABELS = {
    "body": "Body Shape",
    "eyes": "Eyes",
    "mouth": "Mouth",
    "horns": "Horns",
    "ears": "Ears",
    "arms": "Arms",
    "legs": "Legs or Base",
    "tail": "Tail",
    "wings": "Wings",
    "accessory": "Accessory",
}
PART_GROUPS = (
    ("Body & Face", ("body", "eyes", "mouth", "horns", "ears")),
    ("Limbs & Extras", ("arms", "legs", "tail", "wings", "accessory")),
)
FACE_OPTIONS = ("👾", "👹", "👻", "🤪", "🦄", "🐲", "🧌", "🤖", "🐙", "🦖")
NAME_STARTS = ("Wobble", "Bumble", "Fizz", "Mallow", "Spark", "Giggle", "Noodle", "Twinkle")
NAME_ENDS = ("pop", "puff", "zoom", "bean", "claw", "bop", "whisk", "sprite")


def _key(prefix: str, field: str) -> str:
    return f"{prefix}_{field}"


def _name(seed: int | str | None = None) -> str:
    rng = random.Random(seed)
    return f"{rng.choice(NAME_STARTS)}{rng.choice(NAME_ENDS)}"


def _set_editor(prefix: str, values: dict[str, Any], *, name: str | None = None) -> None:
    for field, fallback in MONSTER_DEFAULTS.items():
        st.session_state[_key(prefix, field)] = str(values.get(field, fallback))
    if name is not None:
        st.session_state[_key(prefix, "name")] = str(name)[:24]


def _ensure_editor(prefix: str, *, seed: int | str) -> None:
    for field, fallback in MONSTER_DEFAULTS.items():
        st.session_state.setdefault(_key(prefix, field), fallback)
    st.session_state.setdefault(_key(prefix, "name"), _name(seed))
    st.session_state.setdefault(_key(prefix, "preset"), "Wobblepop Classic")


def _randomize(prefix: str, mode: str) -> None:
    seed = random.randint(0, 10_000_000)
    values = random_monster(seed)
    if mode == "parts":
        values = {field: values[field] for field in MONSTER_PARTS}
    elif mode == "style":
        values = {
            field: values[field]
            for field in (
                "color",
                "secondary_color",
                "pattern",
                "texture",
                "power",
                "personality",
                "mood",
                "size",
                "face",
            )
        }
    current = {
        field: st.session_state.get(_key(prefix, field), fallback)
        for field, fallback in MONSTER_DEFAULTS.items()
    }
    _set_editor(
        prefix,
        {**current, **values},
        name=_name(seed) if mode == "all" else str(st.session_state[_key(prefix, "name")]),
    )


def _apply_preset(prefix: str) -> None:
    preset = str(st.session_state.get(_key(prefix, "preset"), "Wobblepop Classic"))
    values = preset_monster(preset)
    _set_editor(prefix, values, name=str(st.session_state.get(_key(prefix, "name"), _name())))


def _quick_controls(prefix: str, *, allow_copy: bool = False, profile: dict[str, Any] | None = None) -> None:
    st.markdown("#### Quick creation controls")
    cols = st.columns(3)
    cols[0].button(
        "🎲 Randomize All",
        key=_key(prefix, "random_all"),
        use_container_width=True,
        on_click=_randomize,
        args=(prefix, "all"),
    )
    cols[1].button(
        "🧩 Randomize Parts",
        key=_key(prefix, "random_parts"),
        use_container_width=True,
        on_click=_randomize,
        args=(prefix, "parts"),
    )
    cols[2].button(
        "🎨 Randomize Style",
        key=_key(prefix, "random_style"),
        use_container_width=True,
        on_click=_randomize,
        args=(prefix, "style"),
    )
    preset_cols = st.columns([2, 1])
    preset_cols[0].selectbox(
        "Monster theme",
        options=list(MONSTER_PRESETS),
        key=_key(prefix, "preset"),
    )
    preset_cols[1].button(
        "Apply Theme",
        key=_key(prefix, "apply_preset"),
        use_container_width=True,
        on_click=_apply_preset,
        args=(prefix,),
    )
    if allow_copy and profile is not None and profile.get("monsters"):
        latest = normalize_monster(profile["monsters"][-1])
        if latest and st.button(
            "🧬 Copy Latest Monster Into Builder",
            key=_key(prefix, "copy_latest"),
            use_container_width=True,
        ):
            _set_editor(prefix, latest, name=f"{latest['name']} Jr")
            st.rerun()


def _selector(prefix: str, field: str) -> str:
    options = list(MONSTER_PARTS[field])
    labels = MONSTER_PARTS[field]
    current = st.session_state.get(_key(prefix, field))
    if current not in options:
        st.session_state[_key(prefix, field)] = MONSTER_DEFAULTS[field]
    return str(
        st.selectbox(
            PART_LABELS[field],
            options=options,
            format_func=labels.get,
            key=_key(prefix, field),
        )
    )


def _fields(prefix: str) -> tuple[str, dict[str, str]]:
    name = st.text_input("Monster name", max_chars=24, key=_key(prefix, "name"))
    tabs = st.tabs(["🧩 Parts", "🎨 Colors & Texture", "✨ Personality & Power"])
    values: dict[str, str] = {}
    with tabs[0]:
        groups = st.tabs([title for title, _ in PART_GROUPS])
        for tab, (_, fields) in zip(groups, PART_GROUPS, strict=True):
            with tab:
                cols = st.columns(2)
                for index, field in enumerate(fields):
                    with cols[index % 2]:
                        values[field] = _selector(prefix, field)
    with tabs[1]:
        colors = st.columns(2)
        values["color"] = str(
            colors[0].selectbox(
                "Primary color",
                options=list(MONSTER_COLORS),
                format_func=lambda item: MONSTER_COLORS[item][0],
                key=_key(prefix, "color"),
            )
        )
        values["secondary_color"] = str(
            colors[1].selectbox(
                "Secondary color",
                options=list(MONSTER_COLORS),
                format_func=lambda item: MONSTER_COLORS[item][0],
                key=_key(prefix, "secondary_color"),
            )
        )
        styles = st.columns(2)
        values["pattern"] = str(
            styles[0].selectbox(
                "Pattern",
                options=list(MONSTER_PATTERNS),
                format_func=MONSTER_PATTERNS.get,
                key=_key(prefix, "pattern"),
            )
        )
        values["texture"] = str(
            styles[1].selectbox(
                "Texture",
                options=list(MONSTER_TEXTURES),
                format_func=MONSTER_TEXTURES.get,
                key=_key(prefix, "texture"),
            )
        )
        extras = st.columns(2)
        values["size"] = str(
            extras[0].selectbox(
                "Size",
                options=list(MONSTER_SIZES),
                format_func=lambda item: item.title(),
                key=_key(prefix, "size"),
            )
        )
        values["face"] = str(
            extras[1].selectbox("Collection icon", options=FACE_OPTIONS, key=_key(prefix, "face"))
        )
    with tabs[2]:
        values["power"] = str(
            st.selectbox("Silly power", options=MONSTER_POWERS, key=_key(prefix, "power"))
        )
        values["personality"] = str(
            st.selectbox(
                "Personality",
                options=MONSTER_PERSONALITIES,
                key=_key(prefix, "personality"),
            )
        )
        values["mood"] = str(
            st.selectbox("Mood", options=MONSTER_MOODS, key=_key(prefix, "mood"))
        )
    return name, values


def _preview(name: str, values: dict[str, str], *, monster_id: str = "preview") -> dict[str, Any]:
    return {
        "id": monster_id,
        "name": name,
        **MONSTER_DEFAULTS,
        **values,
    }


def _build_tab(profile: dict[str, Any]) -> None:
    _ensure_editor("monster_build", seed=len(profile.get("monsters", [])))
    st.markdown("### Design a completely unique monster friend")
    combinations = 1
    for options in MONSTER_PARTS.values():
        combinations *= len(options)
    st.caption(
        f"Mix {sum(len(options) for options in MONSTER_PARTS.values())} physical options "
        f"across {len(MONSTER_PARTS)} categories, plus colors, patterns, textures, powers, "
        f"personalities, moods, sizes, and presets. That creates more than {combinations:,} "
        "physical combinations before paint and personality are counted."
    )
    _quick_controls("monster_build", allow_copy=True, profile=profile)
    left, right = st.columns([1.15, 1], gap="large")
    with left:
        name, values = _fields("monster_build")
        save_clicked = st.button(
            "👾 Create and Remember Monster",
            type="primary",
            use_container_width=True,
        )
    with right:
        st.caption("Live layered-art preview")
        preview = _preview(name, values)
        st.markdown(monster_html(preview, scene="lab"), unsafe_allow_html=True)
        st.info(f"**Special power:** {values['power']}  \n**Personality:** {values['personality']}")

    if save_clicked:
        monster = build_monster(name=name, **values)
        save_monster(profile, monster, limit=MAX_MONSTERS)
        badges = record_event(profile, "monsters_built")
        remember(
            profile,
            kind="monster",
            title=f"Created {monster['name']}",
            detail=f"{monster['personality']} with the power to {monster['power'].lower()}.",
            emoji=monster["face"],
            entity_id=monster["id"],
            unique_key=f"monster:{monster['id']}",
        )
        robot = active_robot(profile)
        profile["sidekick_message"] = robot_phrase(
            "monster",
            robot["name"] if robot else "Robo Scanner",
            seed=monster["name"],
        )
        profile["monster_animation"] = "celebrate"
        show_new_badges(badges)
        st.success(f"{monster['name']} joined Nico's monster collection!")
        st.rerun()


def _load_editor(profile: dict[str, Any]) -> None:
    selected = st.session_state.get("monster_edit_choice")
    monster = next(
        (normalize_monster(item) for item in profile.get("monsters", []) if item.get("id") == selected),
        None,
    )
    if monster:
        _set_editor("monster_edit", monster, name=monster["name"])
        st.session_state["_monster_edit_loaded"] = selected


def _edit_tab(profile: dict[str, Any]) -> None:
    monsters = [item for item in (normalize_monster(raw) for raw in profile.get("monsters", [])) if item]
    if not monsters:
        st.info("Create a monster first. Then this studio can change every detail without erasing it.")
        return
    ids = [str(item["id"]) for item in monsters]
    labels = {str(item["id"]): str(item["name"]) for item in monsters}
    if st.session_state.get("monster_edit_choice") not in ids:
        st.session_state["monster_edit_choice"] = ids[-1]
    selected_id = str(
        st.selectbox(
            "Choose a monster to customize",
            options=ids,
            format_func=labels.get,
            key="monster_edit_choice",
            on_change=_load_editor,
            args=(profile,),
        )
    )
    selected = next(item for item in monsters if item["id"] == selected_id)
    if st.session_state.get("_monster_edit_loaded") != selected_id:
        _load_editor(profile)
    _quick_controls("monster_edit")
    left, right = st.columns([1.15, 1], gap="large")
    with left:
        name, values = _fields("monster_edit")
        save_clicked = st.button(
            "💾 Save Monster Customization",
            type="primary",
            use_container_width=True,
        )
    with right:
        st.caption(f"Editing {selected['name']}")
        st.markdown(
            monster_html(_preview(name, values, monster_id=selected_id), scene="castle"),
            unsafe_allow_html=True,
        )
        st.info(
            f"Identity, creation date, {selected.get('times_played', 0)} play moments, "
            "and existing memories will be preserved."
        )
    if save_clicked:
        updated = customize_monster(selected, name=name, changes=values)
        save_monster(profile, updated, limit=MAX_MONSTERS)
        counts = profile.setdefault("counts", {})
        counts["monster_customizations"] = int(counts.get("monster_customizations", 0)) + 1
        remember(
            profile,
            kind="monster",
            title=f"Customized {updated['name']}",
            detail=monster_summary(updated),
            emoji=updated["face"],
            entity_id=updated["id"],
        )
        profile["sidekick_message"] = f"{updated['name']} has a brand-new look and the same memories!"
        profile["monster_animation"] = "celebrate"
        st.success(f"{updated['name']} kept every memory and received the new design.")
        st.rerun()


def _collection_tab(profile: dict[str, Any]) -> None:
    monsters = [item for item in (normalize_monster(raw) for raw in profile.get("monsters", [])) if item]
    if not monsters:
        st.info("No monster friends yet. Build the first one in the Create tab.")
        return
    st.markdown(f"### Monster Friends · {len(monsters)}/{MAX_MONSTERS}")
    st.caption("Every monster keeps its full body, paint, power, personality, and play history.")
    cols = st.columns(2)
    for index, monster in enumerate(reversed(monsters)):
        with cols[index % 2]:
            with st.container(border=True):
                st.markdown(monster_card_html(monster), unsafe_allow_html=True)
                st.caption(monster_summary(monster))
                actions = st.columns(2)
                if actions[0].button(
                    "🎨 Load in Editor",
                    key=f"edit_monster_{monster['id']}",
                    use_container_width=True,
                ):
                    st.session_state["monster_edit_choice"] = monster["id"]
                    _set_editor("monster_edit", monster, name=monster["name"])
                    st.session_state["_monster_edit_loaded"] = monster["id"]
                    st.info("Loaded. Open the Edit Monster tab above.")
                if actions[1].button(
                    "Remove",
                    key=f"remove_monster_{monster['id']}",
                    use_container_width=True,
                ):
                    remove_monster(profile, str(monster["id"]))
                    st.rerun()


def _play_tab(profile: dict[str, Any]) -> None:
    monsters = [item for item in (normalize_monster(raw) for raw in profile.get("monsters", [])) if item]
    if not monsters:
        st.info("Create a monster before opening the Monster Playground.")
        return
    labels = {item["id"]: item["name"] for item in monsters}
    selected_id = str(
        st.selectbox(
            "Choose a monster friend",
            options=list(labels),
            format_func=labels.get,
            key="monster_play_choice",
        )
    )
    monster = next(item for item in monsters if item["id"] == selected_id)
    animation = str(st.session_state.get("monster_animation", "idle"))
    scene = "space" if monster["pattern"] == "galaxy" else "forest" if monster["body"] == "plant" else "lab"
    st.markdown(monster_html(monster, animation=animation, scene=scene), unsafe_allow_html=True)
    cols = st.columns(3)
    for index, (action, label) in enumerate(MONSTER_ANIMATIONS.items()):
        with cols[index % 3]:
            if st.button(label, key=f"monster_move_{action}", use_container_width=True):
                st.session_state["monster_animation"] = action
                monster["times_played"] = int(monster.get("times_played", 0)) + 1
                save_monster(profile, monster, limit=MAX_MONSTERS)
                milestone = monster["times_played"]
                if milestone in {1, 5, 10, 25, 50, 100}:
                    remember(
                        profile,
                        kind="monster",
                        title=f"{monster['name']} reached {milestone} play moments",
                        detail=f"The latest move was {label.lower()}.",
                        emoji=monster["face"],
                        entity_id=monster["id"],
                        unique_key=f"monster-play:{monster['id']}:{milestone}",
                    )
                st.rerun()
    robot = active_robot(profile)
    if robot and st.button(
        f"🔎 Ask {robot['name']} to Scan {monster['name']}",
        use_container_width=True,
    ):
        profile["sidekick_message"] = (
            f"{robot['name']}: {monster['name']} is {monster['personality'].lower()}, "
            f"has {MONSTER_PARTS['wings'][monster['wings']].lower()}, and can "
            f"{monster['power'].lower()}!"
        )
        robot_progress(robot, jobs=1, xp=15)
        badges = record_event(profile, "robot_jobs")
        show_new_badges(badges)
        st.rerun()


def render(profile: dict[str, Any]) -> None:
    hero(
        "Monster Lab",
        "Build, paint, edit, animate, and remember completely unique monster friends.",
    )
    st.markdown(MONSTER_ART_CSS, unsafe_allow_html=True)
    tabs = st.tabs(["🧪 Create", "🎨 Edit Monster", "👾 Friends", "🎮 Playground"])
    with tabs[0]:
        _build_tab(profile)
    with tabs[1]:
        _edit_tab(profile)
    with tabs[2]:
        _collection_tab(profile)
    with tabs[3]:
        _play_tab(profile)
