"""Install the enhanced creature renderers into existing Streamlit activities."""

from __future__ import annotations

from typing import Any

import streamlit as st

from activities import memory_book, monster_habitats, monsters, pet_workshop, robot_home
from core.monster_art_v2 import MONSTER_ART_CSS, monster_card_html, monster_html
from core.pet_art import PET_ART_CSS, pet_card_html, pet_html
from core.world4 import ensure_world4

_ORIGINAL_PET_INTERACTION = pet_workshop.interact_with_pet


def _pet_workshop_card(pet: dict[str, Any], *, compact: bool = False) -> str:
    scene = "home" if compact else "training"
    animation = "idle" if compact else str(st.session_state.get("pet_animation", "idle"))
    return PET_ART_CSS + pet_html(
        pet,
        compact=compact,
        animation=animation,
        scene=scene,
    )


def _pet_home_card(pet: dict[str, Any]) -> str:
    return PET_ART_CSS + pet_html(
        pet,
        compact=False,
        animation="idle",
        scene="home",
    )


def _animated_pet_interaction(
    profile: dict[str, Any],
    pet_id: str,
    action: str,
) -> dict[str, Any] | None:
    st.session_state["pet_animation"] = (
        action if action in {"play", "train", "groom", "explore"} else "celebrate"
    )
    return _ORIGINAL_PET_INTERACTION(profile, pet_id, action)


def _memory_pets_and_habitats(profile: dict[str, Any]) -> None:
    state = ensure_world4(profile)
    st.markdown(PET_ART_CSS, unsafe_allow_html=True)
    st.markdown("### Robot Pet Companions")
    pets = state.get("robot_pets", [])
    if not pets:
        st.info("No robot pets have been built yet.")
    cols = st.columns(2)
    for index, pet in enumerate(pets):
        with cols[index % 2]:
            with st.container(border=True):
                st.markdown(pet_card_html(pet), unsafe_allow_html=True)
                active = pet.get("id") == state.get("active_pet_id")
                st.markdown(
                    f"**{'⭐ Active companion' if active else 'Companion collection'}**"
                )
                st.caption(
                    f"{pet.get('color')} · {pet.get('personality')} · "
                    f"{pet.get('accessory')}"
                )
                st.write(
                    f"Bond **{pet.get('bond', 0)}/100** · "
                    f"{pet.get('tricks', 0)} tricks · "
                    f"{pet.get('plays', 0)} visits"
                )
    st.markdown("### Habitat Village")
    habitats = state.get("monster_habitats", {})
    if not habitats:
        st.info("No monster habitats have been built yet.")
    monster_lookup = {
        str(item.get("id")): item for item in profile.get("monsters", [])
    }
    for monster_id, habitat in habitats.items():
        monster = monster_lookup.get(monster_id, {})
        with st.container(border=True):
            st.markdown(
                f"### {monster.get('face', '👾')} "
                f"{monster.get('name', 'Monster')}'s "
                f"{habitat.get('theme', 'Habitat')}"
            )
            st.caption(
                f"{habitat.get('food')} · {habitat.get('toy')} · "
                f"Friendship {habitat.get('friendship', 0)}/100"
            )


def install_creature_art_v2() -> None:
    """Use the V2 monster and pet artwork without changing save contracts."""
    monsters.MONSTER_ART_CSS = MONSTER_ART_CSS
    monsters.monster_html = monster_html
    monsters.monster_card_html = monster_card_html
    monster_habitats.MONSTER_ART_CSS = MONSTER_ART_CSS
    monster_habitats.monster_html = monster_html
    memory_book.MONSTER_ART_CSS = MONSTER_ART_CSS
    memory_book.monster_card_html = monster_card_html
    memory_book._pets_and_habitats = _memory_pets_and_habitats
    pet_workshop._pet_card = _pet_workshop_card
    pet_workshop.interact_with_pet = _animated_pet_interaction
    robot_home._pet_home_card = _pet_home_card


__all__ = [
    "PET_ART_CSS",
    "install_creature_art_v2",
    "monster_card_html",
    "monster_html",
    "pet_card_html",
    "pet_html",
]
