"""Parent-controlled settings, accessibility, diagnostics, and recovery."""

from __future__ import annotations

import copy
import json

import streamlit as st

from core.world2 import ensure_world2, repair_profile, snapshot
from ui.components import hero


def render(profile: dict) -> None:
    state = ensure_world2(profile)
    hero(
        "Parent & Settings",
        "Private controls for language, accessibility, backup, diagnostics, and bounded recovery.",
    )

    st.markdown("## Language and accessibility")
    preferences = profile.setdefault("preferences", {})
    language = st.selectbox(
        "Language",
        ("English", "Spanish", "Both"),
        index=("English", "Spanish", "Both").index(preferences.get("language", "English")),
    )
    sound = st.toggle("Sound enabled", value=bool(preferences.get("sound", True)))
    reduced_motion = st.toggle(
        "Reduced motion",
        value=bool(preferences.get("reduced_motion", False)),
    )
    if st.button("Save Settings", type="primary", use_container_width=True):
        preferences.update(language=language, sound=sound, reduced_motion=reduced_motion)
        profile["sidekick_message"] = "Settings saved for the next adventure."
        st.success("Settings saved.")

    st.markdown("## Automatic session recovery")
    st.write(
        "Nico's World creates safe in-session snapshots. The Complete Memory Save remains the "
        "reliable way to keep progress after Streamlit closes or moves to another device."
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
        st.success("The last safe snapshot was restored.")
        st.rerun()

    st.markdown("## Reparo Check")
    st.caption(
        "Detect invalid state, apply the smallest bounded correction, verify the profile, "
        "and record the repair without changing creative content."
    )
    if st.button("Run Detect · Repair · Verify", use_container_width=True):
        repaired = repair_profile(profile)
        if repaired:
            st.success("A profile-state problem was repaired and recorded.")
        else:
            st.success("No profile-state problems were detected.")

    st.markdown("## Private backup")
    export = copy.deepcopy(profile)
    export.get("world2", {}).pop("recovery_snapshot", None)
    st.download_button(
        "Download Nico's World 2 Backup",
        data=json.dumps(export, ensure_ascii=False, indent=2),
        file_name="nicos-world-2-backup.json",
        mime="application/json",
        use_container_width=True,
    )
    st.caption("No advertising, public child profile, analytics tracker, or open chat is required.")
