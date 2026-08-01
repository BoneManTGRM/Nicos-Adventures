import pytest

from core.catalog import (
    ROBOT_PARTS,
    ROBOT_PATTERNS,
    ROBOT_PERSONALITIES,
    ROBOT_PRESETS,
)
from core.robot import (
    build_robot,
    clean_robot_name,
    customize_robot,
    generate_robot_name,
    preset_customization,
    random_robot_parts,
    random_robot_style,
    unlocked_parts,
)


def test_locked_parts_are_hidden() -> None:
    assert [part.id for part in unlocked_parts("eyes", 0)] == ["round"]
    assert "laser" in [part.id for part in unlocked_parts("eyes", 10)]


def test_build_robot_rejects_locked_part() -> None:
    with pytest.raises(ValueError, match="unlocks"):
        build_robot(
            name="Bolt",
            eyes="laser",
            head="box",
            arms="grabber",
            base="bronze_wheels",
            color="Electric Blue",
            power="bubble",
            hat="none",
            stars=0,
        )


def test_robot_name_generation_is_repeatable_with_seed() -> None:
    assert generate_robot_name(7) == generate_robot_name(7)


def test_robot_name_is_sanitized() -> None:
    assert clean_robot_name("<Bolt&Bot>!!!") == "BoltBot"


def test_catalog_has_deep_customization_in_every_category() -> None:
    assert len(ROBOT_PARTS) == 14
    assert all(len(parts) >= 12 for parts in ROBOT_PARTS.values())
    assert sum(len(parts) for parts in ROBOT_PARTS.values()) >= 168


def test_random_robot_only_uses_unlocked_parts() -> None:
    selections = random_robot_parts(0, seed=4)
    for category in ROBOT_PARTS:
        assert selections[category] in {
            part.id for part in unlocked_parts(category, 0)
        }


def test_random_style_is_repeatable_and_complete() -> None:
    first = random_robot_style(seed=22)
    second = random_robot_style(seed=22)
    assert first == second
    assert first["pattern"] in ROBOT_PATTERNS
    assert first["personality"] in ROBOT_PERSONALITIES
    assert first["catchphrase"]


def test_new_robot_has_full_customization_and_progress_fields() -> None:
    robot = build_robot(
        name="Bolt",
        eyes="round",
        mouth="smile",
        head="box",
        antenna="none",
        ears="none",
        shoulders="none",
        arms="grabber",
        body="classic_core",
        chest="none",
        base="bronze_wheels",
        backpack="none",
        companion="none",
        color="Electric Blue",
        secondary_color="Sunny Yellow",
        finish="Glossy",
        pattern="Two-Tone",
        eye_glow="Aqua",
        size="Standard",
        voice="Classic Beep",
        personality="Curious Explorer",
        mood="Happy",
        catchphrase="Let's explore!",
        power="bubble",
        hat="none",
        stars=0,
    )
    assert robot["level"] == 1
    assert robot["xp"] == 0
    assert robot["created_at"]
    assert robot["mouth"] == "smile"
    assert robot["secondary_color"] == "Sunny Yellow"
    assert robot["pattern"] == "Two-Tone"
    assert robot["catchphrase"] == "Let's explore!"


def test_customizing_robot_preserves_identity_and_progress() -> None:
    original = build_robot(
        name="Bolt",
        eyes="round",
        head="box",
        arms="grabber",
        base="bronze_wheels",
        color="Electric Blue",
        power="bubble",
        hat="none",
        stars=0,
    )
    original["xp"] = 175
    original["level"] = 4
    original["times_moved"] = 19
    original["jobs_completed"] = 7

    updated = customize_robot(
        original,
        stars=20,
        changes={
            "name": "Bolt Prime",
            "pattern": "Circuit Lines",
            "finish": "Neon Glow",
            "personality": "Wild Inventor",
            "catchphrase": "Build it better!",
            "chest": "shield",
        },
    )
    assert updated["id"] == original["id"]
    assert updated["xp"] == 175
    assert updated["level"] == 4
    assert updated["times_moved"] == 19
    assert updated["jobs_completed"] == 7
    assert updated["name"] == "Bolt Prime"
    assert updated["pattern"] == "Circuit Lines"
    assert updated["chest"] == "shield"
    assert updated["customized_at"]


def test_presets_adapt_to_current_unlock_level() -> None:
    assert "Galaxy Wizard" in ROBOT_PRESETS
    preset = preset_customization("Galaxy Wizard", stars=0)
    for category in ROBOT_PARTS:
        assert preset[category] in {
            part.id for part in unlocked_parts(category, 0)
        }
    assert preset["personality"]
