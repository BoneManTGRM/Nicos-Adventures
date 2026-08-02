"""Enhanced illustration pass for the backward-compatible monster renderer."""

from __future__ import annotations

import html
from typing import Any

from core.monster import MONSTER_COLORS, normalize_monster
from core.monster_art import MONSTER_ART_CSS as BASE_MONSTER_ART_CSS
from core.monster_art import monster_html as base_monster_html

MONSTER_FAMILIES = {
    "blob",
    "dragon",
    "jungle",
    "stone",
    "spirit",
    "cosmic",
    "aquatic",
    "candy",
    "mecha",
    "royal",
}


def _esc(value: Any) -> str:
    return html.escape(str(value), quote=True)


def monster_family(monster: dict[str, Any]) -> str:
    data = normalize_monster(monster) or {}
    body = str(data.get("body", "fluffy"))
    texture = str(data.get("texture", "smooth"))
    pattern = str(data.get("pattern", "solid"))
    accessory = str(data.get("accessory", "none"))
    horns = str(data.get("horns", "none"))
    wings = str(data.get("wings", "none"))
    if body == "robot" or texture == "metallic":
        return "mecha"
    if body == "dragon" or wings == "dragon" or horns == "dragon":
        return "dragon"
    if body in {"octopus", "jelly"} or wings in {"fin", "cloud"}:
        return "aquatic"
    if body == "plant" or texture == "leafy" or wings == "leaf":
        return "jungle"
    if body in {"rock", "crystal"} or texture in {"rocky", "crystal"}:
        return "stone"
    if body in {"ghost", "cloud"} or texture == "cloudy":
        return "spirit"
    if body == "star" or texture == "cosmic" or pattern in {"galaxy", "stars"}:
        return "cosmic"
    if accessory in {"crown", "cape", "medal"} or horns == "crown":
        return "royal"
    if pattern in {"spots", "swirls", "checker"} and texture in {"jelly", "fluffy"}:
        return "candy"
    return "blob"


def _expression(data: dict[str, Any], accent: str) -> str:
    mood = str(data.get("mood", "Happy"))
    if mood == "Sleepy":
        brows = (
            '<path d="M271 267q31 18 62 0m34 0q31 18 62 0" fill="none" '
            'stroke="#172033" stroke-width="9" stroke-linecap="round" opacity=".82"/>'
        )
    elif mood in {"Excited", "Proud"}:
        brows = (
            '<path d="M269 259l64-17m34 0 64 17" fill="none" stroke="#172033" '
            'stroke-width="10" stroke-linecap="round"/>'
        )
    elif mood in {"Shy", "Scared"}:
        brows = (
            '<path d="M270 248q31-20 63 4m34 0q32-24 63-4" fill="none" '
            'stroke="#172033" stroke-width="9" stroke-linecap="round"/>'
        )
    else:
        brows = (
            '<path d="M270 255q31-12 63 0m34 0q32-12 63 0" fill="none" '
            'stroke="#172033" stroke-width="8" stroke-linecap="round" opacity=".78"/>'
        )
    cheeks = (
        f'<ellipse cx="252" cy="344" rx="25" ry="12" fill="{accent}" opacity=".3"/>'
        f'<ellipse cx="448" cy="344" rx="25" ry="12" fill="{accent}" opacity=".3"/>'
    )
    return f'<g data-monster-v2-layer="expression">{brows}{cheeks}</g>'


def _family_overlay(family: str, accent: str) -> str:
    overlays = {
        "blob": (
            f'<g data-monster-v2-family-art="blob"><circle cx="226" cy="218" r="14" '
            f'fill="{accent}" opacity=".55"/><circle cx="474" cy="395" r="10" '
            f'fill="{accent}" opacity=".45"/><path d="M262 194q88-48 176 0" '
            'fill="none" stroke="#fff" stroke-width="12" opacity=".18" '
            'stroke-linecap="round"/></g>'
        ),
        "dragon": (
            f'<g data-monster-v2-family-art="dragon"><path d="M281 178l20-46 25 42 '
            f'24-58 25 58 26-42 19 46" fill="{accent}" stroke="#172033" '
            'stroke-width="8"/><path d="M270 422l28-25 27 28 25-30 27 30 28-25 25 28" '
            f'fill="none" stroke="{accent}" stroke-width="11" stroke-linecap="round"/>'
            '<path d="M314 375l12 22 14-22m20 0 13 22 13-22" fill="#fff"/></g>'
        ),
        "jungle": (
            '<g data-monster-v2-family-art="jungle"><path d="M247 204q-57-77-99-14 '
            '51 44 99 14zm206 0q57-77 99-14-51 44-99 14z" fill="#4ade80" '
            'stroke="#166534" stroke-width="8"/><path d="M255 419q95 45 190 0" '
            'fill="none" stroke="#166534" stroke-width="12" opacity=".65"/></g>'
        ),
        "stone": (
            f'<g data-monster-v2-family-art="stone"><path d="M239 235l34-66 43 50 '
            f'34-82 37 82 43-50 31 68" fill="{accent}" opacity=".7" '
            'stroke="#172033" stroke-width="9"/><path d="M243 384l57-33 41 29 49-43 '
            '57 42" fill="none" stroke="#fff" stroke-width="9" opacity=".28"/></g>'
        ),
        "spirit": (
            f'<g data-monster-v2-family-art="spirit"><path d="M196 231q-55-55-75 9 '
            f'38 8 58 43m325-52q55-55 75 9-38 8-58 43" fill="none" '
            f'stroke="{accent}" stroke-width="13" opacity=".62" stroke-linecap="round"/>'
            '<circle cx="235" cy="192" r="11" fill="#fff" opacity=".55"/>'
            '<circle cx="478" cy="258" r="8" fill="#fff" opacity=".42"/></g>'
        ),
        "cosmic": (
            f'<g data-monster-v2-family-art="cosmic"><circle cx="350" cy="315" r="190" '
            f'fill="none" stroke="{accent}" stroke-width="4" stroke-dasharray="10 20" '
            'opacity=".42" class="monster-v2-orbit"/><circle cx="195" cy="237" r="13" '
            f'fill="{accent}"/><circle cx="509" cy="403" r="10" fill="#fff"/>'
            '<path d="M350 137l8 19 21 2-16 14 5 21-18-11-18 11 5-21-16-14 '
            f'21-2z" fill="{accent}"/></g>'
        ),
        "aquatic": (
            f'<g data-monster-v2-family-art="aquatic"><circle cx="220" cy="213" r="18" '
            'fill="#fff" opacity=".35"/><circle cx="493" cy="303" r="12" fill="#fff" '
            'opacity=".28"/><circle cx="471" cy="224" r="7" fill="#fff" opacity=".38"/>'
            f'<path d="M247 405q103 48 206 0" fill="none" stroke="{accent}" '
            'stroke-width="12" opacity=".55"/></g>'
        ),
        "candy": (
            f'<g data-monster-v2-family-art="candy"><path d="M249 202l18-34m35 20 '
            f'21-37m38 35 25-34m38 58 32-27" stroke="{accent}" stroke-width="10" '
            'stroke-linecap="round"/><circle cx="238" cy="413" r="14" fill="#f9a8d4"/>'
            '<circle cx="465" cy="398" r="11" fill="#fde047"/></g>'
        ),
        "mecha": (
            f'<g data-monster-v2-family-art="mecha"><path d="M239 233h222M228 399h244" '
            'stroke="#fff" stroke-width="7" opacity=".24"/><path d="M260 188l28-42 '
            f'31 34m62 0 31-34 28 42" fill="none" stroke="{accent}" stroke-width="11"/>'
            f'<circle cx="350" cy="408" r="35" fill="none" stroke="{accent}" '
            'stroke-width="8" stroke-dasharray="12 8" class="monster-v2-reactor"/></g>'
        ),
        "royal": (
            f'<g data-monster-v2-family-art="royal"><ellipse cx="350" cy="166" rx="99" '
            f'ry="23" fill="none" stroke="{accent}" stroke-width="9" opacity=".72" '
            'class="monster-v2-halo"/><path d="M267 420q83 51 166 0" fill="none" '
            f'stroke="{accent}" stroke-width="14"/><circle cx="350" cy="431" r="19" '
            f'fill="{accent}" stroke="#fff" stroke-width="6"/></g>'
        ),
    }
    return overlays.get(family, overlays["blob"])


def _depth_pass(family: str, accent: str) -> str:
    return f"""
<g data-monster-v2-layer="depth">
  <path d="M232 379q118 97 236 0-17 91-118 91t-118-91z" fill="#020617"
    opacity=".13" pointer-events="none"/>
  <path d="M246 224q104-76 208 0" fill="none" stroke="#fff" stroke-width="16"
    stroke-linecap="round" opacity=".16" pointer-events="none"/>
  <circle cx="350" cy="408" r="30" fill="none" stroke="{accent}" stroke-width="5"
    opacity=".55" class="monster-v2-core-ring"/>
  <text x="350" y="518" text-anchor="middle" fill="#fff" opacity=".24"
    font-size="16" font-family="monospace" letter-spacing="4">{family.upper()} CLASS</text>
</g>
"""


def monster_html(
    monster: dict[str, Any],
    animation: str = "idle",
    compact: bool = False,
    scene: str = "lab",
) -> str:
    data = normalize_monster(monster) or normalize_monster({})
    assert data is not None
    family = monster_family(data)
    accent = MONSTER_COLORS[data["secondary_color"]][1]
    markup = base_monster_html(
        data,
        animation=animation,
        compact=compact,
        scene=scene,
    )
    overlay = (
        _family_overlay(family, accent)
        + _expression(data, accent)
        + _depth_pass(family, accent)
    )
    markup = markup.replace("</svg>", f"{overlay}</svg>", 1)
    markup = markup.replace(
        '<div class="monster-art ',
        f'<div class="monster-art monster-art-v2 family-{family} ',
        1,
    )
    markup = markup.replace(
        'data-monster-body=',
        f'data-monster-family="{_esc(family)}" data-monster-body=',
        1,
    )
    markup = markup.replace(
        '<div class="monster-scene-stars">',
        '<div class="monster-v2-backdrop"><i></i><i></i><i></i></div>'
        '<div class="monster-scene-stars">',
        1,
    )
    markup = markup.replace(
        '<div class="monster-nameplate">',
        f'<div class="monster-family-chip">{family.title()} Monster</div>'
        '<div class="monster-nameplate">',
        1,
    )
    return markup


def monster_card_html(monster: dict[str, Any]) -> str:
    return monster_html(monster, compact=True, scene="lab")


MONSTER_ART_CSS = BASE_MONSTER_ART_CSS + r"""
<style>
.monster-art-v2{border-color:#36466f;box-shadow:0 28px 72px #0f172a55,
inset 0 0 82px #ffffff16;min-height:660px}
.monster-art-v2 .monster-svg{filter:drop-shadow(0 22px 18px #02061775)}
.monster-art-v2 .monster-canvas{inset:9px 2% 72px}
.monster-art-v2:before{opacity:.7}
.monster-art-v2:after{height:52px;bottom:5%;filter:blur(22px);opacity:.58}
.monster-v2-backdrop{position:absolute;inset:0;overflow:hidden;z-index:1;pointer-events:none}
.monster-v2-backdrop:before{content:'';position:absolute;left:8%;right:8%;bottom:15%;height:72px;
border-radius:50%;border:3px solid var(--monster-glow);box-shadow:0 0 34px var(--monster-glow),
inset 0 0 24px var(--monster-glow);opacity:.35;transform:perspective(360px) rotateX(67deg)}
.monster-v2-backdrop i{position:absolute;width:8px;height:8px;border-radius:50%;background:#fff;
box-shadow:0 0 16px var(--monster-glow);animation:monster-v2-float 6s ease-in-out infinite}
.monster-v2-backdrop i:nth-child(1){left:13%;top:24%}.monster-v2-backdrop i:nth-child(2){right:12%;top:38%;animation-delay:-2s}
.monster-v2-backdrop i:nth-child(3){left:22%;bottom:24%;animation-delay:-4s}
.monster-family-chip{position:absolute;right:20px;top:18px;z-index:7;color:#fff;background:#071126d9;
border:1px solid #ffffff44;border-right:6px solid var(--monster-glow);border-radius:10px;padding:.55rem .8rem;
font:800 .72rem/1.2 monospace;letter-spacing:.1em;text-transform:uppercase}
.monster-v2-orbit{transform-origin:350px 315px;animation:monster-v2-spin 14s linear infinite}
.monster-v2-reactor,.monster-v2-core-ring{transform-origin:350px 408px;animation:monster-v2-core 2.3s ease-in-out infinite}
.monster-v2-halo{transform-origin:350px 166px;animation:monster-v2-halo 4s ease-in-out infinite}
.family-dragon{--family-edge:#fb923c}.family-jungle{--family-edge:#4ade80}.family-stone{--family-edge:#c4b5fd}
.family-spirit{--family-edge:#e0f2fe}.family-cosmic{--family-edge:#f0abfc}.family-aquatic{--family-edge:#67e8f9}
.family-candy{--family-edge:#f9a8d4}.family-mecha{--family-edge:#94a3b8}.family-royal{--family-edge:#fde047}
.monster-art-v2[class*="family-"]{outline:1px solid color-mix(in srgb,var(--family-edge,#fff) 35%,transparent)}
.monster-art-v2.family-dragon .monster-character{filter:drop-shadow(0 0 11px #fb923c55)}
.monster-art-v2.family-spirit .monster-character{opacity:.94;filter:drop-shadow(0 0 19px #e0f2fe77)}
.monster-art-v2.family-cosmic .monster-character{filter:drop-shadow(0 0 16px #f0abfc66)}
.monster-art-v2.family-mecha .monster-character{filter:drop-shadow(0 0 13px #67e8f966)}
.monster-art-v2.compact{min-height:385px}.monster-art-v2.compact .monster-canvas{inset:-48px -11% 42px}
.monster-art-v2.compact .monster-family-chip{display:none}
@keyframes monster-v2-float{50%{transform:translate(15px,-21px);opacity:.32}}
@keyframes monster-v2-spin{to{transform:rotate(360deg)}}
@keyframes monster-v2-core{50%{transform:scale(1.16);opacity:.28}}
@keyframes monster-v2-halo{50%{transform:translateY(-8px) scaleX(1.08);opacity:.38}}
@media(max-width:700px){.monster-art-v2{min-height:555px}.monster-art-v2 .monster-canvas{inset:-15px -19% 62px}
.monster-family-chip{right:12px;font-size:.57rem}.monster-art-v2.compact{min-height:325px}}
@media(prefers-reduced-motion:reduce){.monster-v2-backdrop i,.monster-v2-orbit,.monster-v2-reactor,
.monster-v2-core-ring,.monster-v2-halo{animation:none!important}}
</style>
"""
