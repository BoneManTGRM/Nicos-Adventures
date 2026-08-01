import json

import pytest

from core.profile import (
    PROFILE_VERSION,
    default_profile,
    export_profile,
    import_profile,
    normalize_profile,
    save_robot,
)
from core.robot import build_robot


def test_profile_round_trip() -> None:
    profile = default_profile()
    profile["stars"] = 12
    profile["custom_animals"] = [
        {
            "name": "Moon Cat",
            "emoji": "🐱",
            "habitat": "Mountains",
            "region": "Moon Valley",
            "group": "Mammal",
            "diet": "Omnivore",
            "fact": "It jumps high.",
            "adaptation": "Springy moon paws.",
            "mission": "Measure one moon jump.",
        }
    ]
    save_robot(
        profile,
        build_robot(
            name="Bolt",
            eyes="round",
            head="box",
            arms="grabber",
            base="bronze_wheels",
            color="Electric Blue",
            secondary_color="Sunny Yellow",
            finish="Glossy",
            pattern="Circuit Lines",
            eye_glow="Gold",
            size="Mega",
            voice="Deep Hero",
            personality="Brave Hero",
            mood="Proud",
            catchphrase="Adventure systems ready!",
            power="bubble",
            hat="none",
            stars=12,
        ),
    )
    restored = import_profile(export_profile(profile))
    assert restored["stars"] == 12
    assert restored["active_robot_id"]
    assert restored["custom_animals"][0]["name"] == "Moon Cat"
    assert restored["custom_animals"][0]["adaptation"] == "Springy moon paws."
    assert restored["robots"][0]["pattern"] == "Circuit Lines"
    assert restored["robots"][0]["voice"] == "Deep Hero"
    assert restored["robots"][0]["catchphrase"] == "Adventure systems ready!"
    assert restored["version"] == PROFILE_VERSION


def test_profile_bounds_untrusted_values() -> None:
    profile = normalize_profile(
        {
            "stars": -4,
            "xp": 9_999_999,
            "robots": [1, {"id": "ok"}],
        }
    )
    assert profile["stars"] == 0
    assert profile["xp"] == 1_000_000
    assert profile["robots"][0]["id"] == "ok"
    assert profile["robots"][0]["eyes"] == "round"
    assert profile["robots"][0]["mouth"] == "smile"
    assert profile["robots"][0]["body"] == "classic_core"
    assert profile["robots"][0]["backpack"] == "none"
    assert profile["robots"][0]["pattern"] == "Solid"
    assert profile["robots"][0]["personality"] == "Curious Explorer"


def test_invalid_save_is_rejected() -> None:
    with pytest.raises(ValueError, match="not a valid"):
        import_profile("not-json")


def test_v1_save_migrates_collections_into_memory() -> None:
    old_save = {
        "version": 1,
        "robots": [{"id": "r1", "name": "Bolt"}],
        "custom_animals": [
            {
                "name": "Cloud Lion",
                "emoji": "🦁",
                "habitat": "Sky",
                "fact": "It naps on clouds.",
            }
        ],
        "monsters": [
            {
                "name": "Wobble",
                "body": "Fluffy",
                "eyes": "Googly eyes",
                "color": "Purple",
                "power": "Sneeze confetti",
                "personality": "Friendly",
                "face": "👾",
            }
        ],
    }
    migrated = import_profile(json.dumps(old_save))
    assert migrated["version"] == PROFILE_VERSION
    assert migrated["robots"][0]["name"] == "Bolt"
    assert migrated["robots"][0]["mouth"] == "smile"
    assert migrated["robots"][0]["secondary_color"] == "Sunny Yellow"
    assert migrated["custom_animals"][0]["id"].startswith("animal_")
    assert migrated["monsters"][0]["id"].startswith("monster_")
    assert {memory["kind"] for memory in migrated["memories"]} == {
        "robot",
        "animal",
        "monster",
    }


def test_profile_deduplicates_favorites_and_discoveries() -> None:
    profile = normalize_profile(
        {
            "favorites": ["Panda", "panda", "Lion"],
            "discovered_animals": ["Lion", "lion", "Panda"],
        }
    )
    assert profile["favorites"] == ["Panda", "Lion"]
    assert profile["discovered_animals"] == ["Lion", "Panda"]


def test_invalid_new_customization_values_fall_back_safely() -> None:
    profile = normalize_profile(
        {
            "robots": [
                {
                    "id": "r1",
                    "name": "Bolt",
                    "mouth": "unknown-mouth",
                    "pattern": "unknown-pattern",
                    "voice": "unknown-voice",
                    "personality": "unknown-personality",
                }
            ]
        }
    )
    robot = profile["robots"][0]
    assert robot["mouth"] == "smile"
    assert robot["pattern"] == "Solid"
    assert robot["voice"] == "Classic Beep"
    assert robot["personality"] == "Curious Explorer"
