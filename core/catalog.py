"""Robot parts and kid-friendly content catalogs."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Part:
    id: str
    label: str
    emoji: str
    unlock_stars: int = 0


ROBOT_PARTS: dict[str, tuple[Part, ...]] = {
    "eyes": (
        Part("round", "Friendly Round Eyes", "● ●"),
        Part("star", "Star Eyes", "★ ★", 4),
        Part("laser", "Laser Eyes", "◉ ◉", 10),
        Part("heart", "Heart Eyes", "♥ ♥", 16),
    ),
    "head": (
        Part("box", "Classic Box Head", "▣"),
        Part("dome", "Space Dome", "◠", 5),
        Part("screen", "Screen Head", "▤", 12),
        Part("antenna", "Rainbow Antenna", "⌁", 20),
    ),
    "arms": (
        Part("grabber", "Grabber Arms", "C C"),
        Part("spring", "Spring Arms", "≋ ≋", 6),
        Part("giant", "Giant Hands", "✊ ✊", 14),
        Part("wings", "Wing Arms", "◁ ▷", 22),
    ),
    "base": (
        Part("bronze_wheels", "Bronze Wheels", "◉ ◉"),
        Part("bouncy_legs", "Bouncy Legs", "╱ ╲", 5),
        Part("tank_tracks", "Tank Tracks", "▰▰", 11),
        Part("rocket_boots", "Rocket Boots", "🚀 🚀", 18),
    ),
    "power": (
        Part("bubble", "Bubble Blaster", "🫧"),
        Part("scanner", "Super Scanner", "🔎", 4),
        Part("joke", "Joke Beam", "😂", 8),
        Part("rainbow", "Rainbow Shield", "🌈", 15),
        Part("story", "Story Spark", "📖", 21),
    ),
    "hat": (
        Part("none", "No Hat", ""),
        Part("cap", "Adventure Cap", "🧢", 3),
        Part("cowboy", "Cowboy Hat", "🤠", 8),
        Part("crown", "Robot Crown", "👑", 13),
        Part("wizard", "Wizard Hat", "🧙", 19),
    ),
}

ROBOT_COLORS: dict[str, str] = {
    "Electric Blue": "#3B82F6",
    "Rocket Red": "#EF4444",
    "Sunny Yellow": "#FBBF24",
    "Jungle Green": "#22C55E",
    "Galaxy Purple": "#8B5CF6",
    "Bubblegum Pink": "#EC4899",
    "Silver": "#94A3B8",
}

ANIMATIONS: dict[str, tuple[str, str]] = {
    "wave": ("Wave", "👋"),
    "blink": ("Blink", "😊"),
    "spin": ("Spin", "🔄"),
    "walk": ("Walk", "🛞"),
    "fly": ("Fly", "🚀"),
    "dance": ("Dance", "💃"),
    "flash": ("Flash Lights", "⚡"),
}

DEFAULT_ANIMALS: tuple[dict[str, str], ...] = (
    {"name": "Red Panda", "emoji": "🐾", "habitat": "Mountain forests", "fact": "Red pandas use their fluffy tails like warm blankets."},
    {"name": "Axolotl", "emoji": "🦎", "habitat": "Freshwater lakes", "fact": "Axolotls can regrow parts of their limbs."},
    {"name": "Elephant", "emoji": "🐘", "habitat": "Grasslands and forests", "fact": "Elephants communicate with rumbles that travel through the ground."},
    {"name": "Octopus", "emoji": "🐙", "habitat": "Oceans", "fact": "An octopus has three hearts."},
    {"name": "Panda", "emoji": "🐼", "habitat": "Bamboo forests", "fact": "Giant pandas spend much of the day eating bamboo."},
    {"name": "Lion", "emoji": "🦁", "habitat": "Savannas", "fact": "A lion's roar can travel several miles."},
    {"name": "Dolphin", "emoji": "🐬", "habitat": "Oceans and rivers", "fact": "Dolphins use unique whistles a little like names."},
    {"name": "Snowy Owl", "emoji": "🦉", "habitat": "Arctic tundra", "fact": "Snowy owls have feathers covering their feet."},
)
