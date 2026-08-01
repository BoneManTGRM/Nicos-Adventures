"""Replayable learning and adventure games for Nico's World."""

from __future__ import annotations

import random
from typing import Any

import streamlit as st

from core.dinosaurs import DINOSAURS
from core.world2 import ensure_world2, record_arcade_win
from ui.components import hero

ANIMAL_CLUES = (
    ("I am the largest animal on Earth and live in the ocean.", "Blue Whale"),
    ("I can regrow limbs and live in Mexico's wetlands.", "Axolotl"),
    ("I have a very long neck and eat high leaves.", "Giraffe"),
    ("I change my coat color with the seasons.", "Arctic Fox"),
)
PATTERNS = (
    ("🔴 🔵 🔴 🔵", "🔴"),
    ("⭐ ⭐ 🌙 ⭐ ⭐ 🌙", "⭐"),
    ("1, 2, 4, 8", "16"),
    ("🤖 🐾 🤖 🐾", "🤖"),
)
MAZES = (
    (
        "Start at the robot. Move right, right, up, then left. Where do you finish?",
        "Crystal",
        ("Crystal", "Monster", "Tree", "Rocket"),
    ),
    (
        "Start at the cave. Move up, left, left, then down. Where do you finish?",
        "Monster Home",
        ("Monster Home", "Ocean", "Castle", "Arcade"),
    ),
    (
        "Start at the star. Move down, right, up, then right. Where do you finish?",
        "Robot Dock",
        ("Robot Dock", "Jungle", "Moon", "Fossil"),
    ),
)

GAMES = (
    "Animal Clue",
    "Pattern Power",
    "Robot Memory",
    "Dino Dig",
    "Monster Maze",
    "Rocket Math",
)


def _seed(profile: dict[str, Any], game: str) -> random.Random:
    counts = profile.setdefault("counts", {})
    round_number = int(counts.get("arcade_rounds", 0))
    return random.Random(f"{game}:{round_number}:{profile.get('stars', 0)}")


def _new_round(profile: dict[str, Any], game: str) -> None:
    rng = _seed(profile, game)
    if game == "Animal Clue":
        clue, answer = rng.choice(ANIMAL_CLUES)
        options = [item[1] for item in ANIMAL_CLUES]
        rng.shuffle(options)
        round_data = {
            "game": game,
            "prompt": clue,
            "answer": answer,
            "options": options,
            "scene": "🌳 🐾 🌿",
        }
    elif game == "Pattern Power":
        prompt, answer = rng.choice(PATTERNS)
        distractors = ["🌙", "🔵", "32", "🐾", "16", "🤖", "⭐", "🔴"]
        options = list(dict.fromkeys([answer, *distractors]))
        rng.shuffle(options)
        selected = options[:4]
        if answer not in selected:
            selected[-1] = answer
            rng.shuffle(selected)
        round_data = {
            "game": game,
            "prompt": f"What comes next? {prompt}",
            "answer": answer,
            "options": selected,
            "scene": "⚡ ◼️ ✦ ◼️",
        }
    elif game == "Robot Memory":
        parts = (
            "Head",
            "Eyes",
            "Arms",
            "Wheels",
            "Backpack",
            "Power Core",
        )
        chosen = rng.sample(parts, 3)
        answer = " · ".join(chosen)
        options = [
            answer,
            "Eyes · Hat · Wings",
            "Arms · Wheels · Hat",
            "Head · Drone · Tail",
        ]
        rng.shuffle(options)
        round_data = {
            "game": game,
            "prompt": f"Remember these robot parts: {answer}",
            "answer": answer,
            "options": options,
            "scene": "🤖 🧠 ⚙️",
        }
    elif game == "Dino Dig":
        dinosaur_id = rng.choice(tuple(DINOSAURS))
        dinosaur = DINOSAURS[dinosaur_id]
        wrong = [
            item["name"]
            for key, item in DINOSAURS.items()
            if key != dinosaur_id
        ]
        options = rng.sample(wrong, 3) + [dinosaur["name"]]
        rng.shuffle(options)
        round_data = {
            "game": game,
            "prompt": f"A fossil clue says: {dinosaur['fact']}",
            "answer": dinosaur["name"],
            "options": options,
            "scene": "🦴 ⛏️ 🦖",
        }
    elif game == "Monster Maze":
        prompt, answer, choices = rng.choice(MAZES)
        options = list(choices)
        rng.shuffle(options)
        round_data = {
            "game": game,
            "prompt": prompt,
            "answer": answer,
            "options": options,
            "scene": "👾 ➡️ ⬆️ ⬅️",
        }
    else:
        left = rng.randint(3, 12)
        right = rng.randint(2, 9)
        operation = rng.choice(("+", "-", "×"))
        if operation == "+":
            answer_value = left + right
        elif operation == "-":
            left, right = max(left, right), min(left, right)
            answer_value = left - right
        else:
            answer_value = left * right
        answer = str(answer_value)
        distractors = {
            str(answer_value + 1),
            str(max(0, answer_value - 1)),
            str(answer_value + right),
            str(abs(left - right)),
        }
        distractors.discard(answer)
        options = [answer, *list(distractors)[:3]]
        rng.shuffle(options)
        round_data = {
            "game": game,
            "prompt": f"The rocket needs the answer to {left} {operation} {right}.",
            "answer": answer,
            "options": options,
            "scene": "🚀 ✦ 🌙",
        }
    st.session_state.arcade_round = round_data
    counts = profile.setdefault("counts", {})
    counts["arcade_rounds"] = int(counts.get("arcade_rounds", 0)) + 1
    st.session_state.pop("arcade_checked", None)
    st.session_state.pop("memory_hidden", None)


def render(profile: dict[str, Any]) -> None:
    state = ensure_world2(profile)
    hero(
        "Game Arcade",
        "Six learning adventures with streaks, stars, dinosaurs, mazes, memory, and math.",
    )
    best = state.get("arcade_best", {})
    metrics = st.columns(4)
    metrics[0].metric(
        "Arcade wins",
        profile.get("counts", {}).get("arcade_wins", 0),
    )
    metrics[1].metric("Best streak", max(best.values(), default=0))
    metrics[2].metric(
        "Rounds played",
        profile.get("counts", {}).get("arcade_rounds", 0),
    )
    metrics[3].metric("Games", len(GAMES))

    game = st.radio("Choose a game", GAMES, horizontal=True)
    round_data = st.session_state.get("arcade_round")
    if not round_data or round_data.get("game") != game:
        _new_round(profile, game)
        round_data = st.session_state.arcade_round

    st.markdown(
        f"<div style='padding:1.5rem;border-radius:24px;text-align:center;"
        "font-size:3rem;background:linear-gradient(145deg,#1e293b,#4338ca);"
        "color:white;box-shadow:0 15px 35px #11182744'>"
        f"{round_data.get('scene', '🎮')}</div>",
        unsafe_allow_html=True,
    )

    if game == "Robot Memory" and not st.session_state.get(
        "memory_hidden",
        False,
    ):
        st.info(round_data["prompt"])
        if st.button(
            "I Remember Them",
            type="primary",
            use_container_width=True,
        ):
            st.session_state.memory_hidden = True
            st.rerun()
        return

    prompt = (
        round_data["prompt"]
        if game != "Robot Memory"
        else "Which set did you see?"
    )
    st.markdown(f"### {prompt}")
    answer = st.radio(
        "Choose",
        round_data["options"],
        key=(
            f"arcade_{game}_"
            f"{profile.get('counts', {}).get('arcade_rounds', 0)}"
        ),
    )
    if st.button(
        "Check Arcade Answer",
        type="primary",
        use_container_width=True,
    ):
        if answer == round_data["answer"]:
            streak_key = f"arcade_streak_{game}"
            score = int(st.session_state.get(streak_key, 0)) + 1
            st.session_state[streak_key] = score
            record_arcade_win(profile, game, score)
            profile["sidekick_message"] = (
                f"Arcade win! {game} streak: {score}."
            )
            st.success(f"Correct. Streak: {score}. You earned one star.")
        else:
            st.session_state[f"arcade_streak_{game}"] = 0
            st.info(f"Good try. The answer was {round_data['answer']}.")
        st.session_state.arcade_checked = True

    if st.session_state.get("arcade_checked"):
        if st.button("Next Round", use_container_width=True):
            _new_round(profile, game)
            st.rerun()
