"""Badge Book activity."""

from __future__ import annotations

from typing import Any

import streamlit as st

from core.achievements import BADGES, badge_progress, level_for_stars
from core.profile import active_robot
from core.robot import robot_phrase
from ui.components import hero


def render(profile: dict[str, Any]) -> None:
    hero("Badge Book", "Every small creation helps Nico's World grow.")
    stars = int(profile.get("stars", 0))
    level = level_for_stars(stars)
    st.markdown(f"## Explorer Level {level} · {stars} ⭐")
    st.progress((stars % 10) / 10, text=f"{10 - (stars % 10)} stars to the next level" if stars % 10 else "New level started")

    earned = set(profile.get("badges", []))
    cols = st.columns(2)
    for index, badge in enumerate(BADGES):
        current, target = badge_progress(profile, badge)
        with cols[index % 2]:
            with st.container(border=True):
                st.markdown(f"### {badge.emoji if badge.id in earned else '🔒'} {badge.title}")
                st.write(badge.description)
                st.progress(current / target, text=f"{current} / {target}")

    robot = active_robot(profile)
    if robot:
        profile["sidekick_message"] = robot_phrase("badge", robot["name"], seed=len(earned))
