import json

from core.creative_art import artwork_svg
from core.dinosaurs import DINOSAURS, dinosaur_round
from core.profile import PROFILE_VERSION, default_profile, export_profile, import_profile
from core.world4 import (
    CAMPAIGN_MISSIONS,
    ability_report,
    add_artwork,
    assign_monster_habitat,
    campaign_progress,
    claim_campaign_mission,
    create_robot_pet,
    discover_dinosaur,
    ensure_world4,
    interact_with_habitat,
    interact_with_pet,
    normalize_world4_state,
)


def test_campaign_contains_twenty_connected_missions() -> None:
    assert len(CAMPAIGN_MISSIONS) == 20
    assert {mission["chapter"] for mission in CAMPAIGN_MISSIONS.values()} == {
        1,
        2,
        3,
        4,
        5,
        6,
        7,
    }
    assert all(mission["objectives"] for mission in CAMPAIGN_MISSIONS.values())


def test_first_campaign_mission_can_be_claimed_once() -> None:
    profile = default_profile()
    profile["counts"].update(robot_builds=1, robot_moves=1)
    complete, total, rows = campaign_progress(profile, "spark_01")
    assert complete == total == 2
    assert all(done for _, done in rows)
    assert claim_campaign_mission(profile, "spark_01") is True
    assert profile["stars"] == 3
    assert claim_campaign_mission(profile, "spark_01") is False


def test_world4_creations_survive_profile_round_trip() -> None:
    profile = default_profile()
    artwork = add_artwork(
        profile,
        {
            "title": "Moon Team",
            "subject": "NovaBot",
            "background": "Moon Base",
            "frame": "Space Window",
            "stickers": ["🤖", "🌙"],
            "caption": "Ready for launch",
        },
    )
    pet = create_robot_pet(
        profile,
        {
            "name": "Pixel",
            "species": "fox",
            "color": "Galaxy Purple",
            "personality": "Curious Explorer",
            "accessory": "Tiny Jetpack",
        },
    )
    interact_with_pet(profile, pet["id"], "train")
    profile["monsters"] = [
        {
            "id": "monster_friend",
            "name": "Wobble",
            "body": "round",
            "eyes": "two_round",
            "mouth": "smile",
            "color": "Purple",
            "secondary_color": "Sunny Yellow",
            "pattern": "solid",
            "texture": "smooth",
            "power": "Make everyone giggle",
            "personality": "Curious and polite",
            "face": "👾",
        }
    ]
    assign_monster_habitat(
        profile,
        "monster_friend",
        "Moon Pod",
        "Moon Berries",
        "Bouncy Meteor",
    )
    interact_with_habitat(profile, "monster_friend", "play")
    discover_dinosaur(
        profile,
        "triceratops",
        DINOSAURS["triceratops"]["fossil"],
    )
    profile["world2"]["stories"].append(
        {
            "title": "The Moon Team",
            "hero": "NovaBot",
            "animal": "Fox",
            "monster": "Wobble",
            "setting": "Moon Base",
            "language": "English",
            "text": "The team found a friendly star.",
            "artwork_id": artwork["id"],
            "created_at": "2026-08-01T00:00:00+00:00",
        }
    )

    restored = import_profile(export_profile(profile))
    state = restored["world4"]
    assert restored["version"] == PROFILE_VERSION == 5
    assert state["artworks"][0]["title"] == "Moon Team"
    assert state["robot_pets"][0]["species"] == "fox"
    assert state["monster_habitats"]["monster_friend"]["friendship"] == 9
    assert state["dinosaurs_discovered"] == ["triceratops"]
    assert state["fossils"] == [DINOSAURS["triceratops"]["fossil"]]
    assert restored["world2"]["stories"][0]["artwork_id"] == artwork["id"]


def test_world4_normalization_repairs_untrusted_values() -> None:
    state = normalize_world4_state(
        {
            "campaign_active": "unknown",
            "campaign_completed": ["spark_01", "unknown", "spark_01"],
            "living_world_stage": 999,
            "robot_pets": [
                {
                    "id": "pet_1",
                    "name": "Pixel",
                    "species": "invalid",
                    "bond": 999,
                    "tricks": -4,
                }
            ],
        }
    )
    assert state["campaign_active"] == "spark_01"
    assert state["campaign_completed"] == ["spark_01"]
    assert state["living_world_stage"] == 7
    assert state["robot_pets"][0]["species"] == "dog"
    assert state["robot_pets"][0]["bond"] == 100
    assert state["robot_pets"][0]["tricks"] == 0


def test_ability_report_uses_saved_robot_and_monster_parts() -> None:
    profile = default_profile()
    profile["robots"] = [
        {
            "id": "r1",
            "name": "Sky Scout",
            "backpack": "jetpack",
            "eyes": "night",
            "arms": "builder",
            "body": "aquarium",
        }
    ]
    profile["active_robot_id"] = "r1"
    profile["monsters"] = [
        {
            "id": "m1",
            "name": "Cloudwing",
            "wings": "cloud",
            "power": "Make water bubbles",
            "body": "cloud",
        }
    ]
    abilities = ability_report(profile)
    assert abilities["scanner"] is True
    assert abilities["aquatic"] is True
    assert abilities["flight"] is True
    assert abilities["repair"] is True
    assert abilities["monster_magic"] is True
    assert abilities["teamwork"] is True


def test_artwork_renderer_contains_saved_identity_and_subject() -> None:
    rendered = artwork_svg(
        {
            "id": "art_123",
            "title": "Dino Poster",
            "subject": "Triceratops",
            "background": "Dinosaur Valley",
            "frame": "Golden Stars",
            "stickers": ["🦖", "⭐"],
            "caption": "Field team discovery",
        }
    )
    assert 'data-artwork-id="art_123"' in rendered
    assert "Dino Poster" in rendered
    assert "Triceratops" in rendered


def test_dinosaur_round_is_deterministic_and_valid() -> None:
    first = dinosaur_round("nico")
    second = dinosaur_round("nico")
    assert first == second
    assert first["dinosaur_id"] in DINOSAURS
    assert first["answer"] in first["options"]
    assert len(first["options"]) == 4


def test_export_removes_recursive_recovery_snapshot() -> None:
    profile = default_profile()
    profile["world2"]["recovery_snapshot"] = {"profile": "large recursive copy"}
    exported = json.loads(export_profile(profile))
    assert exported["world2"]["recovery_snapshot"] == {}
    assert ensure_world4(exported)["living_world_stage"] >= 1
