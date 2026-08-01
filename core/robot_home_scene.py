"""Layered, state-driven Robot Home scene for Streamlit."""

from __future__ import annotations

import html
from typing import Any

from ui.components import robot_html

ROOM_THEMES = {
    "Cozy Workshop": ("#ffead1", "#d6a86a", "#6c4cf1"),
    "Neon Hangar": ("#111a38", "#273a68", "#5ee7ff"),
    "Forest Cabin": ("#dcefcf", "#8b6a43", "#4f8f5b"),
    "Moon Base": ("#dfe8f7", "#7f8ca8", "#8b5cf6"),
    "Ocean Station": ("#d8f5f5", "#4d8fa3", "#1bb7c9"),
    "Royal Mecha Suite": ("#f7e8bc", "#7b4f84", "#d3a62c"),
}

WEATHER = {
    "Sunny": ("☀️", "linear-gradient(#7dd3fc,#dbeafe 65%,#9bd57d 66%)"),
    "Sunset": ("🌅", "linear-gradient(#fb7185,#fdba74 56%,#46356f 57%)"),
    "Starry Night": ("🌙", "radial-gradient(circle at 70% 20%,#fff 0 2%,transparent 3%),linear-gradient(#101936,#2f3b70 70%,#17233d 71%)"),
    "Rain": ("🌧️", "repeating-linear-gradient(105deg,transparent 0 18px,rgba(255,255,255,.55) 19px 21px),linear-gradient(#607d9f,#b7c8d8 70%,#58715a 71%)"),
    "Snow": ("❄️", "radial-gradient(circle,#fff 0 3px,transparent 4px),linear-gradient(#b7d9f5,#edf7ff 68%,#d9edf7 69%)"),
    "Nebula": ("🌌", "radial-gradient(circle at 25% 30%,#f0abfc 0 8%,transparent 28%),radial-gradient(circle at 75% 60%,#67e8f9 0 7%,transparent 27%),#111135"),
}

DECORATION_META: dict[str, dict[str, str]] = {
    "charging_dock": {"label": "Charging Dock", "class": "dock", "art": "<span class='dock-coil'></span><b>CHARGE</b>"},
    "animal_wall": {"label": "Animal Photo Wall", "class": "animal-wall", "art": "<span>🐼</span><span>🦁</span><span>🐬</span>"},
    "monster_plush": {"label": "Monster Plush", "class": "monster-plush", "art": "👾"},
    "trophy_shelf": {"label": "Trophy Shelf", "class": "trophy-shelf", "art": "<span>🏆</span><span>🥇</span><span>🏅</span>"},
    "star_window": {"label": "Star Window", "class": "star-projector", "art": "✦ ✧ ✦"},
    "mecha_banner": {"label": "Mecha Banner", "class": "mecha-banner", "art": "MECHA<br>141"},
    "story_library": {"label": "Story Library", "class": "story-library", "art": "📕📗📘<br>📙📓📔"},
    "robot_bed": {"label": "Robot Recharge Bed", "class": "robot-bed", "art": "<span>⚡</span> DREAM POD"},
    "holo_aquarium": {"label": "Hologram Aquarium", "class": "holo-aquarium", "art": "🐠　🐟　🫧"},
    "tool_wall": {"label": "Master Tool Wall", "class": "tool-wall", "art": "🔧　🔩　🪛"},
    "galaxy_rug": {"label": "Galaxy Rug", "class": "galaxy-rug", "art": "✦　☄　✧"},
    "robot_pet": {"label": "Robot Pet", "class": "robot-pet", "art": "🐕‍🦺"},
    "plant_station": {"label": "Bio-Light Plants", "class": "plant-station", "art": "🌿🪴"},
    "arcade_console": {"label": "Arcade Console", "class": "arcade-console", "art": "<span>ARCADE</span><i>●　●</i>"},
    "mission_table": {"label": "Mission Hologram", "class": "mission-table", "art": "<span>⌁ WORLD MAP ⌁</span>"},
    "ceiling_drone": {"label": "Helper Drone", "class": "ceiling-drone", "art": "◉━━◉"},
    "crystal_lamp": {"label": "Crystal Lamp", "class": "crystal-lamp", "art": "💎"},
    "memory_terminal": {"label": "Memory Terminal", "class": "memory-terminal", "art": "MEMORY<br>ONLINE"},
}


def _esc(value: Any) -> str:
    return html.escape(str(value))


def room_scene_html(
    robot: dict[str, Any],
    active_decorations: list[str],
    *,
    theme: str,
    weather: str,
    lighting: str,
    animation: str,
    badges: int,
    animals: int,
    monsters: int,
    stories: int,
) -> str:
    """Return a detailed, responsive room scene using existing profile state."""
    wall, floor, accent = ROOM_THEMES.get(theme, ROOM_THEMES["Cozy Workshop"])
    weather_icon, sky = WEATHER.get(weather, WEATHER["Sunny"])
    darkness = {"Bright": "0", "Warm": ".12", "Night": ".38"}.get(lighting, ".12")
    active = set(active_decorations)
    decorations = "".join(
        f"<div class='room-object {meta['class']}' title='{_esc(meta['label'])}'>{meta['art']}</div>"
        for item_id, meta in DECORATION_META.items()
        if item_id in active
    )
    robot_markup = robot_html(robot, animation=animation, compact=True)
    return f"""
<div class="robot-home-scene" style="--room-wall:{wall};--room-floor:{floor};--room-accent:{accent};--room-dark:{darkness}">
  <div class="room-ceiling"><span></span><span></span><span></span></div>
  <div class="room-wall-grid"></div>
  <div class="room-window" style="background:{sky}">
    <div class="weather-icon">{weather_icon}</div><div class="window-city"></div>
  </div>
  <div class="room-pipe pipe-a"></div><div class="room-pipe pipe-b"></div>
  <div class="room-floor"><div class="floor-light"></div></div>
  <div class="room-title"><b>{_esc(robot.get('name','Robot'))}'s Headquarters</b><span>{_esc(theme)}</span></div>
  {decorations}
  <div class="room-robot">{robot_markup}</div>
  <div class="room-hud">
    <span>🏅 {badges}</span><span>🐾 {animals}</span><span>👾 {monsters}</span><span>📚 {stories}</span>
  </div>
  <div class="room-lighting"></div>
</div>
"""


ROBOT_HOME_CSS = r"""
<style>
.robot-home-scene{height:720px;position:relative;overflow:hidden;border-radius:34px;border:5px solid #242b4d;background:linear-gradient(180deg,var(--room-wall) 0 70%,var(--room-floor) 70%);box-shadow:0 24px 65px rgba(24,31,65,.28),inset 0 0 70px rgba(255,255,255,.3);isolation:isolate}
.room-wall-grid{position:absolute;inset:0 0 30%;opacity:.22;background-image:linear-gradient(rgba(36,43,77,.28) 2px,transparent 2px),linear-gradient(90deg,rgba(36,43,77,.28) 2px,transparent 2px);background-size:54px 54px}
.room-ceiling{position:absolute;top:0;left:0;right:0;height:58px;background:linear-gradient(#252d50,#10162e);display:flex;justify-content:space-around;padding-top:17px;box-shadow:0 8px 20px #0005;z-index:8}.room-ceiling span{width:19%;height:9px;border-radius:20px;background:var(--room-accent);box-shadow:0 0 22px var(--room-accent)}
.room-window{position:absolute;top:82px;right:5%;width:35%;height:235px;border:12px solid #303957;border-radius:30px;box-shadow:inset 0 0 35px #fff7,0 10px 22px #1f294844;overflow:hidden}.room-window:after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,#fff8,transparent 35%)}.weather-icon{position:absolute;right:18px;top:12px;font-size:2.2rem}.window-city{position:absolute;bottom:0;left:0;right:0;height:55px;background:repeating-linear-gradient(90deg,#273455 0 28px,#536482 29px 47px);clip-path:polygon(0 38%,8% 38%,8% 0,17% 0,17% 50%,28% 50%,28% 18%,38% 18%,38% 58%,50% 58%,50% 5%,63% 5%,63% 42%,76% 42%,76% 22%,89% 22%,89% 48%,100% 48%,100% 100%,0 100%)}
.room-floor{position:absolute;left:0;right:0;bottom:0;height:31%;background:linear-gradient(170deg,#fff3,transparent 45%),repeating-linear-gradient(90deg,transparent 0 89px,#20274455 90px 93px),repeating-linear-gradient(0deg,transparent 0 58px,#20274444 59px 62px),var(--room-floor);perspective:600px}.floor-light{position:absolute;width:48%;height:45px;left:28%;top:42%;border-radius:50%;background:var(--room-accent);filter:blur(15px);opacity:.55;animation:home-pulse 3s ease-in-out infinite}
.room-title{position:absolute;left:4%;top:75px;background:#10162ee8;color:#fff;border:2px solid #ffffff55;border-left:8px solid var(--room-accent);border-radius:10px;padding:10px 17px;z-index:10;box-shadow:0 8px 20px #0004}.room-title b{display:block;font-family:'Fredoka',sans-serif;font-size:1.2rem}.room-title span{font-size:.78rem;color:#dbeafe}
.room-robot{position:absolute;left:50%;bottom:-12px;transform:translateX(-50%) scale(.72);transform-origin:center bottom;z-index:6}.room-robot .robot-profile-strip,.room-robot .robot-companion{display:none}.room-robot .robot-display{min-height:500px}
.room-object{position:absolute;z-index:5;text-align:center;filter:drop-shadow(0 7px 7px #18203b55);transition:transform .25s}.room-object:hover{transform:scale(1.08) translateY(-4px)}
.dock{left:6%;bottom:15%;width:145px;height:120px;border:6px solid #26304e;border-radius:28px 28px 10px 10px;background:linear-gradient(145deg,#e9f6ff,#60799c);display:grid;place-items:center;color:#18233c;font-size:.75rem}.dock-coil{width:68px;height:68px;border-radius:50%;border:9px double var(--room-accent);box-shadow:0 0 20px var(--room-accent)}
.animal-wall{left:4%;top:180px;display:flex;gap:7px;background:#fff4dc;border:9px ridge #9b633e;padding:9px;border-radius:5px;font-size:1.8rem}.animal-wall span{background:#b7e3ff;padding:7px;border:2px solid #fff}
.monster-plush{right:7%;bottom:18%;font-size:4.3rem;animation:home-bob 2.8s ease-in-out infinite}.trophy-shelf{right:4%;top:345px;background:#70482f;border:7px solid #3e2a22;border-radius:8px;padding:12px 15px;font-size:1.8rem}.trophy-shelf:after{content:'';position:absolute;left:-10px;right:-10px;bottom:-15px;height:13px;background:#3e2a22}
.star-projector{right:39%;top:76px;color:#fff;font-size:1.3rem;text-shadow:0 0 12px #fff,0 0 30px var(--room-accent);animation:home-stars 3s linear infinite}.mecha-banner{left:31%;top:78px;background:linear-gradient(145deg,#18213f,#394b82);border:4px solid #dce7ff;color:#fff;padding:10px 22px;clip-path:polygon(8% 0,92% 0,100% 15%,91% 100%,9% 100%,0 15%);font-weight:900;letter-spacing:.14em}
.story-library{left:3%;top:360px;background:#5a3828;border:7px solid #30211e;padding:12px;font-size:1.5rem;border-radius:4px}.robot-bed{left:23%;bottom:7%;background:linear-gradient(145deg,#29355d,#8aa8df);border:6px solid #202744;border-radius:40px 40px 15px 15px;color:white;padding:22px 34px;font-weight:900}.holo-aquarium{right:4%;top:185px;width:170px;height:90px;border:5px solid #355879;border-radius:50% 50% 18px 18px;background:#67e8f966;box-shadow:inset 0 0 25px #fff,0 0 25px #22d3ee;display:grid;place-items:center}
.tool-wall{left:4%;top:275px;background:#34425f;border:4px solid #11182c;color:#fff;padding:11px;border-radius:8px}.galaxy-rug{left:28%;bottom:3%;width:44%;height:90px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff 0 2px,transparent 3px),linear-gradient(135deg,#312e81,#7e22ce,#0e7490);color:white;display:grid;place-items:center;font-size:1.4rem;z-index:2}.robot-pet{right:27%;bottom:10%;font-size:3.4rem;animation:home-pet 4s ease-in-out infinite}.plant-station{right:4%;bottom:5%;font-size:3rem}.arcade-console{left:4%;bottom:4%;width:105px;height:145px;border:7px solid #1e2745;border-radius:18px 18px 8px 8px;background:linear-gradient(#1e293b 0 15%,#67e8f9 16% 50%,#47327d 51%);color:#fff;font-size:.72rem;font-weight:900;padding-top:20px}.arcade-console i{display:block;margin-top:55px;color:#f87171}.mission-table{left:38%;top:310px;width:210px;height:70px;border-radius:50%;border:5px solid #29375f;background:#22d3ee44;box-shadow:0 0 28px #22d3ee;color:white;display:grid;place-items:center;font-size:.72rem}.ceiling-drone{left:57%;top:95px;color:#dbeafe;font-size:1.5rem;animation:home-drone 5s ease-in-out infinite}.crystal-lamp{right:33%;top:225px;font-size:3.2rem;filter:drop-shadow(0 0 16px #a78bfa)}.memory-terminal{right:20%;bottom:7%;background:#10182f;border:5px solid #4b5d88;border-radius:9px;color:#67e8f9;padding:12px;font-family:monospace;font-size:.72rem;box-shadow:inset 0 0 18px #22d3ee66}
.room-pipe{position:absolute;background:#4b5874;border:4px solid #26304c;z-index:1}.pipe-a{left:22%;top:55px;width:22px;height:230px}.pipe-b{left:22%;top:265px;width:120px;height:22px}.room-hud{position:absolute;right:3%;bottom:2%;display:flex;gap:7px;z-index:10}.room-hud span{background:#10162ee8;color:#fff;border:1px solid #ffffff55;border-radius:999px;padding:6px 9px;font-size:.72rem}.room-lighting{position:absolute;inset:0;background:#080d20;opacity:var(--room-dark);pointer-events:none;z-index:20}.room-lighting:after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,transparent 35%,#0008 100%)}
@keyframes home-pulse{50%{opacity:.9;transform:scaleX(1.08)}}@keyframes home-bob{50%{transform:translateY(-10px) rotate(3deg)}}@keyframes home-stars{to{filter:hue-rotate(360deg)}}@keyframes home-pet{0%,100%{transform:translateX(0)}50%{transform:translateX(-55px) rotate(-5deg)}}@keyframes home-drone{0%,100%{transform:translate(0,0)}50%{transform:translate(70px,20px)}}
.home-control-panel{background:linear-gradient(145deg,#121a35,#263a6b);border:3px solid #5d6fa1;border-radius:24px;padding:1rem;color:white;box-shadow:0 16px 35px #17213c44}.decoration-card{min-height:170px;background:linear-gradient(145deg,#fff,#f0f4ff);border:2px solid #d7def5;border-radius:20px;padding:1rem;box-shadow:0 9px 24px #2a35651a}.decoration-card.placed{border-color:#51b878;box-shadow:0 0 0 3px #b9efca inset,0 9px 24px #2a35651a}
@media(max-width:700px){.robot-home-scene{height:620px;border-radius:22px}.room-robot{transform:translateX(-50%) scale(.55);bottom:-42px}.room-window{width:44%;height:155px;top:80px}.room-title{max-width:48%;font-size:.8rem}.animal-wall{font-size:1rem}.trophy-shelf{font-size:1.15rem;top:270px}.holo-aquarium{width:105px;height:65px;top:180px}.mission-table,.pipe-a,.pipe-b,.story-library{display:none}.dock{width:92px;height:85px}.room-hud{display:none}.robot-bed{left:18%;padding:12px;font-size:.65rem}.arcade-console{transform:scale(.72);transform-origin:left bottom}.memory-terminal{right:4%;bottom:4%}}
</style>
"""
