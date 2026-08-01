"""Reusable Streamlit visual components."""

from __future__ import annotations

import html
from typing import Any

import streamlit as st

from core.catalog import ROBOT_COLORS
from core.profile import active_robot
from core.robot import find_part


def hero(title: str, subtitle: str) -> None:
    st.markdown(
        f'<section class="hero"><h1>{html.escape(title)}</h1><p>{html.escape(subtitle)}</p></section>',
        unsafe_allow_html=True,
    )


def activity_card(icon: str, title: str, text: str) -> None:
    st.markdown(
        '<div class="activity-card">'
        f'<div class="big-icon">{html.escape(icon)}</div>'
        f'<h3>{html.escape(title)}</h3><p>{html.escape(text)}</p></div>',
        unsafe_allow_html=True,
    )


def robot_html(robot: dict[str, Any], animation: str = "idle", compact: bool = False) -> str:
    color = ROBOT_COLORS.get(str(robot.get("color")), "#94A3B8")
    eyes = html.escape(find_part("eyes", str(robot.get("eyes", "round"))).emoji)
    head_id = str(robot.get("head", "box"))
    head_styles = {
        "box": "border-radius:18px",
        "dome": "border-radius:60px 60px 22px 22px",
        "screen": "border-radius:12px;box-shadow:inset 0 0 0 6px rgba(255,255,255,.28)",
        "antenna": "border-radius:30px",
    }
    head_style = head_styles.get(head_id, head_styles["box"])
    antenna = "🌈" if head_id == "antenna" else ("📡" if head_id == "dome" else "")
    arms = html.escape(find_part("arms", str(robot.get("arms", "grabber"))).emoji).split()
    left_arm = arms[0] if arms else "C"
    right_arm = arms[-1] if arms else "C"
    base = html.escape(find_part("base", str(robot.get("base", "bronze_wheels"))).emoji)
    power = html.escape(find_part("power", str(robot.get("power", "bubble"))).emoji)
    hat = html.escape(find_part("hat", str(robot.get("hat", "none"))).emoji)
    name = html.escape(str(robot.get("name", "BuddyBot")))
    animation_class = f"anim-{animation}" if animation != "idle" else ""
    scale = ' style="transform:scale(.72); margin:-35px 0;"' if compact else ""
    return f"""<div class="robot-wrap {animation_class}"{scale}>
      <div class="robot-hat">{hat or antenna}</div>
      <div class="robot-head" style="background:{color};{head_style}">
        <div class="robot-eyes">{eyes}</div><div class="robot-mouth"></div>
      </div>
      <div class="robot-body-row">
        <div class="robot-arm">{left_arm}</div>
        <div class="robot-body" style="background:{color}"><div class="robot-power">{power}</div></div>
        <div class="robot-arm">{right_arm}</div>
      </div>
      <div class="robot-base">{base}</div><div class="robot-label">{name}</div>
    </div>"""


def robot_stage(robot: dict[str, Any], animation: str = "idle") -> None:
    st.markdown(f'<div class="robot-stage">{robot_html(robot, animation)}</div>', unsafe_allow_html=True)


def render_sidekick(profile: dict[str, Any]) -> None:
    robot = active_robot(profile)
    st.markdown('<div class="speech">' + html.escape(profile.get("sidekick_message", "Ready!")) + '</div>', unsafe_allow_html=True)
    if robot:
        color = ROBOT_COLORS.get(str(robot.get("color")), "#94A3B8")
        eyes = html.escape(find_part("eyes", str(robot.get("eyes", "round"))).emoji)
        st.markdown(
            '<div class="sidekick-mini">'
            f'<div class="sidekick-face" style="background:{color}">{eyes}</div>'
            f'<strong>{html.escape(str(robot.get("name", "BuddyBot")))}</strong><br>'
            f'<small>Mood: {html.escape(str(robot.get("mood", "Happy")))} 😊</small>'
            '</div>',
            unsafe_allow_html=True,
        )
    else:
        st.info("Build a robot in Robo Lab to meet your sidekick.")


def show_new_badges(badges: list[Any]) -> None:
    for badge in badges:
        st.balloons()
        st.success(f"Badge unlocked: {badge.emoji} {badge.title}")
