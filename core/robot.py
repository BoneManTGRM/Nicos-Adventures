"""Pure robot-building rules."""

from __future__ import annotations

import random
import re
import uuid
from typing import Any

from core.catalog import ROBOT_COLORS, ROBOT_PARTS, Part

NAME_ADJECTIVES = ("Bolt", "Spark", "Rocket", "Bubble", "Turbo", "Pixel", "Cosmo", "Nova")
NAME_NOUNS = ("Bot", "Buddy", "Rover", "Whiz", "Scout", "Gear", "Pal", "Droid")


def unlocked_parts(category: str, stars: int) -> tuple[Part, ...]:
    """Return all parts in a category that the player can currently use."""
    if category not in ROBOT_PARTS:
        raise KeyError(f"Unknown robot part category: {category}")
    return tuple(part for part in ROBOT_PARTS[category] if part.unlock_stars <= stars)


def find_part(category: str, part_id: str) -> Part:
    """Return one catalog part or raise a clear error."""
    for part in ROBOT_PARTS.get(category, ()):
        if part.id == part_id:
            return part
    raise ValueError(f"Unknown {category} part: {part_id}")


def clean_robot_name(value: str) -> str:
    """Keep names short and safe for display inside HTML components."""
    value = re.sub(r"[^A-Za-z0-9 '\-]", "", value).strip()
    value = re.sub(r"\s+", " ", value)
    return value[:24] or "BuddyBot"


def generate_robot_name(seed: int | str | None = None) -> str:
    rng = random.Random(seed)
    return f"{rng.choice(NAME_ADJECTIVES)}{rng.choice(NAME_NOUNS)} {rng.randint(100, 999)}"


def build_robot(
    *,
    name: str,
    eyes: str,
    head: str,
    arms: str,
    base: str,
    color: str,
    power: str,
    hat: str,
    stars: int,
) -> dict[str, Any]:
    """Validate selections and create a serializable robot record."""
    selections = {
        "eyes": eyes,
        "head": head,
        "arms": arms,
        "base": base,
        "power": power,
        "hat": hat,
    }
    for category, part_id in selections.items():
        part = find_part(category, part_id)
        if part.unlock_stars > stars:
            raise ValueError(f"{part.label} unlocks at {part.unlock_stars} stars")
    if color not in ROBOT_COLORS:
        raise ValueError(f"Unknown robot color: {color}")

    energy = min(5, 3 + (stars >= 8) + (stars >= 18))
    return {
        "id": uuid.uuid4().hex[:12],
        "name": clean_robot_name(name),
        **selections,
        "color": color,
        "energy": energy,
        "mood": "Happy",
        "created_with_stars": max(0, int(stars)),
    }


def robot_phrase(context: str, robot_name: str, seed: int | str | None = None) -> str:
    phrases = {
        "home": (
            "Beep! Want to explore?",
            "Adventure systems ready!",
            "What should we build today?",
        ),
        "built": (
            "My circuits are tingling. I am alive!",
            "Build complete. Friendship mode activated!",
            "Beep-boop! This is an excellent body.",
        ),
        "animal": (
            "I found an animal clue!",
            "Scanner ready for the Animal Forest.",
            "That creature is amazing!",
        ),
        "monster": (
            "Monster scan complete. Very silly. Zero danger.",
            "My scanner says: maximum giggles!",
            "That monster needs a robot friend.",
        ),
        "badge": (
            "Achievement detected! Great work!",
            "New progress saved to my memory banks.",
            "We make a strong adventure team!",
        ),
        "sleepy": ("Power-saving mode... just kidding!",),
    }
    choices = phrases.get(context, phrases["home"])
    rng = random.Random(seed)
    return f"{robot_name}: {rng.choice(choices)}"
