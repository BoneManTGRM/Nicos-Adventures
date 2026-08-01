from core.catalog import ROBOT_COLORS, ROBOT_PARTS, ROBOT_PRESETS
from core.mecha_pack import MECHA_PARTS, install_mecha_pack, install_mecha_ui
from core.robot import build_robot, preset_customization, unlocked_parts
from ui import components


def test_mecha_pack_adds_four_parts_to_every_category() -> None:
    assert set(MECHA_PARTS) == set(ROBOT_PARTS)
    assert all(len(parts) >= 16 for parts in ROBOT_PARTS.values())
    assert all(len(additions) == 4 for additions in MECHA_PARTS.values())


def test_starter_mecha_is_available_without_stars() -> None:
    for category, additions in MECHA_PARTS.items():
        unlocked = {part.id for part in unlocked_parts(category, 0)}
        assert additions[0].id in unlocked


def test_mecha_presets_and_colors_are_installed() -> None:
    assert "Skyframe Vanguard" in ROBOT_PRESETS
    assert "Titan Rescue Frame" in ROBOT_PRESETS
    assert "Mecha White" in ROBOT_COLORS
    assert "Photon Cyan" in ROBOT_COLORS


def test_starter_mecha_preset_builds_a_valid_robot() -> None:
    customization = preset_customization("Skyframe Vanguard", 0)
    robot = build_robot(name="Hikari", stars=0, **customization)
    assert robot["head"] == "mecha_angular"
    assert robot["power"] == "mecha_beam_blade"
    assert robot["personality"] == "Mecha Ace"


def test_mecha_renderer_uses_layered_svg_art() -> None:
    install_mecha_ui()
    customization = preset_customization("Skyframe Vanguard", 0)
    robot = build_robot(name="Hikari", stars=0, **customization)
    rendered = components.robot_html(robot)
    assert 'data-robot-art="v3"' in rendered
    assert 'data-part-head="mecha_angular"' in rendered
    assert 'data-part-power="mecha_beam_blade"' in rendered
    assert "mecha-art-card" in rendered
    assert "energy-ring" in rendered


def test_install_is_idempotent() -> None:
    before = {category: len(parts) for category, parts in ROBOT_PARTS.items()}
    install_mecha_pack()
    after = {category: len(parts) for category, parts in ROBOT_PARTS.items()}
    assert after == before
