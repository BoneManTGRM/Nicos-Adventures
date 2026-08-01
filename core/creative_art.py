"""Deterministic SVG artwork generation for Nico's Art Studio."""

from __future__ import annotations

import html
from typing import Any

from core.world4 import ART_BACKGROUNDS

FRAME_STYLES: dict[str, tuple[str, str]] = {
    "Golden Stars": ("#FACC15", "⭐"),
    "Robot Bolts": ("#64748B", "⚙"),
    "Jungle Vines": ("#22C55E", "❧"),
    "Monster Spots": ("#A855F7", "●"),
    "Crystal Glow": ("#67E8F9", "◆"),
    "Space Window": ("#1E3A8A", "✦"),
}


def _esc(value: Any) -> str:
    return html.escape(str(value), quote=True)


def artwork_svg(artwork: dict[str, Any], *, compact: bool = False) -> str:
    """Create a responsive original poster using only safe stored artwork fields."""
    background = str(artwork.get("background", "Sunrise Meadow"))
    top, bottom = ART_BACKGROUNDS.get(
        background,
        ART_BACKGROUNDS["Sunrise Meadow"],
    )
    frame = str(artwork.get("frame", "Golden Stars"))
    frame_color, frame_mark = FRAME_STYLES.get(
        frame,
        FRAME_STYLES["Golden Stars"],
    )
    title = _esc(artwork.get("title", "Untitled Artwork"))
    subject = _esc(artwork.get("subject", "Nico's World"))
    caption = _esc(artwork.get("caption", ""))
    stickers = [str(value)[:8] for value in artwork.get("stickers", [])[:8]]
    sticker_positions = (
        (90, 120, -12),
        (620, 120, 11),
        (115, 520, 8),
        (600, 520, -8),
        (210, 185, 5),
        (520, 190, -5),
        (210, 460, -4),
        (520, 460, 6),
    )
    sticker_markup = "".join(
        f'<text x="{x}" y="{y}" transform="rotate({rotation} {x} {y})" '
        'font-size="58" text-anchor="middle">'
        f'{_esc(sticker)}</text>'
        for sticker, (x, y, rotation) in zip(
            stickers,
            sticker_positions,
            strict=False,
        )
    )
    marks = "".join(
        f'<text x="{x}" y="{y}" fill="white" opacity=".9" font-size="28">'
        f'{frame_mark}</text>'
        for x, y in (
            (26, 42),
            (715, 42),
            (26, 610),
            (715, 610),
            (370, 42),
            (370, 610),
        )
    )
    height = 360 if compact else 640
    return f"""
<div class="nico-art-card" data-artwork-id="{_esc(artwork.get('id', 'preview'))}">
<svg viewBox="0 0 760 640" role="img" aria-label="{title}" style="width:100%;height:{height}px">
  <defs>
    <linearGradient id="art-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/>
    </linearGradient>
    <filter id="art-shadow"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity=".28"/></filter>
  </defs>
  <rect x="14" y="14" width="732" height="612" rx="40" fill="url(#art-bg)"
        stroke="{frame_color}" stroke-width="24" filter="url(#art-shadow)"/>
  <rect x="46" y="55" width="668" height="510" rx="30" fill="#ffffff22"
        stroke="#ffffff77" stroke-width="4"/>
  {marks}
  {sticker_markup}
  <text x="380" y="285" text-anchor="middle" fill="white" font-size="64"
        font-family="Trebuchet MS, sans-serif" font-weight="900"
        stroke="#202744" stroke-width="3" paint-order="stroke">{subject}</text>
  <text x="380" y="380" text-anchor="middle" fill="white" font-size="38"
        font-family="Trebuchet MS, sans-serif" font-weight="800"
        stroke="#202744" stroke-width="2" paint-order="stroke">{title}</text>
  <text x="380" y="430" text-anchor="middle" fill="#fff" font-size="22"
        font-family="Trebuchet MS, sans-serif">{caption}</text>
</svg>
</div>
"""


ARTWORK_CSS = """
<style>
.nico-art-card{padding:1rem;border-radius:28px;background:linear-gradient(145deg,#fff,#eaf1ff);
box-shadow:0 18px 45px rgba(25,38,78,.18);overflow:hidden}
.nico-art-card svg{display:block;max-width:100%}
</style>
"""
