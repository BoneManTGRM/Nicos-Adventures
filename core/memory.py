"""Small, privacy-conscious memory helpers for Nico's World."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

MAX_MEMORIES = 160


def utc_now() -> str:
    """Return a compact, timezone-aware timestamp suitable for save files."""
    return datetime.now(UTC).isoformat(timespec="seconds")


def new_id(prefix: str) -> str:
    """Create a short opaque identifier without storing personal data."""
    safe_prefix = "".join(character for character in prefix.lower() if character.isalnum())[:10] or "item"
    return f"{safe_prefix}_{uuid.uuid4().hex[:12]}"


def remember(
    profile: dict[str, Any],
    *,
    kind: str,
    title: str,
    detail: str,
    emoji: str = "✨",
    entity_id: str | None = None,
    unique_key: str | None = None,
) -> dict[str, Any]:
    """Append or refresh a bounded memory entry inside the portable profile."""
    memories = profile.setdefault("memories", [])
    if not isinstance(memories, list):
        memories = []
        profile["memories"] = memories

    if unique_key:
        memories[:] = [item for item in memories if item.get("unique_key") != unique_key]

    memory = {
        "id": new_id("memory"),
        "kind": str(kind)[:32] or "adventure",
        "title": str(title).strip()[:80] or "Adventure memory",
        "detail": str(detail).strip()[:240],
        "emoji": str(emoji)[:8] or "✨",
        "entity_id": str(entity_id)[:50] if entity_id else None,
        "unique_key": str(unique_key)[:80] if unique_key else None,
        "created_at": utc_now(),
    }
    memories.append(memory)
    del memories[:-MAX_MEMORIES]
    profile["last_activity_at"] = memory["created_at"]
    return memory


def mark_discovered(profile: dict[str, Any], animal_name: str) -> bool:
    """Remember one animal once, returning True only for a new discovery."""
    clean_name = str(animal_name).strip()[:40]
    if not clean_name:
        return False
    discovered = profile.setdefault("discovered_animals", [])
    if not isinstance(discovered, list):
        discovered = []
        profile["discovered_animals"] = discovered
    if clean_name.casefold() in {str(item).casefold() for item in discovered}:
        return False
    discovered.append(clean_name)
    del discovered[:-120]
    return True


def robot_progress(
    robot: dict[str, Any],
    *,
    moves: int = 0,
    jobs: int = 0,
    xp: int = 0,
) -> None:
    """Update one robot's personal progress and level safely."""
    robot["times_moved"] = max(0, int(robot.get("times_moved", 0)) + int(moves))
    robot["jobs_completed"] = max(0, int(robot.get("jobs_completed", 0)) + int(jobs))
    robot["xp"] = max(0, min(int(robot.get("xp", 0)) + int(xp), 1_000_000))
    robot["level"] = min(100, max(1, robot["xp"] // 50 + 1))
    robot["last_played_at"] = utc_now()


def collection_counts(profile: dict[str, Any]) -> dict[str, int]:
    """Return the collection totals used by the Memory Book and save screen."""
    return {
        "robots": len(profile.get("robots", [])),
        "animals": len(profile.get("custom_animals", [])),
        "discoveries": len(profile.get("discovered_animals", [])),
        "monsters": len(profile.get("monsters", [])),
        "memories": len(profile.get("memories", [])),
    }
