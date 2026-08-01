from core.animal_world import (
    ANIMAL_LIBRARY,
    choose_expedition,
    filter_animals,
    habitat_progress,
    habitats_for,
    make_quiz,
)


def test_library_has_many_animals_across_all_habitats() -> None:
    assert len(ANIMAL_LIBRARY) >= 32
    assert len(habitats_for(ANIMAL_LIBRARY)) == 8


def test_filters_by_habitat_group_and_search() -> None:
    rainforest = filter_animals(ANIMAL_LIBRARY, habitat="Rainforest")
    assert rainforest
    assert all(item["habitat"] == "Rainforest" for item in rainforest)
    birds = filter_animals(ANIMAL_LIBRARY, group="Bird")
    assert birds
    assert all(item["group"] == "Bird" for item in birds)
    mexico = filter_animals(ANIMAL_LIBRARY, query="Mexico")
    assert any(item["name"] == "Axolotl" for item in mexico)


def test_expedition_prefers_an_undiscovered_animal() -> None:
    ocean_names = [item["name"] for item in ANIMAL_LIBRARY if item["habitat"] == "Ocean"]
    discovered = ocean_names[:-1]
    found = choose_expedition(ANIMAL_LIBRARY, discovered, habitat="Ocean", seed=9)
    assert found["name"] == ocean_names[-1]


def test_quiz_is_repeatable_and_has_four_unique_options() -> None:
    first = make_quiz(ANIMAL_LIBRARY, seed=42)
    second = make_quiz(ANIMAL_LIBRARY, seed=42)
    assert first == second
    assert first["answer"] in first["options"]
    assert len(first["options"]) == len(set(first["options"])) == 4


def test_habitat_progress_counts_discoveries() -> None:
    progress = habitat_progress(["Jaguar", "Toucan", "Blue Whale"], ANIMAL_LIBRARY)
    assert progress["Rainforest"][0] == 2
    assert progress["Ocean"][0] == 1
