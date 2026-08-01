from core.animal_photos import (
    AnimalPhoto,
    article_title,
    photo_from_payloads,
)


def _wikipedia_payload() -> dict:
    return {
        "query": {
            "pages": [
                {
                    "title": "Jaguar",
                    "fullurl": "https://en.wikipedia.org/wiki/Jaguar",
                    "pageimage": "Jaguar_example.jpg",
                    "thumbnail": {
                        "source": "https://upload.wikimedia.org/example/jaguar.jpg",
                        "width": 900,
                        "height": 600,
                    },
                }
            ]
        }
    }


def _commons_payload() -> dict:
    return {
        "query": {
            "pages": [
                {
                    "title": "File:Jaguar example.jpg",
                    "imageinfo": [
                        {
                            "thumburl": (
                                "https://upload.wikimedia.org/example/"
                                "jaguar-900.jpg"
                            ),
                            "descriptionurl": (
                                "https://commons.wikimedia.org/wiki/"
                                "File:Jaguar_example.jpg"
                            ),
                            "extmetadata": {
                                "Artist": {
                                    "value": "<b>Wildlife Photographer</b>"
                                },
                                "LicenseShortName": {
                                    "value": "CC BY-SA 4.0"
                                },
                                "LicenseUrl": {
                                    "value": (
                                        "https://creativecommons.org/licenses/"
                                        "by-sa/4.0/"
                                    )
                                },
                            },
                        }
                    ],
                }
            ]
        }
    }


def test_article_title_uses_species_overrides() -> None:
    assert article_title("African Elephant") == "African bush elephant"
    assert article_title("Jaguar") == "Jaguar"


def test_photo_payloads_include_real_image_credit_and_license() -> None:
    photo = photo_from_payloads(_wikipedia_payload(), _commons_payload())
    assert photo == AnimalPhoto(
        image_url="https://upload.wikimedia.org/example/jaguar-900.jpg",
        source_page=(
            "https://commons.wikimedia.org/wiki/File:Jaguar_example.jpg"
        ),
        article_page="https://en.wikipedia.org/wiki/Jaguar",
        artist="Wildlife Photographer",
        license_name="CC BY-SA 4.0",
        license_url="https://creativecommons.org/licenses/by-sa/4.0/",
    )


def test_photo_payload_falls_back_to_wikipedia_metadata() -> None:
    photo = photo_from_payloads(_wikipedia_payload())
    assert photo is not None
    assert photo.image_url.endswith("jaguar.jpg")
    assert photo.source_page == "https://en.wikipedia.org/wiki/Jaguar"
    assert photo.artist == "Wikimedia contributor"


def test_missing_or_non_https_image_is_rejected() -> None:
    payload = _wikipedia_payload()
    payload["query"]["pages"][0]["thumbnail"]["source"] = (
        "http://unsafe.example/jaguar.jpg"
    )
    assert photo_from_payloads(payload) is None
