from core.memory import collection_counts, mark_discovered, remember, robot_progress
from core.profile import default_profile


def test_memory_replaces_unique_entry() -> None:
    profile = default_profile()
    remember(
        profile,
        kind="animal",
        title="Found Panda",
        detail="First",
        unique_key="animal:panda",
    )
    remember(
        profile,
        kind="animal",
        title="Found Panda",
        detail="Updated",
        unique_key="animal:panda",
    )
    assert len(profile["memories"]) == 1
    assert profile["memories"][0]["detail"] == "Updated"


def test_discoveries_are_case_insensitive() -> None:
    profile = default_profile()
    assert mark_discovered(profile, "Panda") is True
    assert mark_discovered(profile, "panda") is False
    assert profile["discovered_animals"] == ["Panda"]


def test_robot_progress_levels_up() -> None:
    robot = {"xp": 45, "times_moved": 0, "jobs_completed": 0}
    robot_progress(robot, moves=1, jobs=1, xp=10)
    assert robot["times_moved"] == 1
    assert robot["jobs_completed"] == 1
    assert robot["level"] == 2


def test_collection_counts() -> None:
    profile = default_profile()
    profile["robots"] = [{"id": "r1"}]
    profile["custom_animals"] = [{"id": "a1"}]
    profile["discovered_animals"] = ["Panda", "Lion"]
    profile["monsters"] = [{"id": "m1"}]
    profile["memories"] = [{"id": "x"}]
    assert collection_counts(profile) == {
        "robots": 1,
        "animals": 1,
        "discoveries": 2,
        "monsters": 1,
        "memories": 1,
    }
