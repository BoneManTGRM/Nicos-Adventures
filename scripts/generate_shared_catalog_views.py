"""Generate deterministic Python and TypeScript views from shared catalogs."""

from __future__ import annotations

import argparse
import json
import pprint
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CATALOG_DIR = ROOT / "shared" / "catalogs"
PYTHON_TARGET = ROOT / "core" / "generated_shared_catalogs.py"
TYPESCRIPT_TARGET = ROOT / "web" / "src" / "generated" / "sharedCatalogs.ts"

EXPORTS: tuple[tuple[str, str], ...] = (
    ("ANIMAL_CATALOG", "animals.json"),
    ("KNOWLEDGE_CATALOG", "knowledge.json"),
    ("MONSTER_CATALOG", "monster.json"),
    ("POSE_CATALOG", "poses.json"),
    ("PROFESSION_CATALOG", "professions.json"),
    ("ROBOT_CATALOG", "robot.json"),
    ("SCHEMA_REGISTRY", "schema-registry.json"),
    ("SHOWTIME_CATALOG", "showtime.json"),
    ("WORLD_CATALOG", "world.json"),
)


def _load(name: str) -> Any:
    path = CATALOG_DIR / name
    return json.loads(path.read_text(encoding="utf-8"))


def _validate(catalogs: dict[str, Any]) -> None:
    manifest = _load("manifest.json")
    expected_files = {filename for _, filename in EXPORTS}
    listed_files = set(manifest.get("files", []))
    if manifest.get("catalogSchemaVersion") != 1:
        raise ValueError("Unsupported shared catalog schema version")
    if expected_files != listed_files:
        missing = sorted(expected_files - listed_files)
        extra = sorted(listed_files - expected_files)
        raise ValueError(
            f"Catalog manifest mismatch: missing={missing}, extra={extra}"
        )
    for export_name, payload in catalogs.items():
        if payload.get("schemaVersion", payload.get("registryVersion")) != 1:
            raise ValueError(f"{export_name} has an unsupported schema version")

    animals = catalogs["ANIMAL_CATALOG"].get("animals", [])
    animal_ids = [item.get("id") for item in animals]
    if not animals or len(animal_ids) != len(set(animal_ids)):
        raise ValueError("Animal catalog IDs must be present and unique")

    professions = catalogs["PROFESSION_CATALOG"].get("professions", [])
    profession_ids = [item.get("id") for item in professions]
    if len(professions) < 26 or len(profession_ids) != len(set(profession_ids)):
        raise ValueError("Profession catalog must contain unique profession IDs")

    showtime = catalogs["SHOWTIME_CATALOG"]
    if showtime.get("durationOptionsMs") != [4000, 6000, 8000]:
        raise ValueError("Showtime duration contract changed unexpectedly")
    if not showtime.get("poses") or not showtime.get("scenes"):
        raise ValueError("Showtime poses and scenes are required")

    registry = catalogs["SCHEMA_REGISTRY"].get("clients", {})
    if set(registry) != {"web", "streamlit", "api"}:
        raise ValueError(
            "Schema registry must describe web, Streamlit, and API clients"
        )


def _python_content(catalogs: dict[str, Any]) -> str:
    lines = [
        '"""Generated shared catalogs. Do not edit by hand.\n\n'
        "Run ``python scripts/generate_shared_catalog_views.py`` after changing\n"
        '``shared/catalogs/*.json``.\n"""',
        "",
        "from __future__ import annotations",
        "",
        "from typing import Any, Final",
        "",
    ]
    for export_name, _ in EXPORTS:
        rendered = pprint.pformat(
            catalogs[export_name], width=100, sort_dicts=True
        )
        lines.append(f"{export_name}: Final[dict[str, Any]] = {rendered}")
        lines.append("")
    lines.append("SHARED_CATALOG_SCHEMA_VERSION: Final[int] = 1")
    lines.append("")
    return "\n".join(lines)


def _typescript_content(catalogs: dict[str, Any]) -> str:
    lines = [
        "/* Generated shared catalogs. Do not edit by hand.",
        " * Run `python scripts/generate_shared_catalog_views.py` after changing",
        " * `shared/catalogs/*.json`.",
        " */",
        "",
    ]
    for export_name, _ in EXPORTS:
        rendered = json.dumps(
            catalogs[export_name], ensure_ascii=False, indent=2, sort_keys=True
        )
        lines.append(f"export const {export_name} = {rendered} as const;")
        lines.append("")
    lines.extend(
        [
            "export const SHARED_CATALOG_SCHEMA_VERSION = 1 as const;",
            "",
            "export type SharedAnimal = (typeof ANIMAL_CATALOG.animals)[number];",
            "export type SharedProfession = (typeof PROFESSION_CATALOG.professions)[number];",
            "export type SharedShowtimePose = (typeof SHOWTIME_CATALOG.poses)[number];",
            "export type SharedShowtimeScene = (typeof SHOWTIME_CATALOG.scenes)[number];",
            "",
        ]
    )
    return "\n".join(lines)


def _write_or_check(path: Path, expected: str, *, check: bool) -> None:
    actual = path.read_text(encoding="utf-8") if path.exists() else None
    if check:
        if actual != expected:
            raise SystemExit(
                f"Generated catalog view is stale: {path.relative_to(ROOT)}"
            )
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(expected, encoding="utf-8")


def generate(*, check: bool) -> None:
    catalogs = {
        export_name: _load(filename) for export_name, filename in EXPORTS
    }
    _validate(catalogs)
    _write_or_check(PYTHON_TARGET, _python_content(catalogs), check=check)
    _write_or_check(
        TYPESCRIPT_TARGET, _typescript_content(catalogs), check=check
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--check", action="store_true", help="Fail when generated files are stale"
    )
    args = parser.parse_args()
    generate(check=args.check)
    print(
        "Shared catalog views are current."
        if args.check
        else "Generated shared catalog views."
    )
