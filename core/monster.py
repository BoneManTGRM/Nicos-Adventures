"""Monster customization, migration, presets, and persistence rules."""

from __future__ import annotations

import hashlib
import random
import re
from typing import Any

from core.memory import new_id, utc_now

MONSTER_PARTS: dict[str, dict[str, str]] = {
    "body": {
        "round": "Round Blob",
        "fluffy": "Fluffy Puff",
        "jelly": "Jelly Drop",
        "rock": "Rock Golem",
        "cloud": "Cloud Creature",
        "crystal": "Crystal Beast",
        "dragon": "Dragon Body",
        "ghost": "Friendly Ghost",
        "plant": "Plant Sprout",
        "robot": "Clockwork Monster",
        "octopus": "Octopus Body",
        "star": "Star Creature",
    },
    "eyes": {
        "two_round": "Two Round Eyes",
        "one_giant": "One Giant Eye",
        "three": "Three Tiny Eyes",
        "six": "Six Blinking Eyes",
        "star": "Star Eyes",
        "sleepy": "Sleepy Eyes",
        "heart": "Heart Eyes",
        "rainbow": "Rainbow Eyes",
        "robot": "Robot Scanner Eyes",
        "spiral": "Spiral Eyes",
        "cat": "Cat Eyes",
        "invisible": "Invisible Eyes",
    },
    "mouth": {
        "smile": "Friendly Smile",
        "fangs": "Silly Fangs",
        "grin": "Giant Grin",
        "tiny": "Tiny Mouth",
        "beak": "Bird Beak",
        "zipper": "Zipper Mouth",
        "speaker": "Speaker Mouth",
        "tongue": "Wiggly Tongue",
        "bubble": "Bubble Mouth",
        "mustache": "Mustache Mouth",
        "robot": "Robot Vent",
        "none": "No Mouth",
    },
    "horns": {
        "none": "No Horns",
        "tiny": "Tiny Horns",
        "curly": "Curly Ram Horns",
        "unicorn": "Unicorn Horn",
        "antlers": "Forest Antlers",
        "crystal": "Crystal Horns",
        "dragon": "Dragon Horns",
        "crown": "Crown Horns",
        "antenna": "Antenna Horns",
        "flame": "Flame Horns",
        "moon": "Moon Horns",
        "star": "Star Horns",
    },
    "ears": {
        "none": "No Ears",
        "round": "Round Ears",
        "cat": "Cat Ears",
        "bunny": "Bunny Ears",
        "elf": "Elf Ears",
        "bat": "Bat Ears",
        "fin": "Ocean Fins",
        "leaf": "Leaf Ears",
        "robot": "Robot Receivers",
        "dragon": "Dragon Ears",
        "cloud": "Cloud Ears",
        "star": "Star Ears",
    },
    "arms": {
        "tiny": "Tiny Arms",
        "long": "Long Wobbly Arms",
        "strong": "Strong Arms",
        "tentacle": "Tentacle Arms",
        "claws": "Friendly Claws",
        "wings": "Wing Arms",
        "robot": "Robot Arms",
        "branch": "Branch Arms",
        "flippers": "Flipper Arms",
        "spring": "Spring Arms",
        "four": "Four Arms",
        "none": "No Arms",
    },
    "legs": {
        "tiny": "Tiny Feet",
        "long": "Long Legs",
        "bouncy": "Bouncy Legs",
        "claws": "Clawed Feet",
        "hooves": "Little Hooves",
        "tentacles": "Tentacle Base",
        "wheels": "Monster Wheels",
        "cloud": "Cloud Floater",
        "roots": "Plant Roots",
        "robot": "Robot Legs",
        "four": "Four Legs",
        "none": "Floating",
    },
    "tail": {
        "none": "No Tail",
        "tiny": "Tiny Tail",
        "curly": "Curly Tail",
        "dragon": "Dragon Tail",
        "fish": "Fish Tail",
        "flame": "Flame Tail",
        "leaf": "Leaf Tail",
        "crystal": "Crystal Tail",
        "robot": "Cable Tail",
        "star": "Star Tail",
        "cloud": "Cloud Trail",
        "rainbow": "Rainbow Tail",
    },
    "wings": {
        "none": "No Wings",
        "tiny": "Tiny Wings",
        "bat": "Bat Wings",
        "bird": "Feather Wings",
        "dragon": "Dragon Wings",
        "butterfly": "Butterfly Wings",
        "cloud": "Cloud Wings",
        "crystal": "Crystal Wings",
        "robot": "Mechanical Wings",
        "leaf": "Leaf Wings",
        "flame": "Flame Wings",
        "star": "Star Wings",
    },
    "accessory": {
        "none": "No Accessory",
        "bow": "Big Bow",
        "hat": "Adventure Hat",
        "crown": "Monster Crown",
        "glasses": "Smart Glasses",
        "scarf": "Cozy Scarf",
        "backpack": "Tiny Backpack",
        "medal": "Friendship Medal",
        "flower": "Flower Clip",
        "cape": "Hero Cape",
        "headphones": "Music Headphones",
        "space": "Space Helmet",
    },
}

MONSTER_COLORS: dict[str, tuple[str, str]] = {
    "purple": ("Purple", "#8B5CF6"),
    "lime": ("Lime Green", "#84CC16"),
    "sky": ("Sky Blue", "#38BDF8"),
    "orange": ("Orange", "#FB923C"),
    "gold": ("Golden", "#FACC15"),
    "pink": ("Bubblegum Pink", "#F472B6"),
    "midnight": ("Midnight Blue", "#312E81"),
    "silver": ("Glowing Silver", "#CBD5E1"),
    "red": ("Cherry Red", "#EF4444"),
    "teal": ("Ocean Teal", "#14B8A6"),
    "mint": ("Mint", "#6EE7B7"),
    "peach": ("Peach", "#FDBA74"),
    "white": ("Moon White", "#F8FAFC"),
    "black": ("Cosmic Black", "#1E293B"),
    "brown": ("Chocolate Brown", "#92400E"),
    "violet": ("Electric Violet", "#C084FC"),
    "aqua": ("Aqua Glow", "#22D3EE"),
    "rainbow": ("Rainbow", "#EC4899"),
}

MONSTER_PATTERNS: dict[str, str] = {
    "solid": "Solid",
    "spots": "Polka Dots",
    "stripes": "Stripes",
    "stars": "Stars",
    "scales": "Dragon Scales",
    "patches": "Patchwork",
    "swirls": "Magic Swirls",
    "lightning": "Lightning",
    "checker": "Checkerboard",
    "galaxy": "Galaxy",
}

MONSTER_TEXTURES: dict[str, str] = {
    "smooth": "Smooth",
    "fluffy": "Extra Fluffy",
    "slimy": "Shiny Slime",
    "rocky": "Rocky",
    "crystal": "Crystal",
    "cloudy": "Cloud Soft",
    "metallic": "Metallic",
    "jelly": "Translucent Jelly",
    "leafy": "Leafy",
    "cosmic": "Cosmic Glow",
}

MONSTER_POWERS: tuple[str, ...] = (
    "Sneeze confetti",
    "Turn hiccups into bubbles",
    "Talk to socks",
    "Grow pizza flowers",
    "Make tiny thunder",
    "Freeze puddles into slides",
    "Summon dancing bananas",
    "Turn shadows into puppets",
    "Make books giggle",
    "Create marshmallow clouds",
    "Paint rainbows in the air",
    "Find lost toys",
    "Make plants sing",
    "Open friendly portals",
    "Build pillow forts instantly",
    "Translate animal sounds",
)

MONSTER_PERSONALITIES: tuple[str, ...] = (
    "Brave but ticklish",
    "Shy and musical",
    "Curious and polite",
    "Wildly dramatic",
    "Sleepy and clever",
    "Helpful and bouncy",
    "Serious about snacks",
    "Friendly but forgetful",
    "Excited by everything",
    "Quietly hilarious",
    "Protective and gentle",
    "Inventive and messy",
    "Royal and kind",
    "Mysterious but friendly",
)

MONSTER_MOODS: tuple[str, ...] = (
    "Happy",
    "Excited",
    "Curious",
    "Sleepy",
    "Silly",
    "Proud",
    "Surprised",
    "Calm",
)

MONSTER_SIZES: dict[str, float] = {"mini": 0.82, "standard": 1.0, "giant": 1.16}
MONSTER_ANIMATIONS: dict[str, str] = {
    "idle": "Breathe",
    "bounce": "Bounce",
    "wiggle": "Wiggle",
    "dance": "Dance",
    "fly": "Fly",
    "blink": "Blink",
    "roar": "Silly Roar",
    "sleep": "Sleep",
    "celebrate": "Celebrate",
}

MONSTER_DEFAULTS: dict[str, str] = {
    "body": "fluffy",
    "eyes": "two_round",
    "mouth": "smile",
    "horns": "none",
    "ears": "round",
    "arms": "tiny",
    "legs": "bouncy",
    "tail": "curly",
    "wings": "none",
    "accessory": "none",
    "color": "purple",
    "secondary_color": "lime",
    "pattern": "spots",
    "texture": "fluffy",
    "power": "Sneeze confetti",
    "personality": "Curious and polite",
    "mood": "Happy",
    "size": "standard",
    "face": "👾",
}

MONSTER_PRESETS: dict[str, dict[str, str]] = {
    "Wobblepop Classic": {},
    "Friendly Dragon": {
        "body": "dragon", "eyes": "cat", "mouth": "fangs", "horns": "dragon",
        "ears": "dragon", "arms": "claws", "legs": "claws", "tail": "dragon",
        "wings": "dragon", "accessory": "medal", "color": "red",
        "secondary_color": "gold", "pattern": "scales", "texture": "rocky",
        "power": "Paint rainbows in the air", "personality": "Protective and gentle",
        "mood": "Proud", "size": "giant", "face": "🐲",
    },
    "Cloud Dreamer": {
        "body": "cloud", "eyes": "sleepy", "mouth": "tiny", "horns": "moon",
        "ears": "cloud", "arms": "none", "legs": "cloud", "tail": "cloud",
        "wings": "cloud", "accessory": "scarf", "color": "white",
        "secondary_color": "sky", "pattern": "stars", "texture": "cloudy",
        "power": "Create marshmallow clouds", "personality": "Sleepy and clever",
        "mood": "Sleepy", "size": "standard", "face": "👻",
    },
    "Crystal Guardian": {
        "body": "crystal", "eyes": "star", "mouth": "smile", "horns": "crystal",
        "ears": "elf", "arms": "strong", "legs": "long", "tail": "crystal",
        "wings": "crystal", "accessory": "cape", "color": "aqua",
        "secondary_color": "violet", "pattern": "lightning", "texture": "crystal",
        "power": "Find lost toys", "personality": "Brave but ticklish",
        "mood": "Brave", "size": "giant", "face": "🧌",
    },
    "Robot Monster": {
        "body": "robot", "eyes": "robot", "mouth": "robot", "horns": "antenna",
        "ears": "robot", "arms": "robot", "legs": "robot", "tail": "robot",
        "wings": "robot", "accessory": "headphones", "color": "silver",
        "secondary_color": "aqua", "pattern": "checker", "texture": "metallic",
        "power": "Build pillow forts instantly", "personality": "Inventive and messy",
        "mood": "Excited", "size": "standard", "face": "🤖",
    },
    "Forest Sprout": {
        "body": "plant", "eyes": "heart", "mouth": "smile", "horns": "antlers",
        "ears": "leaf", "arms": "branch", "legs": "roots", "tail": "leaf",
        "wings": "leaf", "accessory": "flower", "color": "lime",
        "secondary_color": "brown", "pattern": "patches", "texture": "leafy",
        "power": "Make plants sing", "personality": "Helpful and bouncy",
        "mood": "Happy", "size": "mini", "face": "🦄",
    },
    "Galaxy Octopus": {
        "body": "octopus", "eyes": "six", "mouth": "bubble", "horns": "star",
        "ears": "fin", "arms": "tentacle", "legs": "tentacles", "tail": "rainbow",
        "wings": "star", "accessory": "crown", "color": "midnight",
        "secondary_color": "pink", "pattern": "galaxy", "texture": "cosmic",
        "power": "Open friendly portals", "personality": "Mysterious but friendly",
        "mood": "Curious", "size": "standard", "face": "🐙",
    },
}

LEGACY_BODY_MAP = {
    "Fluffy": "fluffy", "Bouncy": "round", "Slimy": "jelly", "Blocky": "robot",
    "Cloudy": "cloud", "Jelly": "jelly", "Rocky": "rock", "Feathery": "cloud",
    "Tiny and round": "round", "Tall and wobbly": "jelly",
}
LEGACY_EYE_MAP = {
    "One giant eye": "one_giant", "Three tiny eyes": "three", "Star eyes": "star",
    "Googly eyes": "two_round", "Sleepy eyes": "sleepy", "Rainbow eyes": "rainbow",
    "Robot eyes": "robot", "Six blinking eyes": "six", "Invisible eyes": "invisible",
    "Heart eyes": "heart",
}
LEGACY_COLOR_MAP = {
    "Purple": "purple", "Lime green": "lime", "Sky blue": "sky", "Orange": "orange",
    "Rainbow": "rainbow", "Golden": "gold", "Bubblegum pink": "pink",
    "Midnight blue": "midnight", "Polka-dot": "purple", "Glowing silver": "silver",
}


def clean_monster_name(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9 '\-]", "", str(value)).strip()
    value = re.sub(r"\s+", " ", value)
    return value[:24] or "Wobblepop"


def _stable_id(name: str) -> str:
    return f"monster_{hashlib.sha256(name.casefold().encode()).hexdigest()[:12]}"


def _valid_part(category: str, value: Any) -> str:
    text = str(value or "")
    if category == "body":
        text = LEGACY_BODY_MAP.get(text, text)
    elif category == "eyes":
        text = LEGACY_EYE_MAP.get(text, text)
    return text if text in MONSTER_PARTS[category] else MONSTER_DEFAULTS[category]


def _valid_style(field: str, value: Any) -> str:
    text = str(value or "")
    if field in {"color", "secondary_color"}:
        text = LEGACY_COLOR_MAP.get(text, text)
        return text if text in MONSTER_COLORS else MONSTER_DEFAULTS[field]
    catalogs: dict[str, Any] = {
        "pattern": MONSTER_PATTERNS,
        "texture": MONSTER_TEXTURES,
        "size": MONSTER_SIZES,
    }
    return text if text in catalogs[field] else MONSTER_DEFAULTS[field]


def normalize_monster(candidate: Any) -> dict[str, Any] | None:
    """Migrate an old or new monster into the complete customization model."""
    if not isinstance(candidate, dict):
        return None
    name = clean_monster_name(str(candidate.get("name", "Wobblepop")))
    monster: dict[str, Any] = {
        "id": str(candidate.get("id") or _stable_id(name))[:50],
        "name": name,
    }
    for category in MONSTER_PARTS:
        monster[category] = _valid_part(category, candidate.get(category))
    for field in ("color", "secondary_color", "pattern", "texture", "size"):
        monster[field] = _valid_style(field, candidate.get(field))
    power = str(candidate.get("power") or MONSTER_DEFAULTS["power"])[:100]
    personality = str(candidate.get("personality") or MONSTER_DEFAULTS["personality"])[:80]
    monster["power"] = power if power in MONSTER_POWERS else MONSTER_DEFAULTS["power"]
    monster["personality"] = (
        personality if personality in MONSTER_PERSONALITIES else MONSTER_DEFAULTS["personality"]
    )
    mood = str(candidate.get("mood") or MONSTER_DEFAULTS["mood"])
    monster["mood"] = mood if mood in MONSTER_MOODS else MONSTER_DEFAULTS["mood"]
    face = str(candidate.get("face") or MONSTER_DEFAULTS["face"]).replace("<", "").replace(">", "")
    monster["face"] = face[:8] or MONSTER_DEFAULTS["face"]
    monster["created_at"] = str(candidate.get("created_at") or utc_now())[:40]
    monster["customized_at"] = str(candidate.get("customized_at") or monster["created_at"])[:40]
    try:
        monster["times_played"] = max(0, min(int(candidate.get("times_played", 0)), 1_000_000))
    except (TypeError, ValueError, OverflowError):
        monster["times_played"] = 0
    return monster


def build_monster(*, name: str, **choices: Any) -> dict[str, Any]:
    now = utc_now()
    candidate = {
        "id": new_id("monster"),
        "name": clean_monster_name(name),
        **MONSTER_DEFAULTS,
        **choices,
        "created_at": now,
        "customized_at": now,
        "times_played": 0,
    }
    monster = normalize_monster(candidate)
    if monster is None:
        raise ValueError("Monster data is invalid")
    return monster


def customize_monster(monster: dict[str, Any], *, name: str, changes: dict[str, Any]) -> dict[str, Any]:
    candidate = {**monster, **changes, "name": name, "customized_at": utc_now()}
    updated = normalize_monster(candidate)
    if updated is None:
        raise ValueError("Monster data is invalid")
    updated["id"] = str(monster.get("id") or updated["id"])
    updated["created_at"] = str(monster.get("created_at") or updated["created_at"])
    updated["times_played"] = int(monster.get("times_played", 0))
    return updated


def random_monster(seed: int | str | None = None) -> dict[str, str]:
    rng = random.Random(seed)
    values = {category: rng.choice(tuple(options)) for category, options in MONSTER_PARTS.items()}
    values.update(
        color=rng.choice(tuple(MONSTER_COLORS)),
        secondary_color=rng.choice(tuple(MONSTER_COLORS)),
        pattern=rng.choice(tuple(MONSTER_PATTERNS)),
        texture=rng.choice(tuple(MONSTER_TEXTURES)),
        power=rng.choice(MONSTER_POWERS),
        personality=rng.choice(MONSTER_PERSONALITIES),
        mood=rng.choice(MONSTER_MOODS),
        size=rng.choice(tuple(MONSTER_SIZES)),
        face=rng.choice(("👾", "👹", "👻", "🤪", "🦄", "🐲", "🧌", "🤖", "🐙", "🦖")),
    )
    return values


def preset_monster(name: str) -> dict[str, str]:
    if name not in MONSTER_PRESETS:
        raise ValueError(f"Unknown monster preset: {name}")
    return {**MONSTER_DEFAULTS, **MONSTER_PRESETS[name]}


def save_monster(profile: dict[str, Any], monster: dict[str, Any], *, limit: int = 24) -> None:
    normalized = normalize_monster(monster)
    if normalized is None:
        raise ValueError("Monster data is invalid")
    monsters = profile.setdefault("monsters", [])
    monsters[:] = [item for item in monsters if item.get("id") != normalized["id"]]
    monsters.append(normalized)
    del monsters[:-max(1, int(limit))]


def monster_summary(monster: dict[str, Any]) -> str:
    data = normalize_monster(monster) or normalize_monster({})
    assert data is not None
    body = MONSTER_PARTS["body"][data["body"]]
    color = MONSTER_COLORS[data["color"]][0]
    return f"{color} {body} · {data['personality']} · {data['power']}"
