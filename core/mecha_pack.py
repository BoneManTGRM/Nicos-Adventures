"""Original anime-mecha-inspired customization pack.

The pack uses generic, original designs and deliberately avoids names or
identifiable designs from existing franchises.
"""

from __future__ import annotations

from typing import Any

from core import catalog
from core.catalog import Part

_INSTALLED = False
_UI_INSTALLED = False

MECHA_PARTS: dict[str, tuple[Part, ...]] = {
    "eyes": (
        Part("mecha_visor", "Mecha Mono Visor", "▰ ▰", 0),
        Part("mecha_dual_camera", "Twin Camera Eyes", "◈ ◈", 12),
        Part("mecha_targeting", "Targeting Sensor Eyes", "⌁ ⌁", 24),
        Part("mecha_photon", "Photon Star Eyes", "✦ ✦", 40),
    ),
    "mouth": (
        Part("mecha_vent", "Armored Vent Mouth", "▭", 0),
        Part("mecha_command_grille", "Command Grille", "≡", 12),
        Part("mecha_fang_guard", "Fang Guard", "▽", 24),
        Part("mecha_reactor_voice", "Reactor Voice Port", "◇", 40),
    ),
    "head": (
        Part("mecha_angular", "Angular Hero Helmet", "⬡", 0),
        Part("mecha_kabuto", "Kabuto Sentinel Helmet", "兜", 12),
        Part("mecha_flight", "Aero Flight Helmet", "△", 24),
        Part("mecha_oni", "Oni Guardian Helmet", "👹", 40),
    ),
    "antenna": (
        Part("mecha_v_crest", "Victory V-Crest", "Ⅴ", 0),
        Part("mecha_sensor_fin", "Sensor Blade Fin", "⌃", 12),
        Part("mecha_horn_array", "Twin Horn Array", "⚔️", 24),
        Part("mecha_photon_crown", "Photon Crown Array", "✧", 40),
    ),
    "ears": (
        Part("mecha_sensor_pods", "Mecha Sensor Pods", "◁ ▷", 0),
        Part("mecha_comm_fins", "Command Communication Fins", "▰ ▰", 12),
        Part("mecha_aero_fins", "Aero Wing Fins", "🪽 🪽", 24),
        Part("mecha_quantum_receivers", "Quantum Receivers", "◈ ◈", 40),
    ),
    "shoulders": (
        Part("mecha_pauldrons", "Hero Armor Pauldrons", "◆ ◆", 0),
        Part("mecha_rescue_pods", "Rescue Launcher Pods", "▣ ▣", 12),
        Part("mecha_wing_binders", "Wing Binder Shoulders", "🪽 🪽", 24),
        Part("mecha_star_generators", "Star Shield Generators", "✦ ✦", 40),
    ),
    "arms": (
        Part("mecha_photon_saber", "Photon Saber Arms", "⚡ ⚡", 0),
        Part("mecha_rocket_punch", "Rocket Punch Arms", "✊ 🚀", 12),
        Part("mecha_guardian", "Guardian Shield Arms", "🛡️ 🛡️", 24),
        Part("mecha_gravity", "Gravity Gauntlets", "🌀 🌀", 40),
    ),
    "body": (
        Part("mecha_reactor_frame", "Hero Reactor Frame", "🔆", 0),
        Part("mecha_kabuto_armor", "Kabuto Armor Frame", "⚙️", 12),
        Part("mecha_aero_frame", "Aero Striker Frame", "🪽", 24),
        Part("mecha_titan_frame", "Titan Fortress Frame", "💠", 40),
    ),
    "chest": (
        Part("mecha_solar_core", "Solar Reactor Crest", "☀️", 0),
        Part("mecha_tiger_crest", "Tiger Guardian Crest", "🐯", 12),
        Part("mecha_phoenix_crest", "Phoenix Flight Crest", "🪽", 24),
        Part("mecha_cosmic_core", "Cosmic Hero Core", "✦", 40),
    ),
    "base": (
        Part("mecha_hero_legs", "Hero Mecha Legs", "╱ ╲", 0),
        Part("mecha_vernier_legs", "Vernier Thruster Legs", "🚀 🚀", 12),
        Part("mecha_hover_skates", "Photon Hover Skates", "◉ ◉", 24),
        Part("mecha_siege_treads", "Titan Siege Treads", "▰▰", 40),
    ),
    "backpack": (
        Part("mecha_scout_pack", "Scout Vernier Pack", "🚀", 0),
        Part("mecha_kaze_wings", "Kaze Wing Pack", "🪽", 12),
        Part("mecha_halo_drive", "Photon Halo Drive", "🔆", 24),
        Part("mecha_cannon_rack", "Titan Rescue Cannon Rack", "✦", 40),
    ),
    "companion": (
        Part("mecha_support_drone", "Support Sphere Drone", "◉", 0),
        Part("mecha_shield_bit", "Guardian Shield Bit", "🛡️", 12),
        Part("mecha_scout_funnel", "Scout Wing Drone", "🪽", 24),
        Part("mecha_repair_sprite", "Photon Repair Sprite", "✨", 40),
    ),
    "power": (
        Part("mecha_beam_blade", "Photon Blade", "⚔️", 0),
        Part("mecha_aegis_field", "Aegis Barrier", "🛡️", 12),
        Part("mecha_comet_drive", "Comet Drive", "☄️", 24),
        Part("mecha_star_burst", "Star Burst Reactor", "🌠", 40),
    ),
    "hat": (
        Part("mecha_command_crest", "Command Crest", "Ⅴ", 0),
        Part("mecha_samurai_crown", "Samurai Guardian Crown", "🪖", 12),
        Part("mecha_pilot_halo", "Pilot Halo", "✦", 24),
        Part("mecha_victory_wings", "Victory Wing Crown", "🪽", 40),
    ),
}

MECHA_COLORS: dict[str, str] = {
    "Mecha White": "#F8FAFC",
    "Vanguard Blue": "#2563EB",
    "Signal Crimson": "#DC2626",
    "Armor Gunmetal": "#475569",
    "Photon Cyan": "#22D3EE",
    "Sakura Alloy": "#FDA4AF",
}

MECHA_VOICES: dict[str, str] = {
    "Hero Pilot": "Bright heroic mission voice",
    "Calm Commander": "Focused and reassuring",
    "Energetic Ace": "Fast, excited, and fearless",
    "Tactical AI": "Precise mission-support voice",
}

MECHA_PERSONALITIES: dict[str, str] = {
    "Mecha Ace": "Systems synchronized. Let's launch!",
    "Samurai Guardian": "Calm heart, strong armor.",
    "Rescue Commander": "Protect first. Help everyone.",
    "Neon Rival": "Let's make this mission legendary!",
}

MECHA_PRESETS: dict[str, dict[str, str | int]] = {
    "Skyframe Vanguard": {
        "unlock_stars": 0,
        "head": "mecha_angular",
        "eyes": "mecha_visor",
        "mouth": "mecha_vent",
        "antenna": "mecha_v_crest",
        "ears": "mecha_sensor_pods",
        "shoulders": "mecha_pauldrons",
        "arms": "mecha_photon_saber",
        "body": "mecha_reactor_frame",
        "chest": "mecha_solar_core",
        "base": "mecha_hero_legs",
        "backpack": "mecha_scout_pack",
        "companion": "mecha_support_drone",
        "power": "mecha_beam_blade",
        "hat": "mecha_command_crest",
        "color": "Mecha White",
        "secondary_color": "Vanguard Blue",
        "finish": "Glossy",
        "pattern": "Two-Tone",
        "eye_glow": "Aqua",
        "size": "Standard",
        "voice": "Hero Pilot",
        "personality": "Mecha Ace",
    },
    "Kabuto Sentinel": {
        "unlock_stars": 12,
        "head": "mecha_kabuto",
        "eyes": "mecha_dual_camera",
        "mouth": "mecha_command_grille",
        "antenna": "mecha_sensor_fin",
        "ears": "mecha_comm_fins",
        "shoulders": "mecha_rescue_pods",
        "arms": "mecha_rocket_punch",
        "body": "mecha_kabuto_armor",
        "chest": "mecha_tiger_crest",
        "base": "mecha_vernier_legs",
        "backpack": "mecha_kaze_wings",
        "companion": "mecha_shield_bit",
        "power": "mecha_aegis_field",
        "hat": "mecha_samurai_crown",
        "color": "Signal Crimson",
        "secondary_color": "Armor Gunmetal",
        "finish": "Brushed Metal",
        "pattern": "Circuit Lines",
        "eye_glow": "Gold",
        "size": "Mega",
        "voice": "Calm Commander",
        "personality": "Samurai Guardian",
    },
    "Neon Comet Striker": {
        "unlock_stars": 24,
        "head": "mecha_flight",
        "eyes": "mecha_targeting",
        "mouth": "mecha_fang_guard",
        "antenna": "mecha_horn_array",
        "ears": "mecha_aero_fins",
        "shoulders": "mecha_wing_binders",
        "arms": "mecha_guardian",
        "body": "mecha_aero_frame",
        "chest": "mecha_phoenix_crest",
        "base": "mecha_hover_skates",
        "backpack": "mecha_halo_drive",
        "companion": "mecha_scout_funnel",
        "power": "mecha_comet_drive",
        "hat": "mecha_pilot_halo",
        "color": "Armor Gunmetal",
        "secondary_color": "Photon Cyan",
        "finish": "Neon Glow",
        "pattern": "Lightning",
        "eye_glow": "Blue",
        "size": "Standard",
        "voice": "Energetic Ace",
        "personality": "Neon Rival",
    },
    "Titan Rescue Frame": {
        "unlock_stars": 40,
        "head": "mecha_oni",
        "eyes": "mecha_photon",
        "mouth": "mecha_reactor_voice",
        "antenna": "mecha_photon_crown",
        "ears": "mecha_quantum_receivers",
        "shoulders": "mecha_star_generators",
        "arms": "mecha_gravity",
        "body": "mecha_titan_frame",
        "chest": "mecha_cosmic_core",
        "base": "mecha_siege_treads",
        "backpack": "mecha_cannon_rack",
        "companion": "mecha_repair_sprite",
        "power": "mecha_star_burst",
        "hat": "mecha_victory_wings",
        "color": "Mecha White",
        "secondary_color": "Sakura Alloy",
        "finish": "Holographic",
        "pattern": "Racing Stripe",
        "eye_glow": "Rainbow",
        "size": "Mega",
        "voice": "Tactical AI",
        "personality": "Rescue Commander",
    },
}


def install_mecha_pack() -> None:
    """Install the mecha catalog once per Python process."""
    global _INSTALLED
    if _INSTALLED:
        return

    for category, additions in MECHA_PARTS.items():
        existing = catalog.ROBOT_PARTS[category]
        existing_ids = {part.id for part in existing}
        catalog.ROBOT_PARTS[category] = existing + tuple(
            part for part in additions if part.id not in existing_ids
        )

    catalog.ROBOT_COLORS.update(MECHA_COLORS)
    catalog.ROBOT_VOICES.update(MECHA_VOICES)
    catalog.ROBOT_PERSONALITIES.update(MECHA_PERSONALITIES)
    catalog.ROBOT_PRESETS.update(MECHA_PRESETS)
    _INSTALLED = True


def _mecha_effect(robot: dict[str, Any]) -> tuple[str, str, str]:
    """Return head/body style additions and an energy effect."""
    head_id = str(robot.get("head", ""))
    body_id = str(robot.get("body", ""))
    power_id = str(robot.get("power", ""))

    head_styles = {
        "mecha_angular": "clip-path:polygon(14% 0,86% 0,100% 28%,90% 100%,10% 100%,0 28%);border-radius:6px",
        "mecha_kabuto": "clip-path:polygon(18% 0,82% 0,100% 38%,82% 100%,18% 100%,0 38%);border-radius:20px 20px 8px 8px",
        "mecha_flight": "clip-path:polygon(50% 0,100% 26%,90% 100%,10% 100%,0 26%);border-radius:8px",
        "mecha_oni": "clip-path:polygon(10% 8%,90% 8%,100% 40%,82% 100%,18% 100%,0 40%);border-radius:14px",
    }
    body_styles = {
        "mecha_reactor_frame": "clip-path:polygon(16% 0,84% 0,100% 24%,92% 100%,8% 100%,0 24%)",
        "mecha_kabuto_armor": "clip-path:polygon(10% 0,90% 0,100% 35%,82% 100%,18% 100%,0 35%)",
        "mecha_aero_frame": "clip-path:polygon(25% 0,75% 0,100% 22%,86% 100%,14% 100%,0 22%)",
        "mecha_titan_frame": "clip-path:polygon(8% 0,92% 0,100% 18%,94% 100%,6% 100%,0 18%)",
    }
    effects = {
        "mecha_beam_blade": "⚔️",
        "mecha_aegis_field": "🛡️",
        "mecha_comet_drive": "☄️",
        "mecha_star_burst": "🌠",
    }
    return head_styles.get(head_id, ""), body_styles.get(body_id, ""), effects.get(power_id, "")


def install_mecha_ui() -> None:
    """Add lightweight mecha styling without replacing the base renderer."""
    global _UI_INSTALLED
    if _UI_INSTALLED:
        return

    from ui import components

    original = components.robot_html
    if getattr(original, "_mecha_wrapped", False):
        _UI_INSTALLED = True
        return

    def mecha_robot_html(
        robot: dict[str, Any],
        animation: str = "idle",
        compact: bool = False,
    ) -> str:
        rendered = original(robot, animation, compact)
        head_style, body_style, effect = _mecha_effect(robot)
        if not (head_style or body_style or effect):
            return rendered

        if head_style:
            rendered = rendered.replace(
                '<div class="robot-head" style="',
                f'<div class="robot-head" style="{head_style};',
                1,
            )
        if body_style:
            rendered = rendered.replace(
                '<div class="robot-body" style="',
                f'<div class="robot-body" style="{body_style};',
                1,
            )

        aura = (
            '<div style="position:absolute;inset:18% 24%;border-radius:50%;'
            'box-shadow:0 0 42px rgba(34,211,238,.5);pointer-events:none"></div>'
        )
        rendered = rendered.replace(
            '<div class="robot-display">',
            f'<div class="robot-display" style="position:relative">{aura}',
            1,
        )
        if effect:
            effect_html = (
                '<div style="font-size:2rem;filter:drop-shadow(0 0 8px #67e8f9);'
                'margin-top:-.25rem">'
                f'{effect}</div>'
            )
            rendered = rendered.replace(
                '<div class="robot-label">',
                f'{effect_html}<div class="robot-label">',
                1,
            )
        return rendered

    setattr(mecha_robot_html, "_mecha_wrapped", True)
    components.robot_html = mecha_robot_html
    _UI_INSTALLED = True
