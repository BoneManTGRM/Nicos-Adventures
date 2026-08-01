from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def test_bootstrap_contract_is_versioned_and_playable() -> None:
    response = client.get("/api/v1/bootstrap")
    assert response.status_code == 200
    payload = response.json()
    assert payload["api_version"] == "3.0.0"
    assert payload["save_schema_version"] == 4
    assert len(payload["locations"]) >= 6
    assert payload["starter_robot"]["name"] == "BoltBot"


def test_repair_adds_robot_and_required_locations() -> None:
    response = client.post(
        "/api/v1/profile/repair",
        json={
            "schema_version": 1,
            "child_display_name": "Nico",
            "robots": [],
            "active_robot_id": "missing",
            "unlocked_locations": ["Unknown", "Robo City"],
            "completed_missions": ["first", "first"],
            "discovered_animals": ["Panda", "Panda"],
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["repaired"] is True
    profile = payload["profile"]
    assert profile["schema_version"] == 4
    assert len(profile["robots"]) == 1
    assert profile["active_robot_id"] == profile["robots"][0]["id"]
    assert profile["unlocked_locations"] == ["Robo City", "Animal Forest"]
    assert profile["completed_missions"] == ["first"]
    assert profile["discovered_animals"] == ["Panda"]


def test_health_endpoint() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
