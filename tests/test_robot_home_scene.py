from core.profile import default_profile
from core.robot_home_scene import DECORATION_META, room_scene_html
from core.world2 import DECORATIONS, decorate_home, ensure_world2


def _robot() -> dict:
    return {
        "name": "GizmoBop 141",
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
        "pattern": "Solid",
        "finish": "Matte",
        "eye_glow": "Aqua",
        "size": "Standard",
        "personality": "Curious Explorer",
        "voice": "Classic Beep",
    }


def test_every_catalog_decoration_has_visual_metadata() -> None:
    catalog_ids = {item_id for item_id, _, _ in DECORATIONS}
    assert catalog_ids == set(DECORATION_META)


def test_active_decorations_are_rendered_in_scene() -> None:
    profile = default_profile()
    profile["stars"] = 50
    state = ensure_world2(profile)
    for item_id, _, _ in DECORATIONS:
        assert decorate_home(profile, item_id)
    markup = room_scene_html(
        _robot(),
        state["active_decorations"],
        theme="Neon Hangar",
        weather="Nebula",
        lighting="Night",
        animation="idle",
        badges=4,
        animals=12,
        monsters=3,
        stories=2,
    )
    for meta in DECORATION_META.values():
        assert meta["class"] in markup
        assert meta["label"] in markup
    assert "GizmoBop 141's Headquarters" in markup
    assert "Neon Hangar" in markup


def test_inactive_decoration_is_not_rendered() -> None:
    markup = room_scene_html(
        _robot(),
        ["charging_dock"],
        theme="Cozy Workshop",
        weather="Sunny",
        lighting="Warm",
        animation="idle",
        badges=0,
        animals=0,
        monsters=0,
        stories=0,
    )
    assert "dock-coil" in markup
    assert "animal-wall" not in markup
