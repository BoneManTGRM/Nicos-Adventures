from core.monster import MONSTER_PARTS, build_monster, preset_monster
from core.monster_art_v2 import MONSTER_ART_CSS, monster_family, monster_html


def test_monster_families_cover_major_visual_styles() -> None:
    examples = {
        "mecha": {"body": "robot", "texture": "metallic"},
        "dragon": {"body": "dragon", "wings": "dragon"},
        "jungle": {"body": "plant", "texture": "leafy"},
        "stone": {"body": "crystal", "texture": "crystal"},
        "spirit": {"body": "ghost", "texture": "cloudy"},
        "cosmic": {"body": "star", "pattern": "galaxy"},
        "aquatic": {"body": "octopus", "texture": "jelly"},
        "royal": {"body": "round", "accessory": "crown"},
    }
    for expected, changes in examples.items():
        monster = build_monster(name=expected, **{**preset_monster("Wobblepop Classic"), **changes})
        assert monster_family(monster) == expected


def test_v2_renderer_preserves_every_selected_part_layer() -> None:
    monster = build_monster(
        name="Royal Dragon",
        **preset_monster("Friendly Dragon"),
    )
    rendered = monster_html(monster, animation="dance", scene="castle")
    assert "monster-art-v2" in rendered
    assert 'data-monster-family="dragon"' in rendered
    assert 'data-monster-v2-layer="expression"' in rendered
    assert 'data-monster-v2-layer="depth"' in rendered
    assert 'data-monster-v2-family-art="dragon"' in rendered
    for field in MONSTER_PARTS:
        assert f'data-monster-part="{field}"' in rendered
        assert f'data-part-id="{monster[field]}"' in rendered


def test_v2_renderer_falls_back_and_escapes() -> None:
    rendered = monster_html(
        {
            "id": "broken",
            "name": "<Unsafe>",
            "body": "missing",
            "texture": "missing",
        },
        animation="missing",
        scene="missing",
    )
    assert "monster-art-v2" in rendered
    assert "anim-idle" in rendered
    assert "scene-lab" in rendered
    assert "&lt;Unsafe&gt;" not in rendered


def test_v2_css_contains_family_and_mobile_presentation() -> None:
    assert ".family-dragon" in MONSTER_ART_CSS
    assert ".family-cosmic" in MONSTER_ART_CSS
    assert ".monster-family-chip" in MONSTER_ART_CSS
    assert "@media(max-width:700px)" in MONSTER_ART_CSS
    assert "prefers-reduced-motion" in MONSTER_ART_CSS
