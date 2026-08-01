"""Home activity."""

from __future__ import annotations

from typing import Any

import streamlit as st

from core.achievements import level_for_stars
from core.navigation import queue_navigation
from core.profile import active_robot
from core.robot import robot_phrase
from ui.components import activity_card, hero


def render(profile: dict[str, Any]) -> None:
    kid_name = profile.get("kid_name", "Nico")
    hero(
        f"Welcome to {kid_name}'s World!",
        "Build, explore, create, and grow with a robot sidekick that remembers the adventure.",
    )

    robot = active_robot(profile)
    if robot:
        profile["sidekick_message"] = robot_phrase("home", robot["name"], seed=profile.get("xp", 0))
    else:
        st.warning("Your first mission is waiting: visit Robo Lab and build a robot sidekick.")

    stars = int(profile.get("stars", 0))
    metrics = st.columns(4)
    metrics[0].metric("⭐ Adventure Stars", stars)
    metrics[1].metric("🚀 Explorer Level", level_for_stars(stars))
    metrics[2].metric("🏅 Badges", len(profile.get("badges", [])))
    metrics[3].metric("✨ Memories", len(profile.get("memories", [])))

    st.subheader("Choose an adventure")
    cards = (
        ("🤖", "Robo Lab", "Build from dozens of parts, animate, upgrade, and befriend robots."),
        ("🐾", "Animal Forest", "Discover animals, save favorites, and create new forest friends."),
        ("👾", "Monster Lab", "Invent silly monsters and keep them in the collection."),
        ("✨", "Memory Book", "See every robot, animal, monster, and special adventure memory."),
        ("⭐", "Badge Book", "Track achievements, stars, and what to unlock next."),
    )
    cols = st.columns(3)
    for index, card in enumerate(cards):
        with cols[index % 3]:
            activity_card(*card)
            st.button(
                f"Open {card[1]}",
                key=f"home_{card[1]}",
                use_container_width=True,
                on_click=queue_navigation,
                args=(st.session_state, card[1]),
            )

    st.subheader("Coming as Nico's World grows")
    st.caption("📖 Story Builder  •  🎨 Art Gallery  •  😂 Joke Machine  •  🧩 Mini Games")
