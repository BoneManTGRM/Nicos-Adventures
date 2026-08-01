"""Pure robot-building rules."""

from __future__ import annotations

import random
import re
import uuid
from datetime import UTC, datetime
from typing import Any

from core.catalog import ROBOT_COLORS, ROBOT_PARTS, Part

NAME_ADJECTIVES = (
    "Bolt", "Spark", "Rocket", "Bubble", "Turbo", "Pixel", "Cosmo", "Nova",
    "Astro", "Zippy", "Bouncy", "Comet", "Gizmo", "Mega", "Sunny", "Flash",
)
NAME_NOUNS = (
    "Bot", "Buddy", "Rover", "Whiz", "Scout", "Gear", "Pal", "Droid",
    "Helper", "Explorer", "Builder", "Zoom", "Beep", "Bop", "Ranger", "Friend",
)


def unlocked_parts(category: str, stars: int) -> tuple[Part, ...]:
    """Return all parts in a category that the player can currently use."""
    if category not in ROBOT_PARTS:
        raise KeyError(f"Unknown robot part category: {category}")
    stars = max(0, int(stars))
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


def random_robot_parts(stars: int, seed: int | str | None = None) -> dict[str, str]:
    """Choose one unlocked option in every part category and one color."""
    rng = random.Random(seed)
    selections = {
        category: rng.choice(unlocked_parts(category, stars)).id
        for category in ROBOT_PARTS
    }
    selections["color"] = rng.choice(tuple(ROBOT_COLORS))
    return selections


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
    body: str = "classic_core",
    backpack: str = "none",
) -> dict[str, Any]:
    """Validate selections and create a serializable robot record."""
    selections = {
        "eyes": eyes,
        "head": head,
        "arms": arms,
        "body": body,
        "base": base,
        "backpack": backpack,
        "power": power,
        "hat": hat,
    }
    stars = max(0, int(stars))
    for category, part_id in selections.items():
        part = find_part(category, part_id)
        if part.unlock_stars > stars:
            raise ValueError(f"{part.label} unlocks at {part.unlock_stars} stars")
    if color not in ROBOT_COLORS:
        raise ValueError(f"Unknown robot color: {color}")

    energy = min(5, 3 + (stars >= 8) + (stars >= 18))
    created_at = datetime.now(UTC).isoformat(timespec="seconds")
    return {
        "id": uuid.uuid4().hex[:12],
        "name": clean_robot_name(name),
        **selections,
        "color": color,
        "energy": energy,
        "mood": "Happy",
        "created_with_stars": stars,
        "xp": 0,
        "level": 1,
        "times_moved": 0,
        "jobs_completed": 0,
        "favorite_job": "",
        "created_at": created_at,
        "last_played_at": created_at,
    }


def robot_phrase(context: str, robot_name: str, seed: int | str | None = None) -> str:
    phrases = {
        "home": (
            "Beep! Want to explore?",
            "Adventure systems ready!",
            "What should we build today?",
            "My memory banks are ready for a new adventure!",
        ),
        "built": (
            "My circuits are tingling. I am alive!",
            "Build complete. Friendship mode activated!",
            "Beep-boop! This is an excellent body.",
            "I will remember this build forever!",
        ),
        "animal": (
            "I found an animal clue!",
            "Scanner ready for the Animal Forest.",
            "That creature is amazing!",
            "Animal memory saved!",
        ),
        "monster": (
            "Monster scan complete. Very silly. Zero danger.",
            "My scanner says: maximum giggles!",
            "That monster needs a robot friend.",
            "Monster memory stored safely!",
        ),
        "badge": (
            "Achievement detected! Great work!",
            "New progress saved to my memory banks.",
            "We make a strong adventure team!",
        ),
        "memory": (
            "Memory saved! We can visit it in the Memory Book.",
            "I stored that adventure in my memory banks!",
            "We are building a great collection together!",
        ),
        "sleepy": ("Power-saving mode... just kidding!",),
    }
    choices = phrases.get(context, phrases["home"])
    rng = random.Random(seed)
    return f"{robot_name}: {rng.choice(choices)}"
