"""Privacy-first bridge to the web Showtime Studio."""

from __future__ import annotations

from typing import Any

import streamlit as st

from ui.components import hero

SHOWTIME_URL = "https://nicos-world.com/#nico/showtime"


def render(profile: dict[str, Any]) -> None:
    hero(
        "Showtime Studio",
        "Create short robot, monster, pet, and Nico movies locally in the web PWA.",
    )

    st.info(
        "Showtime Studio runs in your browser. Video frames are recorded on "
        "the device and offered as a download. Nico's World does not upload "
        "the video or store the video file in the Streamlit session."
    )

    left, right = st.columns([2, 1])
    with left:
        st.markdown(
            "### What the web studio can do\n"
            "- Choose one to three saved characters\n"
            "- Reuse familiar poses such as wave, celebrate, launch, and dance\n"
            "- Add a background, title, and bilingual caption\n"
            "- Record a four-, six-, or eight-second WebM video locally\n"
            "- Save only lightweight project instructions in the browser profile"
        )
        st.warning(
            "A grown-up should help before recording or downloading. "
            "Browser support varies, so some devices may offer preview only."
        )
    with right:
        st.markdown("## 🎬")
        st.link_button(
            "Open Showtime Studio",
            SHOWTIME_URL,
            type="primary",
            use_container_width=True,
        )
        st.caption(
            "No Streamlit profile or child content is attached to this link."
        )

    profile["sidekick_message"] = (
        "Showtime Studio is ready in the private web app. Ask a grown-up "
        "to help make and download a movie!"
    )
