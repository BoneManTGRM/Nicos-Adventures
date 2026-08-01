"""Silly Monster Lab activity."""

from __future__ import annotations

import random
import re
from typing import Any

import streamlit as st

from core.achievements import record_event
from core.memory import new_id, remember, robot_progress, utc_now
from core.profile import MAX_MONSTERS, active_robot, remove_monster
from core.robot import robot_phrase
from ui.components import hero, show_new_badges

BODIES = (
    "Fluffy", "Bouncy", "Slimy", "Blocky", "Cloudy", "Jelly", "Rocky", "Feathery",
    "Tiny and round", "Tall and wobbly",
)
EYES = (
    "One giant eye", "Three tiny eyes", "Star eyes", "Googly eyes", "Sleepy eyes",
    "Rainbow eyes", "Robot eyes", "Six blinking eyes", "Invisible eyes", "Heart eyes",
)
COLORS = (
    "Purple", "Lime green", "Sky blue", "Orange", "Rainbow", "Golden", "Bubblegum pink",
    "Midnight blue", "Polka-dot", "Glowing silver",
)
POWERS = (
    "Sneeze confetti", "Turn hiccups into bubbles", "Talk to socks", "Grow pizza flowers",
    "Make tiny thunder", "Freeze puddles into slides", "Summon dancing bananas",
    "Turn shadows into puppets", "Make books giggle", "Create marshmallow clouds",
)
PERSONALITIES = (
    "Brave but ticklish", "Shy and musical", "Curious and polite", "Wildly dramatic",
    "Sleepy and clever", "Helpful and bouncy", "Serious about snacks", "Friendly but forgetful",
    "Excited by everything", "Quietly hilarious",
)
FACES = ("👾", "👹", "👻", "🤪", "🦄", "🐲", "🧌", "🤖", "🐙", "🦖")


def render(profile: dict[str, Any]) -> None:
    hero("Monster Lab", "Mix silly traits, create a new friend, and let the robot run a scan.")
    left, right = st.columns([1, 1.1], gap="large")
    with left:
        name = st.text_input("Monster name", value="Wobblepop", max_chars=24)
        body = st.selectbox("Body", BODIES)
        eyes = st.selectbox("Eyes", EYES)
        color = st.selectbox("Color", COLORS)
        power = st.selectbox("Silly power", POWERS)
        personality = st.selectbox("Personality", PERSONALITIES)
        face = st.selectbox("Face", FACES)
        if st.button("🎲 Surprise Me", use_container_width=True):
            st.session_state.monster_surprise = random.randint(0, 1_000_000)
            st.rerun()

    seed = st.session_state.get("monster_surprise")
    if seed is not None:
        rng = random.Random(seed)
        body, eyes, color, power, personality, face = (
            rng.choice(BODIES),
            rng.choice(EYES),
            rng.choice(COLORS),
            rng.choice(POWERS),
            rng.choice(PERSONALITIES),
            rng.choice(FACES),
        )

    clean_name = re.sub(r"[^A-Za-z0-9 '\-]", "", name).strip()[:24] or "Wobblepop"
    monster = {
        "id": new_id("monster"),
        "name": clean_name,
        "body": body,
        "eyes": eyes,
        "color": color,
        "power": power,
        "personality": personality,
        "face": face,
        "created_at": utc_now(),
    }
    with right:
        st.markdown(
            f"<div class='robot-stage'><div style='text-align:center;z-index:2'>"
            f"<div style='font-size:7rem'>{face}</div><h2>{clean_name}</h2>"
            f"<strong>{color} • {body}</strong><br>{eyes}<br><em>{personality}</em>"
            f"</div></div>",
            unsafe_allow_html=True,
        )
        st.info(f"Special power: **{power}**")

    if st.button("👾 Save Monster to Memory", type="primary", use_container_width=True):
        monsters = profile.setdefault("monsters", [])
        monsters.append(monster)
        del monsters[:-MAX_MONSTERS]
        badges = record_event(profile, "monsters_built")
        remember(
            profile,
            kind="monster",
            title=f"Created {clean_name}",
            detail=f"{personality} with the power to {power.lower()}.",
            emoji=face,
            entity_id=monster["id"],
            unique_key=f"monster:{monster['id']}",
        )
        robot = active_robot(profile)
        profile["sidekick_message"] = robot_phrase(
            "monster",
            robot["name"] if robot else "Robo Scanner",
            seed=clean_name,
        )
        show_new_badges(badges)
        st.rerun()

    robot = active_robot(profile)
    if robot and st.button(f"🔎 Ask {robot['name']} to Scan This Monster", use_container_width=True):
        profile["sidekick_message"] = (
            f"{robot['name']}: {clean_name} is friendly, {personality.lower()}, "
            f"and powered by {power.lower()}!"
        )
        robot_progress(robot, jobs=1, xp=15)
        badges = record_event(profile, "robot_jobs")
        show_new_badges(badges)
        st.rerun()

    if profile.get("monsters"):
        st.markdown("### Monster friends in memory")
        for saved in reversed(profile["monsters"]):
            with st.container(border=True):
                left, right = st.columns([4, 1])
                left.markdown(f"**{saved.get('face', '👾')} {saved.get('name', 'Monster')}**")
                left.caption(
                    f"{saved.get('color', 'Purple')} · {saved.get('body', 'Fluffy')} · "
                    f"{saved.get('personality', 'Curious and polite')}"
                )
                if right.button(
                    "Remove",
                    key=f"remove_monster_{saved.get('id', saved.get('name'))}",
                    use_container_width=True,
                ):
                    remove_monster(profile, str(saved.get("id", "")))
                    st.rerun()
