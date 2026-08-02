from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_web_metadata_uses_production_domain() -> None:
    index = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
    manifest = (ROOT / "web" / "public" / "manifest.webmanifest").read_text(
        encoding="utf-8"
    )

    assert '<link rel="canonical" href="https://nicos-world.com/"' in index
    assert 'property="og:url" content="https://nicos-world.com/"' in index
    assert "Nico's World 3" not in index
    assert '"id": "https://nicos-world.com/"' in manifest


def test_production_crawler_files_use_canonical_domain() -> None:
    robots = (ROOT / "web" / "public" / "robots.txt").read_text(encoding="utf-8")
    sitemap = (ROOT / "web" / "public" / "sitemap.xml").read_text(
        encoding="utf-8"
    )

    assert "Sitemap: https://nicos-world.com/sitemap.xml" in robots
    assert "<loc>https://nicos-world.com/</loc>" in sitemap


def test_cloudflare_pages_contract_is_documented() -> None:
    guide = (ROOT / "docs" / "CLOUDFLARE_PAGES_NICOS_WORLD.md").read_text(
        encoding="utf-8"
    )

    assert "BoneManTGRM/Nicos-Adventures" in guide
    assert "Root directory | `web`" in guide
    assert "Build command | `npm run build`" in guide
    assert "Build output directory | `dist`" in guide
    assert "Pages Functions | None" in guide
    assert "nicos-world.com" in guide
