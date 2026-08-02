from core.pet_art import PET_ART_CSS, normalize_pet_art, pet_html
from core.world4 import PET_SPECIES


def _pet(species: str = "dog") -> dict:
    return {
        "id": f"pet-{species}",
        "name": f"Test {species}",
        "species": species,
        "color": "Photon Blue",
        "personality": "Brave Scout",
        "accessory": "Star Antenna",
        "bond": 42,
        "tricks": 3,
        "plays": 9,
    }


def test_every_pet_species_has_distinct_svg_anatomy() -> None:
    for species in PET_SPECIES:
        rendered = pet_html(_pet(species), compact=True)
        assert f'data-pet-species="{species}"' in rendered
        assert "pet-art-svg" in rendered
        assert 'data-pet-layer="eyes"' in rendered
        assert 'data-pet-layer="energy-core"' in rendered
        assert 'data-pet-layer="accessory"' in rendered


def test_pet_renderer_includes_bond_and_animation_state() -> None:
    rendered = pet_html(
        _pet("dragon"),
        animation="play",
        scene="training",
    )
    assert "anim-play" in rendered
    assert "scene-training" in rendered
    assert "--pet-bond:42%" in rendered
    assert "Bond 42/100" in rendered
    assert "pet-wing" in rendered
    assert "pet-tail" in rendered


def test_pet_renderer_falls_back_safely() -> None:
    normalized = normalize_pet_art(
        {
            "name": "<Unsafe>",
            "species": "missing",
            "color": "missing",
            "personality": "missing",
            "accessory": "missing",
            "bond": 500,
        }
    )
    assert normalized["name"] == "Unsafe"
    assert normalized["species"] == "dog"
    assert normalized["color"] == "Photon Blue"
    assert normalized["bond"] == 100
    rendered = pet_html(normalized, animation="missing", scene="missing")
    assert "anim-idle" in rendered
    assert "scene-workshop" in rendered
    assert "&lt;Unsafe&gt;" not in rendered


def test_pet_css_has_responsive_and_reduced_motion_rules() -> None:
    assert "@media(max-width:700px)" in PET_ART_CSS
    assert "prefers-reduced-motion" in PET_ART_CSS
    assert ".pet-art-v2.compact" in PET_ART_CSS
