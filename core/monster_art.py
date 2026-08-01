"""Layered, responsive SVG art for customizable monsters in Streamlit."""

from __future__ import annotations

import hashlib
import html
from typing import Any

from core.monster import (
    MONSTER_COLORS,
    MONSTER_PARTS,
    MONSTER_SIZES,
    normalize_monster,
)


def _esc(value: Any) -> str:
    return html.escape(str(value), quote=True)


def _uid(data: dict[str, Any]) -> str:
    raw = f"{data.get('id')}:{data.get('name')}:{data.get('body')}:{data.get('pattern')}"
    return hashlib.sha1(raw.encode()).hexdigest()[:10]


def _pattern(pattern: str, uid: str, primary: str, secondary: str) -> str:
    patterns = {
        "solid": "",
        "spots": (
            f'<pattern id="pat-{uid}" width="42" height="42" patternUnits="userSpaceOnUse">'
            f'<rect width="42" height="42" fill="{primary}"/><circle cx="12" cy="12" r="7" fill="{secondary}" opacity=".8"/>'
            f'<circle cx="34" cy="32" r="5" fill="{secondary}" opacity=".55"/></pattern>'
        ),
        "stripes": (
            f'<pattern id="pat-{uid}" width="42" height="42" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">'
            f'<rect width="42" height="42" fill="{primary}"/><rect width="13" height="42" fill="{secondary}" opacity=".78"/></pattern>'
        ),
        "stars": (
            f'<pattern id="pat-{uid}" width="58" height="58" patternUnits="userSpaceOnUse">'
            f'<rect width="58" height="58" fill="{primary}"/><path d="M16 5l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="{secondary}" opacity=".8"/></pattern>'
        ),
        "scales": (
            f'<pattern id="pat-{uid}" width="38" height="28" patternUnits="userSpaceOnUse">'
            f'<rect width="38" height="28" fill="{primary}"/><path d="M0 0q19 28 38 0M-19 0q19 28 38 0M19 0q19 28 38 0" fill="none" stroke="{secondary}" stroke-width="5" opacity=".65"/></pattern>'
        ),
        "patches": (
            f'<pattern id="pat-{uid}" width="70" height="54" patternUnits="userSpaceOnUse">'
            f'<rect width="70" height="54" fill="{primary}"/><path d="M5 5h27v20H5zM38 29h27v20H38z" fill="{secondary}" opacity=".62"/></pattern>'
        ),
        "swirls": (
            f'<pattern id="pat-{uid}" width="60" height="60" patternUnits="userSpaceOnUse">'
            f'<rect width="60" height="60" fill="{primary}"/><path d="M10 30c0-20 35-20 35 2 0 15-25 17-25 3 0-8 12-9 12-2" fill="none" stroke="{secondary}" stroke-width="6" opacity=".7"/></pattern>'
        ),
        "lightning": (
            f'<pattern id="pat-{uid}" width="52" height="70" patternUnits="userSpaceOnUse">'
            f'<rect width="52" height="70" fill="{primary}"/><path d="M31 2L8 38h18l-8 30 27-42H27z" fill="{secondary}" opacity=".82"/></pattern>'
        ),
        "checker": (
            f'<pattern id="pat-{uid}" width="40" height="40" patternUnits="userSpaceOnUse">'
            f'<rect width="40" height="40" fill="{primary}"/><path d="M0 0h20v20H0zM20 20h20v20H20z" fill="{secondary}" opacity=".72"/></pattern>'
        ),
        "galaxy": (
            f'<radialGradient id="pat-{uid}" cx="30%" cy="25%"><stop offset="0" stop-color="#fff"/><stop offset=".03" stop-color="{secondary}"/><stop offset=".28" stop-color="{primary}"/><stop offset="1" stop-color="#111827"/></radialGradient>'
        ),
    }
    return patterns.get(pattern, patterns["spots"])


def _texture(texture: str, uid: str) -> str:
    values = {
        "smooth": "",
        "fluffy": '<feTurbulence baseFrequency=".025" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7"/>',
        "slimy": '<feGaussianBlur stdDeviation=".7"/><feSpecularLighting surfaceScale="5" specularConstant=".9" specularExponent="18" lighting-color="#fff" result="s"><feDistantLight azimuth="225" elevation="55"/></feSpecularLighting><feComposite in="s" in2="SourceGraphic" operator="in"/><feComposite in="SourceGraphic"/>',
        "rocky": '<feTurbulence baseFrequency=".08" numOctaves="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9"/>',
        "crystal": '<feSpecularLighting surfaceScale="8" specularConstant="1.3" specularExponent="28" lighting-color="#fff" result="s"><fePointLight x="120" y="40" z="160"/></feSpecularLighting><feComposite in="s" in2="SourceGraphic" operator="in"/><feComposite in="SourceGraphic"/>',
        "cloudy": '<feGaussianBlur stdDeviation="1.2"/>',
        "metallic": '<feSpecularLighting surfaceScale="5" specularConstant="1" specularExponent="24" lighting-color="#fff" result="s"><feDistantLight azimuth="225" elevation="45"/></feSpecularLighting><feComposite in="s" in2="SourceGraphic" operator="in"/><feComposite in="SourceGraphic"/>',
        "jelly": '<feGaussianBlur stdDeviation=".5"/><feColorMatrix values="1 0 0 0 .08 0 1 0 0 .08 0 0 1 0 .08 0 0 0 .88 0"/>',
        "leafy": '<feTurbulence baseFrequency=".04" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/>',
        "cosmic": '<feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>',
    }
    effect = values.get(texture, "")
    return f'<filter id="tex-{uid}" x="-30%" y="-30%" width="160%" height="160%">{effect}</filter>'


def _body(body: str, fill: str, uid: str) -> str:
    common = f'fill="{fill}" stroke="#202744" stroke-width="11" filter="url(#tex-{uid})"'
    shapes = {
        "round": f'<ellipse cx="350" cy="320" rx="145" ry="150" {common}/>',
        "fluffy": f'<path d="M213 345c-35-42-10-92 31-104-12-52 40-87 82-61 25-48 91-44 110 7 49-13 87 29 69 73 42 24 39 88 1 111 14 55-48 91-92 66-35 42-99 26-108-20-46 16-93-20-93-72z" {common}/>',
        "jelly": f'<path d="M225 430c12-41 24-61 19-112-8-86 42-151 106-151s114 65 106 151c-5 51 7 71 19 112-32-19-55 14-83 0-28-14-51 16-80 0-29-16-53 17-87 0z" {common}/>',
        "rock": f'<path d="M225 407l-35-95 47-91 93-49 102 24 74 80-15 111-80 67-111-3z" {common}/>',
        "cloud": f'<path d="M198 365c-18-52 20-100 69-99 3-58 75-90 116-47 39-34 102-8 105 46 55 2 77 66 44 105-30 36-80 31-111 19-48 36-102 25-128-2-36 20-78 13-95-22z" {common}/>',
        "crystal": f'<path d="M350 155l116 75 43 119-83 105H271l-80-105 43-119z" {common}/><path d="M350 155v299M234 230l192 224M466 230L271 454" fill="none" stroke="#fff" stroke-width="8" opacity=".35"/>',
        "dragon": f'<path d="M224 422c-42-87-21-192 42-235 73-50 180-11 213 67 23 55 11 137-28 183-59 36-161 38-227-15z" {common}/><path d="M229 246l-68 35 51 31M475 245l67 35-53 33" fill="{fill}" stroke="#202744" stroke-width="10"/>',
        "ghost": f'<path d="M224 443c4-60-18-104-7-170 13-79 66-126 133-126s120 47 133 126c11 66-11 110-7 170l-42-31-38 31-46-31-44 31-40-31z" {common}/>',
        "plant": f'<path d="M231 424c-27-83-5-181 57-224 47-32 107-30 153 5 57 44 73 140 34 219-63 35-180 34-244 0z" {common}/><path d="M350 185c-30-65 6-105 43-123 13 45-3 91-43 123zm-5-3c-52-40-91-17-110 18 42 21 86 12 110-18z" fill="#4ade80" stroke="#166534" stroke-width="8"/>',
        "robot": f'<rect x="215" y="180" width="270" height="270" rx="45" {common}/><path d="M245 230h210M245 400h210" stroke="#fff" stroke-width="8" opacity=".25"/>',
        "octopus": f'<path d="M228 352c-10-108 43-183 122-183s132 75 122 183c-5 47 30 69 46 99-39 7-60-8-78-31-9 29-33 43-59 21-17 31-49 31-65 0-27 21-51 8-60-21-18 23-39 38-78 31 17-31 55-54 50-99z" {common}/>',
        "star": f'<path d="M350 145l47 105 113-12-84 77 35 111-111-57-111 57 35-111-84-77 113 12z" {common}/>',
    }
    return f'<g data-monster-part="body" data-part-id="{_esc(body)}">{shapes.get(body, shapes["round"])}</g>'


def _eyes(eye_id: str, glow: str) -> str:
    pupil = '#172033'
    two = f'<ellipse cx="303" cy="296" rx="30" ry="37" fill="#fff"/><ellipse cx="397" cy="296" rx="30" ry="37" fill="#fff"/><circle cx="303" cy="303" r="15" fill="{glow}" stroke="{pupil}" stroke-width="7"/><circle cx="397" cy="303" r="15" fill="{glow}" stroke="{pupil}" stroke-width="7"/>'
    variants = {
        "two_round": two,
        "one_giant": f'<ellipse cx="350" cy="296" rx="62" ry="53" fill="#fff"/><circle cx="350" cy="303" r="27" fill="{glow}" stroke="{pupil}" stroke-width="9"/>',
        "three": f'<circle cx="287" cy="304" r="25" fill="#fff"/><circle cx="350" cy="278" r="25" fill="#fff"/><circle cx="413" cy="304" r="25" fill="#fff"/><circle cx="287" cy="307" r="10" fill="{glow}"/><circle cx="350" cy="281" r="10" fill="{glow}"/><circle cx="413" cy="307" r="10" fill="{glow}"/>',
        "six": ''.join(f'<circle cx="{265 + (i % 3) * 84}" cy="{280 + (i // 3) * 53}" r="18" fill="#fff" stroke="{glow}" stroke-width="7"/>' for i in range(6)),
        "star": f'<path d="M302 267l10 21 24 3-18 16 5 24-21-12-21 12 5-24-18-16 24-3zM398 267l10 21 24 3-18 16 5 24-21-12-21 12 5-24-18-16 24-3z" fill="{glow}" stroke="#fff" stroke-width="5"/>',
        "sleepy": f'<path d="M272 304q31 28 62 0M366 304q31 28 62 0" fill="none" stroke="{pupil}" stroke-width="12" stroke-linecap="round"/>',
        "heart": f'<path d="M302 333c-49-30-48-70-15-70 13 0 20 8 15 17-5-9 2-17 15-17 33 0 34 40-15 70zm96 0c-49-30-48-70-15-70 13 0 20 8 15 17-5-9 2-17 15-17 33 0 34 40-15 70z" fill="{glow}"/>',
        "rainbow": f'<path d="M272 314q30-46 60 0M368 314q30-46 60 0" fill="none" stroke="{glow}" stroke-width="15"/><circle cx="302" cy="314" r="8"/><circle cx="398" cy="314" r="8"/>',
        "robot": f'<rect x="265" y="273" width="170" height="58" rx="18" fill="#111827" stroke="{glow}" stroke-width="8"/><path d="M288 303h35m54 0h35" stroke="{glow}" stroke-width="13" stroke-linecap="round"/>',
        "spiral": f'<path d="M303 306c-38-36 37-63 35-12-2 41-66 38-67-5M397 306c38-36-37-63-35-12 2 41 66 38 67-5" fill="none" stroke="{glow}" stroke-width="9"/>',
        "cat": f'<path d="M268 316q34-48 68 0-34 22-68 0zm96 0q34-48 68 0-34 22-68 0z" fill="#fff" stroke="{pupil}" stroke-width="7"/><path d="M302 282v45M398 282v45" stroke="{glow}" stroke-width="8"/>',
        "invisible": f'<path d="M270 300q32-23 64 0M366 300q32-23 64 0" fill="none" stroke="{glow}" stroke-width="7" stroke-dasharray="8 12"/>',
    }
    return f'<g data-monster-part="eyes" data-part-id="{_esc(eye_id)}" class="monster-eyes">{variants.get(eye_id, two)}</g>'


def _mouth(mouth: str, secondary: str) -> str:
    variants = {
        "smile": '<path d="M302 357q48 53 96 0" fill="none" stroke="#202744" stroke-width="12" stroke-linecap="round"/>',
        "fangs": '<path d="M294 355q56 45 112 0" fill="#4c1d25" stroke="#202744" stroke-width="9"/><path d="M319 361l17 31 15-31m17 0 16 31 14-31" fill="#fff"/>',
        "grin": '<rect x="295" y="350" width="110" height="55" rx="25" fill="#fff" stroke="#202744" stroke-width="9"/><path d="M326 353v48m48-48v48" stroke="#202744" stroke-width="6"/>',
        "tiny": '<circle cx="350" cy="365" r="12" fill="#202744"/>',
        "beak": f'<path d="M318 354l32-20 34 20-34 24z" fill="{secondary}" stroke="#202744" stroke-width="8"/>',
        "zipper": '<path d="M300 367h100" stroke="#202744" stroke-width="10"/><path d="M312 354v26m18-26v26m18-26v26m18-26v26m18-26v26" stroke="#fff" stroke-width="5"/>',
        "speaker": '<rect x="310" y="345" width="80" height="48" rx="14" fill="#1f2937" stroke="#202744" stroke-width="8"/><path d="M325 358h50m-50 11h50m-50 11h50" stroke="#94a3b8" stroke-width="5"/>',
        "tongue": '<path d="M301 352q49 52 98 0" fill="#4c1d25" stroke="#202744" stroke-width="9"/><path d="M350 371q28 13 2 54-29-17-2-54z" fill="#fb7185" stroke="#202744" stroke-width="6"/>',
        "bubble": '<circle cx="350" cy="365" r="26" fill="#67e8f9" opacity=".7" stroke="#fff" stroke-width="7"/>',
        "mustache": '<path d="M350 363c-23-31-57-22-65 3 21 14 47 12 65-3 18 15 44 17 65 3-8-25-42-34-65-3z" fill="#3f2a22"/>',
        "robot": '<path d="M305 350h90v48h-90z" fill="#334155" stroke="#202744" stroke-width="8"/><path d="M320 365h60m-60 14h60" stroke="#22d3ee" stroke-width="6"/>',
        "none": "",
    }
    return f'<g data-monster-part="mouth" data-part-id="{_esc(mouth)}">{variants.get(mouth, variants["smile"])}</g>'


def _behind_parts(data: dict[str, Any], fill: str, secondary: str) -> str:
    wings = data["wings"]
    tail = data["tail"]
    wing_shapes = {
        "none": "",
        "tiny": f'<path d="M238 250q-82-55-84 34 48 16 86 4m220-38q82-55 84 34-48 16-86 4" fill="{secondary}" stroke="#202744" stroke-width="10"/>',
        "bat": f'<path d="M242 298L116 192l18 99-56 39 137 36m243-68 126-106-18 99 56 39-137 36" fill="{secondary}" stroke="#202744" stroke-width="11"/>',
        "bird": f'<path d="M243 300q-83-86-161-36 68 18 137 93m238-57q83-86 161-36-68 18-137 93" fill="{secondary}" stroke="#202744" stroke-width="11"/>',
        "dragon": f'<path d="M244 300L104 180l32 103-64 51 150 39m234-73 140-120-32 103 64 51-150 39" fill="{secondary}" stroke="#202744" stroke-width="11"/>',
        "butterfly": f'<path d="M243 310c-95-130-181-36-113 42-63 60 37 101 104 27m223-69c95-130 181-36 113 42 63 60-37 101-104 27" fill="{secondary}" opacity=".78" stroke="#202744" stroke-width="10"/>',
        "cloud": '<path d="M241 322c-45-66-131-24-104 42-43 46 31 94 92 45m230-87c45-66 131-24 104 42 43 46-31 94-92 45" fill="#e0f2fe" stroke="#202744" stroke-width="10"/>',
        "crystal": f'<path d="M245 315L127 204l18 151 81 45m229-85 118-111-18 151-81 45" fill="{secondary}" opacity=".72" stroke="#202744" stroke-width="10"/>',
        "robot": f'<path d="M245 300l-115-88-23 139 119 48m229-99 115-88 23 139-119 48" fill="#64748b" stroke="#202744" stroke-width="11"/><path d="M139 244l55 99m367-99-55 99" stroke="{secondary}" stroke-width="9"/>',
        "leaf": '<path d="M244 315Q111 181 95 336q78 39 136 68m225-89q133-134 149 21-78 39-136 68" fill="#4ade80" stroke="#166534" stroke-width="10"/>',
        "flame": '<path d="M244 323q-96-147-136 16 49-28 48 48 43-54 76 17m224-81q96-147 136 16-49-28-48 48-43-54-76 17" fill="#fb923c" stroke="#ef4444" stroke-width="9"/>',
        "star": f'<path d="M210 265l-76-47 12 84-69 49 87 10 29 82 34-78m263-100 76-47-12 84 69 49-87 10-29 82-34-78" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
    }
    tail_shapes = {
        "none": "",
        "tiny": f'<path d="M464 393q93 11 66 70" fill="none" stroke="{fill}" stroke-width="28" stroke-linecap="round"/>',
        "curly": f'<path d="M463 396q106-20 90 63-10 51-66 16 25-44 50-7" fill="none" stroke="{fill}" stroke-width="28" stroke-linecap="round"/>',
        "dragon": f'<path d="M459 396q116 25 141-47-4 89-93 125z" fill="{fill}" stroke="#202744" stroke-width="10"/>',
        "fish": f'<path d="M459 400q75 8 105 25l51-42-4 82-47-40" fill="{secondary}" stroke="#202744" stroke-width="10"/>',
        "flame": '<path d="M462 405q86-15 129 41-43-11-34 38-41-40-84-21z" fill="#fb923c" stroke="#ef4444" stroke-width="9"/>',
        "leaf": '<path d="M459 402q87-6 128 41-73 35-124-10z" fill="#4ade80" stroke="#166534" stroke-width="9"/>',
        "crystal": f'<path d="M459 400l100-35 38 53-91 47z" fill="{secondary}" opacity=".75" stroke="#202744" stroke-width="9"/>',
        "robot": f'<path d="M460 401q90 3 117 58" fill="none" stroke="#64748b" stroke-width="24"/><circle cx="582" cy="461" r="23" fill="{secondary}" stroke="#202744" stroke-width="8"/>',
        "star": f'<path d="M461 400q74 8 104 41l27-19-7 34 28 20-36 2-12 34-13-34-37-1 29-22z" fill="{secondary}" stroke="#202744" stroke-width="8"/>',
        "cloud": '<path d="M462 401q65-9 94 22 37-17 61 16-30 42-77 16-42 21-78-2z" fill="#e0f2fe" stroke="#202744" stroke-width="9"/>',
        "rainbow": '<path d="M460 401q102-14 151 58" fill="none" stroke="#fb7185" stroke-width="30"/><path d="M460 401q102-14 151 58" fill="none" stroke="#fde047" stroke-width="20"/><path d="M460 401q102-14 151 58" fill="none" stroke="#22d3ee" stroke-width="10"/>',
    }
    return (
        f'<g data-monster-part="wings" data-part-id="{_esc(wings)}">{wing_shapes.get(wings, "")}</g>'
        f'<g data-monster-part="tail" data-part-id="{_esc(tail)}">{tail_shapes.get(tail, "")}</g>'
    )


def _limbs(data: dict[str, Any], fill: str, secondary: str) -> str:
    arms = data["arms"]
    legs = data["legs"]
    arm_shapes = {
        "none": "",
        "tiny": f'<path d="M230 330q-62 23-56 70M470 330q62 23 56 70" fill="none" stroke="{fill}" stroke-width="31" stroke-linecap="round"/><circle cx="172" cy="405" r="20" fill="{secondary}"/><circle cx="528" cy="405" r="20" fill="{secondary}"/>',
        "long": f'<path d="M225 310q-95 50-84 145M475 310q95 50 84 145" fill="none" stroke="{fill}" stroke-width="29" stroke-linecap="round"/><circle cx="141" cy="459" r="24" fill="{secondary}"/><circle cx="559" cy="459" r="24" fill="{secondary}"/>',
        "strong": f'<path d="M229 303l-89 35-35 103 50 20 46-86 46-13m224-59 89 35 35 103-50 20-46-86-46-13" fill="{fill}" stroke="#202744" stroke-width="10"/><circle cx="117" cy="454" r="33" fill="{secondary}" stroke="#202744" stroke-width="9"/><circle cx="583" cy="454" r="33" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "tentacle": f'<path d="M229 319q-111 42-76 145 17 51-36 53m354-198q111 42 76 145-17 51 36 53" fill="none" stroke="{fill}" stroke-width="30" stroke-linecap="round"/>',
        "claws": f'<path d="M228 320l-93 62m337-62 93 62" stroke="{fill}" stroke-width="34"/><path d="M119 372l-25 31m44-15-10 40m453-56 25 31m-44-15 10 40" stroke="{secondary}" stroke-width="12" stroke-linecap="round"/>',
        "wings": f'<path d="M230 320l-124 65 56-9-20 48 95-54m233-50 124 65-56-9 20 48-95-54" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "robot": f'<path d="M230 309l-72 42-32 84 50 20 43-72 28-16m223-58 72 42 32 84-50 20-43-72-28-16" fill="#64748b" stroke="#202744" stroke-width="10"/><circle cx="159" cy="352" r="22" fill="{secondary}"/><circle cx="541" cy="352" r="22" fill="{secondary}"/>',
        "branch": '<path d="M230 321l-89 68-25-30m34 23-4 40m324-101 89 68 25-30m-34 23 4 40" fill="none" stroke="#7c4a22" stroke-width="24" stroke-linecap="round"/>',
        "flippers": f'<path d="M230 330q-91 36-112 106 77 11 128-68m224-38q91 36 112 106-77 11-128-68" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "spring": f'<path d="M232 324q-85 15-55 42t-45 44 42 45m294-131q85 15 55 42t45 44-42 45" fill="none" stroke="{secondary}" stroke-width="16"/>',
        "four": f'<path d="M232 305l-91 14-34 61m125-29-89 61-18 62m343-169 91 14 34 61m-125-29 89 61 18 62" fill="none" stroke="{fill}" stroke-width="25" stroke-linecap="round"/>',
    }
    leg_shapes = {
        "none": "",
        "tiny": f'<path d="M300 432v83m100-83v83" stroke="{fill}" stroke-width="36"/><ellipse cx="292" cy="524" rx="45" ry="22" fill="{secondary}" stroke="#202744" stroke-width="9"/><ellipse cx="408" cy="524" rx="45" ry="22" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "long": f'<path d="M296 426l-20 126m128-126 20 126" stroke="{fill}" stroke-width="31"/><ellipse cx="268" cy="558" rx="48" ry="20" fill="{secondary}"/><ellipse cx="432" cy="558" rx="48" ry="20" fill="{secondary}"/>',
        "bouncy": f'<path d="M295 429q-54 54 3 82t-7 54m114-136q54 54-3 82t7 54" fill="none" stroke="{secondary}" stroke-width="20"/><ellipse cx="284" cy="566" rx="45" ry="18" fill="{fill}"/><ellipse cx="416" cy="566" rx="45" ry="18" fill="{fill}"/>',
        "claws": f'<path d="M300 429l-18 109m118-109 18 109" stroke="{fill}" stroke-width="40"/><path d="M248 552l44-21 36 24m44 0 36-24 44 21" fill="none" stroke="{secondary}" stroke-width="15" stroke-linecap="round"/>',
        "hooves": f'<path d="M300 430v113m100-113v113" stroke="{fill}" stroke-width="36"/><path d="M265 543h70l-9 36h-52zm100 0h70l-9 36h-52z" fill="#3f2a22"/>',
        "tentacles": f'<path d="M275 427q-67 72-26 137m72-134q-28 80 10 137m94-140q67 72 26 137m-72-134q28 80-10 137" fill="none" stroke="{fill}" stroke-width="27" stroke-linecap="round"/>',
        "wheels": f'<path d="M290 425v76m120-76v76" stroke="#64748b" stroke-width="32"/><circle cx="287" cy="525" r="48" fill="#1f2937" stroke="{secondary}" stroke-width="13"/><circle cx="413" cy="525" r="48" fill="#1f2937" stroke="{secondary}" stroke-width="13"/>',
        "cloud": '<path d="M250 445c-38 0-54 49-22 69 21 14 42 2 55-2 34 27 91 19 111-10 36 28 95 7 88-35-5-29-34-37-61-25-37-27-89-24-120 4-15-7-33-10-51-1z" fill="#e0f2fe" stroke="#202744" stroke-width="9"/>',
        "roots": '<path d="M300 429q-39 88-92 132m94-88q-3 63 20 105m79-149q39 88 92 132m-94-88q3 63-20 105" fill="none" stroke="#7c4a22" stroke-width="22" stroke-linecap="round"/>',
        "robot": f'<path d="M297 425l-24 98 57 15 28-105m45-8 24 98-57 15-28-105" fill="#64748b" stroke="#202744" stroke-width="10"/><path d="M260 534h85v38h-85zm95 0h85v38h-85z" fill="{secondary}" stroke="#202744" stroke-width="8"/>',
        "four": f'<path d="M270 419l-65 126m116-115-28 135m137-146 65 126m-116-115 28 135" stroke="{fill}" stroke-width="28"/><path d="M180 554h55m35 15h55m140-15h55m-145 15h55" stroke="{secondary}" stroke-width="15" stroke-linecap="round"/>',
    }
    return (
        f'<g data-monster-part="arms" data-part-id="{_esc(arms)}">{arm_shapes.get(arms, arm_shapes["tiny"])}</g>'
        f'<g data-monster-part="legs" data-part-id="{_esc(legs)}">{leg_shapes.get(legs, leg_shapes["bouncy"])}</g>'
    )


def _head_parts(data: dict[str, Any], fill: str, secondary: str) -> str:
    horns = data["horns"]
    ears = data["ears"]
    horn_shapes = {
        "none": "",
        "tiny": f'<path d="M290 202l-25-62 59 52m86 10 25-62-59 52" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "curly": f'<path d="M292 210q-78-36-66-92 11-45 61-16-32 10-22 38 8 22 40 17m103 53q78-36 66-92-11-45-61-16 32 10 22 38-8 22-40 17" fill="none" stroke="{secondary}" stroke-width="22"/>',
        "unicorn": f'<path d="M350 196l-22-132 48 0z" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "antlers": '<path d="M295 205q-43-84-82-91m42 45-49 4m239 42q43-84 82-91m-42 45 49 4" fill="none" stroke="#7c4a22" stroke-width="16" stroke-linecap="round"/>',
        "crystal": f'<path d="M291 207l-42-99 76 64m84 35 42-99-76 64" fill="{secondary}" opacity=".75" stroke="#202744" stroke-width="9"/>',
        "dragon": f'<path d="M292 205l-57-89 80 47m93 42 57-89-80 47" fill="{secondary}" stroke="#202744" stroke-width="10"/>',
        "crown": f'<path d="M284 194l-20-82 63 42 23-83 23 83 63-42-20 82z" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "antenna": f'<path d="M305 198l-28-90m118 90 28-90" stroke="#64748b" stroke-width="12"/><circle cx="275" cy="99" r="18" fill="{secondary}"/><circle cx="425" cy="99" r="18" fill="{secondary}"/>',
        "flame": '<path d="M290 204q-53-83-4-114-9 45 28 62m96 52q53-83 4-114 9 45-28 62" fill="#fb923c" stroke="#ef4444" stroke-width="9"/>',
        "moon": f'<path d="M302 201q-58-66 3-119-17 57 36 79m57 40q58-66-3-119 17 57-36 79" fill="{secondary}" stroke="#202744" stroke-width="8"/>',
        "star": f'<path d="M289 199l-18-38-42-5 31-28-8-42 37 21 37-21-8 42 31 28-42 5zm122 0-18-38-42-5 31-28-8-42 37 21 37-21-8 42 31 28-42 5z" fill="{secondary}" stroke="#202744" stroke-width="7"/>',
    }
    ear_shapes = {
        "none": "",
        "round": f'<circle cx="220" cy="270" r="43" fill="{fill}" stroke="#202744" stroke-width="10"/><circle cx="480" cy="270" r="43" fill="{fill}" stroke="#202744" stroke-width="10"/>',
        "cat": f'<path d="M233 237l-65-68 17 105m282-37 65-68-17 105" fill="{fill}" stroke="#202744" stroke-width="10"/>',
        "bunny": f'<ellipse cx="235" cy="161" rx="35" ry="98" fill="{fill}" stroke="#202744" stroke-width="10"/><ellipse cx="465" cy="161" rx="35" ry="98" fill="{fill}" stroke="#202744" stroke-width="10"/>',
        "elf": f'<path d="M237 254L104 223l111 91m248-60 133-31-111 91" fill="{fill}" stroke="#202744" stroke-width="10"/>',
        "bat": f'<path d="M238 250l-102-64 24 98 66 29m236-63 102-64-24 98-66 29" fill="{secondary}" stroke="#202744" stroke-width="10"/>',
        "fin": f'<path d="M235 248l-92-12 76 70m246-58 92-12-76 70" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "leaf": '<path d="M237 251q-80-68-113-1 51 42 106 51m233-50q80-68 113-1-51 42-106 51" fill="#4ade80" stroke="#166534" stroke-width="9"/>',
        "robot": f'<rect x="178" y="231" width="70" height="76" rx="18" fill="#64748b" stroke="#202744" stroke-width="10"/><rect x="452" y="231" width="70" height="76" rx="18" fill="#64748b" stroke="#202744" stroke-width="10"/><circle cx="213" cy="269" r="18" fill="{secondary}"/><circle cx="487" cy="269" r="18" fill="{secondary}"/>',
        "dragon": f'<path d="M237 251l-93-60 30 92 54 35m235-67 93-60-30 92-54 35" fill="{secondary}" stroke="#202744" stroke-width="10"/>',
        "cloud": '<path d="M239 258c-44-42-105-10-94 39 15 40 69 36 91 5m225-44c44-42 105-10 94 39-15 40-69 36-91 5" fill="#e0f2fe" stroke="#202744" stroke-width="9"/>',
        "star": f'<path d="M221 235l15-32 35-4-26-24 7-35-31 18-31-18 7 35-26 24 35 4zm258 0-15-32-35-4 26-24-7-35 31 18 31-18-7 35 26 24-35 4z" fill="{secondary}" stroke="#202744" stroke-width="7"/>',
    }
    return (
        f'<g data-monster-part="horns" data-part-id="{_esc(horns)}">{horn_shapes.get(horns, "")}</g>'
        f'<g data-monster-part="ears" data-part-id="{_esc(ears)}">{ear_shapes.get(ears, "")}</g>'
    )


def _accessory(accessory: str, secondary: str) -> str:
    art = {
        "none": "",
        "bow": f'<path d="M350 194q-55-55-89-8 27 54 89 20 62 34 89-20-34-47-89 8z" fill="{secondary}" stroke="#202744" stroke-width="8"/><circle cx="350" cy="199" r="19" fill="#fff"/>',
        "hat": f'<path d="M272 207l22-83h112l22 83z" fill="{secondary}" stroke="#202744" stroke-width="9"/><ellipse cx="350" cy="207" rx="112" ry="23" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "crown": f'<path d="M284 205l-14-74 56 34 24-73 24 73 56-34-14 74z" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "glasses": f'<circle cx="302" cy="299" r="45" fill="none" stroke="#202744" stroke-width="11"/><circle cx="398" cy="299" r="45" fill="none" stroke="#202744" stroke-width="11"/><path d="M347 299h6" stroke="#202744" stroke-width="12"/>',
        "scarf": f'<path d="M252 410q98 40 196 0l-13 42q-85 35-170 0z" fill="{secondary}" stroke="#202744" stroke-width="9"/><path d="M421 438l43 91-45-15-25 37-13-109z" fill="{secondary}" stroke="#202744" stroke-width="8"/>',
        "backpack": f'<rect x="440" y="288" width="100" height="142" rx="24" fill="{secondary}" stroke="#202744" stroke-width="10"/><path d="M466 315h48v56h-48z" fill="#fff" opacity=".35"/>',
        "medal": f'<path d="M328 400l22 34 22-34" fill="none" stroke="{secondary}" stroke-width="13"/><circle cx="350" cy="450" r="31" fill="{secondary}" stroke="#202744" stroke-width="8"/><path d="M350 430l7 13 15 2-11 10 3 15-14-7-14 7 3-15-11-10 15-2z" fill="#fff"/>',
        "flower": '<path d="M285 210c-38-39-77 9-36 36-41 26-2 75 36 36 38 39 77-10 36-36 41-27 2-75-36-36z" fill="#f472b6" stroke="#202744" stroke-width="7"/><circle cx="285" cy="246" r="17" fill="#fde047"/>',
        "cape": f'<path d="M253 262q97-48 194 0l48 239q-145 52-290 0z" fill="{secondary}" opacity=".82" stroke="#202744" stroke-width="10"/>',
        "headphones": f'<path d="M239 286q6-136 111-136t111 136" fill="none" stroke="#202744" stroke-width="20"/><rect x="199" y="270" width="52" height="89" rx="20" fill="{secondary}" stroke="#202744" stroke-width="9"/><rect x="449" y="270" width="52" height="89" rx="20" fill="{secondary}" stroke="#202744" stroke-width="9"/>',
        "space": '<path d="M215 323q0-172 135-172t135 172" fill="#dbeafe" opacity=".4" stroke="#64748b" stroke-width="13"/><path d="M242 240q108-66 216 0" fill="none" stroke="#fff" stroke-width="10" opacity=".7"/>',
    }
    return f'<g data-monster-part="accessory" data-part-id="{_esc(accessory)}">{art.get(accessory, "")}</g>'


def monster_html(
    monster: dict[str, Any],
    animation: str = "idle",
    compact: bool = False,
    scene: str = "lab",
) -> str:
    data = normalize_monster(monster) or normalize_monster({})
    assert data is not None
    uid = _uid(data)
    primary = MONSTER_COLORS[data["color"]][1]
    secondary = MONSTER_COLORS[data["secondary_color"]][1]
    fill = primary if data["pattern"] == "solid" else f'url(#pat-{uid})'
    pattern = _pattern(data["pattern"], uid, primary, secondary)
    texture = _texture(data["texture"], uid)
    scale = MONSTER_SIZES[data["size"]] * (0.66 if compact else 1.0)
    glow = secondary if data["texture"] in {"crystal", "cosmic", "metallic"} else primary
    scene_class = scene if scene in {"lab", "forest", "castle", "space"} else "lab"
    valid_animation = animation if animation in {
        "idle", "bounce", "wiggle", "dance", "fly", "blink", "roar", "sleep", "celebrate"
    } else "idle"
    name = _esc(data["name"])
    summary = _esc(f"{MONSTER_PARTS['body'][data['body']]} · {data['personality']}")
    face = _esc(data["face"])
    svg = f'''<svg class="monster-svg" viewBox="0 0 700 620" role="img" aria-label="{name}">
      <defs>{pattern}{texture}<filter id="glow-{uid}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <ellipse cx="350" cy="560" rx="190" ry="35" fill="#111827" opacity=".28"/>
      <g class="monster-character" style="transform-origin:350px 350px">
        {_behind_parts(data, fill, secondary)}
        {_limbs(data, fill, secondary)}
        {_head_parts(data, fill, secondary)}
        {_body(data['body'], fill, uid)}
        <ellipse cx="315" cy="230" rx="65" ry="24" fill="#fff" opacity=".16"/>
        {_eyes(data['eyes'], secondary)}
        {_mouth(data['mouth'], secondary)}
        {_accessory(data['accessory'], secondary)}
        <circle cx="350" cy="408" r="22" fill="{secondary}" opacity=".75" filter="url(#glow-{uid})"/>
      </g>
    </svg>'''
    style = f"--monster-glow:{glow};--monster-scale:{scale};"
    compact_class = " compact" if compact else ""
    return (
        f'<div class="monster-art scene-{scene_class} anim-{valid_animation}{compact_class}" '
        f'data-monster-id="{_esc(data["id"])}" data-monster-body="{_esc(data["body"])}" style="{style}">'
        '<div class="monster-scene-stars">✦　·　✧　·　✦</div>'
        f'<div class="monster-canvas">{svg}</div>'
        f'<div class="monster-nameplate"><span>{face}</span><strong>{name}</strong><small>{summary}</small></div>'
        f'<div class="monster-power-chip">⚡ {_esc(data["power"])}</div>'
        '</div>'
    )


def monster_card_html(monster: dict[str, Any]) -> str:
    return monster_html(monster, compact=True, scene="lab")


MONSTER_ART_CSS = r"""
<style>
.monster-art{position:relative;min-height:630px;overflow:hidden;border-radius:34px;border:4px solid #242b4d;background:radial-gradient(circle at 50% 28%,color-mix(in srgb,var(--monster-glow) 35%,transparent),transparent 32%),linear-gradient(180deg,#181d3e,#293769 63%,#1a203d 64%);box-shadow:0 25px 65px #11182755,inset 0 0 60px #ffffff18;isolation:isolate}
.monster-art.scene-forest{background:radial-gradient(circle at 50% 25%,#fef9c355,transparent 28%),linear-gradient(#6ee7b7,#166534 66%,#3f2a22 67%)}
.monster-art.scene-castle{background:radial-gradient(circle at 50% 25%,#fef3c755,transparent 30%),linear-gradient(#7c3aed,#312e81 66%,#4c1d95 67%)}
.monster-art.scene-space{background:radial-gradient(circle at 20% 20%,#f0abfc55,transparent 22%),radial-gradient(circle at 75% 30%,#67e8f955,transparent 25%),linear-gradient(#020617,#172554 70%,#111827 71%)}
.monster-art:before{content:'';position:absolute;inset:0;background-image:linear-gradient(#ffffff0e 1px,transparent 1px),linear-gradient(90deg,#ffffff0e 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(#000,transparent 75%)}
.monster-art:after{content:'';position:absolute;left:18%;right:18%;bottom:6%;height:40px;border-radius:50%;background:var(--monster-glow);filter:blur(18px);opacity:.45;animation:monster-pulse 3s ease-in-out infinite}
.monster-canvas{position:absolute;inset:15px 3% 66px;display:grid;place-items:center;z-index:3;transform:scale(var(--monster-scale));transform-origin:center bottom;transition:transform .3s ease}
.monster-svg{width:min(100%,720px);height:100%;overflow:visible;filter:drop-shadow(0 18px 18px #11182766)}
.monster-scene-stars{position:absolute;top:24px;left:0;right:0;text-align:center;color:#fff;font-size:1.5rem;letter-spacing:1.2rem;text-shadow:0 0 14px var(--monster-glow);animation:monster-stars 8s linear infinite}
.monster-nameplate{position:absolute;left:22px;bottom:20px;z-index:6;color:#fff;background:#10162ee8;border:2px solid #ffffff44;border-left:8px solid var(--monster-glow);border-radius:14px;padding:10px 16px;box-shadow:0 8px 18px #0005}.monster-nameplate span{font-size:1.5rem;margin-right:8px}.monster-nameplate strong{font-size:1.25rem}.monster-nameplate small{display:block;color:#dbeafe;margin-top:3px}
.monster-power-chip{position:absolute;right:20px;bottom:24px;z-index:6;max-width:43%;padding:9px 14px;border-radius:999px;background:#fff;color:#202744;font-weight:800;box-shadow:0 7px 16px #11182755;border:3px solid var(--monster-glow)}
.monster-art.compact{min-height:360px;border-radius:24px}.monster-art.compact .monster-canvas{inset:-45px -10% 38px;transform:scale(calc(var(--monster-scale)*.62))}.monster-art.compact .monster-nameplate{left:12px;bottom:11px;padding:6px 10px}.monster-art.compact .monster-nameplate strong{font-size:1rem}.monster-art.compact .monster-nameplate small,.monster-art.compact .monster-power-chip,.monster-art.compact .monster-scene-stars{display:none}
.monster-eyes{filter:drop-shadow(0 0 7px var(--monster-glow))}
.anim-idle .monster-character{animation:monster-breathe 3s ease-in-out infinite}.anim-bounce .monster-character{animation:monster-bounce 1s ease-in-out infinite}.anim-wiggle .monster-character{animation:monster-wiggle .8s ease-in-out infinite}.anim-dance .monster-character{animation:monster-dance 1.2s ease-in-out infinite}.anim-fly .monster-character{animation:monster-fly 1.8s ease-in-out infinite}.anim-blink .monster-eyes{animation:monster-blink 1.2s steps(2) infinite}.anim-roar .monster-character{animation:monster-roar .8s ease-in-out infinite}.anim-sleep .monster-character{animation:monster-sleep 3s ease-in-out infinite}.anim-celebrate .monster-character{animation:monster-celebrate 1s ease-in-out infinite}
@keyframes monster-breathe{50%{transform:translateY(-7px) scale(1.015)}}@keyframes monster-bounce{50%{transform:translateY(-42px) scale(1.04,.96)}}@keyframes monster-wiggle{25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}@keyframes monster-dance{25%{transform:translateX(-25px) rotate(-5deg)}75%{transform:translateX(25px) rotate(5deg)}}@keyframes monster-fly{50%{transform:translateY(-65px) rotate(2deg)}}@keyframes monster-blink{50%{transform:scaleY(.08)}}@keyframes monster-roar{50%{transform:scale(1.08) translateY(-8px)}}@keyframes monster-sleep{50%{transform:translateY(18px) rotate(3deg) scale(.98)}}@keyframes monster-celebrate{25%{transform:translateY(-35px) rotate(-4deg)}50%{transform:translateY(0) rotate(4deg)}75%{transform:translateY(-25px)}}@keyframes monster-pulse{50%{opacity:.75;transform:scaleX(1.15)}}@keyframes monster-stars{to{transform:translateX(40px)}}
@media(max-width:700px){.monster-art{min-height:530px}.monster-canvas{inset:-20px -18% 58px;transform:scale(calc(var(--monster-scale)*.78))}.monster-power-chip{display:none}.monster-nameplate{left:12px;right:12px;bottom:12px}.monster-nameplate small{font-size:.68rem}.monster-art.compact{min-height:320px}}
</style>
"""
