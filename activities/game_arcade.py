"""Small, replayable learning games for Nico's World."""

from __future__ import annotations

import random

import streamlit as st

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


def _new_round(profile: dict, game: str) -> None:
    seed = int(profile.get("counts", {}).get("arcade_rounds", 0)) + int(profile.get("stars", 0))
    rng = random.Random(f"{game}:{seed}")
    if game == "Animal Clue":
        clue, answer = rng.choice(ANIMAL_CLUES)
        options = [item[1] for item in ANIMAL_CLUES]
        rng.shuffle(options)
        st.session_state.arcade_round = {"game": game, "prompt": clue, "answer": answer, "options": options}
    elif game == "Pattern Power":
        prompt, answer = rng.choice(PATTERNS)
        options = list({answer, "🌙", "🔵", "32", "🐾", "16", "🤖", "⭐"})
        rng.shuffle(options)
        st.session_state.arcade_round = {"game": game, "prompt": f"What comes next? {prompt}", "answer": answer, "options": options[:4] if answer in options[:4] else [answer, *options[:3]]}
    else:
        parts = ("Head", "Eyes", "Arms", "Wheels", "Backpack", "Power Core")
        chosen = rng.sample(parts, 3)
        st.session_state.arcade_round = {
            "game": game,
            "prompt": f"Remember these robot parts: {' · '.join(chosen)}",
            "answer": " · ".join(chosen),
            "options": [" · ".join(chosen), "Eyes · Hat · Wings", "Arms · Wheels · Hat", "Head · Drone · Tail"],
        }
    profile.setdefault("counts", {})["arcade_rounds"] = int(profile["counts"].get("arcade_rounds", 0)) + 1


def render(profile: dict) -> None:
    state = ensure_world2(profile)
    hero(
        "Game Arcade",
        "Short learning games that reward real answers, improve with practice, and connect to missions.",
    )
    best = state.get("arcade_best", {})
    metrics = st.columns(3)
    metrics[0].metric("Arcade wins", profile.get("counts", {}).get("arcade_wins", 0))
    metrics[1].metric("Animal best", best.get("Animal Clue", 0))
    metrics[2].metric("Pattern best", best.get("Pattern Power", 0))

    game = st.radio("Choose a game", ("Animal Clue", "Pattern Power", "Robot Memory"), horizontal=True)
    round_data = st.session_state.get("arcade_round")
    if not round_data or round_data.get("game") != game:
        _new_round(profile, game)
        round_data = st.session_state.arcade_round

    if game == "Robot Memory" and not st.session_state.get("memory_hidden", False):
        st.info(round_data["prompt"])
        if st.button("I Remember Them", type="primary", use_container_width=True):
            st.session_state.memory_hidden = True
            st.rerun()
        return

    st.markdown(f"### {round_data['prompt'] if game != 'Robot Memory' else 'Which set did you see?'}")
    answer = st.radio("Choose", round_data["options"], key=f"arcade_{game}_{profile.get('counts', {}).get('arcade_rounds', 0)}")
    if st.button("Check Arcade Answer", type="primary", use_container_width=True):
        if answer == round_data["answer"]:
            streak_key = f"arcade_streak_{game}"
            score = int(st.session_state.get(streak_key, 0)) + 1
            st.session_state[streak_key] = score
            record_arcade_win(profile, game, score)
            profile["sidekick_message"] = f"Arcade win! {game} streak: {score}."
            st.success(f"Correct. Streak: {score}. You earned one star.")
        else:
            st.session_state[f"arcade_streak_{game}"] = 0
            st.info(f"Good try. The answer was {round_data['answer']}.")
        st.session_state.arcade_checked = True

    if st.session_state.get("arcade_checked"):
        if st.button("Next Round", use_container_width=True):
            st.session_state.pop("arcade_checked", None)
            st.session_state.pop("memory_hidden", None)
            _new_round(profile, game)
            st.rerun()
