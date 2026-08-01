"""Reusable Streamlit visual components."""

from __future__ import annotations

import html
from typing import Any

import streamlit as st

from core.profile import active_robot
from core.robot_art import ROBOT_ART_CSS, infer_frame, sidekick_html
from core.robot_art import robot_html as render_robot_html


def hero(title: str, subtitle: str) -> None:
    st.markdown(
        f'<section class="hero"><h1>{html.escape(title)}</h1>'
        f'<p>{html.escape(subtitle)}</p></section>',
        unsafe_allow_html=True,
    )


def activity_card(icon: str, title: str, text: str) -> None:
    st.markdown(
        '<div class="activity-card">'
        f'<div class="big-icon">{html.escape(icon)}</div>'
        f'<h3>{html.escape(title)}</h3>'
        f'<p>{html.escape(text)}</p></div>',
        unsafe_allow_html=True,
    )


def _default_scene(robot: dict[str, Any]) -> str:
    frame = infer_frame(robot)
    if frame == "Aerial Frame":
        return "moon"
    if frame == "Heavy Frame":
        return "workshop"
    if frame == "Arcane Frame":
        return "royal"
    if frame == "Scout Frame":
        return "forest"
    return "hangar"


def robot_html(
    robot: dict[str, Any],
    animation: str = "idle",
    compact: bool = False,
    scene: str | None = None,
) -> str:
    """Return the layered SVG robot markup used throughout Streamlit."""
    return render_robot_html(
        robot,
        animation=animation,
        compact=compact,
        scene=scene or _default_scene(robot),
    )


robot_html._mecha_art_v3 = True


def robot_stage(
    robot: dict[str, Any],
    animation: str = "idle",
    scene: str | None = None,
) -> None:
    """Render a stage without going through legacy monkey-patched wrappers."""
    st.markdown(ROBOT_ART_CSS, unsafe_allow_html=True)
    st.markdown(
        render_robot_html(
            robot,
            animation=animation,
            scene=scene or _default_scene(robot),
        ),
        unsafe_allow_html=True,
    )


def render_sidekick(profile: dict[str, Any]) -> None:
    robot = active_robot(profile)
    message = html.escape(str(profile.get("sidekick_message", "Ready!")))
    st.markdown(f'<div class="speech">{message}</div>', unsafe_allow_html=True)
    if robot:
        st.markdown(ROBOT_ART_CSS, unsafe_allow_html=True)
        st.markdown(sidekick_html(robot), unsafe_allow_html=True)
    else:
        st.info("Build a robot in Robo Lab to meet your sidekick.")


def show_new_badges(badges: list[Any]) -> None:
    for badge in badges:
        st.balloons()
        st.success(f"Badge unlocked: {badge.emoji} {badge.title}")
