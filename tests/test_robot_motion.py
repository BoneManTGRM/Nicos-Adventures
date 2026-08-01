import re

from ui.robot_motion import ROBOT_MOTION_CSS


def test_wave_override_raises_arm_above_the_hip() -> None:
    assert ".mecha-art-shell.pose-wave .arm-left" in ROBOT_MOTION_CSS
    assert "mecha-wave-high" in ROBOT_MOTION_CSS
    assert "!important" in ROBOT_MOTION_CSS
    rotations = [
        int(value)
        for value in re.findall(r"rotate\((\d+)deg\)", ROBOT_MOTION_CSS)
    ]
    assert rotations == [96, 124, 84]
    assert min(rotations) >= 80


def test_wave_uses_the_existing_left_shoulder_pivot() -> None:
    assert "transform-origin: 188px 276px" in ROBOT_MOTION_CSS
    assert "transform-box: view-box" in ROBOT_MOTION_CSS
