from core.catalog import ROBOT_PARTS
from core.mecha_pack import install_mecha_pack
from core.robot import build_robot, preset_customization
from core.robot_art import (
    FRAME_KEYS,
    infer_frame,
    normalize_robot_art,
    robot_html,
    robot_svg,
)


def _legacy_robot() -> dict:
    return {
        "id": "legacy-1",
        "name": "Legacy Buddy",
        "head": "box",
        "eyes": "round",
        "mouth": "smile",
        "antenna": "none",
        "ears": "none",
        "shoulders": "none",
        "arms": "grabber",
        "body": "classic_core",
        "chest": "none",
        "base": "bronze_wheels",
        "backpack": "none",
        "companion": "none",
        "power": "bubble",
        "hat": "none",
        "color": "Electric Blue",
        "secondary_color": "Sunny Yellow",
        "finish": "Matte",
        "pattern": "Solid",
        "eye_glow": "Aqua",
        "size": "Standard",
        "voice": "Classic Beep",
        "personality": "Curious Explorer",
        "mood": "Happy",
    }


def test_legacy_robot_without_frame_renders_safely() -> None:
    rendered = robot_html(_legacy_robot())
    assert 'data-robot-art="v3"' in rendered
    assert 'data-frame="hero"' in rendered
    assert "Legacy Buddy" in rendered


def test_all_five_frames_have_distinct_markers() -> None:
    robot = _legacy_robot()
    for frame, marker in FRAME_KEYS.items():
        robot["frame"] = frame
        rendered = robot_svg(robot)
        assert f'data-frame="{marker}"' in rendered


def test_frame_inference_uses_existing_legacy_parts() -> None:
    robot = _legacy_robot()
    robot["body"] = "mecha_titan_frame"
    assert infer_frame(robot) == "Heavy Frame"
    robot["body"] = "classic_core"
    robot["backpack"] = "jetpack"
    assert infer_frame(robot) == "Aerial Frame"
    robot["backpack"] = "none"
    robot["body"] = "galaxy"
    assert infer_frame(robot) == "Arcane Frame"
    robot["body"] = "stealth"
    assert infer_frame(robot) == "Scout Frame"


def test_invalid_visual_fields_fall_back_without_crashing() -> None:
    robot = _legacy_robot()
    robot.update(
        color="missing",
        secondary_color="missing",
        finish="missing",
        pattern="missing",
        eye_glow="missing",
        size="missing",
        frame="missing",
        head="<invalid>",
    )
    normalized = normalize_robot_art(robot)
    assert normalized["color"] == "Electric Blue"
    assert normalized["frame"] in FRAME_KEYS
    assert "<" not in normalized["head"]
    assert 'data-robot-art="v3"' in robot_html(robot)


def test_every_part_category_is_exposed_in_rendered_structure() -> None:
    install_mecha_pack()
    robot = _legacy_robot()
    for category, parts in ROBOT_PARTS.items():
        robot[category] = parts[0].id
    rendered = robot_svg(robot)
    for category in ROBOT_PARTS:
        assert f"data-part-{category}=" in rendered


def test_mecha_preset_keeps_selected_part_ids_in_svg() -> None:
    install_mecha_pack()
    customization = preset_customization("Skyframe Vanguard", 0)
    robot = build_robot(name="Vanguard", stars=0, **customization)
    rendered = robot_svg(robot, animation="fly")
    assert 'data-part-head="mecha_angular"' in rendered
    assert 'data-part-backpack="mecha_scout_pack"' in rendered
    assert "pose-fly" in rendered


def test_compact_room_render_hides_duplicate_stage_chrome() -> None:
    rendered = robot_html(_legacy_robot(), compact=True, scene="home")
    assert "mecha-art-card embedded" in rendered
    assert "mecha-profile" not in rendered
