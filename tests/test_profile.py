import pytest

from core.profile import (
    default_profile,
    export_profile,
    import_profile,
    normalize_profile,
    save_robot,
)


def test_profile_round_trip() -> None:
    profile = default_profile()
    profile["stars"] = 12
    save_robot(profile, {"id": "robot-1", "name": "Bolt"})
    restored = import_profile(export_profile(profile))
    assert restored["stars"] == 12
    assert restored["active_robot_id"] == "robot-1"


def test_profile_bounds_untrusted_values() -> None:
    profile = normalize_profile({"stars": -4, "xp": 9_999_999, "robots": [1, {"id": "ok"}]})
    assert profile["stars"] == 0
    assert profile["xp"] == 1_000_000
    assert profile["robots"][0]["id"] == "ok"
    assert profile["robots"][0]["eyes"] == "round"


def test_invalid_save_is_rejected() -> None:
    with pytest.raises(ValueError, match="not a valid"):
        import_profile("not-json")
