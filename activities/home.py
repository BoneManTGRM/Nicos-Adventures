"""Home activity."""

from __future__ import annotations

from typing import Any

import streamlit as st

from core.achievements import level_for_stars
from core.profile import active_robot
from core.robot import robot_phrase
from ui.components import activity_card, hero


def render(profile: dict[str, Any]) -> None:
    kid_name = profile.get("kid_name", "Nico")
    hero(f"Welcome to {kid_name}'s World!", "Build, explore, create, and grow with your robot sidekick.")

    robot = active_robot(profile)
    if robot:
        profile["sidekick_message"] = robot_phrase("home", robot["name"], seed=profile.get("xp", 0))
    else:
        st.warning("Your first mission is waiting: visit Robo Lab and build a robot sidekick.")

    stars = int(profile.get("stars", 0))
    level = level_for_stars(stars)
    a, b, c = st.columns(3)
    a.metric("⭐ Adventure Stars", stars)
    b.metric("🚀 Explorer Level", level)
    c.metric("🏅 Badges", len(profile.get("badges", [])))

    st.subheader("Choose an adventure")
    cols = st.columns(4)
    cards = (
        ("🤖", "Robo Lab", "Build, animate, upgrade, and befriend robots."),
        ("🐾", "Animal Forest", "Discover animals and add your own fun facts."),
        ("👾", "Monster Lab", "Invent a silly monster and scan it with your robot."),
        ("⭐", "Badge Book", "See achievements and what to unlock next."),
    )
    for col, card in zip(cols, cards, strict=True):
        with col:
            activity_card(*card)
            if st.button(f"Open {card[1]}", key=f"home_{card[1]}", use_container_width=True):
                st.session_state.nav = card[1]
                st.rerun()

    st.subheader("Coming as Nico's World grows")
    st.caption("📖 Story Builder  •  🎨 Art Gallery  •  😂 Joke Machine  •  🧩 Mini Games")
