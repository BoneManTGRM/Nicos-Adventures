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


def _part(category: str, part_id: str, fallback: str):
    try:
        return find_part(category, part_id)
    except ValueError:
        return find_part(category, fallback)


def robot_html(robot: dict[str, Any], animation: str = "idle", compact: bool = False) -> str:
    color = ROBOT_COLORS.get(str(robot.get("color")), "#94A3B8")
    eyes = html.escape(_part("eyes", str(robot.get("eyes", "round")), "round").emoji)
    head_id = str(robot.get("head", "box"))
    head_styles = {
        "box": "border-radius:18px",
        "dome": "border-radius:60px 60px 22px 22px",
        "screen": "border-radius:12px;box-shadow:inset 0 0 0 6px rgba(255,255,255,.28)",
        "antenna": "border-radius:30px",
        "crystal": "border-radius:45% 45% 24px 24px;transform:rotate(1deg)",
        "cat": "border-radius:26px 26px 18px 18px",
        "knight": "border-radius:42px 42px 12px 12px",
        "astronaut": "border-radius:52px",
        "submarine": "border-radius:55px 55px 24px 24px",
        "dragon": "border-radius:35px 35px 18px 18px",
        "royal": "border-radius:20px 20px 35px 35px",
        "portal": "border-radius:50%;box-shadow:0 0 22px rgba(139,92,246,.7)",
    }
    head_style = head_styles.get(head_id, head_styles["box"])
    head_icons = {
        "antenna": "🌈",
        "dome": "📡",
        "crystal": "💎",
        "cat": "🐱",
        "knight": "🛡️",
        "astronaut": "🪐",
        "submarine": "⚓",
        "dragon": "🐲",
        "royal": "♛",
        "portal": "🌀",
    }
    antenna = head_icons.get(head_id, "")
    arms = html.escape(_part("arms", str(robot.get("arms", "grabber")), "grabber").emoji).split()
    left_arm = arms[0] if arms else "C"
    right_arm = arms[-1] if arms else "C"
    body_part = _part("body", str(robot.get("body", "classic_core")), "classic_core")
    body_id = body_part.id
    body_styles = {
        "classic_core": "border-radius:25px",
        "round_core": "border-radius:48px",
        "toolbox": "border-radius:12px",
        "aquarium": "border-radius:45px 45px 22px 22px;box-shadow:inset 0 0 0 7px rgba(255,255,255,.22)",
        "speaker": "border-radius:18px;box-shadow:inset 0 0 0 5px rgba(20,20,40,.14)",
        "crystal": "border-radius:48% 48% 20px 20px",
        "dinosaur": "border-radius:35px 20px 35px 20px",
        "space_suit": "border-radius:55px 55px 24px 24px",
        "candy": "border-radius:42px",
        "stealth": "border-radius:10px 30px 10px 30px",
        "castle": "border-radius:8px 8px 24px 24px",
        "galaxy": "border-radius:50%;box-shadow:0 0 24px rgba(108,76,241,.65)",
    }
    body_style = body_styles.get(body_id, body_styles["classic_core"])
    body_emoji = html.escape(body_part.emoji)
    base = html.escape(_part("base", str(robot.get("base", "bronze_wheels")), "bronze_wheels").emoji)
    backpack = html.escape(_part("backpack", str(robot.get("backpack", "none")), "none").emoji)
    power = html.escape(_part("power", str(robot.get("power", "bubble")), "bubble").emoji)
    hat = html.escape(_part("hat", str(robot.get("hat", "none")), "none").emoji)
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
        <div class="robot-body-shell">
          <div class="robot-backpack">{backpack}</div>
          <div class="robot-body" style="background:{color};{body_style}">
            <div class="robot-core-mark">{body_emoji}</div>
            <div class="robot-power">{power}</div>
          </div>
        </div>
        <div class="robot-arm">{right_arm}</div>
      </div>
      <div class="robot-base">{base}</div><div class="robot-label">{name}</div>
    </div>"""


def robot_stage(robot: dict[str, Any], animation: str = "idle") -> None:
    st.markdown(f'<div class="robot-stage">{robot_html(robot, animation)}</div>', unsafe_allow_html=True)


def render_sidekick(profile: dict[str, Any]) -> None:
    robot = active_robot(profile)
    message = html.escape(str(profile.get("sidekick_message", "Ready!")))
    st.markdown(f'<div class="speech">{message}</div>', unsafe_allow_html=True)
    if robot:
        color = ROBOT_COLORS.get(str(robot.get("color")), "#94A3B8")
        eyes = html.escape(_part("eyes", str(robot.get("eyes", "round")), "round").emoji)
        st.markdown(
            '<div class="sidekick-mini">'
            f'<div class="sidekick-face" style="background:{color}">{eyes}</div>'
            f'<strong>{html.escape(str(robot.get("name", "BuddyBot")))}</strong><br>'
            f'<small>Level {int(robot.get("level", 1))} · Mood: '
            f'{html.escape(str(robot.get("mood", "Happy")))} 😊</small>'
            '</div>',
            unsafe_allow_html=True,
        )
    else:
        st.info("Build a robot in Robo Lab to meet your sidekick.")


def show_new_badges(badges: list[Any]) -> None:
    for badge in badges:
        st.balloons()
        st.success(f"Badge unlocked: {badge.emoji} {badge.title}")
