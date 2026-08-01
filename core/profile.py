"""Portable, versioned adventure profile state."""

from __future__ import annotations

import copy
import hashlib
import json
from datetime import UTC, datetime
from typing import Any

from core.catalog import ROBOT_COLORS, ROBOT_PARTS
from core.memory import MAX_MEMORIES
from core.robot import clean_robot_name

PROFILE_VERSION = 2
MAX_ROBOTS = 12
MAX_MONSTERS = 24
MAX_CUSTOM_ANIMALS = 40
MAX_FAVORITES = 100
MAX_DISCOVERED_ANIMALS = 120


def _clean_text(value: Any, limit: int, fallback: str = "") -> str:
    text = str(value if value is not None else "").replace("<", "").replace(">", "").strip()
    return text[:limit] or fallback


def _safe_int(value: Any, default: int, minimum: int, maximum: int) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError, OverflowError):
        number = default
    return max(minimum, min(number, maximum))


def _stable_id(prefix: str, value: str) -> str:
    digest = hashlib.sha256(value.casefold().encode("utf-8")).hexdigest()[:12]
    return f"{prefix}_{digest}"


def _dedupe_strings(values: Any, *, limit: int, item_limit: int = 60) -> list[str]:
    if not isinstance(values, list):
        return []
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        text = _clean_text(value, item_limit)
        key = text.casefold()
        if text and key not in seen:
            seen.add(key)
            result.append(text)
        if len(result) >= limit:
            break
    return result


def _normalize_robot(candidate: Any) -> dict[str, Any] | None:
    if not isinstance(candidate, dict):
        return None
    valid_ids = {category: {part.id for part in parts} for category, parts in ROBOT_PARTS.items()}
    robot_id = _clean_text(candidate.get("id"), 50)
    if not robot_id:
        return None
    defaults = {
        "eyes": "round",
        "head": "box",
        "arms": "grabber",
        "body": "classic_core",
        "base": "bronze_wheels",
        "backpack": "none",
        "power": "bubble",
        "hat": "none",
    }
    robot: dict[str, Any] = {
        "id": robot_id,
        "name": clean_robot_name(str(candidate.get("name", "BuddyBot"))),
        "color": candidate.get("color") if candidate.get("color") in ROBOT_COLORS else "Silver",
        "energy": _safe_int(candidate.get("energy"), 3, 1, 5),
        "mood": _clean_text(candidate.get("mood"), 24, "Happy"),
        "created_with_stars": _safe_int(candidate.get("created_with_stars"), 0, 0, 100_000),
        "xp": _safe_int(candidate.get("xp"), 0, 0, 1_000_000),
        "level": _safe_int(candidate.get("level"), 1, 1, 100),
        "times_moved": _safe_int(candidate.get("times_moved"), 0, 0, 1_000_000),
        "jobs_completed": _safe_int(candidate.get("jobs_completed"), 0, 0, 1_000_000),
        "favorite_job": _clean_text(candidate.get("favorite_job"), 60),
        "created_at": _clean_text(candidate.get("created_at"), 40),
        "last_played_at": _clean_text(candidate.get("last_played_at"), 40),
    }
    calculated_level = min(100, robot["xp"] // 50 + 1)
    robot["level"] = max(robot["level"], calculated_level)
    for category, default in defaults.items():
        value = _clean_text(candidate.get(category), 40, default)
        robot[category] = value if value in valid_ids[category] else default
    return robot


def _normalize_animal(candidate: Any) -> dict[str, Any] | None:
    if not isinstance(candidate, dict):
        return None
    name = _clean_text(candidate.get("name"), 40)
    habitat = _clean_text(candidate.get("habitat"), 60)
    fact = _clean_text(candidate.get("fact"), 180)
    if not name or not habitat or not fact:
        return None
    return {
        "id": _clean_text(candidate.get("id"), 50, _stable_id("animal", name)),
        "name": name,
        "emoji": _clean_text(candidate.get("emoji"), 8, "🐾"),
        "habitat": habitat,
        "fact": fact,
        "created_at": _clean_text(candidate.get("created_at"), 40),
    }


def _normalize_monster(candidate: Any) -> dict[str, Any] | None:
    if not isinstance(candidate, dict):
        return None
    name = _clean_text(candidate.get("name"), 30, "Monster")
    return {
        "id": _clean_text(candidate.get("id"), 50, _stable_id("monster", name)),
        "name": name,
        "body": _clean_text(candidate.get("body"), 40, "Fluffy"),
        "eyes": _clean_text(candidate.get("eyes"), 50, "Googly eyes"),
        "color": _clean_text(candidate.get("color"), 30, "Purple"),
        "power": _clean_text(candidate.get("power"), 100, "Make everyone giggle"),
        "personality": _clean_text(candidate.get("personality"), 80, "Curious and polite"),
        "face": _clean_text(candidate.get("face"), 8, "👾"),
        "created_at": _clean_text(candidate.get("created_at"), 40),
    }


def _normalize_memory(candidate: Any) -> dict[str, Any] | None:
    if not isinstance(candidate, dict):
        return None
    title = _clean_text(candidate.get("title"), 80)
    if not title:
        return None
    return {
        "id": _clean_text(candidate.get("id"), 50, _stable_id("memory", title)),
        "kind": _clean_text(candidate.get("kind"), 32, "adventure"),
        "title": title,
        "detail": _clean_text(candidate.get("detail"), 240),
        "emoji": _clean_text(candidate.get("emoji"), 8, "✨"),
        "entity_id": _clean_text(candidate.get("entity_id"), 50) or None,
        "unique_key": _clean_text(candidate.get("unique_key"), 80) or None,
        "created_at": _clean_text(candidate.get("created_at"), 40),
    }


def _backfill_v1_memories(profile: dict[str, Any]) -> list[dict[str, Any]]:
    memories: list[dict[str, Any]] = []
    for robot in profile["robots"]:
        memories.append(
            {
                "id": _stable_id("memory", f"robot:{robot['id']}"),
                "kind": "robot",
                "title": f"Built {robot['name']}",
                "detail": "A robot friend carried forward from an earlier adventure save.",
                "emoji": "🤖",
                "entity_id": robot["id"],
                "unique_key": f"robot:{robot['id']}",
                "created_at": robot.get("created_at", ""),
            }
        )
    for animal in profile["custom_animals"]:
        memories.append(
            {
                "id": _stable_id("memory", f"animal:{animal['id']}"),
                "kind": "animal",
                "title": f"Added {animal['name']}",
                "detail": animal["fact"],
                "emoji": animal["emoji"],
                "entity_id": animal["id"],
                "unique_key": f"animal:{animal['id']}",
                "created_at": animal.get("created_at", ""),
            }
        )
    for monster in profile["monsters"]:
        memories.append(
            {
                "id": _stable_id("memory", f"monster:{monster['id']}"),
                "kind": "monster",
                "title": f"Created {monster['name']}",
                "detail": f"{monster['personality']} with the power to {monster['power'].lower()}.",
                "emoji": monster["face"],
                "entity_id": monster["id"],
                "unique_key": f"monster:{monster['id']}",
                "created_at": monster.get("created_at", ""),
            }
        )
    return memories[-MAX_MEMORIES:]


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
        "discovered_animals": [],
        "monsters": [],
        "memories": [],
        "preferences": {
            "language": "English",
            "sound": True,
            "reduced_motion": False,
        },
        "sidekick_message": "Let's build your first robot friend!",
        "last_animation": "idle",
        "last_activity_at": "",
        "last_saved_at": "",
    }


def normalize_profile(candidate: Any) -> dict[str, Any]:
    """Migrate and merge a loaded save into a safe, bounded profile shape."""
    base = default_profile()
    if not isinstance(candidate, dict):
        return base

    source_version = _safe_int(candidate.get("version"), 1, 1, PROFILE_VERSION)
    result = copy.deepcopy(base)
    result["kid_name"] = _clean_text(candidate.get("kid_name"), 20, "Nico")
    result["stars"] = _safe_int(candidate.get("stars"), 0, 0, 100_000)
    result["xp"] = _safe_int(candidate.get("xp"), 0, 0, 1_000_000)

    counts = candidate.get("counts", {})
    if isinstance(counts, dict):
        result["counts"] = {
            _clean_text(key, 40): _safe_int(value, 0, 0, 100_000)
            for key, value in counts.items()
            if _clean_text(key, 40)
        }

    result["badges"] = _dedupe_strings(candidate.get("badges"), limit=80, item_limit=40)

    robots = candidate.get("robots", [])
    if isinstance(robots, list):
        normalized = (_normalize_robot(item) for item in robots[:MAX_ROBOTS])
        result["robots"] = [item for item in normalized if item is not None]

    active = _clean_text(candidate.get("active_robot_id"), 50)
    robot_ids = {robot.get("id") for robot in result["robots"]}
    result["active_robot_id"] = active if active in robot_ids else (result["robots"][0]["id"] if result["robots"] else None)

    result["favorites"] = _dedupe_strings(candidate.get("favorites"), limit=MAX_FAVORITES, item_limit=40)

    animals = candidate.get("custom_animals", [])
    if isinstance(animals, list):
        normalized_animals = (_normalize_animal(item) for item in animals[:MAX_CUSTOM_ANIMALS])
        result["custom_animals"] = [item for item in normalized_animals if item is not None]

    discoveries = _dedupe_strings(
        candidate.get("discovered_animals"),
        limit=MAX_DISCOVERED_ANIMALS,
        item_limit=40,
    )
    discoveries.extend(result["favorites"])
    discoveries.extend(animal["name"] for animal in result["custom_animals"])
    result["discovered_animals"] = _dedupe_strings(
        discoveries,
        limit=MAX_DISCOVERED_ANIMALS,
        item_limit=40,
    )

    monsters = candidate.get("monsters", [])
    if isinstance(monsters, list):
        normalized_monsters = (_normalize_monster(item) for item in monsters[:MAX_MONSTERS])
        result["monsters"] = [item for item in normalized_monsters if item is not None]

    memories = candidate.get("memories", [])
    if isinstance(memories, list):
        normalized_memories = (_normalize_memory(item) for item in memories[-MAX_MEMORIES:])
        result["memories"] = [item for item in normalized_memories if item is not None]
    if source_version < 2 and not result["memories"]:
        result["memories"] = _backfill_v1_memories(result)

    preferences = candidate.get("preferences", {})
    if isinstance(preferences, dict):
        language = _clean_text(preferences.get("language"), 20, "English")
        result["preferences"] = {
            "language": language if language in {"English", "Spanish", "Both"} else "English",
            "sound": bool(preferences.get("sound", True)),
            "reduced_motion": bool(preferences.get("reduced_motion", False)),
        }

    result["sidekick_message"] = _clean_text(
        candidate.get("sidekick_message"),
        180,
        base["sidekick_message"],
    )
    result["last_animation"] = _clean_text(candidate.get("last_animation"), 20, "idle")
    result["last_activity_at"] = _clean_text(candidate.get("last_activity_at"), 40)
    result["last_saved_at"] = _clean_text(candidate.get("last_saved_at"), 40)
    result["version"] = PROFILE_VERSION
    return result


def active_robot(profile: dict[str, Any]) -> dict[str, Any] | None:
    active_id = profile.get("active_robot_id")
    for robot in profile.get("robots", []):
        if robot.get("id") == active_id:
            return robot
    return None


def save_robot(profile: dict[str, Any], robot: dict[str, Any]) -> None:
    normalized = _normalize_robot(robot)
    if normalized is None:
        raise ValueError("Robot data is invalid")
    robots = profile.setdefault("robots", [])
    robots[:] = [item for item in robots if item.get("id") != normalized["id"]]
    robots.append(normalized)
    del robots[:-MAX_ROBOTS]
    profile["active_robot_id"] = normalized["id"]


def remove_robot(profile: dict[str, Any], robot_id: str) -> None:
    profile["robots"] = [robot for robot in profile.get("robots", []) if robot.get("id") != robot_id]
    if profile.get("active_robot_id") == robot_id:
        profile["active_robot_id"] = profile["robots"][0]["id"] if profile["robots"] else None


def remove_custom_animal(profile: dict[str, Any], animal_id: str) -> None:
    removed_names = {
        animal.get("name")
        for animal in profile.get("custom_animals", [])
        if animal.get("id") == animal_id
    }
    profile["custom_animals"] = [
        animal for animal in profile.get("custom_animals", []) if animal.get("id") != animal_id
    ]
    profile["favorites"] = [name for name in profile.get("favorites", []) if name not in removed_names]


def remove_monster(profile: dict[str, Any], monster_id: str) -> None:
    profile["monsters"] = [
        monster for monster in profile.get("monsters", []) if monster.get("id") != monster_id
    ]


def export_profile(profile: dict[str, Any]) -> str:
    exported = normalize_profile(profile)
    exported["last_saved_at"] = datetime.now(UTC).isoformat(timespec="seconds")
    return json.dumps(exported, ensure_ascii=False, indent=2, sort_keys=True)


def import_profile(raw: str | bytes) -> dict[str, Any]:
    if isinstance(raw, bytes):
        try:
            raw = raw.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise ValueError("That file is not a valid Nico's World save") from exc
    if len(raw) > 500_000:
        raise ValueError("Adventure save is too large")
    try:
        candidate = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("That file is not a valid Nico's World save") from exc
    return normalize_profile(candidate)
