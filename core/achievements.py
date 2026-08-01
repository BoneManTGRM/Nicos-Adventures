"""Stars, events, and badge rules."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class Badge:
    id: str
    title: str
    emoji: str
    description: str
    event: str
    target: int


BADGES: tuple[Badge, ...] = (
    Badge("first_friend", "First Robot Friend", "🤖", "Build your first robot.", "robot_builds", 1),
    Badge("robot_engineer", "Robot Engineer", "🛠️", "Build three robot friends.", "robot_builds", 3),
    Badge("robot_team", "Robot Team", "🤖", "Build five robot friends.", "robot_builds", 5),
    Badge("move_master", "Move Master", "💃", "Make robots move five times.", "robot_moves", 5),
    Badge("dance_legend", "Motion Legend", "🚀", "Make robots move twenty times.", "robot_moves", 20),
    Badge("first_discovery", "First Discovery", "🔎", "Remember your first animal.", "animal_discoveries", 1),
    Badge("forest_explorer", "Forest Explorer", "🌳", "Discover five animals.", "animal_discoveries", 5),
    Badge("animal_pal", "Animal Pal", "🐾", "Favorite three animals.", "animal_favorites", 3),
    Badge("world_builder", "World Builder", "🌍", "Add an animal to Nico's World.", "custom_animals", 1),
    Badge("forest_creator", "Forest Creator", "🌱", "Add five custom animals.", "custom_animals", 5),
    Badge("monster_maker", "Monster Maker", "👾", "Create three silly monsters.", "monsters_built", 3),
    Badge("monster_collector", "Monster Collector", "🎭", "Create ten monsters.", "monsters_built", 10),
    Badge("helper_bot", "Helper Bot", "🔎", "Send a robot on three jobs.", "robot_jobs", 3),
    Badge("super_helper", "Super Helper", "⚡", "Complete fifteen robot jobs.", "robot_jobs", 15),
)

EVENT_REWARDS: dict[str, int] = {
    "robot_builds": 3,
    "robot_moves": 1,
    "animal_discoveries": 1,
    "animal_favorites": 1,
    "custom_animals": 2,
    "monsters_built": 2,
    "robot_jobs": 1,
}


def record_event(profile: dict[str, Any], event: str, amount: int = 1) -> list[Badge]:
    """Record progress, award stars, and return newly earned badges."""
    if event not in EVENT_REWARDS:
        raise KeyError(f"Unknown progress event: {event}")
    amount = max(0, int(amount))
    counts = profile.setdefault("counts", {})
    counts[event] = int(counts.get(event, 0)) + amount
    profile["stars"] = int(profile.get("stars", 0)) + EVENT_REWARDS[event] * amount
    profile["xp"] = int(profile.get("xp", 0)) + 10 * amount

    earned_ids = set(profile.setdefault("badges", []))
    new_badges: list[Badge] = []
    for badge in BADGES:
        if badge.id not in earned_ids and int(counts.get(badge.event, 0)) >= badge.target:
            profile["badges"].append(badge.id)
            earned_ids.add(badge.id)
            new_badges.append(badge)
    return new_badges


def level_for_stars(stars: int) -> int:
    return max(1, int(stars) // 10 + 1)


def badge_progress(profile: dict[str, Any], badge: Badge) -> tuple[int, int]:
    return min(int(profile.get("counts", {}).get(badge.event, 0)), badge.target), badge.target
