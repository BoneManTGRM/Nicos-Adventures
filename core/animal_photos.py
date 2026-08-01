"""Real wildlife photos and attribution from Wikimedia projects."""

from __future__ import annotations

import html
import json
import os
import re
from dataclasses import dataclass
from functools import lru_cache
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = (
    "NicosWorld/1.0 educational wildlife viewer "
    "(https://github.com/BoneManTGRM/Nicos-Adventures)"
)

ARTICLE_OVERRIDES: dict[str, str] = {
    "Poison Dart Frog": "Poison dart frog",
    "Giant Pacific Octopus": "Giant Pacific octopus",
    "Sea Turtle": "Sea turtle",
    "Manta Ray": "Manta ray",
    "African Elephant": "African bush elephant",
    "Emperor Penguin": "Emperor penguin",
    "Gila Monster": "Gila monster",
    "Red Panda": "Red panda",
    "Flying Squirrel": "Flying squirrel",
    "Great Horned Owl": "Great horned owl",
    "Snow Leopard": "Snow leopard",
    "Mountain Goat": "Mountain goat",
    "Andean Condor": "Andean condor",
    "Blue Whale": "Blue whale",
    "Arctic Fox": "Arctic fox",
    "Fennec Fox": "Fennec fox",
}


@dataclass(frozen=True)
class AnimalPhoto:
    """One display-ready, attributed wildlife photograph."""

    image_url: str
    source_page: str
    article_page: str
    artist: str
    license_name: str
    license_url: str


def article_title(animal_name: str) -> str:
    """Map a display name to its best English Wikipedia article title."""
    clean = str(animal_name).strip()[:80]
    return ARTICLE_OVERRIDES.get(clean, clean)


def _strip_markup(value: Any, fallback: str = "") -> str:
    text = html.unescape(str(value or ""))
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:180] or fallback


def _metadata_value(metadata: dict[str, Any], key: str) -> str:
    item = metadata.get(key, {})
    return str(item.get("value", "")) if isinstance(item, dict) else ""


def _safe_https(url: Any) -> str:
    value = str(url or "").strip()
    if value.startswith("//"):
        value = f"https:{value}"
    return value if value.startswith("https://") else ""


def _request_json(
    base_url: str,
    params: dict[str, str | int],
    *,
    timeout: float = 3.0,
) -> dict[str, Any]:
    url = f"{base_url}?{urlencode(params)}"
    request = Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
    )
    with urlopen(request, timeout=timeout) as response:  # noqa: S310
        payload = json.loads(response.read().decode("utf-8"))
    return payload if isinstance(payload, dict) else {}


def _page_from_payload(payload: dict[str, Any]) -> dict[str, Any] | None:
    query = payload.get("query", {})
    pages = query.get("pages", []) if isinstance(query, dict) else []
    if isinstance(pages, dict):
        pages = list(pages.values())
    if not isinstance(pages, list):
        return None
    return next(
        (
            page
            for page in pages
            if isinstance(page, dict) and "missing" not in page
        ),
        None,
    )


def photo_from_payloads(
    wikipedia_payload: dict[str, Any],
    commons_payload: dict[str, Any] | None = None,
) -> AnimalPhoto | None:
    """Build safe photo metadata from mocked or live API payloads."""
    page = _page_from_payload(wikipedia_payload)
    if not page:
        return None

    thumbnail = page.get("thumbnail", {})
    image_url = _safe_https(
        thumbnail.get("source") if isinstance(thumbnail, dict) else ""
    )
    article_page = _safe_https(page.get("fullurl"))
    filename = str(page.get("pageimage", "")).strip()
    if not image_url or not filename:
        return None

    source_page = article_page or "https://commons.wikimedia.org/"
    article_page = article_page or "https://en.wikipedia.org/"
    artist = "Wikimedia contributor"
    license_name = "Free Wikimedia image"
    license_url = "https://commons.wikimedia.org/"

    commons_page = _page_from_payload(commons_payload or {})
    if commons_page:
        infos = commons_page.get("imageinfo", [])
        info = (
            infos[0]
            if isinstance(infos, list)
            and infos
            and isinstance(infos[0], dict)
            else {}
        )
        thumb_url = _safe_https(info.get("thumburl"))
        if thumb_url:
            image_url = thumb_url
        source_page = _safe_https(info.get("descriptionurl")) or source_page
        metadata = info.get("extmetadata", {})
        if isinstance(metadata, dict):
            artist = _strip_markup(
                _metadata_value(metadata, "Artist"),
                "Wikimedia contributor",
            )
            license_name = _strip_markup(
                _metadata_value(metadata, "LicenseShortName"),
                "Free Wikimedia image",
            )
            license_url = (
                _safe_https(_metadata_value(metadata, "LicenseUrl"))
                or license_url
            )

    return AnimalPhoto(
        image_url=image_url,
        source_page=source_page,
        article_page=article_page,
        artist=artist,
        license_name=license_name,
        license_url=license_url,
    )


@lru_cache(maxsize=160)
def get_animal_photo(animal_name: str) -> AnimalPhoto | None:
    """Fetch one free Wikimedia photo, returning None on any network problem."""
    if (
        os.getenv("CI", "").lower() == "true"
        or os.getenv("NICO_DISABLE_REMOTE_MEDIA") == "1"
    ):
        return None

    title = article_title(animal_name)
    try:
        wikipedia_payload = _request_json(
            WIKIPEDIA_API,
            {
                "action": "query",
                "format": "json",
                "formatversion": 2,
                "redirects": 1,
                "prop": "pageimages|info",
                "inprop": "url",
                "piprop": "thumbnail|name",
                "pithumbsize": 900,
                "pilicense": "free",
                "titles": title,
            },
        )
        page = _page_from_payload(wikipedia_payload)
        filename = str(page.get("pageimage", "")).strip() if page else ""
        commons_payload: dict[str, Any] | None = None
        if filename:
            commons_payload = _request_json(
                COMMONS_API,
                {
                    "action": "query",
                    "format": "json",
                    "formatversion": 2,
                    "prop": "imageinfo",
                    "iiprop": "url|extmetadata",
                    "iiurlwidth": 900,
                    "iiextmetadatalanguage": "en",
                    "iiextmetadatafilter": (
                        "Artist|LicenseShortName|LicenseUrl"
                    ),
                    "titles": f"File:{filename}",
                },
            )
        return photo_from_payloads(wikipedia_payload, commons_payload)
    except (OSError, TimeoutError, ValueError, TypeError, KeyError):
        return None
