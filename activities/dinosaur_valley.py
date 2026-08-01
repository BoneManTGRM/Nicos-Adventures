"""Dinosaur Valley expeditions, fossil collection, and learning challenges."""

from __future__ import annotations

from typing import Any

import streamlit as st

from core.dinosaurs import DINOSAURS, dinosaur_round
from core.memory import remember
from core.world4 import ability_report, discover_dinosaur, ensure_world4
from ui.components import hero
from ui.narration import narration_button


def _new_quiz(profile: dict[str, Any]) -> None:
    counts = profile.setdefault("counts", {})
    counts["dinosaur_quiz_rounds"] = int(
        counts.get("dinosaur_quiz_rounds", 0)
    ) + 1
    seed = (
        f"{counts['dinosaur_quiz_rounds']}:"
        f"{profile.get('stars', 0)}:{profile.get('kid_name', 'Nico')}"
    )
    st.session_state.dinosaur_quiz = dinosaur_round(seed)
    st.session_state.pop("dinosaur_quiz_checked", None)


def render(profile: dict[str, Any]) -> None:
    state = ensure_world4(profile)
    hero(
        "Dinosaur Valley",
        "Explore prehistoric habitats, recover fossils, and use team abilities in the field.",
    )
    abilities = ability_report(profile)
    metrics = st.columns(4)
    metrics[0].metric(
        "Dinosaurs",
        len(state.get("dinosaurs_discovered", [])),
    )
    metrics[1].metric("Fossils", len(state.get("fossils", [])))
    metrics[2].metric(
        "Field abilities",
        sum(abilities.values()),
    )
    metrics[3].metric(
        "Quiz wins",
        profile.get("counts", {}).get("dinosaur_quiz_correct", 0),
    )

    tabs = st.tabs(
        ["🧭 Expedition", "🦴 Fossil Museum", "🧠 Dino Challenge"]
    )
    with tabs[0]:
        dinosaur_id = st.selectbox(
            "Choose an expedition target",
            tuple(DINOSAURS),
            format_func=lambda item: (
                f"{DINOSAURS[item]['emoji']} {DINOSAURS[item]['name']}"
            ),
        )
        dinosaur = DINOSAURS[dinosaur_id]
        required = dinosaur["ability"]
        ready = abilities.get(required, False)
        left, right = st.columns([1, 1.15], gap="large")
        with left:
            st.markdown(
                f"<div style='min-height:330px;border-radius:30px;padding:2rem;"
                "background:linear-gradient(#7dd3fc 0 43%,#86efac 44% 75%,"
                "#a16207 76%);display:grid;place-items:center;text-align:center;"
                "box-shadow:0 18px 40px #22325a33'>"
                f"<div><div style='font-size:8rem'>{dinosaur['emoji']}</div>"
                f"<h2>{dinosaur['name']}</h2>"
                f"<b>{dinosaur['period']}</b></div></div>",
                unsafe_allow_html=True,
            )
        with right:
            st.markdown(f"## {dinosaur['name']}")
            st.write(f"**Diet:** {dinosaur['diet']}")
            st.write(f"**Habitat:** {dinosaur['habitat']}")
            st.write(dinosaur["fact"])
            st.write(
                f"**Recommended team ability:** "
                f"{'✅' if ready else '⬜'} {required.title()}"
            )
            if not ready:
                st.caption(
                    "The expedition can still continue, but matching robot or "
                    "monster equipment adds a full field-team bonus."
                )
            narration_button(
                profile,
                (
                    f"{dinosaur['name']}. {dinosaur['period']}. "
                    f"{dinosaur['fact']}"
                ),
                key=f"dino-{dinosaur_id}",
            )
            if st.button(
                "🔎 Complete Expedition and Recover Fossil",
                type="primary",
                use_container_width=True,
            ):
                is_new = discover_dinosaur(
                    profile,
                    dinosaur_id,
                    dinosaur["fossil"],
                )
                counts = profile.setdefault("counts", {})
                counts["dinosaur_expeditions"] = int(
                    counts.get("dinosaur_expeditions", 0)
                ) + 1
                if ready:
                    counts[f"ability_{required}_uses"] = int(
                        counts.get(f"ability_{required}_uses", 0)
                    ) + 1
                if is_new:
                    remember(
                        profile,
                        kind="dinosaur",
                        title=f"Discovered {dinosaur['name']}",
                        detail=(
                            f"Recovered {dinosaur['fossil']} in "
                            f"{dinosaur['habitat'].lower()}."
                        ),
                        emoji=dinosaur["emoji"],
                        entity_id=dinosaur_id,
                        unique_key=f"dinosaur:{dinosaur_id}",
                    )
                    profile["stars"] = int(profile.get("stars", 0)) + 1
                    st.success(
                        "New discovery saved. One exploration star earned."
                    )
                else:
                    st.success(
                        "Expedition complete. The fossil record is already saved."
                    )
                st.rerun()

        st.markdown("### Valley Field Guide")
        cols = st.columns(3)
        discovered = set(state.get("dinosaurs_discovered", []))
        for index, (item_id, item) in enumerate(DINOSAURS.items()):
            with cols[index % 3]:
                with st.container(border=True):
                    st.markdown(
                        f"### {item['emoji']} "
                        f"{item['name'] if item_id in discovered else 'Undiscovered'}"
                    )
                    if item_id in discovered:
                        st.caption(
                            f"{item['period']} · {item['diet']} · "
                            f"{item['ability'].title()}"
                        )
                        st.write(item["fact"])
                    else:
                        st.caption(
                            "Complete its expedition to reveal the field notes."
                        )

    with tabs[1]:
        fossils = state.get("fossils", [])
        if not fossils:
            st.info("Complete an expedition to open the fossil museum.")
        else:
            cols = st.columns(2)
            for index, fossil in enumerate(fossils):
                with cols[index % 2]:
                    st.markdown(
                        f"<div style='padding:1.2rem;border:6px ridge #b7791f;"
                        "border-radius:18px;background:#fff7d6;text-align:center'>"
                        f"<div style='font-size:3rem'>🦴</div>"
                        f"<b>{fossil}</b></div>",
                        unsafe_allow_html=True,
                    )

    with tabs[2]:
        if "dinosaur_quiz" not in st.session_state:
            _new_quiz(profile)
        quiz = st.session_state.dinosaur_quiz
        st.markdown("### Which prehistoric animal matches this clue?")
        st.info(quiz["prompt"])
        answer = st.radio(
            "Choose an answer",
            quiz["options"],
            key=(
                "dino_answer_"
                f"{profile.get('counts', {}).get('dinosaur_quiz_rounds', 0)}"
            ),
        )
        if st.button(
            "Check Dino Answer",
            type="primary",
            use_container_width=True,
        ):
            st.session_state.dinosaur_quiz_checked = True
            if answer == quiz["answer"]:
                counts = profile.setdefault("counts", {})
                counts["dinosaur_quiz_correct"] = int(
                    counts.get("dinosaur_quiz_correct", 0)
                ) + 1
                profile["stars"] = int(profile.get("stars", 0)) + 1
                st.success("Correct. One learning star earned.")
            else:
                st.info(f"Good try. The answer was {quiz['answer']}.")
        if st.session_state.get("dinosaur_quiz_checked"):
            if st.button("Next Dino Challenge", use_container_width=True):
                _new_quiz(profile)
                st.rerun()
