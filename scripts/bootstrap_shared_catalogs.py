"""Bootstrap canonical shared catalogs from the verified current clients.

This is a controlled migration tool. It preserves existing persisted IDs, writes
canonical JSON under ``shared/catalogs``, and generates deterministic Python and
TypeScript views. Normal CI only verifies drift and never writes to branches.
"""

from __future__ import annotations

import ast
import dataclasses
import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core import animal_expansion, animal_world, catalog, monster, world4  # noqa: E402

CATALOG_DIR = ROOT / "shared" / "catalogs"
WEB_SRC = ROOT / "web" / "src"


def _jsonable(value: Any) -> Any:
    if dataclasses.is_dataclass(value):
        return {
            field.name: _jsonable(getattr(value, field.name))
            for field in dataclasses.fields(value)
        }
    if isinstance(value, dict):
        return {str(key): _jsonable(item) for key, item in value.items()}
    if isinstance(value, (tuple, list, set, frozenset)):
        return [_jsonable(item) for item in value]
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    raise TypeError(f"Unsupported catalog value: {type(value)!r}")


def _slug(value: str) -> str:
    normalized = (
        unicodedata.normalize("NFKD", value)
        .encode("ascii", "ignore")
        .decode("ascii")
    )
    return re.sub(r"[^a-z0-9]+", "-", normalized.casefold()).strip("-")


def _extract(source: str, start_marker: str, end_marker: str) -> str:
    start = source.find(start_marker)
    if start < 0:
        raise RuntimeError(f"Missing source marker: {start_marker}")
    start += len(start_marker)
    end = source.find(end_marker, start)
    if end < 0:
        raise RuntimeError(f"Missing source end marker: {end_marker}")
    return source[start:end]


def _strip_js_comments(value: str) -> str:
    value = re.sub(r"/\*.*?\*/", "", value, flags=re.DOTALL)
    return re.sub(r"(^|\s)//.*?$", r"\1", value, flags=re.MULTILINE)


def _parse_string_array_object(
    source: str, start_marker: str, end_marker: str
) -> dict[str, list[str]]:
    body = _strip_js_comments(_extract(source, start_marker, end_marker))
    python_like = "{" + body + "}"
    python_like = re.sub(
        r"([,{]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:",
        r'\1"\2":',
        python_like,
    )
    try:
        parsed = ast.literal_eval(python_like)
    except (SyntaxError, ValueError) as exc:
        raise RuntimeError("Unable to parse string-array catalog object") from exc
    if not isinstance(parsed, dict) or not all(
        isinstance(value, list) for value in parsed.values()
    ):
        raise RuntimeError("Expected an object of string arrays")
    result: dict[str, list[str]] = {}
    for key, values in parsed.items():
        if not all(isinstance(item, str) for item in values):
            raise RuntimeError(f"Catalog values for {key!r} must be strings")
        result[str(key)] = list(values)
    return result


def _parse_robot_actions(source: str) -> list[dict[str, str]]:
    block = _extract(
        source,
        'export const ROBOT_ACTIONS: Array<{ pose: RobotPose; icon: string; en: string; es: string }> = [',
        "];\n\nexport const ROBOT_JOBS",
    )
    pattern = re.compile(
        r'\{\s*pose:\s*"(?P<pose>[^"]+)",\s*'
        r'icon:\s*"(?P<icon>[^"]+)",\s*'
        r'en:\s*"(?P<en>[^"]+)",\s*'
        r'es:\s*"(?P<es>[^"]+)"\s*\}'
    )
    actions = [match.groupdict() for match in pattern.finditer(block)]
    if not actions:
        raise RuntimeError("No robot actions were parsed")
    return actions


def _parse_literal_array(
    source: str, start_marker: str, end_marker: str
) -> list[Any]:
    body = _strip_js_comments(_extract(source, start_marker, end_marker))
    wrapped = "[" + body + "]"
    try:
        value = json.loads(wrapped)
    except json.JSONDecodeError:
        try:
            value = ast.literal_eval(wrapped)
        except (SyntaxError, ValueError) as exc:
            raise RuntimeError("Unable to parse catalog array") from exc
    if not isinstance(value, list):
        raise RuntimeError("Expected catalog array")
    return value


def _write_json(name: str, payload: Any) -> None:
    CATALOG_DIR.mkdir(parents=True, exist_ok=True)
    path = CATALOG_DIR / name
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def _python_robot_catalog() -> dict[str, Any]:
    names = [
        name
        for name in dir(catalog)
        if name.startswith("ROBOT_")
        or name in {"ANIMATIONS", "DEFAULT_ANIMALS"}
    ]
    return {name: _jsonable(getattr(catalog, name)) for name in sorted(names)}


def _python_monster_catalog() -> dict[str, Any]:
    names = [name for name in dir(monster) if name.startswith("MONSTER_")]
    return {name: _jsonable(getattr(monster, name)) for name in sorted(names)}


def _combined_animals(web_rows: list[list[str]]) -> list[dict[str, Any]]:
    web_by_name: dict[str, dict[str, Any]] = {}
    for row in web_rows:
        if len(row) != 8:
            raise RuntimeError(f"Unexpected web animal row: {row!r}")
        animal_id, name, habitat, emoji, fact, group, region, adaptation = row
        web_by_name[name.casefold()] = {
            "id": animal_id,
            "name": name,
            "habitat": habitat,
            "emoji": emoji,
            "fact": fact,
            "group": group,
            "region": region,
            "adaptation": adaptation,
        }

    combined_python = [dict(item) for item in animal_world.ANIMAL_LIBRARY]
    combined_python.extend(dict(item) for item in animal_expansion.EXTRA_ANIMALS)
    result: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in combined_python:
        name = str(item["name"])
        key = name.casefold()
        if key in seen:
            continue
        seen.add(key)
        web = web_by_name.get(key, {})
        result.append(
            {
                "id": web.get("id", _slug(name)),
                "name": name,
                "emoji": item.get("emoji", web.get("emoji", "🐾")),
                "habitat": item.get("habitat", web.get("habitat", "Forest")),
                "diet": item.get("diet", "Unknown"),
                "group": item.get("group", web.get("group", "Animal")),
                "region": item.get(
                    "region", web.get("region", "Nico's World")
                ),
                "fact": item.get("fact", web.get("fact", "")),
                "adaptation": item.get(
                    "adaptation", web.get("adaptation", "")
                ),
                "mission": item.get("mission", f"Learn more about {name}."),
                "imageTitle": animal_expansion.PHOTO_TITLE_OVERRIDES.get(
                    name, name
                ),
            }
        )
    return result


def _load_professions() -> list[dict[str, Any]]:
    paths = [
        WEB_SRC / "catalogs" / "nico-professions.json",
        WEB_SRC / "catalogs" / "nico-professions-phase2-extra.json",
    ]
    professions: list[dict[str, Any]] = []
    seen: set[str] = set()
    for path in paths:
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise RuntimeError(f"Profession catalog must be a list: {path}")
        for item in data:
            profession_id = str(item.get("id", ""))
            if not profession_id or profession_id in seen:
                continue
            seen.add(profession_id)
            professions.append(item)
    if len(professions) < 26:
        raise RuntimeError(
            f"Expected at least 26 professions, found {len(professions)}"
        )
    return professions


def main() -> None:
    full_app = (WEB_SRC / "FullApp.tsx").read_text(encoding="utf-8")
    feature_art = (WEB_SRC / "FeatureArt.tsx").read_text(encoding="utf-8")

    web_robot_options = _parse_string_array_object(
        full_app,
        "const robotOptions: Record<string,string[]> = {",
        "\n};\n\nfunction Header",
    )
    web_monster_options = _parse_string_array_object(
        full_app,
        "const options:Record<string,string[]>={",
        "}; const save=",
    )
    web_robot_actions = _parse_robot_actions(feature_art)
    web_robot_jobs = _parse_literal_array(
        feature_art,
        "export const ROBOT_JOBS = [",
        "];\n\nconst rawAnimals",
    )
    web_animals = _parse_literal_array(
        feature_art,
        "const rawAnimals: Array<[string,string,string,string,string,string,string,string]> = [",
        "];\n\nexport const ANIMAL_LIBRARY",
    )

    profession_data = _load_professions()
    showtime_data = json.loads(
        (WEB_SRC / "catalogs" / "showtime.json").read_text(encoding="utf-8")
    )
    knowledge_data = json.loads(
        (WEB_SRC / "catalogs" / "nico-knowledge.json").read_text(
            encoding="utf-8"
        )
    )

    robot_payload = {
        "schemaVersion": 1,
        "web": {
            "options": web_robot_options,
            "actions": web_robot_actions,
            "jobs": web_robot_jobs,
        },
        "streamlit": _python_robot_catalog(),
    }
    monster_payload = {
        "schemaVersion": 1,
        "web": {"options": web_monster_options},
        "streamlit": _python_monster_catalog(),
    }
    animals_payload = {
        "schemaVersion": 1,
        "habitats": _jsonable(animal_world.HABITATS),
        "animals": _combined_animals(web_animals),
        "photoTitleOverrides": _jsonable(
            animal_expansion.PHOTO_TITLE_OVERRIDES
        ),
    }
    world_payload = {
        "schemaVersion": 1,
        "campaignMissions": _jsonable(world4.CAMPAIGN_MISSIONS),
        "seasonalEvents": [
            {
                "idPrefix": "winter",
                "months": [12, 1, 2],
                "title": "Winter Star Festival",
                "emoji": "❄️",
                "challenge": (
                    "Complete three activities and decorate a cozy headquarters."
                ),
            },
            {
                "idPrefix": "spring",
                "months": [3, 4, 5],
                "title": "Spring Animal Celebration",
                "emoji": "🌼",
                "challenge": "Discover an animal and create a colorful artwork.",
            },
            {
                "idPrefix": "summer",
                "months": [6, 7, 8],
                "title": "Summer Ocean Expedition",
                "emoji": "🌊",
                "challenge": (
                    "Prepare an aquatic teammate and win an Arcade round."
                ),
            },
            {
                "idPrefix": "autumn",
                "months": [9, 10, 11],
                "title": "Autumn Monster Masquerade",
                "emoji": "🎃",
                "challenge": (
                    "Visit a monster habitat and create a new story."
                ),
            },
        ],
        "art": {
            "backgrounds": _jsonable(world4.ART_BACKGROUNDS),
            "frames": _jsonable(world4.ART_FRAMES),
            "stickers": _jsonable(world4.ART_STICKERS),
        },
        "monsterHabitats": {
            "themes": _jsonable(world4.HABITAT_THEMES),
            "foods": _jsonable(world4.HABITAT_FOODS),
            "toys": _jsonable(world4.HABITAT_TOYS),
        },
        "robotPets": {
            "species": _jsonable(world4.PET_SPECIES),
            "colors": _jsonable(world4.PET_COLORS),
            "personalities": _jsonable(world4.PET_PERSONALITIES),
            "accessories": _jsonable(world4.PET_ACCESSORIES),
        },
    }
    poses_payload = {
        "schemaVersion": 1,
        "webRobotActions": web_robot_actions,
        "streamlitRobotAnimations": _jsonable(catalog.ANIMATIONS),
        "streamlitMonsterAnimations": _jsonable(
            monster.MONSTER_ANIMATIONS
        ),
        "showtimePoses": showtime_data["poses"],
    }
    professions_payload = {
        "schemaVersion": 1,
        "professions": profession_data,
    }
    showtime_payload = {"schemaVersion": 1, **showtime_data}
    knowledge_payload = {"schemaVersion": 1, "entries": knowledge_data}
    schema_payload = {
        "registryVersion": 1,
        "clients": {
            "web": {
                "profileSchemaVersion": 3,
                "versionField": "schemaVersion",
                "storageKey": "nicos-world-local-save-v3",
                "legacyStorageKeys": [
                    "nicos-world-local-save-v2",
                    "nicos-world-local-save-v1",
                ],
                "exportFormat": "nicos-world-local-profile-v3",
            },
            "streamlit": {
                "profileSchemaVersion": 5,
                "versionField": "version",
                "exportFormat": "complete-profile-json",
            },
            "api": {
                "profileSchemaVersion": 4,
                "versionField": "schema_version",
                "apiVersion": "3.0.0",
                "repairEndpoint": "/api/v1/profile/repair",
            },
        },
        "compatibility": [
            {
                "producer": "web-v1/v2",
                "consumer": "web-v3",
                "status": "automatic",
                "notes": (
                    "Local storage normalization preserves bounded profile data."
                ),
            },
            {
                "producer": "web-v3",
                "consumer": "streamlit-v5",
                "status": "not-interchangeable",
                "notes": (
                    "Separate save shapes; shared catalogs and movie metadata "
                    "contract only."
                ),
            },
            {
                "producer": "streamlit-v1-v5",
                "consumer": "streamlit-v5",
                "status": "automatic",
                "notes": "normalize_profile migrates older saves.",
            },
            {
                "producer": "api-v1-v3",
                "consumer": "api-v4",
                "status": "repair-endpoint",
                "notes": "Pydantic repair upgrades schema_version to 4.",
            },
        ],
    }
    manifest_payload = {
        "catalogSchemaVersion": 1,
        "files": [
            "animals.json",
            "knowledge.json",
            "monster.json",
            "poses.json",
            "professions.json",
            "robot.json",
            "schema-registry.json",
            "showtime.json",
            "world.json",
        ],
        "policy": (
            "Canonical JSON is the source of truth. Generated Python and "
            "TypeScript views must be refreshed and checked in CI."
        ),
    }

    _write_json("robot.json", robot_payload)
    _write_json("monster.json", monster_payload)
    _write_json("animals.json", animals_payload)
    _write_json("world.json", world_payload)
    _write_json("poses.json", poses_payload)
    _write_json("professions.json", professions_payload)
    _write_json("showtime.json", showtime_payload)
    _write_json("knowledge.json", knowledge_payload)
    _write_json("schema-registry.json", schema_payload)
    _write_json("manifest.json", manifest_payload)

    from scripts.generate_shared_catalog_views import generate  # noqa: E402

    generate(check=False)
    print(
        f"Bootstrapped {len(manifest_payload['files'])} canonical catalog files."
    )


if __name__ == "__main__":
    main()
