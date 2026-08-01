"""Reusable Streamlit visual components."""

from __future__ import annotations

import html
from typing import Any

import streamlit as st

from core.catalog import ROBOT_COLORS, ROBOT_EYE_GLOWS, ROBOT_SIZES
from core.profile import active_robot
from core.robot import find_part


def hero(title: str, subtitle: str) -> None:
    st.markdown(
        f'<section class="hero"><h1>{html.escape(title)}</h1>'
        f'<p>{html.escape(subtitle)}</p></section>',
        unsafe_allow_html=True,
    )


def activity_card(icon: str, title: str, text: str) -> None:
    st.markdown(
        '<div class="activity-card">'
        f'<div class="big-icon">{html.escape(icon)}</div>'
        f'<h3>{html.escape(title)}</h3>'
        f'<p>{html.escape(text)}</p></div>',
        unsafe_allow_html=True,
    )


def _part(category: str, part_id: str, fallback: str):
    try:
        return find_part(category, part_id)
    except ValueError:
        return find_part(category, fallback)


def _surface_style(primary: str, secondary: str, pattern: str, finish: str) -> str:
    patterns = {
        "Solid": f"background:{primary}",
        "Two-Tone": (
            "background:linear-gradient(90deg,"
            f"{primary} 0 50%,{secondary} 50% 100%)"
        ),
        "Racing Stripe": (
            "background:linear-gradient(90deg,"
            f"{primary} 0 36%,{secondary} 36% 64%,{primary} 64% 100%)"
        ),
        "Circuit Lines": (
            f"background-color:{primary};"
            "background-image:linear-gradient(90deg,transparent 74%,"
            f"{secondary} 75% 78%,transparent 79%),"
            "linear-gradient(0deg,transparent 74%,"
            f"{secondary} 75% 78%,transparent 79%);"
            "background-size:26px 26px"
        ),
        "Stars": (
            f"background-color:{primary};"
            "background-image:radial-gradient(circle,"
            f"{secondary} 0 2px,transparent 3px);"
            "background-size:24px 24px"
        ),
        "Polka Dots": (
            f"background-color:{primary};"
            "background-image:radial-gradient(circle,"
            f"{secondary} 0 5px,transparent 6px);"
            "background-size:28px 28px"
        ),
        "Checkerboard": (
            f"background-color:{primary};"
            "background-image:linear-gradient(45deg,"
            f"{secondary} 25%,transparent 25% 75%,{secondary} 75%),"
            "linear-gradient(45deg,"
            f"{secondary} 25%,transparent 25% 75%,{secondary} 75%);"
            "background-position:0 0,16px 16px;background-size:32px 32px"
        ),
        "Flames": (
            "background:linear-gradient(0deg,"
            f"{secondary} 0 25%,{primary} 25% 62%,#FDE047 63% 72%,"
            f"{primary} 73% 100%)"
        ),
        "Lightning": (
            "background:linear-gradient(115deg,"
            f"{primary} 0 42%,{secondary} 43% 55%,{primary} 56% 100%)"
        ),
        "Camouflage": (
            "background:radial-gradient(circle at 25% 35%,"
            f"{secondary} 0 13%,transparent 14%),"
            "radial-gradient(circle at 70% 65%,"
            f"{secondary} 0 16%,transparent 17%),{primary}"
        ),
        "Hearts": (
            f"background-color:{primary};"
            "background-image:radial-gradient(circle at 35% 35%,"
            f"{secondary} 0 5px,transparent 6px),"
            "radial-gradient(circle at 65% 35%,"
            f"{secondary} 0 5px,transparent 6px);"
            "background-size:28px 28px"
        ),
        "Galaxy": (
            "background:radial-gradient(circle at 20% 30%,#fff 0 2px,"
            "transparent 3px),radial-gradient(circle at 75% 60%,"
            f"{secondary} 0 3px,transparent 4px),"
            f"linear-gradient(135deg,{primary},#1E1B4B)"
        ),
    }
    finishes = {
        "Matte": "",
        "Glossy": (
            ";box-shadow:inset 16px 10px 18px rgba(255,255,255,.28),"
            "inset -10px -12px 16px rgba(0,0,0,.12)"
        ),
        "Chrome": (
            ";filter:saturate(.8);box-shadow:inset 0 18px 14px "
            "rgba(255,255,255,.55),inset 0 -18px 16px rgba(15,23,42,.28)"
        ),
        "Brushed Metal": (
            ";background-blend-mode:soft-light;"
            "box-shadow:inset 0 0 0 3px rgba(255,255,255,.18)"
        ),
        "Neon Glow": (
            ";box-shadow:0 0 25px currentColor,"
            "inset 0 0 15px rgba(255,255,255,.35)"
        ),
        "Holographic": (
            ";filter:saturate(1.35);box-shadow:0 0 24px "
            "rgba(192,132,252,.55),inset 0 0 18px rgba(103,232,249,.35)"
        ),
        "Candy": (
            ";box-shadow:inset 0 0 18px rgba(255,255,255,.55),"
            "0 6px 10px rgba(0,0,0,.12)"
        ),
        "Ice": (
            ";filter:saturate(.75) brightness(1.12);"
            "box-shadow:inset 0 0 22px rgba(255,255,255,.7),"
            "0 0 18px rgba(147,197,253,.55)"
        ),
        "Lava": (
            ";box-shadow:inset 0 0 18px rgba(127,29,29,.45),"
            "0 0 16px rgba(249,115,22,.55)"
        ),
        "Woodland": (
            ";filter:saturate(.7);"
            "box-shadow:inset 0 0 0 4px rgba(120,53,15,.18)"
        ),
        "Stealth": ";filter:saturate(.45) brightness(.68)",
        "Rainbow": (
            ";box-shadow:0 0 20px rgba(236,72,153,.4),"
            "inset 0 0 16px rgba(255,255,255,.35)"
        ),
    }
    return patterns.get(pattern, patterns["Solid"]) + finishes.get(finish, "")


def robot_html(robot: dict[str, Any], animation: str = "idle", compact: bool = False) -> str:
    primary = ROBOT_COLORS.get(str(robot.get("color")), ROBOT_COLORS["Electric Blue"])
    secondary = ROBOT_COLORS.get(
        str(robot.get("secondary_color")), ROBOT_COLORS["Sunny Yellow"]
    )
    pattern = str(robot.get("pattern", "Solid"))
    finish = str(robot.get("finish", "Matte"))
    surface = _surface_style(primary, secondary, pattern, finish)

    eye_glow = ROBOT_EYE_GLOWS.get(
        str(robot.get("eye_glow")), ROBOT_EYE_GLOWS["Aqua"]
    )
    eyes = html.escape(_part("eyes", str(robot.get("eyes", "round")), "round").emoji)
    mouth = html.escape(_part("mouth", str(robot.get("mouth", "smile")), "smile").emoji)
    antenna = html.escape(
        _part("antenna", str(robot.get("antenna", "none")), "none").emoji
    )
    ears = html.escape(_part("ears", str(robot.get("ears", "none")), "none").emoji)
    shoulders = html.escape(
        _part("shoulders", str(robot.get("shoulders", "none")), "none").emoji
    )
    chest = html.escape(_part("chest", str(robot.get("chest", "none")), "none").emoji)
    companion = html.escape(
        _part("companion", str(robot.get("companion", "none")), "none").emoji
    )

    head_id = str(robot.get("head", "box"))
    head_styles = {
        "box": "border-radius:18px",
        "dome": "border-radius:60px 60px 22px 22px",
        "screen": "border-radius:12px;box-shadow:inset 0 0 0 6px rgba(255,255,255,.28)",
        "antenna": "border-radius:30px",
        "crystal": "border-radius:45% 45% 24px 24px;transform:rotate(1deg)",
        "cat": "border-radius:26px 26px 18px 18px",
        "knight": "border-radius:42px 42px 12px 12px",
        "astronaut": "border-radius:52px",
        "submarine": "border-radius:55px 55px 24px 24px",
        "dragon": "border-radius:35px 35px 18px 18px",
        "royal": "border-radius:20px 20px 35px 35px",
        "portal": "border-radius:50%;box-shadow:0 0 22px rgba(139,92,246,.7)",
    }
    head_style = head_styles.get(head_id, head_styles["box"])

    arms = html.escape(
        _part("arms", str(robot.get("arms", "grabber")), "grabber").emoji
    ).split()
    left_arm = arms[0] if arms else "C"
    right_arm = arms[-1] if arms else "C"

    body_part = _part(
        "body", str(robot.get("body", "classic_core")), "classic_core"
    )
    body_styles = {
        "classic_core": "border-radius:25px",
        "round_core": "border-radius:48px",
        "toolbox": "border-radius:12px",
        "aquarium": "border-radius:45px 45px 22px 22px;box-shadow:inset 0 0 0 7px rgba(255,255,255,.22)",
        "speaker": "border-radius:18px;box-shadow:inset 0 0 0 5px rgba(20,20,40,.14)",
        "crystal": "border-radius:48% 48% 20px 20px",
        "dinosaur": "border-radius:35px 20px 35px 20px",
        "space_suit": "border-radius:55px 55px 24px 24px",
        "candy": "border-radius:42px",
        "stealth": "border-radius:10px 30px 10px 30px",
        "castle": "border-radius:8px 8px 24px 24px",
        "galaxy": "border-radius:50%;box-shadow:0 0 24px rgba(108,76,241,.65)",
    }
    body_style = body_styles.get(body_part.id, body_styles["classic_core"])
    body_emoji = html.escape(body_part.emoji)
    base = html.escape(
        _part("base", str(robot.get("base", "bronze_wheels")), "bronze_wheels").emoji
    )
    backpack = html.escape(
        _part("backpack", str(robot.get("backpack", "none")), "none").emoji
    )
    power = html.escape(
        _part("power", str(robot.get("power", "bubble")), "bubble").emoji
    )
    hat = html.escape(_part("hat", str(robot.get("hat", "none")), "none").emoji)
    name = html.escape(str(robot.get("name", "BuddyBot")))
    catchphrase = html.escape(str(robot.get("catchphrase", "")))
    personality = html.escape(str(robot.get("personality", "Curious Explorer")))
    voice = html.escape(str(robot.get("voice", "Classic Beep")))

    animation_class = f"anim-{animation}" if animation != "idle" else ""
    base_scale = ROBOT_SIZES.get(str(robot.get("size")), ROBOT_SIZES["Standard"])
    if compact:
        base_scale *= 0.66
    scale = (
        f' style="transform:scale({base_scale}); '
        f'margin:{"-68px" if compact else "0"} 0;"'
    )

    return f"""<div class="robot-display">
      <div class="robot-companion">{companion}</div>
      <div class="robot-wrap {animation_class}"{scale}>
        <div class="robot-top-accessories">
          <span class="robot-ears">{ears}</span>
          <span class="robot-hat">{hat}</span>
          <span class="robot-antenna">{antenna}</span>
        </div>
        <div class="robot-head" style="{surface};{head_style}">
          <div class="robot-eyes" style="color:{eye_glow};box-shadow:0 0 15px {eye_glow};">{eyes}</div>
          <div class="robot-mouth robot-mouth-custom">{mouth}</div>
        </div>
        <div class="robot-body-row">
          <div class="robot-arm">{left_arm}</div>
          <div class="robot-body-shell">
            <div class="robot-shoulders">{shoulders}</div>
            <div class="robot-backpack">{backpack}</div>
            <div class="robot-body" style="{surface};{body_style}">
              <div class="robot-core-mark">{body_emoji}</div>
              <div class="robot-power">{power}</div>
              <div class="robot-chest">{chest}</div>
            </div>
          </div>
          <div class="robot-arm">{right_arm}</div>
        </div>
        <div class="robot-base">{base}</div>
        <div class="robot-label">{name}</div>
      </div>
      <div class="robot-profile-strip">
        <strong>{personality}</strong> · {voice}
        {f'<br><em>“{catchphrase}”</em>' if catchphrase else ''}
      </div>
    </div>"""


def robot_stage(robot: dict[str, Any], animation: str = "idle") -> None:
    st.markdown(
        f'<div class="robot-stage">{robot_html(robot, animation)}</div>',
        unsafe_allow_html=True,
    )


def render_sidekick(profile: dict[str, Any]) -> None:
    robot = active_robot(profile)
    message = html.escape(str(profile.get("sidekick_message", "Ready!")))
    st.markdown(f'<div class="speech">{message}</div>', unsafe_allow_html=True)
    if robot:
        primary = ROBOT_COLORS.get(
            str(robot.get("color")), ROBOT_COLORS["Electric Blue"]
        )
        secondary = ROBOT_COLORS.get(
            str(robot.get("secondary_color")), ROBOT_COLORS["Sunny Yellow"]
        )
        eyes = html.escape(
            _part("eyes", str(robot.get("eyes", "round")), "round").emoji
        )
        glow = ROBOT_EYE_GLOWS.get(
            str(robot.get("eye_glow")), ROBOT_EYE_GLOWS["Aqua"]
        )
        st.markdown(
            '<div class="sidekick-mini">'
            '<div class="sidekick-face" '
            f'style="background:linear-gradient(135deg,{primary},{secondary});'
            f'color:{glow};box-shadow:0 0 14px {glow}">{eyes}</div>'
            f'<strong>{html.escape(str(robot.get("name", "BuddyBot")))}</strong><br>'
            f'<small>Level {int(robot.get("level", 1))} · '
            f'{html.escape(str(robot.get("personality", "Curious Explorer")))}</small>'
            '</div>',
            unsafe_allow_html=True,
        )
    else:
        st.info("Build a robot in Robo Lab to meet your sidekick.")


def show_new_badges(badges: list[Any]) -> None:
    for badge in badges:
        st.balloons()
        st.success(f"Badge unlocked: {badge.emoji} {badge.title}")
