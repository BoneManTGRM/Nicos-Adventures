"""Functional robot jobs with real effects and persistent memory results."""

from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Any

from core.achievements import Badge, record_event
from core.animal_world import all_animals, choose_expedition
from core.catalog import ROBOT_PARTS
from core.memory import collection_counts, mark_discovered, remember, robot_progress
from core.profile import active_robot


@dataclass(frozen=True)
class RobotJob:
    id: str
    title: str
    emoji: str
    description: str


@dataclass(frozen=True)
class JobResult:
    job_id: str
    title: str
    emoji: str
    summary: str
    detail: str


ROBOT_JOBS: tuple[RobotJob, ...] = (
    RobotJob(
        "scout_animals",
        "Scout Animal Forest",
        "🐾",
        "Find an animal, add it to the Field Guide, and report one survival fact.",
    ),
    RobotJob(
        "organize_memory",
        "Organize Memory Book",
        "📚",
        "Sort the adventure timeline, remove duplicate keyed memories, and count the collections.",
    ),
    RobotJob(
        "scan_monsters",
        "Scan Monster Lab",
        "👾",
        "Analyze the newest saved monster, or calibrate the scanner if the lab is empty.",
    ),
    RobotJob(
        "charge_workshop",
        "Charge the Workshop",
        "🔋",
        "Restore the sidekick to full energy and power the Robo Lab systems.",
    ),
    RobotJob(
        "recommend_story",
        "Recommend a Story",
        "📖",
        "Create a personalized adventure idea using Nico's robot, animals, and monsters.",
    ),
    RobotJob(
        "find_hidden_part",
        "Find a Hidden Part",
        "🧩",
        "Search the workshop and reveal a clue for the next locked robot component.",
    ),
)

_JOB_LOOKUP = {job.id: job for job in ROBOT_JOBS}


def _dedupe_and_sort_memories(profile: dict[str, Any]) -> tuple[int, int]:
    memories = profile.setdefault("memories", [])
    if not isinstance(memories, list):
        profile["memories"] = []
        return 0, 0

    before = len(memories)
    seen_keys: set[str] = set()
    cleaned: list[dict[str, Any]] = []
    for item in reversed(memories):
        if not isinstance(item, dict):
            continue
        unique_key = str(item.get("unique_key") or "")
        if unique_key and unique_key in seen_keys:
            continue
        if unique_key:
            seen_keys.add(unique_key)
        cleaned.append(item)
    cleaned.reverse()
    cleaned.sort(key=lambda item: str(item.get("created_at", "")))
    profile["memories"] = cleaned
    return before, len(cleaned)


def _next_locked_part(stars: int) -> tuple[str, str, int] | None:
    candidates: list[tuple[int, str, str]] = []
    for category, parts in ROBOT_PARTS.items():
        for part in parts:
            if part.unlock_stars > stars:
                candidates.append((part.unlock_stars, category, part.label))
    if not candidates:
        return None
    unlock_stars, category, label = min(candidates)
    return category, label, unlock_stars


def _story_recommendation(profile: dict[str, Any], seed: int | str | None) -> tuple[str, str]:
    robot = active_robot(profile)
    assert robot is not None
    rng = random.Random(seed)
    animals = all_animals(profile.get("custom_animals", []))
    animal = rng.choice(animals)
    monsters = profile.get("monsters", [])
    monster_name = str(rng.choice(monsters).get("name", "Wobblepop")) if monsters else "Wobblepop"
    places = (
        "a floating bamboo island",
        "an underwater crystal library",
        "a moonlit mountain workshop",
        "a rainforest city powered by friendship",
        "a hidden station beyond the stars",
    )
    place = rng.choice(places)
    title = f"{robot['name']} and the {animal['name']} Signal"
    detail = (
        f"In {place}, {robot['name']} teams up with a {animal['name']} and "
        f"{monster_name} to repair a mysterious beacon before sunrise."
    )
    return title, detail


def perform_robot_job(
    profile: dict[str, Any],
    job_id: str,
    *,
    seed: int | str | None = None,
) -> tuple[JobResult, list[Badge]]:
    """Perform one job, apply a real effect, and save the result to memory."""
    job = _JOB_LOOKUP.get(job_id)
    if job is None:
        raise KeyError(f"Unknown robot job: {job_id}")

    robot = active_robot(profile)
    if robot is None:
        raise ValueError("Build and select a robot before starting a job")

    if seed is None:
        seed = f"{job_id}:{robot.get('jobs_completed', 0)}:{profile.get('xp', 0)}"

    badges: list[Badge] = []
    summary = "Job complete"
    detail = ""

    if job_id == "scout_animals":
        animals = all_animals(profile.get("custom_animals", []))
        animal = choose_expedition(
            animals,
            profile.get("discovered_animals", []),
            seed=seed,
        )
        newly_discovered = mark_discovered(profile, str(animal["name"]))
        if newly_discovered:
            badges.extend(record_event(profile, "animal_discoveries"))
        summary = f"Found {animal['name']}"
        detail = (
            f"{animal.get('fact', '')} Survival skill: "
            f"{animal.get('adaptation', 'a special adaptation')}."
        )
        profile["last_animation"] = "walk"

    elif job_id == "scan_monsters":
        monsters = profile.get("monsters", [])
        if monsters:
            monster = monsters[-1]
            name = str(monster.get("name", "Monster"))
            summary = f"Scanned {name}"
            detail = (
                f"Scanner result: friendly, {str(monster.get('personality', 'curious')).lower()}, "
                f"with the power to {str(monster.get('power', 'make everyone giggle')).lower()}."
            )
        else:
            summary = "Scanner calibrated"
            detail = "The Monster Lab is empty, so the robot calibrated its sensors on a friendly hologram."
        profile["last_animation"] = "flash"

    elif job_id == "organize_memory":
        before, after = _dedupe_and_sort_memories(profile)
        counts = collection_counts(profile)
        summary = f"Organized {after} memories"
        detail = (
            f"Checked {before} timeline entries and organized {counts['robots']} robots, "
            f"{counts['discoveries']} animal discoveries, and {counts['monsters']} monsters."
        )
        profile["last_animation"] = "spin"

    elif job_id == "charge_workshop":
        before = int(robot.get("energy", 3))
        robot["energy"] = 5
        summary = "Workshop fully charged"
        detail = f"Robot energy increased from {before}/5 to 5/5 and the Robo Lab power grid is ready."
        profile["last_animation"] = "charge"

    elif job_id == "recommend_story":
        title, story = _story_recommendation(profile, seed)
        summary = title
        detail = story
        remember(
            profile,
            kind="story",
            title=title,
            detail=story,
            emoji="📖",
            entity_id=str(robot.get("id", "")),
        )
        profile["last_animation"] = "celebrate"

    elif job_id == "find_hidden_part":
        clue = _next_locked_part(int(profile.get("stars", 0)))
        if clue is None:
            summary = "Master builder clue"
            detail = "Every catalog part is unlocked. The robot found a blank blueprint for Nico's next original invention."
        else:
            category, label, unlock_stars = clue
            remaining = max(0, unlock_stars - int(profile.get("stars", 0)))
            summary = f"Blueprint clue: {label}"
            detail = (
                f"The clue points to the {category} workshop. It unlocks at {unlock_stars} stars, "
                f"only {remaining} more to go."
            )
        profile["last_animation"] = "flash"

    robot["favorite_job"] = job.title
    robot_progress(robot, jobs=1, xp=15)
    badges.extend(record_event(profile, "robot_jobs"))

    milestone = int(robot.get("jobs_completed", 0))
    remember(
        profile,
        kind="job",
        title=f"{robot['name']}: {job.title}",
        detail=f"{summary}. {detail}",
        emoji=job.emoji,
        entity_id=str(robot.get("id", "")),
    )
    if milestone in {1, 3, 10, 25, 50, 100}:
        remember(
            profile,
            kind="robot",
            title=f"{robot['name']} completed {milestone} jobs",
            detail=f"Latest completed job: {job.title}.",
            emoji="🛠️",
            entity_id=str(robot.get("id", "")),
            unique_key=f"robot-jobs:{robot.get('id')}:{milestone}",
        )

    result = JobResult(
        job_id=job.id,
        title=job.title,
        emoji=job.emoji,
        summary=summary,
        detail=detail,
    )
    profile["last_job_result"] = {
        "job_id": result.job_id,
        "title": result.title,
        "emoji": result.emoji,
        "summary": result.summary,
        "detail": result.detail,
    }
    profile["sidekick_message"] = f"{robot['name']}: {summary}!"
    return result, badges
