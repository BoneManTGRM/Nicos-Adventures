"""Interactive living world map and twenty-mission campaign board."""

from __future__ import annotations

from typing import Any

import streamlit as st

from core.navigation import queue_navigation
from core.profile import active_robot
from core.world2 import daily_adventure, tr
from core.world4 import (
    CAMPAIGN_MISSIONS,
    ability_report,
    campaign_progress,
    claim_campaign_mission,
    claim_seasonal_reward,
    ensure_world4,
    seasonal_event,
)
from ui.components import hero

LOCATIONS = (
    (
        "🤖",
        "Robo City",
        "Robo Lab",
        0,
        "Build detailed robot sidekicks and unlock field abilities.",
    ),
    (
        "🌳",
        "Animal Forest",
        "Animal Forest",
        0,
        "Explore habitats, wildlife photographs, quizzes, and expeditions.",
    ),
    (
        "👾",
        "Monster Mountain",
        "Monster Lab",
        0,
        "Design and animate completely original monster friends.",
    ),
    (
        "🏡",
        "Habitat Village",
        "Monster Habitats",
        4,
        "Build homes and grow friendship with saved monsters.",
    ),
    (
        "🎨",
        "Art Studio",
        "Art Studio",
        2,
        "Create posters and illustrations for stories and Robot Home.",
    ),
    (
        "📖",
        "Story Castle",
        "Story Castle",
        3,
        "Create bilingual adventures starring Nico's own characters.",
    ),
    (
        "🎮",
        "Game Arcade",
        "Game Arcade",
        5,
        "Play six learning games with streaks and star rewards.",
    ),
    (
        "🦕",
        "Dinosaur Valley",
        "Dinosaur Valley",
        6,
        "Recover fossils and explore prehistoric habitats.",
    ),
    (
        "🐾",
        "Pet Workshop",
        "Pet Workshop",
        7,
        "Build robot pets, train tricks, and choose a companion.",
    ),
    (
        "🏠",
        "Robot Home",
        "Robot Home",
        8,
        "Display pets, artwork, discoveries, and earned decorations.",
    ),
    (
        "📚",
        "Memory Museum",
        "Memory Book",
        0,
        "Review the complete timeline and portable Version 5 save.",
    ),
    (
        "🏆",
        "Badge Observatory",
        "Badge Book",
        0,
        "Track stars, levels, badges, and milestones.",
    ),
)

STAGE_LABELS = {
    1: ("Quiet Workshop", "Only the first workshop lights are active."),
    2: ("Growing Village", "Animals and friendly monsters are arriving."),
    3: ("Explorer Town", "New paths connect the forest, castle, and valley."),
    4: ("Adventure City", "Creative buildings and transport systems are online."),
    5: ("World Network", "Ocean, moon, and crystal routes are connected."),
    6: ("Star Capital", "Nico's creations fill every district."),
    7: ("Guardian World", "The entire world is restored and thriving."),
}


def _go(destination: str) -> None:
    queue_navigation(st.session_state, destination)


def _living_world(profile: dict[str, Any], state: dict[str, Any]) -> None:
    stage = int(state.get("living_world_stage", 1))
    label, description = STAGE_LABELS[stage]
    additions = ["🏭"]
    if stage >= 2:
        additions.extend(["🌳", "🏡", "👾"])
    if stage >= 3:
        additions.extend(["🏰", "🦕", "🎨"])
    if stage >= 4:
        additions.extend(["🚝", "🎮", "🐾"])
    if stage >= 5:
        additions.extend(["🌊", "🚀", "💎"])
    if stage >= 6:
        additions.extend(["🌠", "🏆", "🛸"])
    if stage >= 7:
        additions.extend(["👑", "🌈", "✨"])
    skyline = "　".join(additions)
    st.markdown(
        f"""
<div style="min-height:260px;border:5px solid #26304f;border-radius:34px;overflow:hidden;
background:linear-gradient(#7dd3fc 0 52%,#a7f3d0 53% 74%,#65a30d 75%);position:relative;
box-shadow:0 20px 50px #1f2f5a33;text-align:center;padding:2rem">
  <div style="font-size:3rem;margin-top:3rem">{skyline}</div>
  <div style="background:#111a38dd;color:white;display:inline-block;padding:.8rem 1.4rem;
  border-radius:16px;margin-top:1.6rem"><b>Stage {stage}: {label}</b><br>
  <small>{description}</small></div>
</div>
""",
        unsafe_allow_html=True,
    )
    completed = len(state.get("campaign_completed", []))
    st.progress(
        stage / 7,
        text=(
            f"Living world stage {stage}/7 · "
            f"{completed}/20 campaign missions"
        ),
    )


def _ability_deck(profile: dict[str, Any]) -> None:
    abilities = ability_report(profile)
    labels = {
        "scanner": ("🔎", "Scanner"),
        "translator": ("🗣️", "Translator"),
        "aquatic": ("🌊", "Aquatic"),
        "strength": ("💪", "Strength"),
        "flight": ("🪽", "Flight"),
        "repair": ("🛠️", "Repair"),
        "creative": ("🎨", "Creative"),
        "monster_magic": ("✨", "Monster Magic"),
        "teamwork": ("🤝", "Teamwork"),
    }
    st.markdown("## ⚙️ Adventure Team Abilities")
    st.caption(
        "Robot parts, voices, monster bodies, wings, and powers now affect "
        "field readiness."
    )
    cols = st.columns(3)
    for index, (ability_id, (emoji, label)) in enumerate(labels.items()):
        with cols[index % 3]:
            active = abilities.get(ability_id, False)
            st.markdown(
                f"<div style='padding:1rem;border-radius:18px;border:3px solid "
                f"{'#22c55e' if active else '#cbd5e1'};background:"
                f"{'#dcfce7' if active else '#f8fafc'};text-align:center'>"
                f"<div style='font-size:2rem'>{emoji}</div><b>{label}</b><br>"
                f"<small>{'READY' if active else 'Build matching equipment'}</small>"
                "</div>",
                unsafe_allow_html=True,
            )


def _campaign_board(profile: dict[str, Any], state: dict[str, Any]) -> None:
    st.markdown(f"## 🎯 {tr(profile, 'missions')} · 20-Mission Campaign")
    mission_ids = tuple(CAMPAIGN_MISSIONS)
    active_id = state.get("campaign_active", mission_ids[0])
    selected = st.selectbox(
        "Choose a campaign mission",
        mission_ids,
        index=mission_ids.index(active_id) if active_id in mission_ids else 0,
        format_func=lambda item: (
            f"Chapter {CAMPAIGN_MISSIONS[item]['chapter']} · "
            f"{CAMPAIGN_MISSIONS[item]['emoji']} "
            f"{CAMPAIGN_MISSIONS[item]['title']}"
        ),
    )
    state["campaign_active"] = selected
    mission = CAMPAIGN_MISSIONS[selected]
    complete, total, rows = campaign_progress(profile, selected)
    st.markdown(f"### {mission['emoji']} {mission['title']}")
    st.write(mission["description"])
    st.caption(
        f"Recommended ability: {mission['ability'].replace('_', ' ').title()}"
    )
    st.progress(
        complete / total,
        text=f"{complete} of {total} objectives complete",
    )
    for label, done in rows:
        st.write(f"{'✅' if done else '⬜'} {label}")
    st.caption(f"Reward: ⭐ {mission['reward']} stars")
    if selected in state.get("campaign_completed", []):
        st.success("Mission completed and permanently recorded.")
    elif complete == total:
        if st.button(
            "🏆 Claim Campaign Reward",
            type="primary",
            use_container_width=True,
        ):
            claim_campaign_mission(profile, selected)
            st.rerun()
    else:
        st.caption(
            "Complete connected activities around the world to fill this mission."
        )


def render(profile: dict[str, Any]) -> None:
    state = ensure_world4(profile)
    robot = active_robot(profile)
    hero(
        "Nico's World 4",
        "A living creative world where robots, monsters, pets, art, stories, and missions connect.",
    )
    st.info(f"**{tr(profile, 'today')}:** {daily_adventure(profile)}")
    if robot:
        st.success(
            f"{robot['name']} is ready. "
            f"{profile.get('sidekick_message', 'Choose our next adventure!')}"
        )

    event = seasonal_event()
    with st.container(border=True):
        event_left, event_right = st.columns([3, 1])
        event_left.markdown(f"### {event['emoji']} {event['title']}")
        event_left.write(event["challenge"])
        claimed = event["id"] in state.get("seasonal_claims", [])
        if event_right.button(
            "Claim 5 Stars" if not claimed else "Reward Claimed",
            disabled=claimed,
            use_container_width=True,
        ):
            if claim_seasonal_reward(profile):
                st.success("Seasonal reward claimed.")
                st.rerun()
            else:
                st.info(
                    "Complete at least three activities before claiming the reward."
                )

    st.markdown(f"## 🗺️ {tr(profile, 'world_map')}")
    _living_world(profile, state)
    stars = int(profile.get("stars", 0))
    cols = st.columns(2)
    for index, (emoji, title, page, needed, description) in enumerate(LOCATIONS):
        unlocked = stars >= needed
        with cols[index % 2]:
            with st.container(border=True):
                st.markdown(f"### {emoji} {title}")
                st.write(description)
                if unlocked:
                    st.button(
                        f"Enter {title}",
                        key=f"map_{page}",
                        use_container_width=True,
                        on_click=_go,
                        args=(page,),
                    )
                else:
                    st.button(
                        f"🔒 Unlocks at {needed} stars",
                        key=f"locked_{page}",
                        disabled=True,
                        use_container_width=True,
                    )

    _ability_deck(profile)
    _campaign_board(profile, state)
