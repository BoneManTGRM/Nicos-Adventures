"""Portable adventure profile state."""

from __future__ import annotations

import copy
import json
from typing import Any

from core.catalog import ROBOT_COLORS, ROBOT_PARTS
from core.robot import clean_robot_name

PROFILE_VERSION = 1
MAX_ROBOTS = 8
MAX_MONSTERS = 12
MAX_CUSTOM_ANIMALS = 20


def _normalize_robot(candidate: Any) -> dict[str, Any] | None:
    if not isinstance(candidate, dict):
        return None
    valid_ids = {category: {part.id for part in parts} for category, parts in ROBOT_PARTS.items()}
    robot_id = str(candidate.get("id", ""))[:40]
    if not robot_id:
        return None
    defaults = {
        "eyes": "round",
        "head": "box",
        "arms": "grabber",
        "base": "bronze_wheels",
        "power": "bubble",
        "hat": "none",
    }
    robot: dict[str, Any] = {
        "id": robot_id,
        "name": clean_robot_name(str(candidate.get("name", "BuddyBot"))),
        "color": candidate.get("color") if candidate.get("color") in ROBOT_COLORS else "Silver",
        "energy": max(1, min(int(candidate.get("energy", 3)), 5)),
        "mood": str(candidate.get("mood", "Happy"))[:20],
        "created_with_stars": max(0, min(int(candidate.get("created_with_stars", 0)), 100_000)),
    }
    for category, default in defaults.items():
        value = str(candidate.get(category, default))
        robot[category] = value if value in valid_ids[category] else default
    return robot


def default_profile() -> dict[str, Any]:
    return {
        "version": PROFILE_VERSION,
        "kid_name": "Nico",
        "stars": 0,
        "xp": 0,
        "counts": {},
        "badges": [],
        "robots": [],
        "active_robot_id": None,
        "favorites": [],
        "custom_animals": [],
        "monsters": [],
        "sidekick_message": "Let's build your first robot friend!",
        "last_animation": "idle",
    }


def normalize_profile(candidate: Any) -> dict[str, Any]:
    """Merge a loaded save into a safe, bounded profile shape."""
    base = default_profile()
    if not isinstance(candidate, dict):
        return base

    result = copy.deepcopy(base)
    result["kid_name"] = str(candidate.get("kid_name", "Nico"))[:20] or "Nico"
    result["stars"] = max(0, min(int(candidate.get("stars", 0)), 100_000))
    result["xp"] = max(0, min(int(candidate.get("xp", 0)), 1_000_000))

    counts = candidate.get("counts", {})
    if isinstance(counts, dict):
        result["counts"] = {
            str(key)[:40]: max(0, min(int(value), 100_000))
            for key, value in counts.items()
            if isinstance(value, (int, float))
        }

    badges = candidate.get("badges", [])
    if isinstance(badges, list):
        result["badges"] = [str(item)[:40] for item in badges[:50]]

    robots = candidate.get("robots", [])
    if isinstance(robots, list):
        normalized = (_normalize_robot(item) for item in robots[:MAX_ROBOTS])
        result["robots"] = [item for item in normalized if item is not None]

    active = candidate.get("active_robot_id")
    robot_ids = {robot.get("id") for robot in result["robots"]}
    result["active_robot_id"] = active if active in robot_ids else None

    favorites = candidate.get("favorites", [])
    if isinstance(favorites, list):
        result["favorites"] = [str(item)[:40] for item in favorites[:50]]

    animals = candidate.get("custom_animals", [])
    if isinstance(animals, list):
        result["custom_animals"] = [item for item in animals[:MAX_CUSTOM_ANIMALS] if isinstance(item, dict)]

    monsters = candidate.get("monsters", [])
    if isinstance(monsters, list):
        result["monsters"] = [item for item in monsters[:MAX_MONSTERS] if isinstance(item, dict)]

    result["sidekick_message"] = str(candidate.get("sidekick_message", base["sidekick_message"]))[:180]
    result["last_animation"] = str(candidate.get("last_animation", "idle"))[:20]
    return result


def active_robot(profile: dict[str, Any]) -> dict[str, Any] | None:
    active_id = profile.get("active_robot_id")
    for robot in profile.get("robots", []):
        if robot.get("id") == active_id:
            return robot
    return None


def save_robot(profile: dict[str, Any], robot: dict[str, Any]) -> None:
    robots = profile.setdefault("robots", [])
    robots.append(robot)
    del robots[:-MAX_ROBOTS]
    profile["active_robot_id"] = robot["id"]


def remove_robot(profile: dict[str, Any], robot_id: str) -> None:
    profile["robots"] = [robot for robot in profile.get("robots", []) if robot.get("id") != robot_id]
    if profile.get("active_robot_id") == robot_id:
        profile["active_robot_id"] = profile["robots"][0]["id"] if profile["robots"] else None


def export_profile(profile: dict[str, Any]) -> str:
    return json.dumps(normalize_profile(profile), ensure_ascii=False, indent=2, sort_keys=True)


def import_profile(raw: str | bytes) -> dict[str, Any]:
    if isinstance(raw, bytes):
        raw = raw.decode("utf-8")
    if len(raw) > 250_000:
        raise ValueError("Adventure save is too large")
    try:
        candidate = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("That file is not a valid Nico's World save") from exc
    return normalize_profile(candidate)
