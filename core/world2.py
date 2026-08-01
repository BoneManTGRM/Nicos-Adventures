"""Shared progression, mission, bilingual, and recovery helpers for Nico's World 2."""

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
    ("star_window", "🌌 Star Window", 12),
    ("mecha_banner", "🤖 Mecha Banner", 18),
)


def ensure_world2(profile: dict[str, Any]) -> dict[str, Any]:
    counts = profile.setdefault("counts", {})
    counts.setdefault("world2_visits", 0)
    profile.setdefault("world2", {})
    state = profile["world2"]
    state.setdefault("active_mission", "jungle_crystal")
    state.setdefault("completed_missions", [])
    state.setdefault("decorations", ["charging_dock"])
    state.setdefault("active_decorations", ["charging_dock"])
    state.setdefault("stories", [])
    state.setdefault("arcade_best", {})
    state.setdefault("recovery_snapshot", {})
    state.setdefault("last_safe_page", "Home")
    state.setdefault("repairs", [])
    return state


def tr(profile: dict[str, Any], key: str) -> str:
    language = profile.get("preferences", {}).get("language", "English")
    return TRANSLATIONS.get(language, TRANSLATIONS["English"]).get(key, key)


def mission_progress(profile: dict[str, Any], mission_id: str) -> tuple[int, int, list[tuple[str, bool]]]:
    mission = MISSIONS[mission_id]
    counts = profile.get("counts", {})
    rows: list[tuple[str, bool]] = []
    complete = 0
    for key, target, label in mission["steps"]:
        value = len(profile.get("monsters", [])) if key == "monsters" else int(counts.get(key, 0))
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
    profile["stars"] = int(profile.get("stars", 0)) + int(MISSIONS[mission_id]["reward"])
    profile["sidekick_message"] = f"Mission complete: {MISSIONS[mission_id]['title']}!"
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
    unlocked = {item_id for item_id, _, cost in DECORATIONS if int(profile.get("stars", 0)) >= cost}
    if decoration_id not in unlocked:
        return False
    if decoration_id not in state["decorations"]:
        state["decorations"].append(decoration_id)
    if decoration_id not in state["active_decorations"]:
        state["active_decorations"].append(decoration_id)
        profile.setdefault("counts", {})["home_decorations"] = len(state["active_decorations"])
    return True


def record_arcade_win(profile: dict[str, Any], game: str, score: int) -> None:
    state = ensure_world2(profile)
    best = int(state["arcade_best"].get(game, 0))
    state["arcade_best"][game] = max(best, score)
    counts = profile.setdefault("counts", {})
    counts["arcade_wins"] = int(counts.get("arcade_wins", 0)) + 1
    profile["stars"] = int(profile.get("stars", 0)) + 1


def snapshot(profile: dict[str, Any], page: str) -> None:
    state = ensure_world2(profile)
    safe = {key: copy.deepcopy(value) for key, value in profile.items() if key != "world2"}
    safe["world2"] = {key: copy.deepcopy(value) for key, value in state.items() if key != "recovery_snapshot"}
    state["recovery_snapshot"] = safe
    state["last_safe_page"] = page


def repair_profile(profile: dict[str, Any]) -> bool:
    state = ensure_world2(profile)
    repaired = False
    if not isinstance(profile.get("counts"), dict):
        profile["counts"] = {}
        repaired = True
    if int(profile.get("stars", 0)) < 0:
        profile["stars"] = 0
        repaired = True
    if state.get("active_mission") not in MISSIONS:
        state["active_mission"] = "jungle_crystal"
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
    )
    seed = datetime.now(UTC).strftime("%Y-%m-%d") + str(profile.get("kid_name", "Nico"))
    return random.Random(seed).choice(options)
