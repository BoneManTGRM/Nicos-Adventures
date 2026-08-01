"""Streamlit integration for functional robot jobs."""

from __future__ import annotations

from typing import Any

import streamlit as st

from activities import robo_lab
from core.achievements import record_event
from core.catalog import ANIMATIONS
from core.memory import remember, robot_progress
from core.profile import active_robot
from core.robot_jobs import ROBOT_JOBS, perform_robot_job
from ui.components import robot_stage, show_new_badges

_INSTALLED = False


def _render_last_job_result(profile: dict[str, Any]) -> None:
    result = profile.get("last_job_result")
    if not isinstance(result, dict):
        return
    with st.container(border=True):
        st.markdown(
            f"### {result.get('emoji', '🛠️')} {result.get('summary', 'Job complete')}"
        )
        st.write(result.get("detail", "The robot completed the assignment."))
        st.caption(f"Completed job: {result.get('title', 'Robot Job')}")
        if st.button("Clear Job Report", key="clear_job_report", use_container_width=True):
            profile.pop("last_job_result", None)
            st.rerun()


def _run_job(profile: dict[str, Any], job_id: str) -> None:
    try:
        _, badges = perform_robot_job(profile, job_id)
    except (KeyError, ValueError) as exc:
        st.error(str(exc))
        return
    show_new_badges(badges)
    st.rerun()


def _functional_move_tab(profile: dict[str, Any]) -> None:
    robot = active_robot(profile)
    if not robot:
        st.info("Build a robot first, then come back to make it move and work.")
        return

    st.markdown(f"### Play with {robot['name']}")
    status = st.columns(4)
    status[0].metric("Level", robot.get("level", 1))
    status[1].metric("Robot XP", robot.get("xp", 0))
    status[2].metric("Moves", robot.get("times_moved", 0))
    status[3].metric("Jobs", robot.get("jobs_completed", 0))
    robot_stage(robot, profile.get("last_animation", "idle"))
    if robot.get("catchphrase"):
        st.info(f"{robot['name']}: “{robot['catchphrase']}”")

    st.markdown("### Movement controls")
    cols = st.columns(4)
    for index, (action_id, (label, emoji)) in enumerate(ANIMATIONS.items()):
        with cols[index % 4]:
            if st.button(
                f"{emoji} {label}",
                key=f"move_{action_id}",
                use_container_width=True,
            ):
                profile["last_animation"] = action_id
                profile["sidekick_message"] = (
                    f"{robot['name']}: {label} sequence activated!"
                )
                if action_id == "charge":
                    robot["energy"] = min(5, int(robot.get("energy", 3)) + 1)
                robot_progress(robot, moves=1, xp=10)
                badges = record_event(profile, "robot_moves")
                milestone = int(robot.get("times_moved", 0))
                if milestone in {1, 5, 10, 25, 50, 100}:
                    remember(
                        profile,
                        kind="robot",
                        title=f"{robot['name']} reached {milestone} moves",
                        detail=f"The latest move was {label.lower()}.",
                        emoji=emoji,
                        entity_id=str(robot.get("id", "")),
                        unique_key=(
                            f"robot-moves:{robot.get('id')}:{milestone}"
                        ),
                    )
                show_new_badges(badges)
                st.rerun()

    st.divider()
    st.markdown("## Robot jobs")
    st.caption(
        "Each assignment now performs real work, updates the world, rewards the robot, "
        "and saves a report in Memory Book."
    )
    _render_last_job_result(profile)

    job_cols = st.columns(2)
    for index, job in enumerate(ROBOT_JOBS):
        with job_cols[index % 2]:
            with st.container(border=True):
                st.markdown(f"### {job.emoji} {job.title}")
                st.write(job.description)
                if st.button(
                    f"Start {job.title}",
                    key=f"functional_job_{job.id}",
                    type="primary" if index == 0 else "secondary",
                    use_container_width=True,
                ):
                    _run_job(profile, job.id)

    recent_jobs = [
        memory
        for memory in reversed(profile.get("memories", []))
        if isinstance(memory, dict) and memory.get("kind") == "job"
    ][:5]
    if recent_jobs:
        st.markdown("### Recent job reports")
        for item in recent_jobs:
            with st.expander(
                f"{item.get('emoji', '🛠️')} {item.get('title', 'Robot Job')}"
            ):
                st.write(item.get("detail", ""))
                if item.get("created_at"):
                    st.caption(str(item["created_at"]).replace("T", " "))


def install_functional_job_ui() -> None:
    """Replace the placeholder job tab once per Python process."""
    global _INSTALLED
    if _INSTALLED:
        return
    robo_lab._move_tab = _functional_move_tab
    _INSTALLED = True
