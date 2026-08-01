"""A detailed, interactive home for Nico's active robot."""

from __future__ import annotations

import streamlit as st

from core.profile import active_robot
from core.robot_home_scene import DECORATION_META, ROBOT_HOME_CSS, room_scene_html
from core.world2 import (
    DECORATIONS,
    ROOM_LIGHTING,
    ROOM_THEMES,
    ROOM_WEATHER,
    ensure_world2,
    record_home_interaction,
    set_home_environment,
    toggle_home_decoration,
)
from ui.components import hero


INTERACTIONS = (
    ("charge", "⚡ Charge", "charge", "Power cells full. Ready for adventure!"),
    ("dance", "💃 Dance", "dance", "Music mode activated!"),
    ("sleep", "💤 Sleep", "blink", "Entering cozy dream mode."),
    ("read", "📚 Read", "idle", "Let's open one of our saved stories."),
    ("scan", "🔭 Scan Stars", "flash", "I found a sparkling constellation!"),
    ("pet", "🐾 Play with Pet", "bounce", "Best robot-pet playtime ever!"),
)


def _environment_controls(profile: dict, state: dict) -> None:
    st.markdown('<div class="home-control-panel"><b>🎛️ Room Control Deck</b><br><small>Change the entire atmosphere instantly.</small></div>', unsafe_allow_html=True)
    cols = st.columns(3)
    theme = cols[0].selectbox(
        "Room style",
        ROOM_THEMES,
        index=ROOM_THEMES.index(state.get("home_theme", ROOM_THEMES[0])),
        key="home_theme_select",
    )
    weather = cols[1].selectbox(
        "Window view",
        ROOM_WEATHER,
        index=ROOM_WEATHER.index(state.get("home_weather", ROOM_WEATHER[0])),
        key="home_weather_select",
    )
    lighting = cols[2].selectbox(
        "Lighting",
        ROOM_LIGHTING,
        index=ROOM_LIGHTING.index(state.get("home_lighting", ROOM_LIGHTING[0])),
        key="home_lighting_select",
    )
    if (
        theme != state.get("home_theme")
        or weather != state.get("home_weather")
        or lighting != state.get("home_lighting")
    ):
        set_home_environment(profile, theme, weather, lighting)
        st.rerun()


def _interaction_controls(profile: dict, robot: dict) -> None:
    st.markdown("## 🎮 Play Inside the Room")
    st.caption("These actions animate the robot and become part of its home memory.")
    cols = st.columns(3)
    for index, (action, label, animation, message) in enumerate(INTERACTIONS):
        with cols[index % 3]:
            if st.button(label, key=f"home_action_{action}", use_container_width=True):
                count = record_home_interaction(profile, action)
                profile["last_animation"] = animation
                profile["sidekick_message"] = f"{robot['name']}: {message}"
                if action == "charge":
                    robot["energy"] = 5
                if action == "sleep":
                    robot["mood"] = "Sleepy"
                elif action in {"dance", "pet"}:
                    robot["mood"] = "Happy"
                profile.setdefault("memories", []).append(
                    {
                        "type": "robot_home",
                        "title": f"{robot['name']} used {label}",
                        "detail": f"Home interaction #{count}",
                    }
                )
                del profile["memories"][:-100]
                st.rerun()


def _decoration_workshop(profile: dict, state: dict, robot: dict) -> None:
    st.markdown("## 🛠️ Decoration Workshop")
    st.caption(
        "Every green item is physically visible in the room above. Store an item to remove it, then place it again whenever you want."
    )
    stars = int(profile.get("stars", 0))
    owned = set(state.get("decorations", []))
    active = set(state.get("active_decorations", []))
    cols = st.columns(3)
    for index, (item_id, label, cost) in enumerate(DECORATIONS):
        is_owned = item_id in owned
        is_active = item_id in active
        meta = DECORATION_META.get(item_id, {})
        with cols[index % 3]:
            card_class = "decoration-card placed" if is_active else "decoration-card"
            st.markdown(
                f'<div class="{card_class}"><h3>{label}</h3>'
                f'<p>{meta.get("label", "Collectible room object")}</p>'
                f'<small>Unlocks at ⭐ {cost}</small></div>',
                unsafe_allow_html=True,
            )
            if is_active:
                if st.button("📦 Store Item", key=f"store_{item_id}", use_container_width=True):
                    toggle_home_decoration(profile, item_id)
                    profile["sidekick_message"] = f"{robot['name']}: I stored {meta.get('label', label)} safely."
                    st.rerun()
            elif is_owned or stars >= cost:
                if st.button("✨ Place in Room", key=f"place_{item_id}", use_container_width=True):
                    toggle_home_decoration(profile, item_id)
                    profile["sidekick_message"] = f"{robot['name']}: Now I can actually see {meta.get('label', label)}!"
                    st.rerun()
            else:
                st.button(
                    f"🔒 Need {cost - stars} more stars",
                    key=f"decor_locked_{item_id}",
                    disabled=True,
                    use_container_width=True,
                )


def render(profile: dict) -> None:
    state = ensure_world2(profile)
    state["home_visits"] = int(state.get("home_visits", 0)) + 1
    robot = active_robot(profile)
    hero(
        "Robot Home",
        "A living headquarters where every decoration, discovery, trophy, and memory becomes part of the scene.",
    )
    if not robot:
        st.info("Build a robot in Robo Lab before opening Robot Home.")
        return

    st.markdown(ROBOT_HOME_CSS, unsafe_allow_html=True)
    _environment_controls(profile, state)

    scene = room_scene_html(
        robot,
        state.get("active_decorations", []),
        theme=state.get("home_theme", ROOM_THEMES[0]),
        weather=state.get("home_weather", ROOM_WEATHER[0]),
        lighting=state.get("home_lighting", ROOM_LIGHTING[0]),
        animation=profile.get("last_animation", "idle"),
        badges=len(profile.get("badges", [])),
        animals=len(profile.get("discovered_animals", [])),
        monsters=len(profile.get("monsters", [])),
        stories=len(state.get("stories", [])),
    )
    st.markdown(scene, unsafe_allow_html=True)

    stats = st.columns(5)
    stats[0].metric("Robot Level", robot.get("level", 1))
    stats[1].metric("Energy", f"{robot.get('energy', 3)}/5")
    stats[2].metric("Room Items", len(state.get("active_decorations", [])))
    stats[3].metric("Home Visits", state.get("home_visits", 0))
    stats[4].metric("Home Moments", sum(state.get("home_interactions", {}).values()))

    _interaction_controls(profile, robot)

    with st.expander("🏆 Living Trophy Cabinet", expanded=True):
        shelf = st.columns(4)
        shelf[0].metric("Badges", len(profile.get("badges", [])))
        shelf[1].metric("Robot Jobs", robot.get("jobs_completed", 0))
        shelf[2].metric("Arcade Wins", profile.get("counts", {}).get("arcade_wins", 0))
        shelf[3].metric("Completed Missions", len(state.get("completed_missions", [])))
        if "trophy_shelf" not in state.get("active_decorations", []):
            st.info("Place the Trophy Shelf to make these achievements appear inside the room scene.")

    _decoration_workshop(profile, state, robot)
