from core.showtime import normalize_movie_project


def test_normalize_movie_project_keeps_metadata_only() -> None:
    project = normalize_movie_project(
        {
            "id": "movie-1",
            "title": "Robot Dance",
            "characters": [
                {"kind": "robot", "id": "robot-1", "name": "BoltBot"}
            ],
            "poseSequence": [
                {"pose": "dance", "durationMs": 6000}
            ],
            "background": "star-stage",
            "caption": "Dance time!",
            "language": "en",
            "durationMs": 6000,
            "createdAt": "2026-08-03T00:00:00Z",
            "videoBlob": "never persist this",
        }
    )

    assert project is not None
    assert project["title"] == "Robot Dance"
    assert project["durationMs"] == 6000
    assert "videoBlob" not in project


def test_normalize_movie_project_requires_character_and_pose() -> None:
    assert normalize_movie_project({"characters": [], "poseSequence": []}) is None


def test_normalize_movie_project_bounds_values() -> None:
    project = normalize_movie_project(
        {
            "id": "x" * 200,
            "title": "A" * 100,
            "characters": [
                {"kind": "nico", "id": "nico", "name": "Nico"},
                {"kind": "invalid", "id": "bad", "name": "Bad"},
            ],
            "poseSequence": [
                {"pose": "wave", "durationMs": 10},
                {"pose": "invalid", "durationMs": 1000},
            ],
            "durationMs": 50_000,
        }
    )

    assert project is not None
    assert len(project["id"]) == 80
    assert len(project["title"]) == 48
    assert len(project["characters"]) == 1
    assert project["poseSequence"] == [{"pose": "wave", "durationMs": 400}]
    assert project["durationMs"] == 8000
