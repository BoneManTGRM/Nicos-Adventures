"""Parent-controlled settings, narration, diagnostics, and recovery slots."""

from __future__ import annotations

import copy
import json
from typing import Any

import streamlit as st

from core.profile import export_profile
from core.world2 import ensure_world2, repair_profile, snapshot
from core.world4 import ensure_world4, snapshot_for_slot
from ui.components import hero


def _recovery_slots(profile: dict[str, Any]) -> None:
    st.markdown("## Three in-session recovery slots")
    st.write(
        "These slots survive Streamlit reruns in the current browser session. "
        "Download a slot or the complete save for reliable cross-session storage."
    )
    slots = st.session_state.setdefault("nw4_save_slots", {})
    cols = st.columns(3)
    for index in range(1, 4):
        slot_id = f"slot_{index}"
        saved = slots.get(slot_id)
        with cols[index - 1]:
            with st.container(border=True):
                st.markdown(f"### Save Slot {index}")
                if saved:
                    st.caption(
                        f"⭐ {saved.get('stars', 0)} · "
                        f"{len(saved.get('robots', []))} robots · "
                        f"{len(saved.get('world4', {}).get('campaign_completed', []))}/20 missions"
                    )
                else:
                    st.caption("Empty")
                if st.button(
                    "Save Current World",
                    key=f"save_{slot_id}",
                    use_container_width=True,
                ):
                    slots[slot_id] = snapshot_for_slot(profile)
                    st.success(f"Slot {index} saved.")
                    st.rerun()
                if st.button(
                    "Restore Slot",
                    key=f"restore_{slot_id}",
                    disabled=not bool(saved),
                    use_container_width=True,
                ):
                    profile.clear()
                    profile.update(copy.deepcopy(saved))
                    ensure_world2(profile)
                    ensure_world4(profile)
                    st.success(f"Slot {index} restored.")
                    st.rerun()
                if saved:
                    st.download_button(
                        "Download Slot",
                        data=json.dumps(saved, ensure_ascii=False, indent=2),
                        file_name=f"nicos-world-slot-{index}.json",
                        mime="application/json",
                        key=f"download_{slot_id}",
                        use_container_width=True,
                    )
                    if st.button(
                        "Clear Slot",
                        key=f"clear_{slot_id}",
                        use_container_width=True,
                    ):
                        slots.pop(slot_id, None)
                        st.rerun()


def render(profile: dict[str, Any]) -> None:
    state = ensure_world2(profile)
    world4 = ensure_world4(profile)
    hero(
        "Parent & Settings",
        "Private controls for language, narration, accessibility, backup, diagnostics, and recovery.",
    )

    st.markdown("## Language, narration, and accessibility")
    preferences = profile.setdefault("preferences", {})
    language_options = ("English", "Spanish", "Both")
    language_value = preferences.get("language", "English")
    language = st.selectbox(
        "Language",
        language_options,
        index=(
            language_options.index(language_value)
            if language_value in language_options
            else 0
        ),
    )
    sound = st.toggle(
        "Sound enabled",
        value=bool(preferences.get("sound", True)),
    )
    narration = st.toggle(
        "Browser read-aloud enabled",
        value=bool(preferences.get("narration", True)),
        help=(
            "Uses the browser's local speech-synthesis feature. Story text is not "
            "sent to an external narration service."
        ),
    )
    reduced_motion = st.toggle(
        "Reduced motion",
        value=bool(preferences.get("reduced_motion", False)),
    )
    rate = st.slider(
        "Narration speed",
        min_value=0.6,
        max_value=1.5,
        value=float(world4.get("narration_rate", 1.0)),
        step=0.1,
    )
    pitch = st.slider(
        "Narration pitch",
        min_value=0.6,
        max_value=1.5,
        value=float(world4.get("narration_pitch", 1.0)),
        step=0.1,
    )
    if st.button(
        "Save Settings",
        type="primary",
        use_container_width=True,
    ):
        preferences.update(
            language=language,
            sound=sound,
            narration=narration,
            reduced_motion=reduced_motion,
        )
        world4["narration_rate"] = rate
        world4["narration_pitch"] = pitch
        profile["sidekick_message"] = "Settings saved for the next adventure."
        st.success("Settings saved.")

    st.markdown("## Automatic session recovery")
    st.write(
        "Nico's World creates bounded in-session snapshots. The portable Version 5 "
        "Memory Save remains the reliable way to keep progress after Streamlit closes "
        "or moves to another device."
    )
    cols = st.columns(2)
    if cols[0].button("Create Safe Snapshot", use_container_width=True):
        snapshot(profile, state.get("last_safe_page", "Home"))
        st.success("Safe snapshot created.")
    recovery = state.get("recovery_snapshot", {})
    if cols[1].button(
        "Restore Safe Snapshot",
        disabled=not bool(recovery),
        use_container_width=True,
    ):
        restored = copy.deepcopy(recovery)
        profile.clear()
        profile.update(restored)
        ensure_world2(profile)
        ensure_world4(profile)
        st.success("The last safe snapshot was restored.")
        st.rerun()

    _recovery_slots(profile)

    st.markdown("## Reparo Check")
    st.caption(
        "Detect invalid state, apply the smallest bounded correction, verify the "
        "profile, and record the repair without changing creative content."
    )
    if st.button("Run Detect · Repair · Verify", use_container_width=True):
        repaired = repair_profile(profile)
        ensure_world4(profile)
        if repaired:
            st.success("A profile-state problem was repaired and recorded.")
        else:
            st.success("No profile-state problems were detected.")

    st.markdown("## Private portable backup")
    st.download_button(
        "Download Nico's World 4 Backup",
        data=export_profile(profile),
        file_name="nicos-world-4-backup.json",
        mime="application/json",
        use_container_width=True,
    )
    st.info(
        "True automatic cross-device cloud saving requires a configured database or "
        "storage provider. This build does not claim Streamlit session memory is cloud "
        "storage. Portable downloads and recovery slots remain private and account-free."
    )
    st.caption(
        "No advertising, public child profile, analytics tracker, or open chat is required."
    )
