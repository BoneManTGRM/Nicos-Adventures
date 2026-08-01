"""Shared legacy progression, room, story, arcade, and recovery helpers."""

from __future__ import annotations

import copy
import random
from datetime import UTC, datetime
from typing import Any

MISSIONS: dict[str, dict[str, Any]] = {
    "jungle_crystal": {
        "title": "The Missing Jungle Crystal",
        "emoji": "💎",
        "steps": (
            ("animal_discoveries", 1, "Discover an animal in Animal Forest"),
            ("animal_quiz_correct", 1, "Answer an animal challenge"),
            ("robot_jobs", 1, "Complete a robot job"),
            ("monsters", 1, "Create a monster guardian"),
        ),
        "reward": 8,
    },
    "story_rescue": {
        "title": "The Lost Story Pages",
        "emoji": "📖",
        "steps": (
            ("stories_created", 1, "Create a story in Story Castle"),
            ("arcade_wins", 1, "Win an Arcade challenge"),
            ("home_decorations", 1, "Place a decoration in Robot Home"),
        ),
        "reward": 10,
    },
    "world_builder": {
        "title": "Builder of Nico's World",
        "emoji": "🏗️",
        "steps": (
            ("robot_builds", 1, "Build a robot"),
            ("custom_animals", 1, "Create an animal entry"),
            ("monsters", 2, "Create two monsters"),
            ("stories_created", 2, "Create two stories"),
        ),
        "reward": 15,
    },
}

TRANSLATIONS = {
    "English": {
        "world_map": "World Map",
        "today": "Today's Adventure",
        "missions": "Missions",
        "continue": "Continue Adventure",
    },
    "Spanish": {
        "world_map": "Mapa del Mundo",
        "today": "La aventura de hoy",
        "missions": "Misiones",
        "continue": "Continuar aventura",
    },
    "Both": {
        "world_map": "World Map · Mapa del Mundo",
        "today": "Today's Adventure · La aventura de hoy",
        "missions": "Missions · Misiones",
        "continue": "Continue · Continuar",
    },
}

DECORATIONS = (
    ("charging_dock", "🔋 Charging Dock", 0),
    ("animal_wall", "🖼️ Animal Photo Wall", 3),
    ("monster_plush", "👾 Monster Plush", 5),
    ("trophy_shelf", "🏆 Trophy Shelf", 8),
    ("story_library", "📚 Story Library", 10),
    ("star_window", "🌌 Star Window", 12),
    ("robot_bed", "🛏️ Robot Recharge Bed", 14),
    ("holo_aquarium", "🐠 Hologram Aquarium", 16),
    ("mecha_banner", "🤖 Mecha Banner", 18),
    ("tool_wall", "🛠️ Master Tool Wall", 20),
    ("galaxy_rug", "🌠 Galaxy Rug", 22),
    ("robot_pet", "🐕 Robot Pet", 25),
    ("plant_station", "🌿 Bio-Light Plants", 28),
    ("arcade_console", "🕹️ Arcade Console", 32),
    ("mission_table", "🗺️ Mission Hologram", 36),
    ("ceiling_drone", "🛸 Helper Drone", 40),
    ("crystal_lamp", "💎 Crystal Lamp", 45),
    ("memory_terminal", "🧠 Memory Terminal", 50),
)
ROOM_THEMES = (
    "Cozy Workshop",
    "Neon Hangar",
    "Forest Cabin",
    "Moon Base",
    "Ocean Station",
    "Royal Mecha Suite",
)
ROOM_WEATHER = ("Sunny", "Sunset", "Starry Night", "Rain", "Snow", "Nebula")
ROOM_LIGHTING = ("Bright", "Warm", "Night")


def _text(value: Any, limit: int, fallback: str = "") -> str:
    cleaned = str(value if value is not None else "")
    cleaned = cleaned.replace("<", "").replace(">", "").strip()
    return cleaned[:limit] or fallback


def _number(value: Any, default: int = 0, maximum: int = 1_000_000) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError, OverflowError):
        parsed = default
    return max(0, min(parsed, maximum))


def normalize_world2_state(candidate: Any) -> dict[str, Any]:
    source = candidate if isinstance(candidate, dict) else {}
    valid_ids = {item_id for item_id, _, _ in DECORATIONS}
    owned = [
        item for item in source.get("decorations", []) if item in valid_ids
    ]
    if "charging_dock" not in owned:
        owned.insert(0, "charging_dock")
    owned = list(dict.fromkeys(owned))[: len(DECORATIONS)]
    active = [
        item
        for item in source.get("active_decorations", [])
        if item in owned
    ]
    active = list(dict.fromkeys(active))[: len(DECORATIONS)]
    if not active:
        active = ["charging_dock"]
    completed = list(
        dict.fromkeys(
            item
            for item in source.get("completed_missions", [])
            if item in MISSIONS
        )
    )[: len(MISSIONS)]
    stories: list[dict[str, str]] = []
    raw_stories = source.get("stories", [])
    if isinstance(raw_stories, list):
        for item in raw_stories[-20:]:
            if not isinstance(item, dict):
                continue
            stories.append(
                {
                    "title": _text(item.get("title"), 60, "Nico's Adventure"),
                    "hero": _text(item.get("hero"), 40, "Robo Guide"),
                    "animal": _text(item.get("animal"), 40, "Animal Friend"),
                    "monster": _text(item.get("monster"), 40, "Friendly Monster"),
                    "pet": _text(item.get("pet"), 40),
                    "setting": _text(item.get("setting"), 50, "Nico's World"),
                    "language": _text(item.get("language"), 20, "English"),
                    "text": _text(item.get("text"), 2_000),
                    "artwork_id": _text(item.get("artwork_id"), 50),
                    "created_at": _text(item.get("created_at"), 40),
                }
            )
    arcade_best = source.get("arcade_best", {})
    best = (
        {
            _text(key, 40): _number(value, maximum=100_000)
            for key, value in arcade_best.items()
            if _text(key, 40)
        }
        if isinstance(arcade_best, dict)
        else {}
    )
    raw_interactions = source.get("home_interactions", {})
    interactions = (
        {
            _text(key, 30): _number(value, maximum=100_000)
            for key, value in raw_interactions.items()
            if _text(key, 30)
        }
        if isinstance(raw_interactions, dict)
        else {}
    )
    active_mission = _text(
        source.get("active_mission"), 40, "jungle_crystal"
    )
    return {
        "active_mission": (
            active_mission if active_mission in MISSIONS else "jungle_crystal"
        ),
        "completed_missions": completed,
        "decorations": owned,
        "active_decorations": active,
        "home_theme": (
            source.get("home_theme")
            if source.get("home_theme") in ROOM_THEMES
            else ROOM_THEMES[0]
        ),
        "home_weather": (
            source.get("home_weather")
            if source.get("home_weather") in ROOM_WEATHER
            else ROOM_WEATHER[0]
        ),
        "home_lighting": (
            source.get("home_lighting")
            if source.get("home_lighting") in ROOM_LIGHTING
            else "Warm"
        ),
        "home_visits": _number(source.get("home_visits")),
        "home_interactions": interactions,
        "stories": stories,
        "arcade_best": best,
        "recovery_snapshot": {},
        "last_safe_page": _text(
            source.get("last_safe_page"), 40, "Home"
        ),
        "repairs": [
            _text(item, 40)
            for item in source.get("repairs", [])[-20:]
            if _text(item, 40)
        ],
    }


def ensure_world2(profile: dict[str, Any]) -> dict[str, Any]:
    counts = profile.setdefault("counts", {})
    counts.setdefault("world2_visits", 0)
    existing = profile.get("world2")
    if not isinstance(existing, dict):
        existing = {}
        profile["world2"] = existing
    recovery = existing.get("recovery_snapshot", {})
    normalized = normalize_world2_state(existing)
    normalized["recovery_snapshot"] = (
        recovery if isinstance(recovery, dict) else {}
    )
    existing.clear()
    existing.update(normalized)
    return existing


def tr(profile: dict[str, Any], key: str) -> str:
    language = profile.get("preferences", {}).get("language", "English")
    return TRANSLATIONS.get(language, TRANSLATIONS["English"]).get(key, key)


def mission_progress(
    profile: dict[str, Any], mission_id: str
) -> tuple[int, int, list[tuple[str, bool]]]:
    mission = MISSIONS[mission_id]
    rows: list[tuple[str, bool]] = []
    complete = 0
    for key, target, label in mission["steps"]:
        value = (
            len(profile.get("monsters", []))
            if key == "monsters"
            else int(profile.get("counts", {}).get(key, 0))
        )
        done = value >= target
        complete += int(done)
        rows.append((f"{label} ({min(value, target)}/{target})", done))
    return complete, len(rows), rows


def complete_mission_if_ready(profile: dict[str, Any], mission_id: str) -> bool:
    state = ensure_world2(profile)
    if mission_id in state["completed_missions"]:
        return False
    complete, total, _ = mission_progress(profile, mission_id)
    if complete != total:
        return False
    state["completed_missions"].append(mission_id)
    profile["stars"] = int(profile.get("stars", 0)) + int(
        MISSIONS[mission_id]["reward"]
    )
    profile["sidekick_message"] = (
        f"Mission complete: {MISSIONS[mission_id]['title']}!"
    )
    return True


def add_story(profile: dict[str, Any], story: dict[str, str]) -> None:
    state = ensure_world2(profile)
    item = dict(story)
    item["created_at"] = datetime.now(UTC).isoformat()
    state["stories"].append(item)
    del state["stories"][:-20]
    counts = profile.setdefault("counts", {})
    counts["stories_created"] = int(counts.get("stories_created", 0)) + 1


def decorate_home(profile: dict[str, Any], decoration_id: str) -> bool:
    state = ensure_world2(profile)
    unlocked = {
        item_id
        for item_id, _, cost in DECORATIONS
        if int(profile.get("stars", 0)) >= cost
    }
    if decoration_id not in unlocked:
        return False
    if decoration_id not in state["decorations"]:
        state["decorations"].append(decoration_id)
    if decoration_id not in state["active_decorations"]:
        state["active_decorations"].append(decoration_id)
    profile.setdefault("counts", {})["home_decorations"] = len(
        state["active_decorations"]
    )
    return True


def toggle_home_decoration(profile: dict[str, Any], decoration_id: str) -> bool:
    state = ensure_world2(profile)
    if decoration_id not in state["decorations"]:
        return decorate_home(profile, decoration_id)
    if decoration_id in state["active_decorations"]:
        state["active_decorations"].remove(decoration_id)
        visible = False
    else:
        state["active_decorations"].append(decoration_id)
        visible = True
    profile.setdefault("counts", {})["home_decorations"] = len(
        state["active_decorations"]
    )
    return visible


def set_home_environment(
    profile: dict[str, Any], theme: str, weather: str, lighting: str
) -> None:
    state = ensure_world2(profile)
    state["home_theme"] = theme if theme in ROOM_THEMES else ROOM_THEMES[0]
    state["home_weather"] = (
        weather if weather in ROOM_WEATHER else ROOM_WEATHER[0]
    )
    state["home_lighting"] = (
        lighting if lighting in ROOM_LIGHTING else ROOM_LIGHTING[0]
    )


def record_home_interaction(profile: dict[str, Any], action: str) -> int:
    state = ensure_world2(profile)
    interactions = state["home_interactions"]
    interactions[action] = int(interactions.get(action, 0)) + 1
    return interactions[action]


def record_arcade_win(profile: dict[str, Any], game: str, score: int) -> None:
    state = ensure_world2(profile)
    state["arcade_best"][game] = max(
        int(state["arcade_best"].get(game, 0)),
        int(score),
    )
    counts = profile.setdefault("counts", {})
    counts["arcade_wins"] = int(counts.get("arcade_wins", 0)) + 1
    profile["stars"] = int(profile.get("stars", 0)) + 1


def snapshot(profile: dict[str, Any], page: str) -> None:
    state = ensure_world2(profile)
    safe = {
        key: copy.deepcopy(value)
        for key, value in profile.items()
        if key != "world2"
    }
    safe["world2"] = {
        key: copy.deepcopy(value)
        for key, value in state.items()
        if key != "recovery_snapshot"
    }
    state["recovery_snapshot"] = safe
    state["last_safe_page"] = page


def repair_profile(profile: dict[str, Any]) -> bool:
    original = copy.deepcopy(profile.get("world2"))
    state = ensure_world2(profile)
    repaired = original != state
    if not isinstance(profile.get("counts"), dict):
        profile["counts"] = {}
        repaired = True
    if int(profile.get("stars", 0)) < 0:
        profile["stars"] = 0
        repaired = True
    if repaired:
        state["repairs"].append(datetime.now(UTC).isoformat())
        del state["repairs"][:-20]
    return repaired


def daily_adventure(profile: dict[str, Any]) -> str:
    options = (
        "Discover one new animal and teach your robot its best survival trick.",
        "Create a monster, then write a story where it becomes the hero.",
        "Win one Arcade challenge and add a decoration to Robot Home.",
        "Customize your sidekick for a mission in Animal Forest.",
        "Create an artwork and display it inside Robot Home.",
        "Visit Dinosaur Valley and recover a new fossil.",
        "Train a robot pet or visit a monster habitat.",
    )
    seed = datetime.now(UTC).strftime("%Y-%m-%d") + str(
        profile.get("kid_name", "Nico")
    )
    return random.Random(seed).choice(options)
