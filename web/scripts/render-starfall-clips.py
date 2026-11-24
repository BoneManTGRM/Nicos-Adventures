"""Render the silent Starfall catch cinematics from the original game art.
Run with Python, Pillow and FFmpeg. The website serves the finished files.
"""

import math
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance

GAME = Path(__file__).resolve().parents[1] / "public/games/starfall-anglers"
ART, OUT = GAME / "assets", GAME / "clips"
W, H, FPS, FRAMES = 512, 288, 24, 126
# Fish, surface, underwater habitat, leap height, close-up width, signature motion, highlight.
STORIES = [
    ("crown", "pineglass", "fresh", 69, 189, "fins", "#ffd68b"),
    ("phoenix", "ember", "reef", 94, 196, "flare", "#ffac74"),
    ("star", "moon", "ice", 54, 203, "stars", "#bbdfff"),
    ("dragon", "reef", "reef", 50, 166, "leaves", "#bce8a5"),
    ("axolotl", "ruins", "fresh", 33, 156, "frills", "#ffc993"),
    ("narwhal", "aurora", "ice", 86, 207, "lance", "#9ef1e4"),
    ("goldrooster", "faro", "reef", 68, 199, "comb", "#ffdf82"),
    ("marlin", "bank", "bank", 103, 222, "bill", "#c6ebff"),
    ("mantastar", "cabo", "cabo", 79, 223, "wings", "#ffdf91"),
    ("veil", "seamount", "seamount", 49, 244, "ribbon", "#ecaaff"),
    ("moonpaddle", "pineglass", "fresh", 59, 218, "stars", "#ddedff"),
    ("obsidiangiant", "ember", "reef", 81, 238, "flare", "#ff9260"),
    ("prismeel", "moon", "ice", 88, 206, "ribbon", "#d3a4ff"),
    ("sunlion", "reef", "reef", 40, 125, "comb", "#ffda82"),
    ("jadesaw", "ruins", "fresh", 54, 220, "lance", "#8fe8aa"),
    ("auroraskate", "aurora", "ice", 61, 165, "wings", "#94ffcf"),
    ("beaconsail", "faro", "reef", 99, 185, "bill", "#fff39c"),
    ("thunderblue", "bank", "bank", 104, 225, "flare", "#ffe48a"),
    ("greatwhite", "cabo", "cabo", 111, 251, "breach", "#deffff"),
    ("eclipseangler", "seamount", "seamount", 40, 167, "fins", "#ffd97b"),
]
SIN, COS, PI = math.sin, math.cos, math.pi


def smooth(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def landscape(img, zoom, cx, cy):
    width = min(img.width, img.height * W / H) / zoom
    height = width * H / W
    left = (img.width - width) * cx
    top = (img.height - height) * cy
    return img.transform(
        (W, H),
        Image.Transform.EXTENT,
        (left, top, left + width, top + height),
        Image.Resampling.BILINEAR,
    ).convert("RGBA")


def ring(draw, x, y, radius, color):
    draw.ellipse(
        (x - radius, y - radius * 0.18, x + radius, y + radius * 0.18), outline=color, width=1
    )


def fish_sprite(base, width, angle, motion, phase):
    img = base.resize(
        (int(width), max(1, round(base.height * width / base.width))), Image.Resampling.NEAREST
    )
    # Swim motion travels from head to tail. The manta's wings bank and the
    # oarfish forms a long rolling S, including while approaching the net.
    w, h = img.size
    pad = 14
    flex = Image.new("RGBA", (w, h + 2 * pad))
    for x in range(0, w, 4):
        tail = 1 - x / w
        amp = 8 if motion == "ribbon" else 5 if motion == "wings" else 2.8
        cycles = 2.1 if motion == "ribbon" else 1.0
        dy = round(amp * tail * SIN(phase - tail * cycles * PI))
        flex.paste(img.crop((x, 0, min(w, x + 4), h)), (x, pad + dy))
    if motion == "wings":
        flex = flex.resize(
            (w, int(flex.height * (0.89 + 0.12 * COS(phase)))), Image.Resampling.NEAREST
        )
    return flex.rotate(angle, Image.Resampling.BICUBIC, expand=True)


def draw_fish(frame, sprite, x, y):
    frame.alpha_composite(sprite, (round(x - sprite.width / 2), round(y - sprite.height / 2)))


def rod_and_line(draw, mouth, pulse):
    # Quadratic bent rod, guides, and a finer line from its tip to the fish.
    a, b, c = (-9, 299), (17, 76 - pulse * 19), (130 + pulse * 9, 107 + pulse * 13)
    rod = []
    for n in range(25):
        t = n / 24
        rod.append(
            (
                (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0],
                (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1],
            )
        )
    draw.line(rod, fill="#152e37", width=5)
    draw.line(rod, fill="#d7a463", width=2)
    for i in (5, 11, 18, 24):
        x, y = rod[i]
        draw.ellipse((x - 2, y - 1, x + 2, y + 2), outline="#ebe4b6")
    draw.line(
        [c, ((c[0] + mouth[0]) / 2, (c[1] + mouth[1]) / 2 + 3), mouth], fill="#e7f3e4", width=1
    )


def water_burst(draw, x, y, age, color, strength=1.0):
    if not 0 <= age <= 1:
        return
    ring(draw, x, y, 8 + 56 * age, color)
    for i in range(19):
        k = (i * 13 % 19) / 18
        dx = (2 * k - 1) * age * 59 * strength
        dy = (-SIN(k * PI) * 82 * strength - 8) * age + 82 * strength * age * age
        if dy < 1:
            r = 2 if i % 3 == 0 else 1
            draw.ellipse((x + dx - r, y + dy - r, x + dx + r, y + dy + r), fill=color)


def render(story):
    fish, place, habitat, height, close_width, motion, gold = story
    back = Image.open(ART / (place + ".png")).convert("RGB")
    under = Image.open(ART / ("dive-" + habitat + ".png")).convert("RGB")
    animal = Image.open(ART / (fish + ".png")).convert("RGBA")
    animal = animal.crop(animal.getbbox())
    index = next(i for i, s in enumerate(STORIES) if s[0] == fish)
    # Shift the shot toward Cabo's arch and the lighthouse in their own films.
    focus = 0.24 if place in ("cabo", "faro") else 0.5
    film = subprocess.Popen(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "-s",
            f"{W}x{H}",
            "-r",
            str(FPS),
            "-i",
            "pipe:0",
            "-an",
            "-c:v",
            "libx264",
            "-threads",
            "1",
            "-preset",
            "medium",
            "-crf",
            "25",
            "-profile:v",
            "main",
            "-level",
            "3.0",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(OUT / (fish + ".mp4")),
        ],
        stdin=subprocess.PIPE,
    )
    for n in range(FRAMES):
        sec = n / FPS
        if n < 38:
            u = n / 37
            frame = landscape(under, 1.04 + 0.055 * u, 0.40 + 0.10 * u, 0.57)
            d = ImageDraw.Draw(frame)
            for i in range(17):
                x = (i * 59 + 5 * SIN(sec + i)) % W
                y = (H + i * 37 - sec * (9 + i % 6)) % H
                r = 1 + i % 3
                d.ellipse((x - r, y - r, x + r, y + r), outline="#85c8c9")
            x = 94 + 202 * smooth(u)
            y = 167 - 51 * smooth(u) + 9 * SIN(u * PI * 2 + index * 0.5)
            size = 64 + 69 * u
            bob_x = 343 + 4 * SIN(sec * 4)
            bob_y = 116 + 2 * COS(sec * 4) - 11 * smooth((u - 0.72) / 0.28)
            d.line([(bob_x + 35, -1), (bob_x, bob_y)], fill="#c7dfd9")
            d.polygon(
                [(bob_x - 5, bob_y), (bob_x, bob_y - 6), (bob_x + 6, bob_y), (bob_x, bob_y + 3)],
                fill=gold,
            )
            spr = fish_sprite(animal, size, 5 + 3 * SIN(sec * 3), motion, sec * 6)
            draw_fish(frame, spr, x, y)
        elif n < 91:
            u = (n - 38) / 52
            frame = landscape(back, 1.01 + 0.08 * u, focus + 0.04 * u, 0.55)
            d = ImageDraw.Draw(frame)
            water = 221
            arc = abs(SIN(PI * (u * 1.82 + 0.03))) if motion == "bill" else SIN(PI * u)
            x = 114 + 254 * u
            y = water - 15 - height * arc
            tilt = 34 * COS(PI * u) if motion != "bill" else 34 * COS(PI * (3.64 * u + 0.06))
            size = close_width * (0.64 + 0.16 * arc)
            if motion == "breach":
                tilt = 46 * COS(PI * u)
                y -= 8 * SIN(PI * u) ** 4
            if motion == "frills":
                y += 6 * SIN(3 * PI * u)
            if motion == "lance":
                tilt += 9
            if motion == "leaves":
                tilt += 13 * SIN(PI * 2 * u)
            rod_and_line(
                d,
                (
                    x + 0.40 * size * COS(math.radians(tilt)),
                    y - 0.40 * size * SIN(math.radians(tilt)),
                ),
                arc,
            )
            ring(d, x, water, 16 + 13 * arc, "#b8e4de")
            draw_fish(frame, fish_sprite(animal, size, tilt, motion, sec * 6), x, y)
            water_burst(d, 115, water, u * 2.7, "#d6f4ef")
            if motion == "bill":
                water_burst(d, 249, water, (u - 0.52) * 3.0, "#eefffa")
            if motion in ("flare", "stars", "comb", "fins") and 0.18 < u < 0.83:
                for j in range(4):
                    sx = x - size * 0.37 + j * size * 0.18
                    sy = y - 17 - 9 * SIN(j + sec * 3)
                    d.line((sx - 2, sy, sx + 2, sy), fill=gold)
                    d.line((sx, sy - 2, sx, sy + 2), fill=gold)
            water_burst(d, 364, water, (u - 0.81) * 4, "#edf7dc")
        else:
            u = (n - 91) / (FRAMES - 92)
            frame = landscape(back, 1.22 + 0.045 * smooth(u), focus, 0.92)
            frame = ImageEnhance.Brightness(frame).enhance(0.88)
            d = ImageDraw.Draw(frame)
            cx, cy = 267, 163
            rx, ry = 147, 55
            d.line([(W + 8, H + 7), (cx + rx - 8, cy + 12)], fill="#2c251e", width=13)
            d.line([(W + 8, H + 7), (cx + rx - 8, cy + 12)], fill="#bc965d", width=7)
            bowl = Image.new("RGBA", (W, H))
            mesh = ImageDraw.Draw(bowl)
            mesh.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(13, 47, 51, 140))
            for k in range(-6, 7):
                shift = k / 7
                edge = math.sqrt(1 - shift * shift)
                mesh.arc(
                    (cx - rx * edge, cy + shift * ry - 9, cx + rx * edge, cy + shift * ry + 9),
                    0,
                    180,
                    fill=(183, 204, 160, 175),
                )
                px = cx + shift * rx
                mesh.line(
                    [(px, cy - ry * edge), (px - 7 * shift, cy), (px, cy + ry * edge)],
                    fill=(149, 180, 155, 175),
                )
            frame.alpha_composite(bowl)
            d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), outline="#8d6b42", width=5)
            d.arc((cx - rx, cy - ry, cx + rx, cy + ry), 180, 360, fill="#efdb9f", width=2)
            x = cx - 56 * (1 - smooth(u * 2))
            y = cy - 32 * (1 - smooth(u * 2)) - 2 * COS(sec * 3)
            tilt = 8 * (1 - smooth(u * 2)) + 2 * SIN(sec * 4)
            draw_fish(frame, fish_sprite(animal, close_width, tilt, motion, sec * 4), x, y)
            d.arc((cx - rx, cy - ry, cx + rx, cy + ry), 15, 165, fill="#e5c998", width=3)
            if u < 0.6:
                water_burst(d, cx - 39, cy + 26, u / 0.6, "#c9f1e6", 0.48)
        if n == 62:
            frame.convert("RGB").save(OUT / (fish + ".webp"), quality=79)
        film.stdin.write(frame.convert("RGB").tobytes())
    film.stdin.close()
    if film.wait():
        raise RuntimeError("Could not encode " + fish)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    with ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(render, STORIES))
