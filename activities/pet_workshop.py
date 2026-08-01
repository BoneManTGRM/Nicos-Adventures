"""Custom robot-pet workshop, training, and companion collection."""

from __future__ import annotations

import html
from typing import Any

import streamlit as st

from core.memory import remember
from core.world4 import (
    PET_ACCESSORIES,
    PET_COLORS,
    PET_PERSONALITIES,
    PET_SPECIES,
    active_pet,
    create_robot_pet,
    ensure_world4,
    interact_with_pet,
)
from ui.components import hero


def _pet_card(pet: dict[str, Any], *, compact: bool = False) -> str:
    species = PET_SPECIES.get(str(pet.get("species")), "🐕")
    color = PET_COLORS.get(
        str(pet.get("color")),
        PET_COLORS["Photon Blue"],
    )
    name = html.escape(str(pet.get("name", "Pixel")))
    accessory = html.escape(str(pet.get("accessory", "None")))
    personality = html.escape(str(pet.get("personality", "Brave Scout")))
    height = 260 if compact else 420
    size = "5rem" if compact else "8rem"
    return f"""
<div data-pet-id="{html.escape(str(pet.get('id', 'preview')))}" style="min-height:{height}px;
background:radial-gradient(circle at 50% 38%,#ffffffaa,transparent 30%),
linear-gradient(160deg,{color},#1e293b);border:5px solid #242b4d;border-radius:30px;
position:relative;overflow:hidden;display:grid;place-items:center;text-align:center;color:white;
box-shadow:0 18px 44px #11182744">
  <div style="position:absolute;inset:0;background-image:radial-gradient(circle,#fff 0 2px,
  transparent 3px);background-size:35px 35px;opacity:.18"></div>
  <div style="z-index:2"><div style="font-size:{size};filter:drop-shadow(0 14px 10px #11182788)">
  {species}</div><h2 style="margin:.2rem 0">{name}</h2><b>{personality}</b><br>
  <small>{accessory}</small></div>
</div>
"""


def render(profile: dict[str, Any]) -> None:
    state = ensure_world4(profile)
    hero(
        "Robot Pet Workshop",
        "Build small companions, choose their style, train tricks, and bring one home.",
    )
    build_tab, friends_tab, training_tab = st.tabs(
        ["🧩 Build a Pet", "🐾 Pet Friends", "🎓 Training Yard"]
    )
    with build_tab:
        left, right = st.columns([1, 1.05], gap="large")
        with left:
            with st.form("pet_builder"):
                name = st.text_input("Pet name", value="Pixel", max_chars=24)
                species = st.selectbox(
                    "Pet species",
                    tuple(PET_SPECIES),
                    format_func=lambda item: (
                        f"{PET_SPECIES[item]} "
                        f"{item.replace('_', ' ').title()}"
                    ),
                )
                color = st.selectbox("Pet color", tuple(PET_COLORS))
                personality = st.selectbox("Personality", PET_PERSONALITIES)
                accessory = st.selectbox("Accessory", PET_ACCESSORIES)
                create_clicked = st.form_submit_button(
                    "🐾 Build and Remember Pet",
                    type="primary",
                    use_container_width=True,
                )
        preview = {
            "id": "pet-preview",
            "name": name,
            "species": species,
            "color": color,
            "personality": personality,
            "accessory": accessory,
            "bond": 0,
            "tricks": 0,
        }
        with right:
            st.caption("Live pet preview")
            st.markdown(_pet_card(preview), unsafe_allow_html=True)
        if create_clicked:
            pet = create_robot_pet(profile, preview)
            remember(
                profile,
                kind="robot_pet",
                title=f"Built robot pet {pet['name']}",
                detail=(
                    f"A {pet['color'].lower()} "
                    f"{pet['species'].replace('_', ' ')} with a "
                    f"{pet['personality'].lower()} personality."
                ),
                emoji=PET_SPECIES[pet["species"]],
                entity_id=pet["id"],
                unique_key=f"robot-pet:{pet['id']}",
            )
            profile["sidekick_message"] = (
                f"{pet['name']} is ready to follow the adventure team."
            )
            st.success("Robot pet built and selected as the active companion.")
            st.rerun()

    with friends_tab:
        pets = state.get("robot_pets", [])
        if not pets:
            st.info("Build the first robot pet to open the companion collection.")
        cols = st.columns(3)
        for index, pet in enumerate(pets):
            with cols[index % 3]:
                with st.container(border=True):
                    st.markdown(
                        _pet_card(pet, compact=True),
                        unsafe_allow_html=True,
                    )
                    active = pet.get("id") == state.get("active_pet_id")
                    st.caption(
                        f"Bond {pet.get('bond', 0)}/100 · "
                        f"{pet.get('tricks', 0)} tricks · "
                        f"{pet.get('plays', 0)} visits"
                    )
                    if st.button(
                        "Make Active Companion",
                        key=f"activate_pet_{pet.get('id')}",
                        disabled=active,
                        use_container_width=True,
                    ):
                        state["active_pet_id"] = pet["id"]
                        st.rerun()
                    if st.button(
                        "Remove Pet",
                        key=f"remove_pet_{pet.get('id')}",
                        use_container_width=True,
                    ):
                        state["robot_pets"] = [
                            item
                            for item in state["robot_pets"]
                            if item.get("id") != pet.get("id")
                        ]
                        if active:
                            state["active_pet_id"] = (
                                state["robot_pets"][0]["id"]
                                if state["robot_pets"]
                                else ""
                            )
                        st.rerun()

    with training_tab:
        pet = active_pet(profile)
        if pet is None:
            st.info(
                "Build and select a robot pet before entering the training yard."
            )
        else:
            left, right = st.columns([1.1, 1], gap="large")
            with left:
                st.markdown(_pet_card(pet), unsafe_allow_html=True)
            with right:
                st.markdown(f"## Training {pet['name']}")
                st.progress(
                    int(pet.get("bond", 0)) / 100,
                    text=f"Friendship bond: {pet.get('bond', 0)}/100",
                )
                st.metric("Tricks learned", pet.get("tricks", 0))
                actions = (
                    ("play", "🎾 Play", "played in the training yard"),
                    ("train", "🎓 Train", "practiced a new trick"),
                    ("groom", "✨ Polish", "received a shiny tune-up"),
                    ("explore", "🧭 Explore", "explored the workshop"),
                )
                cols = st.columns(2)
                for index, (action, label, message) in enumerate(actions):
                    with cols[index % 2]:
                        if st.button(
                            label,
                            key=f"pet_action_{action}",
                            use_container_width=True,
                        ):
                            previous_tricks = int(pet.get("tricks", 0))
                            updated = interact_with_pet(
                                profile,
                                pet["id"],
                                action,
                            )
                            if updated:
                                profile["sidekick_message"] = (
                                    f"{pet['name']} {message}. Bond is now "
                                    f"{updated['bond']}."
                                )
                                if int(updated.get("tricks", 0)) > previous_tricks:
                                    profile["stars"] = int(
                                        profile.get("stars", 0)
                                    ) + 1
                                    st.success(
                                        "New trick learned. One training star earned."
                                    )
                                st.rerun()
