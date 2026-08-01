import pytest

from core.profile import default_profile, save_robot
from core.robot import build_robot
from core.robot_jobs import ROBOT_JOBS, perform_robot_job


def _profile_with_robot():
    profile = default_profile()
    robot = build_robot(
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
    save_robot(profile, robot)
    return profile


def test_job_catalog_has_six_real_assignments() -> None:
    assert [job.id for job in ROBOT_JOBS] == [
        "scout_animals",
        "organize_memory",
        "scan_monsters",
        "charge_workshop",
        "recommend_story",
        "find_hidden_part",
    ]


def test_jobs_require_an_active_robot() -> None:
    with pytest.raises(ValueError, match="Build and select"):
        perform_robot_job(default_profile(), "charge_workshop")


def test_animal_job_adds_a_field_guide_discovery() -> None:
    profile = _profile_with_robot()
    result, _ = perform_robot_job(profile, "scout_animals", seed=4)
    assert result.summary.startswith("Found ")
    assert len(profile["discovered_animals"]) == 1
    assert profile["counts"]["animal_discoveries"] == 1
    assert profile["robots"][0]["jobs_completed"] == 1


def test_charge_job_has_a_real_energy_effect() -> None:
    profile = _profile_with_robot()
    profile["robots"][0]["energy"] = 1
    result, _ = perform_robot_job(profile, "charge_workshop")
    assert profile["robots"][0]["energy"] == 5
    assert profile["last_animation"] == "charge"
    assert "fully charged" in result.summary.lower()


def test_monster_scan_uses_saved_monster_data() -> None:
    profile = _profile_with_robot()
    profile["monsters"] = [
        {
            "name": "Wobble",
            "personality": "Brave but ticklish",
            "power": "Sneeze confetti",
        }
    ]
    result, _ = perform_robot_job(profile, "scan_monsters")
    assert result.summary == "Scanned Wobble"
    assert "sneeze confetti" in result.detail.lower()


def test_story_job_creates_a_persistent_story_memory() -> None:
    profile = _profile_with_robot()
    result, _ = perform_robot_job(profile, "recommend_story", seed=7)
    story_memories = [item for item in profile["memories"] if item["kind"] == "story"]
    assert story_memories
    assert story_memories[-1]["title"] == result.summary
    assert "Bolt" in result.detail


def test_memory_job_removes_duplicate_keyed_memories() -> None:
    profile = _profile_with_robot()
    profile["memories"] = [
        {"title": "Old", "unique_key": "same", "created_at": "2026-01-01"},
        {"title": "New", "unique_key": "same", "created_at": "2026-01-02"},
    ]
    perform_robot_job(profile, "organize_memory")
    keyed = [item for item in profile["memories"] if item.get("unique_key") == "same"]
    assert len(keyed) == 1
    assert keyed[0]["title"] == "New"


def test_hidden_part_job_reports_next_unlock() -> None:
    profile = _profile_with_robot()
    result, _ = perform_robot_job(profile, "find_hidden_part")
    assert "unlock" in result.detail.lower()
    assert profile["counts"]["robot_jobs"] == 1
    assert any(item.get("kind") == "job" for item in profile["memories"])


def test_unknown_job_is_rejected() -> None:
    profile = _profile_with_robot()
    with pytest.raises(KeyError, match="Unknown robot job"):
        perform_robot_job(profile, "not-a-job")
