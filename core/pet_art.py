"""Layered SVG artwork for Nico's customizable robot pets."""

from __future__ import annotations

import hashlib
import html
from typing import Any

from core.world4 import PET_ACCESSORIES, PET_COLORS, PET_PERSONALITIES, PET_SPECIES

PET_ANIMATIONS = {
    "idle",
    "play",
    "train",
    "groom",
    "explore",
    "nap",
    "celebrate",
}
PET_SCENES = {"workshop", "home", "training", "space", "forest"}


def _esc(value: Any) -> str:
    return html.escape(str(value), quote=True)


def _uid(pet: dict[str, Any]) -> str:
    raw = f"{pet.get('id')}:{pet.get('name')}:{pet.get('species')}:{pet.get('color')}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:10]


def normalize_pet_art(candidate: Any) -> dict[str, Any]:
    source = candidate if isinstance(candidate, dict) else {}
    species = str(source.get("species", "dog"))
    color = str(source.get("color", "Photon Blue"))
    personality = str(source.get("personality", PET_PERSONALITIES[0]))
    accessory = str(source.get("accessory", PET_ACCESSORIES[0]))
    return {
        "id": str(source.get("id", "pet-preview"))[:50] or "pet-preview",
        "name": str(source.get("name", "Pixel")).replace("<", "").replace(">", "")[:24]
        or "Pixel",
        "species": species if species in PET_SPECIES else "dog",
        "color": color if color in PET_COLORS else "Photon Blue",
        "personality": (
            personality if personality in PET_PERSONALITIES else PET_PERSONALITIES[0]
        ),
        "accessory": accessory if accessory in PET_ACCESSORIES else PET_ACCESSORIES[0],
        "bond": max(0, min(int(source.get("bond", 0) or 0), 100)),
        "tricks": max(0, min(int(source.get("tricks", 0) or 0), 50)),
        "plays": max(0, int(source.get("plays", 0) or 0)),
    }


def _defs(uid: str, primary: str) -> str:
    return f"""
<defs>
  <linearGradient id="pet-body-{uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity=".48"/>
    <stop offset=".18" stop-color="{primary}"/>
    <stop offset=".72" stop-color="{primary}"/>
    <stop offset="1" stop-color="#0f172a" stop-opacity=".54"/>
  </linearGradient>
  <linearGradient id="pet-metal-{uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f8fafc"/>
    <stop offset=".42" stop-color="#94a3b8"/>
    <stop offset="1" stop-color="#334155"/>
  </linearGradient>
  <radialGradient id="pet-eye-{uid}">
    <stop offset="0" stop-color="#ffffff"/>
    <stop offset=".26" stop-color="#67e8f9"/>
    <stop offset="1" stop-color="#0284c7"/>
  </radialGradient>
  <filter id="pet-glow-{uid}" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="9" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="pet-shadow-{uid}" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="14" stdDeviation="10" flood-color="#020617"
      flood-opacity=".42"/>
  </filter>
</defs>
"""


def _eye_pair(uid: str, left: int, right: int, y: int, radius: int = 16) -> str:
    return f"""
<g class="pet-eyes" data-pet-layer="eyes">
  <circle cx="{left}" cy="{y}" r="{radius + 7}" fill="#0f172a"/>
  <circle cx="{right}" cy="{y}" r="{radius + 7}" fill="#0f172a"/>
  <circle cx="{left}" cy="{y}" r="{radius}" fill="url(#pet-eye-{uid})"
    filter="url(#pet-glow-{uid})"/>
  <circle cx="{right}" cy="{y}" r="{radius}" fill="url(#pet-eye-{uid})"
    filter="url(#pet-glow-{uid})"/>
  <circle cx="{left - 5}" cy="{y - 6}" r="5" fill="#fff"/>
  <circle cx="{right - 5}" cy="{y - 6}" r="5" fill="#fff"/>
</g>
"""


def _dog(uid: str, fill: str, accent: str) -> str:
    return f"""
<g data-pet-species="dog">
  <path class="pet-tail" d="M420 310q90-45 63-111" fill="none" stroke="{fill}"
    stroke-width="34" stroke-linecap="round"/>
  <ellipse cx="298" cy="337" rx="137" ry="93" fill="{fill}" stroke="#172033"
    stroke-width="12"/>
  <path d="M206 394v76m74-65v79m83-79v79m66-90v76" stroke="url(#pet-metal-{uid})"
    stroke-width="33" stroke-linecap="round"/>
  <path d="M179 474h68m2 12h66m17 0h66m-7-12h68" stroke="{accent}"
    stroke-width="22" stroke-linecap="round"/>
  <rect x="169" y="151" width="260" height="205" rx="82" fill="{fill}"
    stroke="#172033" stroke-width="12"/>
  <path d="M188 191l-68 23 45 112 61-53zm222 0 68 23-45 112-61-53z" fill="{accent}"
    stroke="#172033" stroke-width="11"/>
  <ellipse cx="299" cy="296" rx="48" ry="35" fill="#dbeafe" stroke="#172033"
    stroke-width="9"/>
  <circle cx="299" cy="285" r="15" fill="#172033"/>
  <path d="M299 299q-28 35-58 2m58-2q28 35 58 2" fill="none" stroke="#172033"
    stroke-width="8" stroke-linecap="round"/>
  {_eye_pair(uid, 240, 358, 238)}
</g>
"""


def _cat(uid: str, fill: str, accent: str) -> str:
    return f"""
<g data-pet-species="cat">
  <path class="pet-tail" d="M415 356q126-37 74-155-24-54-69-10 57 23 35 79"
    fill="none" stroke="{fill}" stroke-width="31" stroke-linecap="round"/>
  <ellipse cx="301" cy="355" rx="126" ry="89" fill="{fill}" stroke="#172033"
    stroke-width="12"/>
  <path d="M217 400v77m72-65v75m82-75v75m67-87v77" stroke="url(#pet-metal-{uid})"
    stroke-width="29" stroke-linecap="round"/>
  <path d="M192 482h55m18 6h53m33 0h53m12-6h55" stroke="{accent}"
    stroke-width="18" stroke-linecap="round"/>
  <path d="M177 196l38-106 74 89m92 0 72-89 40 108" fill="{accent}"
    stroke="#172033" stroke-width="12" stroke-linejoin="round"/>
  <rect x="172" y="153" width="258" height="207" rx="94" fill="{fill}"
    stroke="#172033" stroke-width="12"/>
  <path d="M287 288h25l-13 15z" fill="#fb7185" stroke="#172033" stroke-width="6"/>
  <path d="M299 303v22m0 0q-25 25-50 2m50-2q25 25 50 2" fill="none"
    stroke="#172033" stroke-width="7" stroke-linecap="round"/>
  <path d="M222 305l-80-20m82 42-88 7m240-29 80-20m-82 42 88 7" stroke="#cbd5e1"
    stroke-width="6" stroke-linecap="round"/>
  {_eye_pair(uid, 238, 362, 244, 17)}
</g>
"""


def _dinosaur(uid: str, fill: str, accent: str) -> str:
    return f"""
<g data-pet-species="dinosaur">
  <path class="pet-tail" d="M410 352q132 2 172-94-18 117-137 154" fill="{fill}"
    stroke="#172033" stroke-width="12"/>
  <path d="M198 387q-17-128 78-183 105-61 184 27 47 52 26 151-102 67-288 5z"
    fill="{fill}" stroke="#172033" stroke-width="12"/>
  <path d="M245 205l22-66 41 49 36-75 34 72 49-50 8 77" fill="{accent}"
    stroke="#172033" stroke-width="10"/>
  <path d="M239 386l-25 90m188-91 31 91" stroke="url(#pet-metal-{uid})"
    stroke-width="38" stroke-linecap="round"/>
  <path d="M177 484h82m137 0h80" stroke="{accent}" stroke-width="23"
    stroke-linecap="round"/>
  <path d="M196 222q-52-15-74 27 40 22 78 14m260-40q58-4 70 43-44 13-79 0"
    fill="{accent}" stroke="#172033" stroke-width="10"/>
  <path d="M275 306q40 35 87 0" fill="none" stroke="#172033" stroke-width="9"
    stroke-linecap="round"/>
  <path d="M302 315l14 25 15-25m17 0 14 25 14-25" fill="#fff"/>
  {_eye_pair(uid, 274, 381, 260, 15)}
</g>
"""


def _dragon(uid: str, fill: str, accent: str) -> str:
    return f"""
<g data-pet-species="dragon">
  <path class="pet-wing" d="M223 289L93 168l25 113-61 45 153 41m185-78 130-121-25 113
    61 45-153 41" fill="{accent}" stroke="#172033" stroke-width="12"/>
  <path class="pet-tail" d="M411 368q117 26 144-69-1 91-82 121l35 36-78 3"
    fill="{fill}" stroke="#172033" stroke-width="12"/>
  <ellipse cx="302" cy="358" rx="126" ry="93" fill="{fill}" stroke="#172033"
    stroke-width="12"/>
  <path d="M220 401l-24 78m191-78 25 78" stroke="url(#pet-metal-{uid})"
    stroke-width="34" stroke-linecap="round"/>
  <path d="M168 485h69m145 0h69" stroke="{accent}" stroke-width="22"
    stroke-linecap="round"/>
  <path d="M204 197l-46-94 86 61m119 0 83-63-44 98" fill="{accent}"
    stroke="#172033" stroke-width="11"/>
  <path d="M173 180q129-91 258 0l-17 174q-112 72-224 0z" fill="{fill}"
    stroke="#172033" stroke-width="12"/>
  <path d="M274 310q29 30 58 0m-29 15q37 23 74-5" fill="none" stroke="#172033"
    stroke-width="8" stroke-linecap="round"/>
  <path class="pet-flame" d="M480 383q59-8 88 40-28-8-23 30-26-30-58-18z"
    fill="#fb923c" stroke="#ef4444" stroke-width="8"/>
  {_eye_pair(uid, 245, 359, 247, 16)}
</g>
"""


def _penguin(uid: str, fill: str, accent: str) -> str:
    return f"""
<g data-pet-species="penguin">
  <ellipse cx="300" cy="336" rx="123" ry="162" fill="{fill}" stroke="#172033"
    stroke-width="12"/>
  <ellipse cx="300" cy="353" rx="77" ry="111" fill="#f8fafc" opacity=".9"/>
  <path class="pet-wing" d="M190 291q-93 57-78 145 58-38 100-105m198-40q93 57 78 145-58-38-100-105"
    fill="{accent}" stroke="#172033" stroke-width="11"/>
  <path d="M245 484l-71 35 92 5m89-40 71 35-92 5" fill="{accent}"
    stroke="#172033" stroke-width="10" stroke-linejoin="round"/>
  <ellipse cx="300" cy="222" rx="112" ry="91" fill="{fill}" stroke="#172033"
    stroke-width="12"/>
  <path d="M270 280l30-22 33 22-33 24z" fill="#f59e0b" stroke="#172033"
    stroke-width="8"/>
  {_eye_pair(uid, 255, 345, 225, 15)}
</g>
"""


def _fox(uid: str, fill: str, accent: str) -> str:
    return f"""
<g data-pet-species="fox">
  <path class="pet-tail" d="M407 349q122-53 142 52-37 70-130 28 69-14 64-51-9-41-76-1"
    fill="{fill}" stroke="#172033" stroke-width="12"/>
  <path d="M475 384q41 3 60 32-25 31-80 12" fill="#f8fafc"/>
  <ellipse cx="296" cy="357" rx="125" ry="87" fill="{fill}" stroke="#172033"
    stroke-width="12"/>
  <path d="M215 401v78m75-66v75m77-75v75m70-87v78" stroke="url(#pet-metal-{uid})"
    stroke-width="30" stroke-linecap="round"/>
  <path d="M185 486h60m20 4h58m23 0h58m10-4h60" stroke="{accent}"
    stroke-width="19" stroke-linecap="round"/>
  <path d="M182 201l42-115 71 94m72 0 70-94 43 115" fill="{accent}"
    stroke="#172033" stroke-width="12"/>
  <path d="M170 177q130-66 260 0l-25 173q-105 72-210 0z" fill="{fill}"
    stroke="#172033" stroke-width="12"/>
  <path d="M203 316q97 71 194 0-30 88-97 88t-97-88z" fill="#f8fafc" opacity=".92"/>
  <path d="M284 328h32l-16 18z" fill="#172033"/>
  <path d="M300 346q-27 26-54 3m54-3q27 26 54 3" fill="none" stroke="#172033"
    stroke-width="7" stroke-linecap="round"/>
  {_eye_pair(uid, 242, 358, 248, 16)}
</g>
"""


def _owl(uid: str, fill: str, accent: str) -> str:
    return f"""
<g data-pet-species="owl">
  <ellipse cx="300" cy="357" rx="122" ry="139" fill="{fill}" stroke="#172033"
    stroke-width="12"/>
  <path class="pet-wing" d="M203 304q-95 68-61 164 54-39 94-116m161-48q95 68 61 164-54-39-94-116"
    fill="{accent}" stroke="#172033" stroke-width="11"/>
  <path d="M243 469l-29 55m144-55 29 55" stroke="url(#pet-metal-{uid})"
    stroke-width="25"/>
  <path d="M182 525h72m92 0h72" stroke="{accent}" stroke-width="18"
    stroke-linecap="round"/>
  <path d="M197 197l39-81 38 72m52 0 38-72 39 81" fill="{accent}"
    stroke="#172033" stroke-width="11"/>
  <ellipse cx="300" cy="255" rx="129" ry="108" fill="{fill}" stroke="#172033"
    stroke-width="12"/>
  <circle cx="245" cy="254" r="55" fill="#f8fafc" opacity=".9"/>
  <circle cx="355" cy="254" r="55" fill="#f8fafc" opacity=".9"/>
  <path d="M281 304l19-31 20 31-20 23z" fill="#f59e0b" stroke="#172033"
    stroke-width="7"/>
  {_eye_pair(uid, 245, 355, 255, 19)}
</g>
"""


def _space_orb(uid: str, fill: str, accent: str) -> str:
    return f"""
<g data-pet-species="space_orb">
  <ellipse class="pet-hover-ring" cx="300" cy="447" rx="139" ry="27" fill="none"
    stroke="{accent}" stroke-width="12" filter="url(#pet-glow-{uid})"/>
  <path d="M186 310l-78 40 78 41m228-81 78 40-78 41" fill="{accent}"
    stroke="#172033" stroke-width="11"/>
  <circle cx="300" cy="307" r="151" fill="{fill}" stroke="#172033" stroke-width="13"/>
  <path d="M221 204q79-73 158 0" fill="none" stroke="#fff" stroke-width="17"
    opacity=".36" stroke-linecap="round"/>
  <path d="M300 155V85" stroke="url(#pet-metal-{uid})" stroke-width="15"/>
  <path class="pet-antenna" d="M300 85l-23-38h46z" fill="{accent}" stroke="#172033"
    stroke-width="8"/>
  <rect x="201" y="260" width="198" height="99" rx="42" fill="#0f172a"
    stroke="{accent}" stroke-width="10"/>
  {_eye_pair(uid, 252, 348, 309, 18)}
  <path d="M267 346q33 22 66 0" fill="none" stroke="{accent}" stroke-width="8"
    stroke-linecap="round"/>
</g>
"""


def _species_art(species: str, uid: str, fill: str, accent: str) -> str:
    renderers = {
        "dog": _dog,
        "cat": _cat,
        "dinosaur": _dinosaur,
        "dragon": _dragon,
        "penguin": _penguin,
        "fox": _fox,
        "owl": _owl,
        "space_orb": _space_orb,
    }
    return renderers.get(species, _dog)(uid, fill, accent)


def _accessory(name: str, accent: str) -> str:
    art = {
        "None": "",
        "Explorer Bandana": (
            f'<path d="M211 350q89 35 178 0l-13 43q-76 27-152 0z" fill="{accent}" '
            'stroke="#172033" stroke-width="9"/><path d="M377 377l70 73-54-8-15 46-37-94z" '
            f'fill="{accent}" stroke="#172033" stroke-width="8"/>'
        ),
        "Tiny Jetpack": (
            '<g class="pet-jetpack"><rect x="391" y="301" width="72" height="104" rx="24" '
            f'fill="{accent}" stroke="#172033" stroke-width="10"/><path d="M407 405l13 59 '
            '20-59" fill="#fb923c" stroke="#ef4444" stroke-width="8"/></g>'
        ),
        "Crystal Collar": (
            f'<path d="M215 361q85 40 170 0" fill="none" stroke="{accent}" stroke-width="18"/>'
            f'<path d="M300 365l25 39-25 39-25-39z" fill="{accent}" stroke="#fff" '
            'stroke-width="7" class="pet-crystal"/>'
        ),
        "Tool Harness": (
            '<path d="M209 331l181 90m-180 0 180-90" stroke="#475569" stroke-width="17"/>'
            f'<rect x="340" y="367" width="77" height="64" rx="14" fill="{accent}" '
            'stroke="#172033" stroke-width="8"/><path d="M361 388h35m-18-17v35" '
            'stroke="#fff" stroke-width="8"/>'
        ),
        "Royal Cape": (
            f'<path d="M196 267q104-55 208 0l62 230q-166 58-332 0z" fill="{accent}" '
            'opacity=".78" stroke="#172033" stroke-width="11" class="pet-cape"/>'
        ),
        "Star Antenna": (
            '<path d="M300 159V87" stroke="#94a3b8" stroke-width="13"/>'
            f'<path d="M300 38l13 29 32 4-24 21 7 32-28-16-28 16 7-32-24-21 '
            f'32-4z" fill="{accent}" stroke="#172033" stroke-width="7" '
            'class="pet-star"/>'
        ),
    }
    return f'<g data-pet-layer="accessory" data-accessory="{_esc(name)}">{art[name]}</g>'


def pet_html(
    pet: dict[str, Any],
    *,
    compact: bool = False,
    animation: str = "idle",
    scene: str = "workshop",
) -> str:
    data = normalize_pet_art(pet)
    uid = _uid(data)
    primary = PET_COLORS[data["color"]]
    accent = "#fde047" if data["color"] != "Sunny Gold" else "#67e8f9"
    valid_animation = animation if animation in PET_ANIMATIONS else "idle"
    valid_scene = scene if scene in PET_SCENES else "workshop"
    species_label = data["species"].replace("_", " ").title()
    compact_class = " compact" if compact else ""
    svg = f"""
<svg class="pet-art-svg" viewBox="0 0 600 570" role="img"
  aria-label="Robot pet {_esc(data['name'])}">
  {_defs(uid, primary)}
  <ellipse cx="300" cy="524" rx="190" ry="33" fill="#020617" opacity=".32"/>
  <g class="pet-character" filter="url(#pet-shadow-{uid})"
    style="transform-origin:300px 360px">
    {_species_art(data['species'], uid, f'url(#pet-body-{uid})', accent)}
    {_accessory(data['accessory'], accent)}
    <circle cx="300" cy="393" r="20" fill="{accent}" stroke="#172033"
      stroke-width="8" filter="url(#pet-glow-{uid})" data-pet-layer="energy-core"/>
    <path d="M227 178q73-38 146 0" fill="none" stroke="#fff" stroke-width="12"
      opacity=".22" stroke-linecap="round" data-pet-layer="highlight"/>
  </g>
</svg>
"""
    return f"""
<div class="pet-art-v2 scene-{valid_scene} anim-{valid_animation}{compact_class}"
  data-pet-id="{_esc(data['id'])}" data-pet-species="{_esc(data['species'])}"
  style="--pet-primary:{primary};--pet-accent:{accent};--pet-bond:{data['bond']}%">
  <div class="pet-ambient"><span></span><span></span><span></span></div>
  <div class="pet-stage-label">COMPANION SYSTEM · {species_label}</div>
  <div class="pet-canvas">{svg}</div>
  <div class="pet-profile">
    <strong>{_esc(data['name'])}</strong>
    <span>{_esc(data['personality'])}</span>
    <small>{_esc(data['accessory'])}</small>
    <div class="pet-bond-track"><i></i></div>
    <em>Bond {data['bond']}/100 · {data['tricks']} tricks</em>
  </div>
</div>
"""


def pet_card_html(pet: dict[str, Any]) -> str:
    return pet_html(pet, compact=True, scene="home")


PET_ART_CSS = r"""
<style>
.pet-art-v2{position:relative;min-height:520px;overflow:hidden;border:4px solid #263457;
border-radius:32px;background:radial-gradient(circle at 50% 31%,#ffffff5c,transparent 25%),
linear-gradient(155deg,#0f1835,#28467c 63%,#10172d);box-shadow:0 24px 58px #0f172a45,
inset 0 0 65px #ffffff12;isolation:isolate}
.pet-art-v2:before{content:'';position:absolute;inset:0;background-image:
linear-gradient(#ffffff10 1px,transparent 1px),linear-gradient(90deg,#ffffff10 1px,transparent 1px);
background-size:46px 46px;mask-image:linear-gradient(#000,transparent 78%)}
.pet-art-v2:after{content:'';position:absolute;left:18%;right:18%;bottom:66px;height:35px;
border-radius:50%;background:var(--pet-accent);filter:blur(17px);opacity:.42}
.pet-art-v2.scene-home{background:radial-gradient(circle at 50% 27%,#fff9,transparent 24%),
linear-gradient(155deg,#6750a4,#312e81 62%,#17172d)}
.pet-art-v2.scene-training{background:radial-gradient(circle at 50% 28%,#fef08a66,transparent 24%),
linear-gradient(155deg,#166534,#14532d 62%,#172033)}
.pet-art-v2.scene-space{background:radial-gradient(circle at 20% 20%,#f0abfc55,transparent 21%),
radial-gradient(circle at 78% 30%,#67e8f955,transparent 25%),linear-gradient(#020617,#172554)}
.pet-art-v2.scene-forest{background:radial-gradient(circle at 50% 24%,#fef3c766,transparent 24%),
linear-gradient(#34d399,#166534 64%,#3f2a22 65%)}
.pet-canvas{position:absolute;inset:16px 4% 70px;display:grid;place-items:center;z-index:3}
.pet-art-svg{width:min(100%,620px);height:100%;overflow:visible}
.pet-stage-label{position:absolute;top:18px;left:20px;z-index:6;color:#e0f2fe;background:#08132dcc;
border:1px solid #ffffff44;border-left:6px solid var(--pet-accent);border-radius:9px;padding:.55rem .75rem;
font:800 .72rem/1.2 monospace;letter-spacing:.12em}
.pet-ambient{position:absolute;inset:0;z-index:1}.pet-ambient span{position:absolute;width:9px;height:9px;
border-radius:50%;background:var(--pet-accent);box-shadow:0 0 16px var(--pet-accent);animation:pet-orbit 7s linear infinite}
.pet-ambient span:nth-child(1){left:14%;top:24%}.pet-ambient span:nth-child(2){right:13%;top:38%;animation-delay:-2s}
.pet-ambient span:nth-child(3){left:22%;bottom:25%;animation-delay:-4s}
.pet-profile{position:absolute;left:18px;right:18px;bottom:15px;z-index:7;display:grid;
grid-template-columns:auto 1fr;column-gap:.7rem;align-items:center;color:white;background:#071126dd;
border:1px solid #ffffff44;border-radius:16px;padding:.7rem .9rem;backdrop-filter:blur(8px)}
.pet-profile strong{font-size:1.2rem}.pet-profile span{font-weight:800;color:#e0f2fe}.pet-profile small{grid-column:1/3;color:#cbd5e1}
.pet-profile em{grid-column:1/3;font-size:.74rem;color:#e2e8f0;font-style:normal;margin-top:.25rem}
.pet-bond-track{grid-column:1/3;height:8px;border-radius:999px;background:#ffffff24;overflow:hidden;margin-top:.45rem}
.pet-bond-track i{display:block;width:var(--pet-bond);height:100%;background:linear-gradient(90deg,var(--pet-primary),
var(--pet-accent));box-shadow:0 0 12px var(--pet-accent)}
.pet-art-v2.compact{min-height:330px;border-radius:23px}.pet-art-v2.compact .pet-canvas{inset:-38px -9% 42px}
.pet-art-v2.compact .pet-stage-label,.pet-art-v2.compact .pet-profile span,
.pet-art-v2.compact .pet-profile small,.pet-art-v2.compact .pet-bond-track{display:none}
.pet-art-v2.compact .pet-profile{left:10px;right:10px;bottom:9px;display:flex;justify-content:space-between;padding:.5rem .7rem}
.pet-art-v2.compact .pet-profile strong{font-size:1rem}.pet-art-v2.compact .pet-profile em{font-size:.68rem;margin:0}
.pet-character{animation:pet-idle 3s ease-in-out infinite}.pet-eyes{transform-origin:center}
.anim-play .pet-character{animation:pet-play .7s ease-in-out 6}.anim-train .pet-character{animation:pet-train 1s ease-in-out 5}
.anim-groom .pet-character{animation:pet-groom 1.6s ease-in-out 3}.anim-explore .pet-character{animation:pet-explore 2.4s ease-in-out 2}
.anim-nap .pet-character{animation:pet-nap 3s ease-in-out infinite}.anim-nap .pet-eyes{animation:pet-blink 1s steps(2) infinite}
.anim-celebrate .pet-character{animation:pet-celebrate .8s ease-in-out 6}.anim-play .pet-tail,
.anim-celebrate .pet-tail{animation:pet-tail .28s ease-in-out infinite;transform-origin:410px 355px}
.anim-explore .pet-antenna,.anim-train .pet-star{animation:pet-scan .5s ease-in-out infinite}
.anim-play .pet-flame,.anim-explore .pet-jetpack{animation:pet-thrust .25s ease-in-out infinite}
@keyframes pet-idle{50%{transform:translateY(-8px) scale(1.012)}}
@keyframes pet-play{25%{transform:translate(-18px,-25px) rotate(-5deg)}75%{transform:translate(18px,-25px) rotate(5deg)}}
@keyframes pet-train{50%{transform:translateY(-42px) rotate(2deg)}}
@keyframes pet-groom{25%{filter:brightness(1.25)}50%{transform:rotate(-3deg)}75%{transform:rotate(3deg)}}
@keyframes pet-explore{0%{transform:translateX(-65px)}50%{transform:translateX(65px)}100%{transform:translateX(-65px)}}
@keyframes pet-nap{50%{transform:translateY(20px) rotate(3deg) scale(.97)}}
@keyframes pet-celebrate{25%{transform:translateY(-42px) rotate(-7deg)}75%{transform:translateY(-42px) rotate(7deg)}}
@keyframes pet-tail{50%{transform:rotate(12deg)}}@keyframes pet-blink{50%{transform:scaleY(.08)}}
@keyframes pet-scan{50%{filter:drop-shadow(0 0 18px var(--pet-accent)) brightness(1.5)}}
@keyframes pet-thrust{50%{transform:scaleY(1.35);filter:brightness(1.4)}}
@keyframes pet-orbit{50%{transform:translate(12px,-20px);opacity:.35}}
@media(max-width:700px){.pet-art-v2{min-height:455px;border-radius:23px}.pet-canvas{inset:-5px -13% 65px}
.pet-stage-label{font-size:.58rem;left:12px}.pet-profile{left:10px;right:10px;bottom:10px}.pet-art-v2.compact{min-height:300px}}
@media(prefers-reduced-motion:reduce){.pet-character,.pet-ambient span,.pet-tail,.pet-flame,
.pet-antenna,.pet-star,.pet-jetpack{animation:none!important}}
</style>
"""
