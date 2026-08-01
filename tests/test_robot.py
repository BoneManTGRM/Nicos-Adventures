import pytest

from core.robot import (
    build_robot,
    clean_robot_name,
    generate_robot_name,
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
