from core.profile import default_profile
from core.world2 import (
    MISSIONS,
    add_story,
    complete_mission_if_ready,
    decorate_home,
    ensure_world2,
    mission_progress,
    record_arcade_win,
    record_home_interaction,
    repair_profile,
    set_home_environment,
    snapshot,
    toggle_home_decoration,
)


def test_world2_defaults_are_idempotent() -> None:
    profile = default_profile()
    first = ensure_world2(profile)
    second = ensure_world2(profile)
    assert first is second
    assert first["active_mission"] in MISSIONS
    assert "charging_dock" in first["decorations"]
    assert first["home_theme"] == "Cozy Workshop"


def test_story_and_arcade_progress_are_recorded() -> None:
    profile = default_profile()
    add_story(profile, {"title": "Test", "text": "A safe story."})
    record_arcade_win(profile, "Animal Clue", 3)
    assert profile["counts"]["stories_created"] == 1
    assert profile["counts"]["arcade_wins"] == 1
    assert profile["world2"]["arcade_best"]["Animal Clue"] == 3
    assert profile["stars"] == 1


def test_decoration_requires_stars_and_tracks_progress() -> None:
    profile = default_profile()
    ensure_world2(profile)
    assert not decorate_home(profile, "trophy_shelf")
    profile["stars"] = 8
    assert decorate_home(profile, "trophy_shelf")
    assert "trophy_shelf" in profile["world2"]["active_decorations"]
    assert profile["counts"]["home_decorations"] == 2


def test_owned_decoration_can_be_stored_and_replaced() -> None:
    profile = default_profile()
    profile["stars"] = 12
    assert decorate_home(profile, "star_window")
    assert not toggle_home_decoration(profile, "star_window")
    assert "star_window" not in profile["world2"]["active_decorations"]
    assert toggle_home_decoration(profile, "star_window")
    assert "star_window" in profile["world2"]["active_decorations"]


def test_home_environment_and_interactions_persist() -> None:
    profile = default_profile()
    set_home_environment(profile, "Moon Base", "Nebula", "Night")
    assert profile["world2"]["home_theme"] == "Moon Base"
    assert profile["world2"]["home_weather"] == "Nebula"
    assert profile["world2"]["home_lighting"] == "Night"
    assert record_home_interaction(profile, "dance") == 1
    assert record_home_interaction(profile, "dance") == 2


def test_mission_completes_once() -> None:
    profile = default_profile()
    profile["counts"].update(animal_discoveries=1, animal_quiz_correct=1, robot_jobs=1)
    profile["monsters"] = [{"name": "Guardian"}]
    complete, total, _ = mission_progress(profile, "jungle_crystal")
    assert complete == total
    assert complete_mission_if_ready(profile, "jungle_crystal")
    reward_total = profile["stars"]
    assert not complete_mission_if_ready(profile, "jungle_crystal")
    assert profile["stars"] == reward_total


def test_snapshot_avoids_recursive_copy_and_repair_is_bounded() -> None:
    profile = default_profile()
    ensure_world2(profile)
    snapshot(profile, "Home")
    saved = profile["world2"]["recovery_snapshot"]
    assert saved["world2"].get("recovery_snapshot") is None
    profile["stars"] = -5
    profile["world2"]["active_mission"] = "missing"
    profile["world2"]["active_decorations"].append("missing_item")
    assert repair_profile(profile)
    assert profile["stars"] == 0
    assert profile["world2"]["active_mission"] == "jungle_crystal"
    assert "missing_item" not in profile["world2"]["active_decorations"]
