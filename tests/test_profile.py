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


def test_profile_round_trip() -> None:
    profile = default_profile()
    profile["stars"] = 12
    profile["custom_animals"] = [
        {"name": "Moon Cat", "emoji": "🐱", "habitat": "Moon", "fact": "It jumps high."}
    ]
    save_robot(profile, {"id": "robot-1", "name": "Bolt"})
    restored = import_profile(export_profile(profile))
    assert restored["stars"] == 12
    assert restored["active_robot_id"] == "robot-1"
    assert restored["custom_animals"][0]["name"] == "Moon Cat"
    assert restored["version"] == PROFILE_VERSION


def test_profile_bounds_untrusted_values() -> None:
    profile = normalize_profile({"stars": -4, "xp": 9_999_999, "robots": [1, {"id": "ok"}]})
    assert profile["stars"] == 0
    assert profile["xp"] == 1_000_000
    assert profile["robots"][0]["id"] == "ok"
    assert profile["robots"][0]["eyes"] == "round"
    assert profile["robots"][0]["body"] == "classic_core"
    assert profile["robots"][0]["backpack"] == "none"


def test_invalid_save_is_rejected() -> None:
    with pytest.raises(ValueError, match="not a valid"):
        import_profile("not-json")


def test_v1_save_migrates_collections_into_memory() -> None:
    old_save = {
        "version": 1,
        "robots": [{"id": "r1", "name": "Bolt"}],
        "custom_animals": [
            {"name": "Cloud Lion", "emoji": "🦁", "habitat": "Sky", "fact": "It naps on clouds."}
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
    assert migrated["custom_animals"][0]["id"].startswith("animal_")
    assert migrated["monsters"][0]["id"].startswith("monster_")
    assert {memory["kind"] for memory in migrated["memories"]} == {"robot", "animal", "monster"}


def test_profile_deduplicates_favorites_and_discoveries() -> None:
    profile = normalize_profile(
        {
            "favorites": ["Panda", "panda", "Lion"],
            "discovered_animals": ["Lion", "lion", "Panda"],
        }
    )
    assert profile["favorites"] == ["Panda", "Lion"]
    assert profile["discovered_animals"] == ["Lion", "Panda"]
