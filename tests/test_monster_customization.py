from core.monster import (
    MONSTER_DEFAULTS,
    MONSTER_PARTS,
    MONSTER_PRESETS,
    build_monster,
    customize_monster,
    normalize_monster,
    preset_monster,
    random_monster,
    save_monster,
)
from core.monster_art import monster_html
from core.profile import PROFILE_VERSION, default_profile, export_profile, import_profile


def test_monster_catalog_has_deep_customization() -> None:
    assert set(MONSTER_PARTS) == {
        "body",
        "eyes",
        "mouth",
        "horns",
        "ears",
        "arms",
        "legs",
        "tail",
        "wings",
        "accessory",
    }
    assert all(len(options) >= 12 for options in MONSTER_PARTS.values())
    assert len(MONSTER_PRESETS) >= 6


def test_legacy_monster_migrates_to_complete_model() -> None:
    legacy = normalize_monster(
        {
            "id": "old-1",
            "name": "Wobble",
            "body": "Fluffy",
            "eyes": "Googly eyes",
            "color": "Purple",
            "power": "Sneeze confetti",
            "personality": "Curious and polite",
            "face": "👾",
        }
    )
    assert legacy is not None
    assert legacy["body"] == "fluffy"
    assert legacy["eyes"] == "two_round"
    assert legacy["color"] == "purple"
    assert legacy["mouth"] == MONSTER_DEFAULTS["mouth"]
    assert legacy["wings"] == MONSTER_DEFAULTS["wings"]
    assert legacy["texture"] == MONSTER_DEFAULTS["texture"]


def test_build_customize_and_save_preserve_identity() -> None:
    original = build_monster(
        name="Crystal Buddy",
        **preset_monster("Crystal Guardian"),
    )
    updated = customize_monster(
        original,
        name="Crystal Buddy Prime",
        changes={"wings": "butterfly", "pattern": "galaxy", "mood": "Proud"},
    )
    assert updated["id"] == original["id"]
    assert updated["created_at"] == original["created_at"]
    assert updated["wings"] == "butterfly"
    profile = default_profile()
    save_monster(profile, original)
    save_monster(profile, updated)
    assert len(profile["monsters"]) == 1
    assert profile["monsters"][0]["name"] == "Crystal Buddy Prime"


def test_profile_v4_round_trip_keeps_all_monster_parts() -> None:
    profile = default_profile()
    monster = build_monster(
        name="Galaxy Friend",
        **preset_monster("Galaxy Octopus"),
    )
    save_monster(profile, monster)
    restored = import_profile(export_profile(profile))
    saved = restored["monsters"][0]
    assert restored["version"] == PROFILE_VERSION
    for field in MONSTER_PARTS:
        assert saved[field] == monster[field]
    assert saved["secondary_color"] == monster["secondary_color"]
    assert saved["pattern"] == "galaxy"
    assert saved["texture"] == "cosmic"
    assert saved["size"] == monster["size"]


def test_random_monster_is_deterministic_and_complete() -> None:
    first = random_monster("nico")
    second = random_monster("nico")
    assert first == second
    assert set(MONSTER_PARTS).issubset(first)
    assert {"color", "secondary_color", "pattern", "texture", "power"}.issubset(first)


def test_renderer_contains_every_selected_layer() -> None:
    monster = build_monster(
        name="Layer Test",
        **preset_monster("Friendly Dragon"),
    )
    rendered = monster_html(monster, animation="dance", scene="castle")
    assert "<svg" in rendered
    assert "anim-dance" in rendered
    assert "scene-castle" in rendered
    for field in MONSTER_PARTS:
        assert f'data-monster-part="{field}"' in rendered
        assert f'data-part-id="{monster[field]}"' in rendered


def test_renderer_falls_back_for_malformed_legacy_values() -> None:
    rendered = monster_html(
        {
            "id": "broken",
            "name": "<Unsafe>",
            "body": "unknown",
            "eyes": "unknown",
            "color": "unknown",
            "texture": "unknown",
        },
        animation="unknown",
    )
    assert "&lt;Unsafe&gt;" not in rendered
    assert 'data-part-id="fluffy"' in rendered
    assert "anim-idle" in rendered
    assert "monster-svg" in rendered


def test_all_presets_build_and_render() -> None:
    for name in MONSTER_PRESETS:
        monster = build_monster(name=name, **preset_monster(name))
        rendered = monster_html(monster, compact=True)
        assert monster["id"] in rendered
        assert "monster-art" in rendered
