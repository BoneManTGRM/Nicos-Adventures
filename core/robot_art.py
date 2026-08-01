"""High-detail, backward-compatible SVG robot art for the Streamlit app."""

from __future__ import annotations

import hashlib
import html
import re
from typing import Any

from core.catalog import (
    ROBOT_COLORS,
    ROBOT_EYE_GLOWS,
    ROBOT_FINISHES,
    ROBOT_PATTERNS,
    ROBOT_SIZES,
)

DEFAULT_PARTS: dict[str, str] = {
    "head": "box",
    "eyes": "round",
    "mouth": "smile",
    "antenna": "none",
    "ears": "none",
    "shoulders": "none",
    "arms": "grabber",
    "body": "classic_core",
    "chest": "none",
    "base": "bronze_wheels",
    "backpack": "none",
    "companion": "none",
    "power": "bubble",
    "hat": "none",
}

ROBOT_FRAMES: dict[str, str] = {
    "Scout Frame": "Light, fast reconnaissance silhouette",
    "Hero Frame": "Balanced champion silhouette",
    "Heavy Frame": "Wide armored fortress silhouette",
    "Aerial Frame": "Slim flight-focused silhouette",
    "Arcane Frame": "Crystal and energy-focused silhouette",
}

FRAME_KEYS: dict[str, str] = {
    "Scout Frame": "scout",
    "Hero Frame": "hero",
    "Heavy Frame": "heavy",
    "Aerial Frame": "aerial",
    "Arcane Frame": "arcane",
}

SCENE_LABELS: dict[str, str] = {
    "hangar": "MECHA ASSEMBLY BAY",
    "spotlight": "HERO DISPLAY PLATFORM",
    "moon": "LUNAR LAUNCH DECK",
    "workshop": "INVENTOR WORKSHOP",
    "forest": "FOREST TECH OUTPOST",
    "royal": "ROYAL MECHA HALL",
    "home": "ROBOT HOME",
}

ROBOT_ART_CSS = r"""
<style>
.mecha-art-card{
  --mecha-glow:#67e8f9;
  position:relative;
  min-height:570px;
  border-radius:30px;
  overflow:hidden;
  isolation:isolate;
  display:flex;
  align-items:center;
  justify-content:center;
  background:
    radial-gradient(circle at 50% 38%,color-mix(in srgb,var(--mecha-glow) 22%,transparent),transparent 32%),
    linear-gradient(145deg,#101a35,#1e315d 54%,#0a1025);
  border:4px solid #32436f;
  box-shadow:0 24px 60px rgba(7,13,34,.38),inset 0 0 70px rgba(103,232,249,.08);
}
.mecha-art-card.embedded{background:transparent!important;border:0;box-shadow:none;min-height:470px;overflow:visible}.mecha-art-card.embedded .mecha-scene-grid,.mecha-art-card.embedded .mecha-scene-rig,.mecha-art-card.embedded .mecha-scene-label,.mecha-art-card.embedded .mecha-platform,.mecha-art-card.embedded .mecha-profile,.mecha-art-card.embedded .mecha-companion{display:none}
.mecha-art-card[data-scene="spotlight"]{background:radial-gradient(circle at 50% 28%,#fff8,transparent 20%),linear-gradient(150deg,#291b52,#723f87 62%,#130d2b)}
.mecha-art-card[data-scene="moon"]{background:radial-gradient(circle at 76% 18%,#f8fafc 0 7%,transparent 7.5%),linear-gradient(160deg,#080f2b,#283d72 68%,#687897)}
.mecha-art-card[data-scene="workshop"]{background:linear-gradient(160deg,#4b2e23,#8a5934 56%,#1c243c)}
.mecha-art-card[data-scene="forest"]{background:radial-gradient(circle at 50% 12%,#fff9 0 4%,transparent 28%),linear-gradient(160deg,#193b34,#376d4c 58%,#152339)}
.mecha-art-card[data-scene="royal"]{background:radial-gradient(circle at 50% 18%,#fff7d6aa,transparent 27%),linear-gradient(145deg,#3c2552,#795279 55%,#1c1738)}
.mecha-scene-grid{position:absolute;inset:0;z-index:-2;opacity:.27;background-image:linear-gradient(rgba(134,239,255,.22) 1px,transparent 1px),linear-gradient(90deg,rgba(134,239,255,.22) 1px,transparent 1px);background-size:42px 42px;transform:perspective(500px) rotateX(58deg) scale(1.4);transform-origin:center bottom}
.mecha-scene-rig{position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,transparent 7%,#9eeaff30 7.4% 8%,transparent 8.4% 92%,#9eeaff30 92.4% 93%,transparent 93.4%),linear-gradient(180deg,transparent 12%,#9eeaff20 12.5% 13.2%,transparent 13.7%)}
.mecha-platform{position:absolute;left:18%;right:18%;bottom:54px;height:60px;border-radius:50%;background:radial-gradient(ellipse,var(--mecha-glow) 0 12%,#20345e 44%,#090f24 72%);box-shadow:0 0 30px color-mix(in srgb,var(--mecha-glow) 62%,transparent),inset 0 8px 15px #fff3}
.mecha-scene-label{position:absolute;top:17px;left:20px;color:#dffcff;font:800 .74rem/1.2 monospace;letter-spacing:.18em;background:#071127bb;border:1px solid #9eeaff66;border-left:5px solid var(--mecha-glow);border-radius:8px;padding:.6rem .8rem}
.mecha-art-shell{position:relative;width:min(100%,520px);height:535px;display:grid;place-items:center;z-index:2;transform-origin:center bottom}
.mecha-art-shell.compact{width:410px;height:470px}
.mecha-art-svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 18px 13px rgba(0,0,0,.38))}
.mecha-profile{position:absolute;left:18px;right:18px;bottom:10px;z-index:4;text-align:center;color:#e7f8ff;background:#08132edb;border:1px solid #a5f3fc55;border-radius:14px;padding:.55rem .7rem;font-size:.88rem;backdrop-filter:blur(8px)}
.mecha-profile strong{font-family:'Fredoka',sans-serif;font-size:1.08rem;color:white}
.mecha-companion{position:absolute;right:9%;top:19%;z-index:5;width:54px;height:54px;border:3px solid #e6fbff;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#fff,var(--mecha-glow) 28%,#152244 70%);box-shadow:0 0 24px var(--mecha-glow);font-weight:900;color:#0e1834;animation:mecha-drone 3s ease-in-out infinite}
.sidekick-mecha{position:relative;overflow:hidden;border:2px solid #b7d9ff;border-radius:20px;padding:.8rem;text-align:center;background:radial-gradient(circle at 50% 22%,#fff,#e8f5ff 52%,#dce8ff);box-shadow:0 10px 24px rgba(38,57,110,.12);margin-bottom:.8rem}
.sidekick-mecha svg{width:110px;height:125px;filter:drop-shadow(0 8px 6px #26355255)}
.sidekick-mecha strong{display:block;color:#1f2a4c;font-family:'Fredoka',sans-serif}
.mecha-art-shell.pose-wave .arm-left{animation:mecha-wave .75s ease-in-out 4;transform-origin:188px 276px}
.mecha-art-shell.pose-blink .visor{animation:mecha-blink .8s step-end 4}
.mecha-art-shell.pose-spin{animation:mecha-spin 1.1s ease-in-out 2}
.mecha-art-shell.pose-walk .leg-left{animation:mecha-step-left .65s ease-in-out 4;transform-origin:226px 448px}.mecha-art-shell.pose-walk .leg-right{animation:mecha-step-right .65s ease-in-out 4;transform-origin:294px 448px}
.mecha-art-shell.pose-fly{animation:mecha-fly 2.2s ease-in-out 1}.mecha-art-shell.pose-fly .thruster-flame{opacity:1;animation:mecha-flame .18s ease-in-out infinite}
.mecha-art-shell.pose-dance{animation:mecha-dance .55s ease-in-out 6}
.mecha-art-shell.pose-flash .reactor,.mecha-art-shell.pose-celebrate .reactor{animation:mecha-core .42s ease-in-out 8}
.mecha-art-shell.pose-bounce{animation:mecha-bounce .65s ease-in-out 5}
.mecha-art-shell.pose-moonwalk{animation:mecha-moonwalk 2.8s ease-in-out 1}
.mecha-art-shell.pose-celebrate{animation:mecha-celebrate .7s ease-in-out 4}
.mecha-art-shell.pose-charge .energy-ring{animation:mecha-charge .65s ease-in-out 6;transform-origin:260px 349px}
.mecha-art-shell.pose-sleep .visor{opacity:.35;transform:scaleY(.18);transform-origin:center}
@keyframes mecha-drone{50%{transform:translateY(-13px) rotate(5deg)}}
@keyframes mecha-wave{50%{transform:rotate(-52deg) translate(-5px,-4px)}}
@keyframes mecha-blink{50%{transform:scaleY(.08);transform-origin:center}}
@keyframes mecha-spin{to{transform:rotate(360deg)}}
@keyframes mecha-step-left{50%{transform:rotate(9deg) translateY(-9px)}}@keyframes mecha-step-right{50%{transform:rotate(-9deg) translateY(9px)}}
@keyframes mecha-fly{45%{transform:translateY(-86px) rotate(5deg)}}
@keyframes mecha-flame{50%{transform:scaleY(1.35);filter:brightness(1.5)}}
@keyframes mecha-dance{25%{transform:rotate(-8deg) translateY(-10px)}75%{transform:rotate(8deg) translateY(-10px)}}
@keyframes mecha-core{50%{filter:drop-shadow(0 0 18px var(--mecha-glow)) brightness(1.8);transform:scale(1.18)}}
@keyframes mecha-bounce{50%{transform:translateY(-55px) scaleX(.95)}}
@keyframes mecha-moonwalk{0%{transform:translateX(120px)}100%{transform:translateX(-120px)}}
@keyframes mecha-celebrate{25%{transform:translateY(-25px) rotate(-6deg)}75%{transform:translateY(-25px) rotate(6deg)}}
@keyframes mecha-charge{50%{transform:scale(1.35);opacity:.25}}
@media(max-width:700px){.mecha-art-card{min-height:500px;border-radius:22px}.mecha-art-shell{width:390px;height:465px;transform:scale(.86)}.mecha-art-shell.compact{transform:scale(.72)}.mecha-platform{left:8%;right:8%;bottom:42px}.mecha-scene-label{font-size:.62rem}.mecha-profile{font-size:.75rem}}
</style>
"""


def _esc(value: Any) -> str:
    return html.escape(str(value), quote=True)


def _slug(value: Any) -> str:
    return re.sub(r"[^a-z0-9_-]+", "-", str(value).casefold()).strip("-")[:48] or "part"


def _stable_number(value: Any, modulus: int) -> int:
    digest = hashlib.sha256(str(value).encode("utf-8")).digest()
    return int.from_bytes(digest[:4], "big") % modulus


def _choice(value: Any, catalog: dict[str, Any], fallback: str) -> str:
    text = str(value)
    return text if text in catalog else fallback


def infer_frame(robot: dict[str, Any]) -> str:
    """Infer a frame for legacy robots that predate explicit frame selection."""
    selected = str(robot.get("frame", ""))
    if selected in ROBOT_FRAMES:
        return selected
    tokens = " ".join(
        str(robot.get(key, "")).casefold()
        for key in ("head", "body", "base", "backpack", "shoulders", "arms", "power")
    )
    if any(word in tokens for word in ("titan", "tank", "siege", "castle", "giant", "heavy")):
        return "Heavy Frame"
    if any(word in tokens for word in ("aero", "wing", "rocket", "hover", "jet", "cloud", "flight")):
        return "Aerial Frame"
    if any(word in tokens for word in ("crystal", "galaxy", "portal", "royal", "dragon", "star_burst")):
        return "Arcane Frame"
    if any(word in tokens for word in ("stealth", "scout", "tool", "skate", "bouncy", "ranger")):
        return "Scout Frame"
    return "Hero Frame"


def normalize_robot_art(robot: dict[str, Any]) -> dict[str, Any]:
    """Return a safe visual projection without mutating the saved robot."""
    normalized = dict(robot) if isinstance(robot, dict) else {}
    for category, fallback in DEFAULT_PARTS.items():
        normalized[category] = _slug(normalized.get(category, fallback))
    normalized["frame"] = infer_frame(normalized)
    normalized["color"] = _choice(normalized.get("color"), ROBOT_COLORS, "Electric Blue")
    normalized["secondary_color"] = _choice(
        normalized.get("secondary_color"), ROBOT_COLORS, "Sunny Yellow"
    )
    normalized["finish"] = _choice(normalized.get("finish"), ROBOT_FINISHES, "Matte")
    normalized["pattern"] = _choice(normalized.get("pattern"), ROBOT_PATTERNS, "Solid")
    normalized["eye_glow"] = _choice(normalized.get("eye_glow"), ROBOT_EYE_GLOWS, "Aqua")
    normalized["size"] = _choice(normalized.get("size"), ROBOT_SIZES, "Standard")
    normalized["name"] = str(normalized.get("name", "BuddyBot"))[:24]
    normalized["personality"] = str(normalized.get("personality", "Curious Explorer"))[:50]
    normalized["voice"] = str(normalized.get("voice", "Classic Beep"))[:40]
    normalized["catchphrase"] = str(normalized.get("catchphrase", ""))[:90]
    return normalized


def _frame_geometry(frame: str) -> dict[str, float]:
    specs: dict[str, dict[str, float]] = {
        "Scout Frame": {
            "torso_left": 184, "torso_top": 260, "torso_width": 152, "torso_height": 158,
            "shoulder": 42, "arm_width": 34, "leg_width": 38, "head_width": 132,
            "head_height": 100, "head_y": 133,
        },
        "Hero Frame": {
            "torso_left": 169, "torso_top": 250, "torso_width": 182, "torso_height": 174,
            "shoulder": 55, "arm_width": 42, "leg_width": 47, "head_width": 145,
            "head_height": 108, "head_y": 126,
        },
        "Heavy Frame": {
            "torso_left": 143, "torso_top": 238, "torso_width": 234, "torso_height": 196,
            "shoulder": 74, "arm_width": 57, "leg_width": 62, "head_width": 158,
            "head_height": 112, "head_y": 119,
        },
        "Aerial Frame": {
            "torso_left": 179, "torso_top": 246, "torso_width": 162, "torso_height": 168,
            "shoulder": 48, "arm_width": 36, "leg_width": 39, "head_width": 138,
            "head_height": 102, "head_y": 123,
        },
        "Arcane Frame": {
            "torso_left": 163, "torso_top": 244, "torso_width": 194, "torso_height": 184,
            "shoulder": 60, "arm_width": 44, "leg_width": 45, "head_width": 150,
            "head_height": 110, "head_y": 118,
        },
    }
    return specs.get(frame, specs["Hero Frame"])


def _armor_pattern(pattern: str, suffix: str, primary: str, secondary: str) -> str:
    if pattern in {"Racing Stripe", "Lightning", "Two-Tone"}:
        return (
            f'<linearGradient id="armor-{suffix}" x1="0" x2="1">'
            f'<stop offset="0" stop-color="{primary}"/><stop offset=".42" stop-color="{primary}"/>'
            f'<stop offset=".43" stop-color="{secondary}"/><stop offset=".61" stop-color="{secondary}"/>'
            f'<stop offset=".62" stop-color="{primary}"/><stop offset="1" stop-color="{primary}"/>'
            "</linearGradient>"
        )
    if pattern in {"Circuit Lines", "Checkerboard", "Stars", "Galaxy"}:
        return (
            f'<pattern id="armor-{suffix}" width="24" height="24" patternUnits="userSpaceOnUse">'
            f'<rect width="24" height="24" fill="{primary}"/>'
            f'<path d="M0 12H24M12 0V24" stroke="{secondary}" stroke-width="2" opacity=".55"/>'
            f'<circle cx="4" cy="4" r="1.8" fill="#fff" opacity=".75"/>'
            "</pattern>"
        )
    if pattern in {"Camouflage", "Polka Dots", "Hearts"}:
        return (
            f'<pattern id="armor-{suffix}" width="28" height="28" patternUnits="userSpaceOnUse">'
            f'<rect width="28" height="28" fill="{primary}"/>'
            f'<circle cx="8" cy="9" r="5" fill="{secondary}" opacity=".68"/>'
            f'<circle cx="23" cy="22" r="4" fill="{secondary}" opacity=".42"/>'
            "</pattern>"
        )
    if pattern == "Flames":
        return (
            f'<linearGradient id="armor-{suffix}" x1="0" y1="1" x2="0" y2="0">'
            f'<stop offset="0" stop-color="{secondary}"/><stop offset=".26" stop-color="#fbbf24"/>'
            f'<stop offset=".48" stop-color="{primary}"/><stop offset="1" stop-color="{primary}"/>'
            "</linearGradient>"
        )
    return (
        f'<linearGradient id="armor-{suffix}" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0" stop-color="{primary}"/><stop offset=".52" stop-color="{primary}"/>'
        f'<stop offset="1" stop-color="{secondary}" stop-opacity=".72"/></linearGradient>'
    )


def _finish_filter(finish: str, suffix: str) -> str:
    shine = {
        "Matte": ".08", "Glossy": ".38", "Chrome": ".62", "Brushed Metal": ".28",
        "Neon Glow": ".32", "Holographic": ".45", "Candy": ".50", "Ice": ".55",
        "Lava": ".26", "Woodland": ".16", "Stealth": ".06", "Rainbow": ".44",
    }.get(finish, ".18")
    return (
        f'<linearGradient id="shine-{suffix}" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0" stop-color="#fff" stop-opacity="{shine}"/>'
        '<stop offset=".42" stop-color="#fff" stop-opacity=".02"/>'
        '<stop offset="1" stop-color="#020617" stop-opacity=".34"/></linearGradient>'
    )


def _head_path(frame: str, head_id: str, x: float, y: float, width: float, height: float) -> str:
    variant = _stable_number(head_id, 5)
    if frame == "Arcane Frame" or variant == 4:
        return f"M{x + width * .5},{y} L{x + width},{y + height * .28} L{x + width * .84},{y + height} L{x + width * .16},{y + height} L{x},{y + height * .28} Z"
    if frame == "Aerial Frame" or variant == 3:
        return f"M{x + width * .5},{y} L{x + width},{y + height * .36} L{x + width * .76},{y + height} L{x + width * .24},{y + height} L{x},{y + height * .36} Z"
    if frame == "Heavy Frame" or variant == 2:
        return f"M{x + width * .12},{y} H{x + width * .88} L{x + width},{y + height * .34} L{x + width * .88},{y + height} H{x + width * .12} L{x},{y + height * .34} Z"
    if variant == 1:
        return f"M{x + width * .22},{y} H{x + width * .78} Q{x + width},{y} {x + width},{y + height * .34} V{y + height * .72} Q{x + width},{y + height} {x + width * .72},{y + height} H{x + width * .28} Q{x},{y + height} {x},{y + height * .72} V{y + height * .34} Q{x},{y} {x + width * .22},{y} Z"
    return f"M{x + width * .12},{y} H{x + width * .88} Q{x + width},{y} {x + width},{y + height * .2} V{y + height * .78} Q{x + width},{y + height} {x + width * .78},{y + height} H{x + width * .22} Q{x},{y + height} {x},{y + height * .78} V{y + height * .2} Q{x},{y} {x + width * .12},{y} Z"


def _emblem_path(chest_id: str) -> str:
    paths = (
        "M260 315l10 20 22 3-16 16 4 23-20-11-20 11 4-23-16-16 22-3z",
        "M260 315l26 20-10 31h-32l-10-31z",
        "M260 315l28 11-5 31-23 20-23-20-5-31z",
        "M260 315l17 17-17 35-17-35z",
        "M260 316a25 25 0 1 1 0 50a25 25 0 1 1 0-50z",
    )
    return paths[_stable_number(chest_id, len(paths))]


def _tool_art(arms_id: str, side: str, glow: str) -> str:
    variant = _stable_number(arms_id + side, 5)
    sign = -1 if side == "left" else 1
    x = 118 if side == "left" else 402
    if variant == 0:
        return f'<path d="M{x} 350 l{sign * 35} -14 l{sign * 5} 18 l{-sign * 35} 14z" fill="{glow}" opacity=".85"/>'
    if variant == 1:
        return f'<circle cx="{x}" cy="354" r="18" fill="none" stroke="{glow}" stroke-width="7"/><path d="M{x-10} 354h20" stroke="#fff" stroke-width="4"/>'
    if variant == 2:
        return f'<path d="M{x-18} 340h36v32h-36z" fill="#273858" stroke="{glow}" stroke-width="4"/><path d="M{x-10} 350h20M{x} 344v20" stroke="#fff" stroke-width="3"/>'
    if variant == 3:
        return f'<path d="M{x} 326l{sign*15} 28-15 28-{sign*15}-28z" fill="{glow}" opacity=".8"/><circle cx="{x}" cy="354" r="8" fill="#fff"/>'
    return f'<path d="M{x} 326l{sign*44} 28-44 28z" fill="{glow}" opacity=".74"/><path d="M{x} 340l{sign*25} 14-25 14" fill="none" stroke="#fff" stroke-width="4"/>'


def _backpack_art(backpack_id: str, frame: str, armor: str, secondary: str, glow: str) -> str:
    if backpack_id == "none":
        return ""
    wingish = frame == "Aerial Frame" or any(word in backpack_id for word in ("wing", "jet", "rocket", "aero", "halo", "moon"))
    if wingish:
        return '<g class="backpack-layer" opacity=".96">' + f'<path d="M198 264L76 186l48 122 86 45z" fill="{secondary}" stroke="#111b36" stroke-width="8"/><path d="M322 264l122-78-48 122-86 45z" fill="{secondary}" stroke="#111b36" stroke-width="8"/><path d="M188 296L96 274l82 72zM332 296l92-22-82 72z" fill="{armor}" stroke="#111b36" stroke-width="6"/><path class="thruster-flame" d="M177 343l-18 61 36-49zM343 343l18 61-36-49z" fill="{glow}" opacity=".72"/></g>'
    return '<g class="backpack-layer">' + f'<rect x="166" y="268" width="188" height="116" rx="24" fill="#243554" stroke="#10182f" stroke-width="9"/><rect x="178" y="284" width="54" height="76" rx="14" fill="{secondary}"/><rect x="288" y="284" width="54" height="76" rx="14" fill="{secondary}"/><circle cx="205" cy="323" r="14" fill="{glow}"/><circle cx="315" cy="323" r="14" fill="{glow}"/></g>'


def robot_svg(robot: dict[str, Any], animation: str = "idle") -> str:
    """Compose one detailed SVG robot from legacy-compatible part selections."""
    data = normalize_robot_art(robot)
    frame = str(data["frame"])
    geometry = _frame_geometry(frame)
    primary = ROBOT_COLORS[str(data["color"])]
    secondary = ROBOT_COLORS[str(data["secondary_color"])]
    glow = ROBOT_EYE_GLOWS[str(data["eye_glow"])]
    suffix = hashlib.sha1(f"{data.get('id','')}:{data['name']}:{data['head']}:{data['body']}".encode()).hexdigest()[:10]
    pattern = _armor_pattern(str(data["pattern"]), suffix, primary, secondary)
    shine = _finish_filter(str(data["finish"]), suffix)
    armor = f"url(#armor-{suffix})"
    torso_x = geometry["torso_left"]
    torso_y = geometry["torso_top"]
    torso_w = geometry["torso_width"]
    torso_h = geometry["torso_height"]
    head_w = geometry["head_width"]
    head_h = geometry["head_height"]
    head_x = 260 - head_w / 2
    head_y = geometry["head_y"]
    shoulder = geometry["shoulder"]
    arm_w = geometry["arm_width"]
    leg_w = geometry["leg_width"]
    frame_key = FRAME_KEYS.get(frame, "hero")
    head_path = _head_path(frame, str(data["head"]), head_x, head_y, head_w, head_h)
    backpack = _backpack_art(str(data["backpack"]), frame, armor, secondary, glow)
    crest_variant = _stable_number(str(data["antenna"]) + str(data["hat"]), 4)
    crest = f'<path d="M260 {head_y-8}l-34-68 34 28 34-28z" fill="{secondary}" stroke="#10182f" stroke-width="8"/>' if str(data["antenna"]) != "none" or str(data["hat"]) != "none" else ""
    if crest_variant == 1 and crest:
        crest += f'<circle cx="260" cy="{head_y-50}" r="11" fill="{glow}" filter="url(#glow-{suffix})"/>'
    elif crest_variant == 2 and crest:
        crest += f'<path d="M227 {head_y-35}l-45-22 30 48zM293 {head_y-35}l45-22-30 48z" fill="{secondary}" stroke="#10182f" stroke-width="6"/>'
    elif crest_variant == 3 and crest:
        crest += f'<path d="M260 {head_y-48}v-38" stroke="{glow}" stroke-width="9"/><circle cx="260" cy="{head_y-93}" r="10" fill="{glow}"/>'
    ears = ""
    if str(data["ears"]) != "none":
        ears = f'<path d="M{head_x+3} {head_y+26}l-34 20 34 26zM{head_x+head_w-3} {head_y+26}l34 20-34 26z" fill="{secondary}" stroke="#10182f" stroke-width="7"/>'
    shoulder_y = torso_y + 20
    left_shoulder_x = torso_x - shoulder * .72
    right_shoulder_x = torso_x + torso_w - shoulder * .28
    shoulder_path_l = f"M{left_shoulder_x+shoulder},{shoulder_y} L{left_shoulder_x},{shoulder_y+shoulder*.25} L{left_shoulder_x+shoulder*.15},{shoulder_y+shoulder} L{left_shoulder_x+shoulder*.92},{shoulder_y+shoulder*.78} Z"
    shoulder_path_r = f"M{right_shoulder_x},{shoulder_y} L{right_shoulder_x+shoulder},{shoulder_y+shoulder*.25} L{right_shoulder_x+shoulder*.85},{shoulder_y+shoulder} L{right_shoulder_x+shoulder*.08},{shoulder_y+shoulder*.78} Z"
    left_arm_x = torso_x - arm_w - 30
    right_arm_x = torso_x + torso_w + 30
    arm_y = torso_y + 55
    arm_h = 154 if frame != "Heavy Frame" else 170
    left_leg_x = 260 - 20 - leg_w
    right_leg_x = 280
    leg_y = torso_y + torso_h - 8
    leg_h = 166 if frame != "Scout Frame" else 151
    visor_variant = _stable_number(str(data["eyes"]), 4)
    visor_shapes = (
        f'<rect class="visor" x="{head_x+25}" y="{head_y+38}" width="{head_w-50}" height="28" rx="13"/>',
        f'<path class="visor" d="M{head_x+20} {head_y+43}L{head_x+head_w-20} {head_y+43}L{head_x+head_w-35} {head_y+70}H{head_x+35}Z"/>',
        f'<path class="visor" d="M{head_x+22} {head_y+44}L{head_x+head_w/2} {head_y+65}L{head_x+head_w-22} {head_y+44}V{head_y+70}H{head_x+22}Z"/>',
        f'<g class="visor"><circle cx="{head_x+head_w*.35}" cy="{head_y+55}" r="13"/><circle cx="{head_x+head_w*.65}" cy="{head_y+55}" r="13"/></g>',
    )
    visor = visor_shapes[visor_variant]
    mouth_variant = _stable_number(str(data["mouth"]), 4)
    mouth_shapes = (
        f'<path d="M{head_x+head_w*.36} {head_y+83}Q260 {head_y+94} {head_x+head_w*.64} {head_y+83}" fill="none" stroke="#cbd5e1" stroke-width="5"/>',
        f'<rect x="{head_x+head_w*.36}" y="{head_y+80}" width="{head_w*.28}" height="12" rx="4" fill="#273858"/><path d="M{head_x+head_w*.39} {head_y+84}h{head_w*.22}" stroke="#94a3b8" stroke-width="3"/>',
        f'<path d="M{head_x+head_w*.35} {head_y+82}h{head_w*.3}" stroke="#dbeafe" stroke-width="6" stroke-dasharray="7 5"/>',
        f'<circle cx="260" cy="{head_y+86}" r="10" fill="#273858" stroke="#dbeafe" stroke-width="3"/>',
    )
    mouth = mouth_shapes[mouth_variant]
    reactor_variant = _stable_number(str(data["power"]) + str(data["body"]), 4)
    reactor_shapes = (
        f'<circle class="reactor" cx="260" cy="{torso_y+torso_h*.52}" r="35" fill="#0a1630" stroke="{glow}" stroke-width="8"/><circle cx="260" cy="{torso_y+torso_h*.52}" r="18" fill="{glow}"/>',
        f'<path class="reactor" d="M260 {torso_y+torso_h*.3}l31 {torso_h*.22}-31 {torso_h*.22}-31-{torso_h*.22}z" fill="{glow}" stroke="#0a1630" stroke-width="8"/>',
        f'<rect class="reactor" x="230" y="{torso_y+torso_h*.34}" width="60" height="60" rx="16" fill="{glow}" stroke="#0a1630" stroke-width="8"/>',
        f'<path class="reactor" d="M260 {torso_y+torso_h*.29}l37 37-37 37-37-37z" fill="{glow}" stroke="#0a1630" stroke-width="8"/>',
    )
    reactor = reactor_shapes[reactor_variant]
    emblem = "" if str(data["chest"]) == "none" else f'<path d="{_emblem_path(str(data["chest"]))}" transform="translate(0 {torso_y-250}) scale(.72)" fill="{secondary}" stroke="#fff" stroke-width="3" opacity=".92"/>'
    companion = "" if str(data["companion"]) == "none" else f'<g class="mini-drone"><circle cx="426" cy="190" r="27" fill="#1d2b4d" stroke="{glow}" stroke-width="6"/><circle cx="426" cy="190" r="9" fill="{glow}"/><path d="M399 190h-28M453 190h28" stroke="{secondary}" stroke-width="8"/><circle cx="371" cy="190" r="8" fill="{glow}"/><circle cx="481" cy="190" r="8" fill="{glow}"/></g>'
    markers = " ".join(f'data-part-{category}="{_esc(data[category])}"' for category in DEFAULT_PARTS)
    animation_key = _slug(animation)
    size_scale = ROBOT_SIZES[str(data["size"])]
    transform = f"translate(260 610) scale({size_scale}) translate(-260 -610)"
    return f'''<svg class="mecha-art-svg" data-robot-art="v3" data-frame="{frame_key}" {markers} viewBox="0 0 520 650" role="img" aria-label="{_esc(data['name'])}, {frame}"><defs>{pattern}{shine}<filter id="glow-{suffix}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="shadow-{suffix}" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#020617" flood-opacity=".55"/></filter></defs><g class="robot-vector pose-{animation_key}" transform="{transform}"><ellipse cx="260" cy="610" rx="{140 if frame != 'Heavy Frame' else 175}" ry="23" fill="#020617" opacity=".42"/><circle class="energy-ring" cx="260" cy="349" r="{112 if frame != 'Heavy Frame' else 138}" fill="none" stroke="{glow}" stroke-width="4" opacity=".34" stroke-dasharray="13 11"/>{backpack}<g class="leg-left" filter="url(#shadow-{suffix})"><path d="M{left_leg_x} {leg_y}h{leg_w}l9 {leg_h*.72}-12 {leg_h*.28}h-{leg_w+15}l-9-{leg_h*.28}z" fill="{armor}" stroke="#10182f" stroke-width="9"/><path d="M{left_leg_x-17} {leg_y+leg_h-33}h{leg_w+44}l18 27h-{leg_w+66}z" fill="{secondary}" stroke="#10182f" stroke-width="8"/><circle cx="{left_leg_x+leg_w/2}" cy="{leg_y+leg_h*.48}" r="10" fill="{glow}"/></g><g class="leg-right" filter="url(#shadow-{suffix})"><path d="M{right_leg_x} {leg_y}h{leg_w}l9 {leg_h*.72}-12 {leg_h*.28}h-{leg_w+15}l-9-{leg_h*.28}z" fill="{armor}" stroke="#10182f" stroke-width="9"/><path d="M{right_leg_x-10} {leg_y+leg_h-33}h{leg_w+44}l24 27h-{leg_w+66}z" fill="{secondary}" stroke="#10182f" stroke-width="8"/><circle cx="{right_leg_x+leg_w/2}" cy="{leg_y+leg_h*.48}" r="10" fill="{glow}"/></g><g class="torso" filter="url(#shadow-{suffix})"><path d="M{torso_x+torso_w*.16} {torso_y}H{torso_x+torso_w*.84}L{torso_x+torso_w} {torso_y+torso_h*.25}L{torso_x+torso_w*.88} {torso_y+torso_h}H{torso_x+torso_w*.12}L{torso_x} {torso_y+torso_h*.25}Z" fill="{armor}" stroke="#10182f" stroke-width="10"/><path d="M{torso_x+18} {torso_y+28}L260 {torso_y+62}L{torso_x+torso_w-18} {torso_y+28}L{torso_x+torso_w*.82} {torso_y+torso_h*.76}L260 {torso_y+torso_h-12}L{torso_x+torso_w*.18} {torso_y+torso_h*.76}Z" fill="url(#shine-{suffix})"/><path d="M{torso_x+24} {torso_y+torso_h*.78}H{torso_x+torso_w-24}" stroke="{secondary}" stroke-width="9" stroke-linecap="round"/>{reactor}{emblem}<path d="M{torso_x+30} {torso_y+45}h35M{torso_x+torso_w-65} {torso_y+45}h35" stroke="#dbeafe" stroke-width="5" opacity=".65"/></g><g class="arm-left" filter="url(#shadow-{suffix})"><path d="{shoulder_path_l}" fill="{armor}" stroke="#10182f" stroke-width="9"/><circle cx="{left_arm_x+arm_w/2}" cy="{arm_y+28}" r="{arm_w*.48}" fill="#273858" stroke="{secondary}" stroke-width="7"/><path d="M{left_arm_x} {arm_y+36}h{arm_w}l8 {arm_h*.65}-{arm_w*.15} {arm_h*.35}h-{arm_w*1.15}l-{arm_w*.15}-{arm_h*.35}z" fill="{armor}" stroke="#10182f" stroke-width="9"/><circle cx="{left_arm_x+arm_w/2}" cy="{arm_y+arm_h*.62}" r="11" fill="{glow}"/>{_tool_art(str(data['arms']), 'left', glow)}</g><g class="arm-right" filter="url(#shadow-{suffix})"><path d="{shoulder_path_r}" fill="{armor}" stroke="#10182f" stroke-width="9"/><circle cx="{right_arm_x+arm_w/2}" cy="{arm_y+28}" r="{arm_w*.48}" fill="#273858" stroke="{secondary}" stroke-width="7"/><path d="M{right_arm_x} {arm_y+36}h{arm_w}l{arm_w*.15} {arm_h*.65}-{arm_w*.15} {arm_h*.35}h-{arm_w*1.15}l8-{arm_h*.35}z" fill="{armor}" stroke="#10182f" stroke-width="9"/><circle cx="{right_arm_x+arm_w/2}" cy="{arm_y+arm_h*.62}" r="11" fill="{glow}"/>{_tool_art(str(data['arms']), 'right', glow)}</g><g class="head-layer" filter="url(#shadow-{suffix})"><rect x="240" y="{head_y+head_h-1}" width="40" height="{torso_y-head_y-head_h+15}" rx="12" fill="#273858" stroke="#10182f" stroke-width="7"/>{ears}{crest}<path d="{head_path}" fill="{armor}" stroke="#10182f" stroke-width="10"/><path d="M{head_x+18} {head_y+17}Q260 {head_y-1} {head_x+head_w-18} {head_y+17}" fill="none" stroke="#fff" stroke-width="7" opacity=".24"/><g fill="{glow}" filter="url(#glow-{suffix})">{visor}</g>{mouth}<path d="M{head_x+17} {head_y+head_h-18}h25M{head_x+head_w-42} {head_y+head_h-18}h25" stroke="{secondary}" stroke-width="5"/></g>{companion}</g></svg>'''


def robot_html(robot: dict[str, Any], animation: str = "idle", compact: bool = False, scene: str = "hangar") -> str:
    """Return the complete Streamlit-safe robot card markup."""
    data = normalize_robot_art(robot)
    frame_key = FRAME_KEYS.get(str(data["frame"]), "hero")
    glow = ROBOT_EYE_GLOWS[str(data["eye_glow"])]
    companion = "" if str(data["companion"]) == "none" else f'<div class="mecha-companion" aria-hidden="true">{_esc(str(data["companion"])[:2].upper())}</div>'
    profile = "" if compact else (f'<div class="mecha-profile"><strong>{_esc(data["name"])}</strong><br>{_esc(data["frame"])} · {_esc(data["personality"])} · {_esc(data["voice"])}' + (f'<br><em>“{_esc(data["catchphrase"])}”</em>' if data["catchphrase"] else "") + "</div>")
    label = SCENE_LABELS.get(scene, SCENE_LABELS["hangar"])
    return f'<div class="mecha-art-card {"embedded" if compact else ""}" data-scene="{_esc(scene)}" data-frame="{frame_key}" style="--mecha-glow:{glow}"><div class="mecha-scene-grid"></div><div class="mecha-scene-rig"></div><div class="mecha-scene-label">{_esc(label)}</div><div class="mecha-platform"></div>{companion}<div class="mecha-art-shell {"compact" if compact else ""} pose-{_slug(animation)}">{robot_svg(data, animation)}</div>{profile}</div>'


def sidekick_html(robot: dict[str, Any]) -> str:
    """Return a compact but still layered robot portrait for the sidebar."""
    data = normalize_robot_art(robot)
    glow = ROBOT_EYE_GLOWS[str(data["eye_glow"])]
    return f'<div class="sidekick-mecha" style="--mecha-glow:{glow}">{robot_svg(data, "idle")}<strong>{_esc(data["name"])}</strong><small>Level {int(data.get("level", 1))} · {_esc(data["frame"])}</small></div>'


robot_html._mecha_art_v3 = True
