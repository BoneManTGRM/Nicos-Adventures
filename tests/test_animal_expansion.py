from collections import Counter

from core import animal_photos, animal_world
from core.animal_expansion import (
    EXTRA_ANIMALS,
    PHOTO_TITLE_OVERRIDES,
    install_animal_expansion,
)


def test_expansion_doubles_and_balances_the_builtin_library() -> None:
    assert len(EXTRA_ANIMALS) == 32
    assert install_animal_expansion() == 64
    habitat_counts = Counter(
        animal["habitat"]
        for animal in animal_world.ANIMAL_LIBRARY
    )
    assert len(habitat_counts) == 8
    assert set(habitat_counts.values()) == {8}
    assert len({animal["name"] for animal in animal_world.ANIMAL_LIBRARY}) == 64


def test_expansion_is_idempotent() -> None:
    first = install_animal_expansion()
    second = install_animal_expansion()
    assert first == second == 64


def test_new_mexican_wildlife_is_present() -> None:
    install_animal_expansion()
    names = {animal["name"] for animal in animal_world.ANIMAL_LIBRARY}
    assert {
        "Vaquita",
        "Baird's Tapir",
        "Monarch Butterfly",
        "Mexican Gray Wolf",
    } <= names


def test_extra_animals_have_complete_field_guide_data() -> None:
    required = {
        "name",
        "emoji",
        "habitat",
        "diet",
        "group",
        "region",
        "fact",
        "adaptation",
        "mission",
    }
    assert all(required <= set(animal) for animal in EXTRA_ANIMALS)
    assert all(
        all(str(animal[field]).strip() for field in required)
        for animal in EXTRA_ANIMALS
    )


def test_photo_article_overrides_install_with_the_catalog() -> None:
    install_animal_expansion()
    assert PHOTO_TITLE_OVERRIDES.items() <= animal_photos.ARTICLE_OVERRIDES.items()
    assert animal_photos.article_title("Mexican Gray Wolf") == "Mexican wolf"
    assert animal_photos.article_title("Sidewinder Rattlesnake") == "Crotalus cerastes"
