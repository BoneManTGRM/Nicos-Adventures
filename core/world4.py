"""Connected campaign, creative, habitat, pet, and seasonal state for Nico's World 4."""

from __future__ import annotations

import copy
import hashlib
from datetime import UTC, datetime
from typing import Any

CAMPAIGN_MISSIONS: dict[str, dict[str, Any]] = {
    "spark_01": {
        "chapter": 1,
        "title": "The First Lost Energy Star",
        "emoji": "⭐",
        "description": "Build a sidekick and restore the first light in Robo City.",
        "objectives": (
            ("robot_builds", 1, "Build a robot sidekick"),
            ("robot_moves", 1, "Try one robot animation"),
        ),
        "reward": 3,
        "ability": "scanner",
    },
    "spark_02": {
        "chapter": 1,
        "title": "Pawprints in the Power Station",
        "emoji": "🐾",
        "description": "Follow an animal clue through the old power station.",
        "objectives": (
            ("animal_discoveries", 2, "Discover two animals"),
            ("animal_quiz_correct", 1, "Solve an animal challenge"),
        ),
        "reward": 4,
        "ability": "translator",
    },
    "spark_03": {
        "chapter": 1,
        "title": "The Friendly Monster Signal",
        "emoji": "👾",
        "description": "Create a monster guardian and learn its unusual power.",
        "objectives": (
            ("monsters", 1, "Create a monster"),
            ("monster_plays", 1, "Play with a monster"),
        ),
        "reward": 4,
        "ability": "monster_magic",
    },
    "spark_04": {
        "chapter": 1,
        "title": "A Home for the Team",
        "emoji": "🏠",
        "description": "Make headquarters feel like a real home.",
        "objectives": (
            ("home_decorations", 2, "Place two room decorations"),
            ("home_moments", 2, "Use two Robot Home activities"),
        ),
        "reward": 5,
        "ability": "repair",
    },
    "forest_01": {
        "chapter": 2,
        "title": "The Whispering Canopy",
        "emoji": "🌳",
        "description": "Restore the forest sensors without frightening its animals.",
        "objectives": (
            ("animal_discoveries", 4, "Discover four animals"),
            ("robot_jobs", 2, "Complete two robot jobs"),
        ),
        "reward": 5,
        "ability": "scanner",
    },
    "forest_02": {
        "chapter": 2,
        "title": "River Rescue Route",
        "emoji": "🌊",
        "description": "Use aquatic equipment to reach a stranded forest friend.",
        "objectives": (
            ("animal_expeditions", 1, "Complete an animal expedition"),
            ("ability_aquatic", 1, "Prepare an aquatic-capable teammate"),
        ),
        "reward": 6,
        "ability": "aquatic",
    },
    "forest_03": {
        "chapter": 2,
        "title": "The Painted Trail",
        "emoji": "🎨",
        "description": "Create a field poster that helps explorers follow the safe trail.",
        "objectives": (
            ("artworks", 1, "Create an artwork"),
            ("stories_created", 1, "Create a story"),
        ),
        "reward": 6,
        "ability": "creative",
    },
    "forest_04": {
        "chapter": 2,
        "title": "Guardian of the Great Tree",
        "emoji": "🦉",
        "description": "Complete the forest chapter with a robot, monster, and animal team.",
        "objectives": (
            ("animal_discoveries", 6, "Discover six animals"),
            ("monster_friendship", 15, "Build monster friendship"),
            ("robot_jobs", 4, "Complete four robot jobs"),
        ),
        "reward": 8,
        "ability": "translator",
    },
    "dino_01": {
        "chapter": 3,
        "title": "Footprints from the Past",
        "emoji": "🦕",
        "description": "Open Dinosaur Valley and identify its first ancient resident.",
        "objectives": (
            ("dinosaurs_discovered", 1, "Discover one dinosaur"),
            ("fossils", 1, "Recover one fossil"),
        ),
        "reward": 6,
        "ability": "scanner",
    },
    "dino_02": {
        "chapter": 3,
        "title": "The Fossil Bridge",
        "emoji": "🦴",
        "description": "Use strength and careful observation to repair a fossil bridge.",
        "objectives": (
            ("dinosaurs_discovered", 3, "Discover three dinosaurs"),
            ("ability_strength", 1, "Prepare a strong teammate"),
        ),
        "reward": 7,
        "ability": "strength",
    },
    "dino_03": {
        "chapter": 3,
        "title": "Sky Nest Mystery",
        "emoji": "🪽",
        "description": "Reach the high nesting grounds without disturbing the eggs.",
        "objectives": (
            ("dinosaurs_discovered", 5, "Discover five dinosaurs"),
            ("ability_flight", 1, "Prepare a flying teammate"),
        ),
        "reward": 8,
        "ability": "flight",
    },
    "dino_04": {
        "chapter": 3,
        "title": "Valley of Gentle Giants",
        "emoji": "🌋",
        "description": "Complete the valley expedition and preserve its discoveries.",
        "objectives": (
            ("dinosaurs_discovered", 7, "Discover seven dinosaurs"),
            ("fossils", 4, "Recover four fossils"),
            ("arcade_wins", 3, "Win three Arcade rounds"),
        ),
        "reward": 10,
        "ability": "repair",
    },
    "ocean_01": {
        "chapter": 4,
        "title": "Ocean Station Emergency",
        "emoji": "🐋",
        "description": "Dive below the waves and restart the station beacons.",
        "objectives": (
            ("ability_aquatic", 1, "Prepare an aquatic teammate"),
            ("animal_discoveries", 8, "Discover eight animals"),
        ),
        "reward": 8,
        "ability": "aquatic",
    },
    "ocean_02": {
        "chapter": 4,
        "title": "The Singing Reef",
        "emoji": "🐠",
        "description": "Translate the reef's music and solve its color pattern.",
        "objectives": (
            ("ability_translator", 1, "Prepare a translator teammate"),
            ("arcade_wins", 5, "Win five Arcade rounds"),
        ),
        "reward": 9,
        "ability": "translator",
    },
    "moon_01": {
        "chapter": 5,
        "title": "Launch to the Moon",
        "emoji": "🚀",
        "description": "Train a pet and prepare a flight-capable exploration team.",
        "objectives": (
            ("robot_pets", 1, "Create a robot pet"),
            ("ability_flight", 1, "Prepare a flying teammate"),
        ),
        "reward": 9,
        "ability": "flight",
    },
    "moon_02": {
        "chapter": 5,
        "title": "The Silent Moon Library",
        "emoji": "🌙",
        "description": "Recover a forgotten story and illustrate its final page.",
        "objectives": (
            ("stories_created", 3, "Create three stories"),
            ("artworks", 3, "Create three artworks"),
        ),
        "reward": 10,
        "ability": "creative",
    },
    "crystal_01": {
        "chapter": 6,
        "title": "The Crystal Castle Door",
        "emoji": "💎",
        "description": "Combine repair skill and monster magic to open the castle safely.",
        "objectives": (
            ("ability_repair", 1, "Prepare a repair teammate"),
            ("monster_friendship", 35, "Reach 35 total monster friendship"),
        ),
        "reward": 11,
        "ability": "repair",
    },
    "crystal_02": {
        "chapter": 6,
        "title": "Festival of Inventors",
        "emoji": "🛠️",
        "description": "Show the world what Nico's creative team can build together.",
        "objectives": (
            ("robot_customizations", 2, "Customize robots twice"),
            ("artworks", 5, "Create five artworks"),
            ("pet_tricks", 2, "Teach robot pets two tricks"),
        ),
        "reward": 12,
        "ability": "creative",
    },
    "finale_01": {
        "chapter": 7,
        "title": "Return of the Star Machine",
        "emoji": "🌠",
        "description": "Restore the machine that connects every part of Nico's World.",
        "objectives": (
            ("campaign_completed", 16, "Complete sixteen earlier missions"),
            ("world_growth", 5, "Grow the living world to stage five"),
        ),
        "reward": 15,
        "ability": "teamwork",
    },
    "finale_02": {
        "chapter": 7,
        "title": "Guardian of Nico's World",
        "emoji": "👑",
        "description": "Finish the campaign with a complete creative adventure team.",
        "objectives": (
            ("campaign_completed", 19, "Complete nineteen earlier missions"),
            ("robot_pets", 2, "Create two robot pets"),
            ("monster_habitats", 2, "Build two monster habitats"),
            ("dinosaurs_discovered", 8, "Discover eight dinosaurs"),
        ),
        "reward": 20,
        "ability": "teamwork",
    },
}

PET_SPECIES: dict[str, str] = {
    "dog": "🐕",
    "cat": "🐈",
    "dinosaur": "🦖",
    "dragon": "🐉",
    "penguin": "🐧",
    "fox": "🦊",
    "owl": "🦉",
    "space_orb": "🛸",
}
PET_COLORS: dict[str, str] = {
    "Photon Blue": "#38BDF8",
    "Rocket Red": "#EF4444",
    "Jungle Green": "#22C55E",
    "Sunny Gold": "#FACC15",
    "Galaxy Purple": "#8B5CF6",
    "Bubblegum Pink": "#EC4899",
    "Cloud White": "#E2E8F0",
    "Armor Black": "#334155",
}
PET_PERSONALITIES = (
    "Brave Scout",
    "Cuddly Helper",
    "Silly Acrobat",
    "Calm Guardian",
    "Curious Explorer",
    "Musical Friend",
)
PET_ACCESSORIES = (
    "None",
    "Explorer Bandana",
    "Tiny Jetpack",
    "Crystal Collar",
    "Tool Harness",
    "Royal Cape",
    "Star Antenna",
)
HABITAT_THEMES = (
    "Crystal Cave",
    "Cloud Nest",
    "Jungle Hideaway",
    "Ocean Bubble",
    "Moon Pod",
    "Candy Garden",
    "Volcano Workshop",
    "Royal Tower",
)
HABITAT_FOODS = (
    "Moon Berries",
    "Crunchy Star Chips",
    "Rainbow Noodles",
    "Bubble Soup",
    "Dinosaur Leaf Wraps",
    "Marshmallow Clouds",
)
HABITAT_TOYS = (
    "Bouncy Meteor",
    "Puzzle Cube",
    "Squeaky Rocket",
    "Mini Castle",
    "Dancing Banana",
    "Hologram Fish",
)
ART_BACKGROUNDS: dict[str, tuple[str, str]] = {
    "Sunrise Meadow": ("#7DD3FC", "#86EFAC"),
    "Moon Base": ("#111827", "#475569"),
    "Rainbow Sky": ("#F9A8D4", "#67E8F9"),
    "Dinosaur Valley": ("#FDBA74", "#4ADE80"),
    "Ocean Station": ("#0EA5E9", "#164E63"),
    "Crystal Castle": ("#C4B5FD", "#FDE68A"),
}
ART_FRAMES = (
    "Golden Stars",
    "Robot Bolts",
    "Jungle Vines",
    "Monster Spots",
    "Crystal Glow",
    "Space Window",
)
ART_STICKERS = (
    "⭐",
    "🤖",
    "🐾",
    "👾",
    "🦖",
    "🚀",
    "🌈",
    "💎",
    "🌙",
    "🏆",
    "🐉",
    "🎨",
)


def _clean_text(value: Any, limit: int, fallback: str = "") -> str:
    text = str(value if value is not None else "").replace("<", "").replace(">", "")
    return text.strip()[:limit] or fallback


def _safe_int(value: Any, default: int, minimum: int, maximum: int) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError, OverflowError):
        number = default
    return max(minimum, min(number, maximum))


def _stable_id(prefix: str, text: str) -> str:
    digest = hashlib.sha256(text.encode()).hexdigest()[:12]
    return f"{prefix}_{digest}"


def normalize_world4_state(candidate: Any) -> dict[str, Any]:
    """Return a bounded world-four state that is safe to persist in a profile."""
    source = candidate if isinstance(candidate, dict) else {}
    artworks = []
    for item in source.get("artworks", []) if isinstance(source.get("artworks"), list) else []:
        if not isinstance(item, dict):
            continue
        title = _clean_text(item.get("title"), 60, "Untitled Artwork")
        artworks.append(
            {
                "id": _clean_text(item.get("id"), 50, _stable_id("art", title)),
                "title": title,
                "background": _clean_text(item.get("background"), 40, "Sunrise Meadow"),
                "frame": _clean_text(item.get("frame"), 40, "Golden Stars"),
                "subject": _clean_text(item.get("subject"), 60, "Nico's World"),
                "caption": _clean_text(item.get("caption"), 120),
                "stickers": [
                    _clean_text(value, 8)
                    for value in item.get("stickers", [])[:8]
                    if _clean_text(value, 8)
                ],
                "created_at": _clean_text(item.get("created_at"), 40),
            }
        )
    pets = []
    for item in source.get("robot_pets", []) if isinstance(source.get("robot_pets"), list) else []:
        if not isinstance(item, dict):
            continue
        name = _clean_text(item.get("name"), 24, "Pixel")
        species = _clean_text(item.get("species"), 24, "dog")
        pets.append(
            {
                "id": _clean_text(item.get("id"), 50, _stable_id("pet", name)),
                "name": name,
                "species": species if species in PET_SPECIES else "dog",
                "color": (
                    item.get("color") if item.get("color") in PET_COLORS else "Photon Blue"
                ),
                "personality": (
                    item.get("personality")
                    if item.get("personality") in PET_PERSONALITIES
                    else PET_PERSONALITIES[0]
                ),
                "accessory": (
                    item.get("accessory")
                    if item.get("accessory") in PET_ACCESSORIES
                    else PET_ACCESSORIES[0]
                ),
                "bond": _safe_int(item.get("bond"), 0, 0, 100),
                "tricks": _safe_int(item.get("tricks"), 0, 0, 50),
                "plays": _safe_int(item.get("plays"), 0, 0, 100_000),
                "created_at": _clean_text(item.get("created_at"), 40),
            }
        )
    habitats: dict[str, dict[str, Any]] = {}
    raw_habitats = source.get("monster_habitats", {})
    if isinstance(raw_habitats, dict):
        for monster_id, item in list(raw_habitats.items())[:24]:
            if not isinstance(item, dict):
                continue
            key = _clean_text(monster_id, 50)
            if not key:
                continue
            habitats[key] = {
                "theme": (
                    item.get("theme")
                    if item.get("theme") in HABITAT_THEMES
                    else HABITAT_THEMES[0]
                ),
                "food": (
                    item.get("food") if item.get("food") in HABITAT_FOODS else HABITAT_FOODS[0]
                ),
                "toy": (
                    item.get("toy") if item.get("toy") in HABITAT_TOYS else HABITAT_TOYS[0]
                ),
                "friendship": _safe_int(item.get("friendship"), 0, 0, 100),
                "visits": _safe_int(item.get("visits"), 0, 0, 100_000),
                "last_action": _clean_text(item.get("last_action"), 40),
            }
    completed = [
        item
        for item in source.get("campaign_completed", [])
        if item in CAMPAIGN_MISSIONS
    ][: len(CAMPAIGN_MISSIONS)]
    active_id = _clean_text(source.get("campaign_active"), 40, next(iter(CAMPAIGN_MISSIONS)))
    active_pet_id = _clean_text(source.get("active_pet_id"), 50)
    pet_ids = {item["id"] for item in pets}
    return {
        "campaign_active": (
            active_id if active_id in CAMPAIGN_MISSIONS else next(iter(CAMPAIGN_MISSIONS))
        ),
        "campaign_completed": list(dict.fromkeys(completed)),
        "artworks": artworks[-24:],
        "featured_artwork_id": _clean_text(source.get("featured_artwork_id"), 50),
        "robot_pets": pets[-12:],
        "active_pet_id": active_pet_id if active_pet_id in pet_ids else (pets[0]["id"] if pets else ""),
        "monster_habitats": habitats,
        "dinosaurs_discovered": list(
            dict.fromkeys(
                _clean_text(item, 40)
                for item in source.get("dinosaurs_discovered", [])
                if _clean_text(item, 40)
            )
        )[:40],
        "fossils": list(
            dict.fromkeys(
                _clean_text(item, 60)
                for item in source.get("fossils", [])
                if _clean_text(item, 60)
            )
        )[:80],
        "seasonal_claims": list(
            dict.fromkeys(
                _clean_text(item, 30)
                for item in source.get("seasonal_claims", [])
                if _clean_text(item, 30)
            )
        )[-20:],
        "living_world_stage": _safe_int(source.get("living_world_stage"), 1, 1, 7),
        "narration_rate": float(source.get("narration_rate", 1.0))
        if isinstance(source.get("narration_rate", 1.0), (int, float))
        else 1.0,
        "narration_pitch": float(source.get("narration_pitch", 1.0))
        if isinstance(source.get("narration_pitch", 1.0), (int, float))
        else 1.0,
    }


def ensure_world4(profile: dict[str, Any]) -> dict[str, Any]:
    state = normalize_world4_state(profile.get("world4"))
    profile["world4"] = state
    update_living_world(profile)
    return state


def utc_now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def ability_report(profile: dict[str, Any]) -> dict[str, bool]:
    """Infer useful field abilities from currently saved robots and monsters."""
    robot = next(
        (
            item
            for item in profile.get("robots", [])
            if item.get("id") == profile.get("active_robot_id")
        ),
        profile.get("robots", [None])[0] if profile.get("robots") else None,
    )
    values = " ".join(str(value).lower() for value in (robot or {}).values())
    monsters = " ".join(
        f"{item.get('power', '')} {item.get('wings', '')} {item.get('body', '')}".lower()
        for item in profile.get("monsters", [])
    )
    return {
        "scanner": any(term in values for term in ("scan", "sensor", "laser", "night", "target")),
        "translator": any(
            term in values for term in ("animal friend", "radio", "compass", "tactical", "music")
        ),
        "aquatic": any(
            term in values for term in ("aquarium", "submarine", "bubble", "ocean", "water")
        )
        or any(term in monsters for term in ("bubble", "water", "ocean", "fish")),
        "strength": any(
            term in values for term in ("giant", "tank", "titan", "siege", "gravity", "rock")
        ),
        "flight": any(
            term in values for term in ("wing", "jet", "rocket", "aero", "flight", "hover")
        )
        or any(term in monsters for term in ("wing", "fly", "cloud")),
        "repair": any(
            term in values for term in ("repair", "rescue", "builder", "tool", "heart", "helper")
        ),
        "creative": bool(profile.get("world4", {}).get("artworks"))
        or bool(profile.get("world2", {}).get("stories")),
        "monster_magic": bool(profile.get("monsters")),
        "teamwork": bool(profile.get("robots")) and bool(profile.get("monsters")),
    }


def _metric(profile: dict[str, Any], key: str) -> int:
    state = profile.get("world4", {})
    abilities = ability_report(profile)
    if key == "monsters":
        return len(profile.get("monsters", []))
    if key == "artworks":
        return len(state.get("artworks", []))
    if key == "robot_pets":
        return len(state.get("robot_pets", []))
    if key == "monster_habitats":
        return len(state.get("monster_habitats", {}))
    if key == "dinosaurs_discovered":
        return len(state.get("dinosaurs_discovered", []))
    if key == "fossils":
        return len(state.get("fossils", []))
    if key == "campaign_completed":
        return len(state.get("campaign_completed", []))
    if key == "world_growth":
        return int(state.get("living_world_stage", 1))
    if key == "monster_friendship":
        return sum(
            int(item.get("friendship", 0))
            for item in state.get("monster_habitats", {}).values()
        )
    if key == "pet_tricks":
        return sum(int(item.get("tricks", 0)) for item in state.get("robot_pets", []))
    if key == "home_moments":
        return sum(
            int(value)
            for value in profile.get("world2", {}).get("home_interactions", {}).values()
        )
    if key.startswith("ability_"):
        return int(abilities.get(key.removeprefix("ability_"), False))
    return int(profile.get("counts", {}).get(key, 0))


def campaign_progress(
    profile: dict[str, Any], mission_id: str
) -> tuple[int, int, list[tuple[str, bool]]]:
    mission = CAMPAIGN_MISSIONS[mission_id]
    rows: list[tuple[str, bool]] = []
    complete = 0
    for key, target, label in mission["objectives"]:
        value = _metric(profile, key)
        done = value >= target
        rows.append((f"{label} ({min(value, target)}/{target})", done))
        complete += int(done)
    return complete, len(rows), rows


def claim_campaign_mission(profile: dict[str, Any], mission_id: str) -> bool:
    state = ensure_world4(profile)
    if mission_id in state["campaign_completed"]:
        return False
    complete, total, _ = campaign_progress(profile, mission_id)
    if complete != total:
        return False
    state["campaign_completed"].append(mission_id)
    reward = int(CAMPAIGN_MISSIONS[mission_id]["reward"])
    profile["stars"] = int(profile.get("stars", 0)) + reward
    profile.setdefault("counts", {})["campaign_missions"] = len(state["campaign_completed"])
    profile["sidekick_message"] = (
        f"Campaign mission complete: {CAMPAIGN_MISSIONS[mission_id]['title']}!"
    )
    update_living_world(profile)
    return True


def add_artwork(profile: dict[str, Any], artwork: dict[str, Any]) -> dict[str, Any]:
    state = ensure_world4(profile)
    title = _clean_text(artwork.get("title"), 60, "Untitled Artwork")
    item = {
        "id": _stable_id("art", f"{title}:{utc_now()}"),
        "title": title,
        "background": (
            artwork.get("background")
            if artwork.get("background") in ART_BACKGROUNDS
            else next(iter(ART_BACKGROUNDS))
        ),
        "frame": artwork.get("frame") if artwork.get("frame") in ART_FRAMES else ART_FRAMES[0],
        "subject": _clean_text(artwork.get("subject"), 60, "Nico's World"),
        "caption": _clean_text(artwork.get("caption"), 120),
        "stickers": [value for value in artwork.get("stickers", []) if value in ART_STICKERS][:8],
        "created_at": utc_now(),
    }
    state["artworks"].append(item)
    del state["artworks"][:-24]
    state["featured_artwork_id"] = item["id"]
    counts = profile.setdefault("counts", {})
    counts["artworks_created"] = int(counts.get("artworks_created", 0)) + 1
    return item


def create_robot_pet(profile: dict[str, Any], values: dict[str, Any]) -> dict[str, Any]:
    state = ensure_world4(profile)
    name = _clean_text(values.get("name"), 24, "Pixel")
    item = {
        "id": _stable_id("pet", f"{name}:{utc_now()}"),
        "name": name,
        "species": values.get("species") if values.get("species") in PET_SPECIES else "dog",
        "color": values.get("color") if values.get("color") in PET_COLORS else "Photon Blue",
        "personality": (
            values.get("personality")
            if values.get("personality") in PET_PERSONALITIES
            else PET_PERSONALITIES[0]
        ),
        "accessory": (
            values.get("accessory")
            if values.get("accessory") in PET_ACCESSORIES
            else PET_ACCESSORIES[0]
        ),
        "bond": 0,
        "tricks": 0,
        "plays": 0,
        "created_at": utc_now(),
    }
    state["robot_pets"].append(item)
    del state["robot_pets"][:-12]
    state["active_pet_id"] = item["id"]
    profile.setdefault("counts", {})["robot_pets_created"] = int(
        profile.setdefault("counts", {}).get("robot_pets_created", 0)
    ) + 1
    return item


def active_pet(profile: dict[str, Any]) -> dict[str, Any] | None:
    state = ensure_world4(profile)
    return next(
        (item for item in state["robot_pets"] if item["id"] == state["active_pet_id"]),
        None,
    )


def interact_with_pet(profile: dict[str, Any], pet_id: str, action: str) -> dict[str, Any] | None:
    state = ensure_world4(profile)
    pet = next((item for item in state["robot_pets"] if item["id"] == pet_id), None)
    if pet is None:
        return None
    pet["plays"] = int(pet.get("plays", 0)) + 1
    pet["bond"] = min(100, int(pet.get("bond", 0)) + (8 if action == "train" else 5))
    if action == "train" and pet["bond"] >= (int(pet.get("tricks", 0)) + 1) * 15:
        pet["tricks"] = min(10, int(pet.get("tricks", 0)) + 1)
    counts = profile.setdefault("counts", {})
    counts["pet_interactions"] = int(counts.get("pet_interactions", 0)) + 1
    return pet


def assign_monster_habitat(
    profile: dict[str, Any], monster_id: str, theme: str, food: str, toy: str
) -> dict[str, Any]:
    state = ensure_world4(profile)
    current = state["monster_habitats"].get(monster_id, {})
    habitat = {
        "theme": theme if theme in HABITAT_THEMES else HABITAT_THEMES[0],
        "food": food if food in HABITAT_FOODS else HABITAT_FOODS[0],
        "toy": toy if toy in HABITAT_TOYS else HABITAT_TOYS[0],
        "friendship": _safe_int(current.get("friendship"), 0, 0, 100),
        "visits": _safe_int(current.get("visits"), 0, 0, 100_000),
        "last_action": _clean_text(current.get("last_action"), 40),
    }
    state["monster_habitats"][monster_id] = habitat
    profile.setdefault("counts", {})["monster_habitats_built"] = len(
        state["monster_habitats"]
    )
    return habitat


def interact_with_habitat(profile: dict[str, Any], monster_id: str, action: str) -> dict[str, Any] | None:
    state = ensure_world4(profile)
    habitat = state["monster_habitats"].get(monster_id)
    if habitat is None:
        return None
    gain = {"feed": 7, "play": 9, "rest": 5, "decorate": 6}.get(action, 4)
    habitat["friendship"] = min(100, int(habitat.get("friendship", 0)) + gain)
    habitat["visits"] = int(habitat.get("visits", 0)) + 1
    habitat["last_action"] = action
    counts = profile.setdefault("counts", {})
    counts["habitat_interactions"] = int(counts.get("habitat_interactions", 0)) + 1
    return habitat


def discover_dinosaur(profile: dict[str, Any], dinosaur_id: str, fossil: str) -> bool:
    state = ensure_world4(profile)
    is_new = dinosaur_id not in state["dinosaurs_discovered"]
    if is_new:
        state["dinosaurs_discovered"].append(dinosaur_id)
        profile.setdefault("counts", {})["dinosaur_discoveries"] = len(
            state["dinosaurs_discovered"]
        )
    if fossil and fossil not in state["fossils"]:
        state["fossils"].append(_clean_text(fossil, 60))
    update_living_world(profile)
    return is_new


def update_living_world(profile: dict[str, Any]) -> int:
    state = profile.setdefault("world4", normalize_world4_state({}))
    points = (
        len(profile.get("robots", []))
        + len(profile.get("monsters", []))
        + len(profile.get("discovered_animals", [])) // 2
        + len(state.get("artworks", []))
        + len(state.get("robot_pets", [])) * 2
        + len(state.get("dinosaurs_discovered", []))
        + len(state.get("campaign_completed", [])) * 2
    )
    stage = min(7, max(1, points // 8 + 1))
    state["living_world_stage"] = stage
    return stage


def seasonal_event(now: datetime | None = None) -> dict[str, str]:
    current = now or datetime.now(UTC)
    month = current.month
    if month in {12, 1, 2}:
        return {
            "id": f"winter-{current.year}",
            "title": "Winter Star Festival",
            "emoji": "❄️",
            "challenge": "Complete three activities and decorate a cozy headquarters.",
        }
    if month in {3, 4, 5}:
        return {
            "id": f"spring-{current.year}",
            "title": "Spring Animal Celebration",
            "emoji": "🌼",
            "challenge": "Discover an animal and create a colorful artwork.",
        }
    if month in {6, 7, 8}:
        return {
            "id": f"summer-{current.year}",
            "title": "Summer Ocean Expedition",
            "emoji": "🌊",
            "challenge": "Prepare an aquatic teammate and win an Arcade round.",
        }
    return {
        "id": f"autumn-{current.year}",
        "title": "Autumn Monster Masquerade",
        "emoji": "🎃",
        "challenge": "Visit a monster habitat and create a new story.",
    }


def claim_seasonal_reward(profile: dict[str, Any]) -> bool:
    state = ensure_world4(profile)
    event = seasonal_event()
    if event["id"] in state["seasonal_claims"]:
        return False
    activity_total = sum(int(value) for value in profile.get("counts", {}).values())
    if activity_total < 3:
        return False
    state["seasonal_claims"].append(event["id"])
    profile["stars"] = int(profile.get("stars", 0)) + 5
    profile["sidekick_message"] = f"Seasonal reward claimed: {event['title']}!"
    return True


def snapshot_for_slot(profile: dict[str, Any]) -> dict[str, Any]:
    """Return a copy suitable for a session-only recovery slot."""
    copied = copy.deepcopy(profile)
    copied.get("world2", {}).pop("recovery_snapshot", None)
    return copied
