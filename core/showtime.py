"""Shared Python contract for lightweight Showtime Studio project metadata.

The Streamlit client does not record or upload video. These types mirror the
portable metadata stored by the web PWA so future import/display work can use a
bounded, validated contract without ever persisting video blobs.
"""

from __future__ import annotations

from typing import Any, Literal, TypedDict

MovieCharacterKind = Literal["nico", "robot", "monster", "pet"]
MoviePose = Literal[
    "idle",
    "wave",
    "celebrate",
    "launch",
    "dance",
    "spin",
    "bounce",
    "roar",
    "sleep",
]

ALLOWED_CHARACTER_KINDS: frozenset[str] = frozenset(
    {"nico", "robot", "monster", "pet"}
)
ALLOWED_POSES: frozenset[str] = frozenset(
    {
        "idle",
        "wave",
        "celebrate",
        "launch",
        "dance",
        "spin",
        "bounce",
        "roar",
        "sleep",
    }
)


class MovieCharacterRef(TypedDict):
    kind: MovieCharacterKind
    id: str
    name: str


class MoviePoseStep(TypedDict):
    pose: MoviePose
    durationMs: int


class MovieProject(TypedDict, total=False):
    id: str
    title: str
    characters: list[MovieCharacterRef]
    poseSequence: list[MoviePoseStep]
    background: str
    caption: str
    language: Literal["en", "es-MX"]
    durationMs: int
    createdAt: str
    lastDownloadedAt: str
    lastMimeType: str


def _clean_text(value: Any, limit: int, fallback: str = "") -> str:
    text = str(value if value is not None else "").replace("<", "").replace(">", "")
    return text.strip()[:limit] or fallback


def _safe_int(value: Any, default: int, minimum: int, maximum: int) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError, OverflowError):
        number = default
    return max(minimum, min(number, maximum))


def normalize_movie_project(candidate: Any) -> MovieProject | None:
    """Return bounded metadata only; unknown fields such as video blobs are dropped."""
    if not isinstance(candidate, dict):
        return None

    characters: list[MovieCharacterRef] = []
    raw_characters = candidate.get("characters", [])
    if isinstance(raw_characters, list):
        for item in raw_characters[:3]:
            if not isinstance(item, dict):
                continue
            kind = _clean_text(item.get("kind"), 16)
            if kind not in ALLOWED_CHARACTER_KINDS:
                continue
            characters.append(
                {
                    "kind": kind,  # type: ignore[typeddict-item]
                    "id": _clean_text(item.get("id"), 80, kind),
                    "name": _clean_text(item.get("name"), 48, kind.title()),
                }
            )
    if not characters:
        return None

    steps: list[MoviePoseStep] = []
    raw_steps = candidate.get("poseSequence", [])
    if isinstance(raw_steps, list):
        for item in raw_steps[:8]:
            if not isinstance(item, dict):
                continue
            pose = _clean_text(item.get("pose"), 20)
            if pose not in ALLOWED_POSES:
                continue
            steps.append(
                {
                    "pose": pose,  # type: ignore[typeddict-item]
                    "durationMs": _safe_int(
                        item.get("durationMs"), 1200, 400, 3000
                    ),
                }
            )
    if not steps:
        return None

    calculated_duration = sum(step["durationMs"] for step in steps)
    project: MovieProject = {
        "id": _clean_text(candidate.get("id"), 80, "movie"),
        "title": _clean_text(candidate.get("title"), 48, "My Little Movie"),
        "characters": characters,
        "poseSequence": steps,
        "background": _clean_text(candidate.get("background"), 40, "star-stage"),
        "caption": _clean_text(candidate.get("caption"), 140),
        "language": "es-MX" if candidate.get("language") == "es-MX" else "en",
        "durationMs": _safe_int(
            candidate.get("durationMs"), calculated_duration, 4000, 8000
        ),
        "createdAt": _clean_text(candidate.get("createdAt"), 40),
    }
    if candidate.get("lastDownloadedAt"):
        project["lastDownloadedAt"] = _clean_text(
            candidate.get("lastDownloadedAt"), 40
        )
    if candidate.get("lastMimeType"):
        project["lastMimeType"] = _clean_text(
            candidate.get("lastMimeType"), 80
        )
    return project
