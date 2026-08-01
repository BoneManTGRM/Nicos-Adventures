"""Animal Forest exploration, expeditions, quizzes, collections, and builder mode."""

from __future__ import annotations

import random
import re
from typing import Any

import streamlit as st

from core.achievements import record_event
from core.animal_world import (
    HABITATS,
    all_animals,
    choose_expedition,
    filter_animals,
    habitat_progress,
    habitats_for,
    make_quiz,
)
from core.memory import mark_discovered, new_id, remember, utc_now
from core.profile import MAX_CUSTOM_ANIMALS, active_robot, remove_custom_animal
from core.robot import robot_phrase
from ui.components import hero, show_new_badges


def _clean(value: str, limit: int) -> str:
    return re.sub(r"[<>]", "", value).strip()[:limit]


def _is_named(items: list[str], name: str) -> bool:
    return name.casefold() in {str(item).casefold() for item in items}


def _remember_animal(profile: dict[str, Any], animal: dict[str, Any], *, source: str) -> list[Any]:
    badges: list[Any] = []
    if mark_discovered(profile, animal["name"]):
        badges.extend(record_event(profile, "animal_discoveries"))
    remember(
        profile,
        kind="animal",
        title=f"Discovered {animal['name']}",
        detail=(
            f"{animal['fact']} Habitat: {animal['habitat']}. "
            f"Adaptation: {animal.get('adaptation', 'A special survival skill.')}"
        ),
        emoji=animal.get("emoji", "🐾"),
        entity_id=animal.get("id") or animal["name"],
        unique_key=f"animal-discovery:{animal['name'].casefold()}",
    )
    robot = active_robot(profile)
    profile["sidekick_message"] = robot_phrase(
        "animal",
        robot["name"] if robot else "Robo Guide",
        seed=f"{source}:{animal['name']}",
    )
    return badges


def _animal_card(profile: dict[str, Any], animal: dict[str, Any], *, key_prefix: str) -> None:
    discovered = _is_named(profile.get("discovered_animals", []), animal["name"])
    favorite = _is_named(profile.get("favorites", []), animal["name"])
    habitat_emoji = HABITATS.get(animal.get("habitat", ""), ("🌎", ""))[0]

    with st.container(border=True):
        top_left, top_right = st.columns([1, 5])
        top_left.markdown(f"# {animal.get('emoji', '🐾')}")
        top_right.markdown(f"## {animal['name']} {'✅' if discovered else ''}")
        top_right.caption(
            f"{habitat_emoji} {animal.get('habitat', 'Unknown')} · "
            f"{animal.get('group', 'Animal')} · {animal.get('diet', 'Unknown diet')}"
        )
        st.write(f"**Where:** {animal.get('region', 'Nico’s World')}")
        st.write(animal.get("fact", "A fascinating animal."))
        with st.expander("How does it survive?"):
            st.write(animal.get("adaptation", "It has special traits that help it survive."))
            st.caption(f"Field mission: {animal.get('mission', 'Learn one new fact about this animal.')}")

        left, right = st.columns(2)
        with left:
            if st.button(
                "✅ In Field Guide" if discovered else "🔎 Add to Field Guide",
                key=f"{key_prefix}_discover",
                disabled=discovered,
                use_container_width=True,
            ):
                show_new_badges(_remember_animal(profile, animal, source="field-guide"))
                st.rerun()
        with right:
            if st.button(
                "⭐ Remove Favorite" if favorite else "☆ Add Favorite",
                key=f"{key_prefix}_favorite",
                use_container_width=True,
            ):
                if favorite:
                    profile["favorites"] = [
                        item
                        for item in profile.get("favorites", [])
                        if str(item).casefold() != animal["name"].casefold()
                    ]
                else:
                    profile.setdefault("favorites", []).append(animal["name"])
                    badges = record_event(profile, "animal_favorites")
                    badges.extend(_remember_animal(profile, animal, source="favorite"))
                    show_new_badges(badges)
                st.rerun()


def _explore_tab(profile: dict[str, Any], animals: list[dict[str, Any]]) -> None:
    st.markdown("### 🔭 Explore the animal library")
    habitats = ("All", *habitats_for(animals))
    groups = ("All", *sorted({str(animal.get("group", "Animal")) for animal in animals}))
    filters = st.columns([1, 1, 1.4])
    habitat = filters[0].selectbox("Habitat", habitats, key="animal_filter_habitat")
    group = filters[1].selectbox("Animal group", groups, key="animal_filter_group")
    query = filters[2].text_input("Search", placeholder="Try owl, Mexico, ocean...", key="animal_search")
    matches = filter_animals(animals, habitat=habitat, group=group, query=query)
    st.caption(f"Showing {len(matches)} of {len(animals)} animals")
    if not matches:
        st.info("No animals matched those filters. Try another habitat or search word.")
        return
    names = [animal["name"] for animal in matches]
    selected = st.selectbox("Choose an animal", names, key="animal_selected")
    animal = next(item for item in matches if item["name"] == selected)
    _animal_card(profile, animal, key_prefix=f"explore_{selected}")


def _expedition_tab(profile: dict[str, Any], animals: list[dict[str, Any]]) -> None:
    st.markdown("### 🧭 Robot expeditions")
    st.write("Choose a habitat, send the team out, and uncover an animal clue.")
    habitat = st.selectbox("Expedition destination", ("All", *habitats_for(animals)), key="expedition_habitat")
    robot = active_robot(profile)
    button_label = f"Send {robot['name']} Exploring" if robot else "Start Expedition"
    if st.button(f"🥾 {button_label}", type="primary", use_container_width=True):
        seed = f"{profile.get('counts', {}).get('animal_expeditions', 0)}:{habitat}:{profile.get('xp', 0)}"
        st.session_state.animal_expedition = choose_expedition(
            animals,
            profile.get("discovered_animals", []),
            habitat=habitat,
            seed=seed,
        )

    found = st.session_state.get("animal_expedition")
    if not found:
        st.info("The trail is ready. Start an expedition to reveal a discovery.")
        return

    habitat_emoji = HABITATS.get(found.get("habitat", ""), ("🌎", ""))[0]
    st.success(f"Tracks found in {habitat_emoji} {found.get('habitat', 'the wild')}!")
    st.markdown(f"# {found.get('emoji', '🐾')} {found['name']}")
    st.write(found["fact"])
    st.write(f"**Survival clue:** {found.get('adaptation', '')}")
    if st.button("📓 Complete Expedition and Save Discovery", use_container_width=True):
        badges = _remember_animal(profile, found, source="expedition")
        badges.extend(record_event(profile, "animal_expeditions"))
        robot = active_robot(profile)
        if robot:
            robot["jobs_completed"] = int(robot.get("jobs_completed", 0)) + 1
            robot["xp"] = int(robot.get("xp", 0)) + 15
            robot["level"] = min(100, robot["xp"] // 50 + 1)
            badges.extend(record_event(profile, "robot_jobs"))
            profile["sidekick_message"] = f"{robot['name']}: Expedition complete! We found {found['name']}!"
        remember(
            profile,
            kind="expedition",
            title=f"Expedition found {found['name']}",
            detail=f"Explored {found.get('habitat', 'the wild')} and recorded a new field observation.",
            emoji="🧭",
        )
        show_new_badges(badges)
        st.session_state.pop("animal_expedition", None)
        st.rerun()


def _quiz_tab(profile: dict[str, Any], animals: list[dict[str, Any]]) -> None:
    st.markdown("### 🧠 Animal challenge")
    correct = int(profile.get("counts", {}).get("animal_quiz_correct", 0))
    attempts = int(profile.get("counts", {}).get("animal_quiz_attempts", 0))
    a, b = st.columns(2)
    a.metric("Correct answers", correct)
    b.metric("Challenges tried", attempts)

    if "animal_quiz" not in st.session_state:
        st.session_state.animal_quiz = make_quiz(animals, seed=f"first:{profile.get('xp', 0)}")
    quiz = st.session_state.animal_quiz
    st.markdown(f"#### {quiz['prompt']}")
    answer = st.radio("Choose an answer", quiz["options"], key=f"quiz_answer_{quiz['answer']}")
    if st.button("Check Answer", type="primary", use_container_width=True):
        badges = record_event(profile, "animal_quiz_attempts")
        if answer == quiz["answer"]:
            badges.extend(record_event(profile, "animal_quiz_correct"))
            badges.extend(_remember_animal(profile, quiz["animal"], source="quiz"))
            st.session_state.animal_quiz_result = (True, f"Correct! {quiz['animal']['fact']}")
        else:
            st.session_state.animal_quiz_result = (
                False,
                f"Good try. The answer was {quiz['answer']}. {quiz['animal']['adaptation']}",
            )
        show_new_badges(badges)

    result = st.session_state.get("animal_quiz_result")
    if result:
        (st.success if result[0] else st.info)(result[1])
        if st.button("Next Challenge", use_container_width=True):
            number = int(profile.get("counts", {}).get("animal_quiz_attempts", 0))
            st.session_state.animal_quiz = make_quiz(animals, seed=f"quiz:{number}:{profile.get('xp', 0)}")
            st.session_state.pop("animal_quiz_result", None)
            st.rerun()


def _collection_tab(profile: dict[str, Any], animals: list[dict[str, Any]]) -> None:
    st.markdown("### 📚 Nico's Field Guide")
    discovered = profile.get("discovered_animals", [])
    progress = habitat_progress(discovered, animals)
    total = len({animal["name"].casefold() for animal in animals})
    found = len({name.casefold() for name in discovered})
    st.progress(min(found / total, 1.0) if total else 0.0, text=f"{found} of {total} animals discovered")

    cols = st.columns(2)
    for index, (habitat, (complete, count)) in enumerate(progress.items()):
        emoji, description = HABITATS.get(habitat, ("🌎", "A special habitat in Nico's World."))
        with cols[index % 2]:
            with st.container(border=True):
                st.markdown(f"### {emoji} {habitat}")
                st.caption(description)
                st.progress(complete / count if count else 0.0, text=f"{complete} / {count} found")

    if profile.get("favorites"):
        st.markdown("#### ⭐ Favorite animals")
        st.write(" · ".join(profile["favorites"]))

    discovered_lookup = {name.casefold() for name in discovered}
    discovered_animals = [animal for animal in animals if animal["name"].casefold() in discovered_lookup]
    if discovered_animals:
        st.markdown("#### Discovery cards")
        for animal in discovered_animals:
            with st.expander(f"{animal.get('emoji', '🐾')} {animal['name']} · {animal.get('habitat', '')}"):
                st.write(animal.get("fact", ""))
                st.caption(f"Adaptation: {animal.get('adaptation', '')}")
    else:
        st.info("Explore an animal or complete an expedition to begin the Field Guide.")


def _builder_tab(profile: dict[str, Any], animals: list[dict[str, Any]]) -> None:
    st.markdown("### 🧰 Builder Mode: create an animal entry")
    st.caption("Nico's animal becomes part of the complete Memory Save.")
    with st.form("add_animal", clear_on_submit=True):
        name = st.text_input("Animal name", max_chars=40)
        emoji = st.text_input("Animal emoji", value="🐾", max_chars=8)
        habitat = st.selectbox("Habitat", (*HABITATS, "Nico's World"))
        region = st.text_input("Where in the world does it live?", max_chars=60)
        group = st.selectbox("Animal group", ("Mammal", "Bird", "Reptile", "Amphibian", "Fish", "Insect", "Mollusk", "Other"))
        diet = st.selectbox("Diet", ("Herbivore", "Carnivore", "Omnivore", "Other"))
        fact = st.text_area("Write one fun fact", max_chars=180)
        adaptation = st.text_area("What special trait helps it survive?", max_chars=180)
        submitted = st.form_submit_button("Add to Animal Forest", type="primary")

    if submitted:
        clean_name = _clean(name, 40)
        clean_region = _clean(region, 60)
        clean_fact = _clean(fact, 180)
        clean_adaptation = _clean(adaptation, 180)
        if not clean_name or not clean_region or not clean_fact or not clean_adaptation:
            st.error("Please complete the name, location, fact, and survival trait.")
        elif len(profile.get("custom_animals", [])) >= MAX_CUSTOM_ANIMALS:
            st.error("The forest memory is full. Remove an older custom animal first.")
        elif clean_name.casefold() in {item["name"].casefold() for item in animals}:
            st.error("That animal is already in the forest.")
        else:
            custom_animal = {
                "id": new_id("animal"),
                "name": clean_name,
                "emoji": _clean(emoji, 8) or "🐾",
                "habitat": habitat,
                "region": clean_region,
                "group": group,
                "diet": diet,
                "fact": clean_fact,
                "adaptation": clean_adaptation,
                "mission": f"Learn more about {clean_name}.",
                "created_at": utc_now(),
            }
            profile.setdefault("custom_animals", []).append(custom_animal)
            badges = record_event(profile, "custom_animals")
            badges.extend(_remember_animal(profile, custom_animal, source="builder"))
            remember(
                profile,
                kind="animal",
                title=f"Created {clean_name}",
                detail=f"{clean_fact} Adaptation: {clean_adaptation}",
                emoji=custom_animal["emoji"],
                entity_id=custom_animal["id"],
                unique_key=f"custom-animal:{custom_animal['id']}",
            )
            profile["sidekick_message"] = f"New Animal Forest entry saved: {clean_name}!"
            show_new_badges(badges)
            st.rerun()

    if profile.get("custom_animals"):
        st.markdown("#### Nico's created animals")
        for custom in profile["custom_animals"]:
            with st.container(border=True):
                left, right = st.columns([4, 1])
                left.markdown(f"**{custom.get('emoji', '🐾')} {custom.get('name', 'Animal')}**")
                left.caption(f"{custom.get('habitat', '')} · {custom.get('fact', '')}")
                if right.button(
                    "Remove",
                    key=f"remove_animal_{custom.get('id', custom.get('name'))}",
                    use_container_width=True,
                ):
                    remove_custom_animal(profile, str(custom.get("id", "")))
                    st.rerun()


def render(profile: dict[str, Any]) -> None:
    hero(
        "Animal Forest",
        "Explore eight habitats, lead expeditions, solve animal challenges, and build a living field guide.",
    )
    animals = all_animals(profile.get("custom_animals", []))
    discovered = len(profile.get("discovered_animals", []))
    a, b, c = st.columns(3)
    a.metric("Animals", len(animals))
    b.metric("Discovered", discovered)
    c.metric("Habitats", len(habitats_for(animals)))

    tabs = st.tabs(["🔭 Explore", "🧭 Expeditions", "🧠 Quiz", "📚 Field Guide", "🧰 Builder Mode"])
    with tabs[0]:
        _explore_tab(profile, animals)
    with tabs[1]:
        _expedition_tab(profile, animals)
    with tabs[2]:
        _quiz_tab(profile, animals)
    with tabs[3]:
        _collection_tab(profile, animals)
    with tabs[4]:
        _builder_tab(profile, animals)
