import pytest

from core.catalog import ROBOT_PARTS
from core.robot import (
    build_robot,
    clean_robot_name,
    generate_robot_name,
    random_robot_parts,
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


def test_catalog_has_many_options_in_every_category() -> None:
    assert len(ROBOT_PARTS) == 8
    assert all(len(parts) >= 12 for parts in ROBOT_PARTS.values())


def test_random_robot_only_uses_unlocked_parts() -> None:
    selections = random_robot_parts(0, seed=4)
    for category in ROBOT_PARTS:
        assert selections[category] in {part.id for part in unlocked_parts(category, 0)}


def test_new_robot_has_memory_ready_progress_fields() -> None:
    robot = build_robot(
        name="Bolt",
        eyes="round",
        head="box",
        arms="grabber",
        body="classic_core",
        base="bronze_wheels",
        backpack="none",
        color="Electric Blue",
        power="bubble",
        hat="none",
        stars=0,
    )
    assert robot["level"] == 1
    assert robot["xp"] == 0
    assert robot["created_at"]
