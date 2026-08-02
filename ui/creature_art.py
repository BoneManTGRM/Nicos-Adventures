"""Install the enhanced creature renderers into existing Streamlit activities."""

from __future__ import annotations

from typing import Any

from activities import memory_book, monster_habitats, monsters, pet_workshop, robot_home
from core.monster_art_v2 import MONSTER_ART_CSS, monster_card_html, monster_html
from core.pet_art import PET_ART_CSS, pet_card_html, pet_html


def _pet_workshop_card(pet: dict[str, Any], *, compact: bool = False) -> str:
    scene = "home" if compact else "workshop"
    animation = "idle"
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


def install_creature_art_v2() -> None:
    """Use the V2 monster and pet artwork without changing save contracts."""
    monsters.MONSTER_ART_CSS = MONSTER_ART_CSS
    monsters.monster_html = monster_html
    monsters.monster_card_html = monster_card_html
    monster_habitats.MONSTER_ART_CSS = MONSTER_ART_CSS
    monster_habitats.monster_html = monster_html
    memory_book.MONSTER_ART_CSS = MONSTER_ART_CSS
    memory_book.monster_card_html = monster_card_html
    pet_workshop._pet_card = _pet_workshop_card
    robot_home._pet_home_card = _pet_home_card


__all__ = [
    "PET_ART_CSS",
    "install_creature_art_v2",
    "monster_card_html",
    "monster_html",
    "pet_card_html",
    "pet_html",
]
