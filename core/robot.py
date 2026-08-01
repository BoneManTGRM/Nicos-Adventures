"""Pure robot-building and customization rules."""

from __future__ import annotations

import random
import re
import uuid
from datetime import UTC, datetime
from typing import Any

from core.catalog import (
    ROBOT_COLORS,
    ROBOT_EYE_GLOWS,
    ROBOT_FINISHES,
    ROBOT_MOODS,
    ROBOT_PARTS,
    ROBOT_PATTERNS,
    ROBOT_PERSONALITIES,
    ROBOT_PRESETS,
    ROBOT_SIZES,
    ROBOT_VOICES,
    Part,
)

NAME_ADJECTIVES = (
    "Bolt", "Spark", "Rocket", "Bubble", "Turbo", "Pixel", "Cosmo", "Nova",
    "Astro", "Zippy", "Bouncy", "Comet", "Gizmo", "Mega", "Sunny", "Flash",
)
NAME_NOUNS = (
    "Bot", "Buddy", "Rover", "Whiz", "Scout", "Gear", "Pal", "Droid",
    "Helper", "Explorer", "Builder", "Zoom", "Beep", "Bop", "Ranger", "Friend",
)

ROBOT_PART_DEFAULTS: dict[str, str] = {
    "eyes": "round",
    "mouth": "smile",
    "head": "box",
    "antenna": "none",
    "ears": "none",
    "shoulders": "none",
    "arms": "grabber",
    "body": "classic_core",
    "chest": "none",
    "base": "bronze_wheels",
    "backpack": "none",
    "companion": "none",
    "power": "bubble",
    "hat": "none",
}

ROBOT_STYLE_DEFAULTS: dict[str, str] = {
    "color": "Electric Blue",
    "secondary_color": "Sunny Yellow",
    "finish": "Matte",
    "pattern": "Solid",
    "eye_glow": "Aqua",
    "size": "Standard",
    "voice": "Classic Beep",
    "personality": "Curious Explorer",
    "mood": "Happy",
}


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


def clean_catchphrase(value: str) -> str:
    """Keep catchphrases short and safe for display."""
    value = re.sub(r"[<>]", "", str(value)).strip()
    value = re.sub(r"\s+", " ", value)
    return value[:90]


def generate_robot_name(seed: int | str | None = None) -> str:
    rng = random.Random(seed)
    return f"{rng.choice(NAME_ADJECTIVES)}{rng.choice(NAME_NOUNS)} {rng.randint(100, 999)}"


def _valid_choice(value: str, catalog: dict[str, Any], fallback: str, label: str) -> str:
    if value not in catalog:
        raise ValueError(f"Unknown robot {label}: {value}")
    return value or fallback


def random_robot_parts(stars: int, seed: int | str | None = None) -> dict[str, str]:
    """Choose one unlocked option in every part category and a complete style."""
    rng = random.Random(seed)
    selections = {
        category: rng.choice(unlocked_parts(category, stars)).id
        for category in ROBOT_PARTS
    }
    selections.update(
        {
            "color": rng.choice(tuple(ROBOT_COLORS)),
            "secondary_color": rng.choice(tuple(ROBOT_COLORS)),
            "finish": rng.choice(tuple(ROBOT_FINISHES)),
            "pattern": rng.choice(tuple(ROBOT_PATTERNS)),
            "eye_glow": rng.choice(tuple(ROBOT_EYE_GLOWS)),
            "size": rng.choice(tuple(ROBOT_SIZES)),
            "voice": rng.choice(tuple(ROBOT_VOICES)),
            "personality": rng.choice(tuple(ROBOT_PERSONALITIES)),
            "mood": rng.choice(ROBOT_MOODS),
        }
    )
    selections["catchphrase"] = ROBOT_PERSONALITIES[selections["personality"]]
    return selections


def random_robot_style(seed: int | str | None = None) -> dict[str, str]:
    """Randomize only paint, finish, visual styling, voice, and personality."""
    rng = random.Random(seed)
    personality = rng.choice(tuple(ROBOT_PERSONALITIES))
    return {
        "color": rng.choice(tuple(ROBOT_COLORS)),
        "secondary_color": rng.choice(tuple(ROBOT_COLORS)),
        "finish": rng.choice(tuple(ROBOT_FINISHES)),
        "pattern": rng.choice(tuple(ROBOT_PATTERNS)),
        "eye_glow": rng.choice(tuple(ROBOT_EYE_GLOWS)),
        "size": rng.choice(tuple(ROBOT_SIZES)),
        "voice": rng.choice(tuple(ROBOT_VOICES)),
        "personality": personality,
        "mood": rng.choice(ROBOT_MOODS),
        "catchphrase": ROBOT_PERSONALITIES[personality],
    }


def preset_customization(name: str, stars: int) -> dict[str, str]:
    """Return a preset adapted to the player's currently unlocked parts."""
    if name not in ROBOT_PRESETS:
        raise ValueError(f"Unknown robot preset: {name}")
    preset = ROBOT_PRESETS[name]
    stars = max(0, int(stars))
    result: dict[str, str] = {}
    for category, fallback in ROBOT_PART_DEFAULTS.items():
        requested = str(preset.get(category, fallback))
        unlocked_ids = {part.id for part in unlocked_parts(category, stars)}
        result[category] = requested if requested in unlocked_ids else unlocked_parts(category, stars)[0].id
    for field, fallback in ROBOT_STYLE_DEFAULTS.items():
        result[field] = str(preset.get(field, fallback))
    personality = result["personality"]
    result["catchphrase"] = ROBOT_PERSONALITIES.get(personality, "Adventure systems ready!")
    return result


def _validated_customization(
    *,
    stars: int,
    part_values: dict[str, str],
    color: str,
    secondary_color: str,
    finish: str,
    pattern: str,
    eye_glow: str,
    size: str,
    voice: str,
    personality: str,
    mood: str,
    catchphrase: str,
) -> dict[str, str]:
    stars = max(0, int(stars))
    selections: dict[str, str] = {}
    for category, fallback in ROBOT_PART_DEFAULTS.items():
        part_id = str(part_values.get(category, fallback))
        part = find_part(category, part_id)
        if part.unlock_stars > stars:
            raise ValueError(f"{part.label} unlocks at {part.unlock_stars} stars")
        selections[category] = part_id

    selections.update(
        {
            "color": _valid_choice(color, ROBOT_COLORS, "Electric Blue", "color"),
            "secondary_color": _valid_choice(
                secondary_color,
                ROBOT_COLORS,
                "Sunny Yellow",
                "secondary color",
            ),
            "finish": _valid_choice(finish, ROBOT_FINISHES, "Matte", "finish"),
            "pattern": _valid_choice(pattern, ROBOT_PATTERNS, "Solid", "pattern"),
            "eye_glow": _valid_choice(eye_glow, ROBOT_EYE_GLOWS, "Aqua", "eye glow"),
            "size": _valid_choice(size, ROBOT_SIZES, "Standard", "size"),
            "voice": _valid_choice(voice, ROBOT_VOICES, "Classic Beep", "voice"),
            "personality": _valid_choice(
                personality,
                ROBOT_PERSONALITIES,
                "Curious Explorer",
                "personality",
            ),
            "mood": mood if mood in ROBOT_MOODS else "Happy",
            "catchphrase": clean_catchphrase(catchphrase),
        }
    )
    if not selections["catchphrase"]:
        selections["catchphrase"] = ROBOT_PERSONALITIES[selections["personality"]]
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
    mouth: str = "smile",
    antenna: str = "none",
    ears: str = "none",
    shoulders: str = "none",
    chest: str = "none",
    companion: str = "none",
    secondary_color: str = "Sunny Yellow",
    finish: str = "Matte",
    pattern: str = "Solid",
    eye_glow: str = "Aqua",
    size: str = "Standard",
    voice: str = "Classic Beep",
    personality: str = "Curious Explorer",
    mood: str = "Happy",
    catchphrase: str = "",
) -> dict[str, Any]:
    """Validate selections and create a serializable robot record."""
    customization = _validated_customization(
        stars=stars,
        part_values={
            "eyes": eyes,
            "mouth": mouth,
            "head": head,
            "antenna": antenna,
            "ears": ears,
            "shoulders": shoulders,
            "arms": arms,
            "body": body,
            "chest": chest,
            "base": base,
            "backpack": backpack,
            "companion": companion,
            "power": power,
            "hat": hat,
        },
        color=color,
        secondary_color=secondary_color,
        finish=finish,
        pattern=pattern,
        eye_glow=eye_glow,
        size=size,
        voice=voice,
        personality=personality,
        mood=mood,
        catchphrase=catchphrase,
    )
    stars = max(0, int(stars))
    energy = min(5, 3 + (stars >= 8) + (stars >= 18))
    created_at = datetime.now(UTC).isoformat(timespec="seconds")
    return {
        "id": uuid.uuid4().hex[:12],
        "name": clean_robot_name(name),
        **customization,
        "energy": energy,
        "created_with_stars": stars,
        "xp": 0,
        "level": 1,
        "times_moved": 0,
        "jobs_completed": 0,
        "favorite_job": "",
        "created_at": created_at,
        "last_played_at": created_at,
        "customized_at": created_at,
    }


def customize_robot(
    robot: dict[str, Any],
    *,
    stars: int,
    changes: dict[str, Any],
) -> dict[str, Any]:
    """Apply customization while preserving identity, levels, and adventure history."""
    values = {**ROBOT_PART_DEFAULTS, **ROBOT_STYLE_DEFAULTS, **robot, **changes}
    rebuilt = build_robot(
        name=str(values.get("name", "BuddyBot")),
        stars=stars,
        **{category: str(values[category]) for category in ROBOT_PART_DEFAULTS},
        color=str(values["color"]),
        secondary_color=str(values["secondary_color"]),
        finish=str(values["finish"]),
        pattern=str(values["pattern"]),
        eye_glow=str(values["eye_glow"]),
        size=str(values["size"]),
        voice=str(values["voice"]),
        personality=str(values["personality"]),
        mood=str(values["mood"]),
        catchphrase=str(values.get("catchphrase", "")),
    )
    preserved_fields = (
        "id",
        "energy",
        "created_with_stars",
        "xp",
        "level",
        "times_moved",
        "jobs_completed",
        "favorite_job",
        "created_at",
        "last_played_at",
    )
    for field in preserved_fields:
        if field in robot:
            rebuilt[field] = robot[field]
    rebuilt["customized_at"] = datetime.now(UTC).isoformat(timespec="seconds")
    return rebuilt


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
        "customized": (
            "New look installed. I feel spectacular!",
            "Customization complete. Same memories, brand-new style!",
            "Upgrade accepted. My confidence circuits are glowing!",
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
