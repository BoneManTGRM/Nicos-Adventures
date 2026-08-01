from core.achievements import record_event
from core.profile import default_profile


def test_first_robot_awards_stars_and_badge() -> None:
    profile = default_profile()
    new_badges = record_event(profile, "robot_builds")
    assert profile["stars"] == 3
    assert profile["counts"]["robot_builds"] == 1
    assert [badge.id for badge in new_badges] == ["first_friend"]


def test_badges_are_not_awarded_twice() -> None:
    profile = default_profile()
    record_event(profile, "robot_builds")
    new_badges = record_event(profile, "robot_builds")
    assert all(badge.id != "first_friend" for badge in new_badges)
    assert profile["badges"].count("first_friend") == 1
