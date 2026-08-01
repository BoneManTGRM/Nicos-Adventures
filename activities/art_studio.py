"""Art Studio and gallery connected to stories, memories, and Robot Home."""

from __future__ import annotations

from typing import Any

import streamlit as st

from core.creative_art import ARTWORK_CSS, artwork_svg
from core.memory import remember
from core.world4 import (
    ART_BACKGROUNDS,
    ART_FRAMES,
    ART_STICKERS,
    add_artwork,
    ensure_world4,
)
from ui.components import hero
from ui.narration import narration_button


def _subjects(profile: dict[str, Any]) -> list[str]:
    options = ["Nico's World", "Nico and the Adventure Team"]
    options.extend(
        str(item.get("name", "Robot")) for item in profile.get("robots", [])
    )
    options.extend(
        str(item.get("name", "Monster"))
        for item in profile.get("monsters", [])
    )
    options.extend(str(item) for item in profile.get("discovered_animals", []))
    return list(dict.fromkeys(options))[:80]


def render(profile: dict[str, Any]) -> None:
    state = ensure_world4(profile)
    hero(
        "Art Studio",
        "Create original posters, story illustrations, robot emblems, and room artwork.",
    )
    st.markdown(ARTWORK_CSS, unsafe_allow_html=True)
    left, right = st.columns([1, 1.15], gap="large")
    with left:
        with st.form("art_studio_builder"):
            title = st.text_input(
                "Artwork title",
                value="Nico's Great Adventure",
                max_chars=60,
            )
            subject = st.selectbox("Main subject", _subjects(profile))
            background = st.selectbox(
                "Painted background",
                tuple(ART_BACKGROUNDS),
            )
            frame = st.selectbox("Gallery frame", ART_FRAMES)
            stickers = st.multiselect(
                "Stickers and symbols",
                ART_STICKERS,
                default=["⭐", "🤖", "🎨"],
                max_selections=8,
            )
            caption = st.text_input(
                "Caption",
                value="Created in Nico's World",
                max_chars=120,
            )
            save_clicked = st.form_submit_button(
                "🎨 Save Artwork to Gallery",
                type="primary",
                use_container_width=True,
            )
    preview = {
        "id": "art-preview",
        "title": title,
        "subject": subject,
        "background": background,
        "frame": frame,
        "stickers": stickers,
        "caption": caption,
    }
    with right:
        st.caption("Live gallery preview")
        st.markdown(artwork_svg(preview), unsafe_allow_html=True)
        narration_button(
            profile,
            f"{title}. {subject}. {caption}",
            label="🔊 Describe This Artwork",
            key="art-preview",
        )
    if save_clicked:
        artwork = add_artwork(profile, preview)
        remember(
            profile,
            kind="artwork",
            title=f"Created {artwork['title']}",
            detail=(
                f"A {artwork['background'].lower()} illustration featuring "
                f"{artwork['subject']}."
            ),
            emoji="🎨",
            entity_id=artwork["id"],
            unique_key=f"artwork:{artwork['id']}",
        )
        profile["sidekick_message"] = (
            f"Art saved: {artwork['title']} is now in the gallery and Robot Home."
        )
        st.success(
            "Artwork saved and selected as the featured Robot Home picture."
        )
        st.rerun()

    st.markdown("## 🖼️ Nico's Gallery")
    artworks = list(reversed(state.get("artworks", [])))
    if not artworks:
        st.info("Create the first artwork to open the gallery.")
        return
    for artwork in artworks:
        with st.container(border=True):
            art_col, detail_col = st.columns([1.2, 1])
            with art_col:
                st.markdown(
                    artwork_svg(artwork, compact=True),
                    unsafe_allow_html=True,
                )
            with detail_col:
                featured = artwork.get("id") == state.get(
                    "featured_artwork_id"
                )
                st.markdown(
                    f"### 🎨 {artwork.get('title', 'Artwork')} "
                    f"{'⭐ Featured' if featured else ''}"
                )
                st.write(artwork.get("caption", ""))
                st.caption(
                    f"{artwork.get('background', '')} · "
                    f"{artwork.get('frame', '')} · "
                    f"{artwork.get('subject', '')}"
                )
                if st.button(
                    "Display in Robot Home",
                    key=f"feature_art_{artwork.get('id')}",
                    disabled=featured,
                    use_container_width=True,
                ):
                    state["featured_artwork_id"] = artwork["id"]
                    st.rerun()
                st.download_button(
                    "Download Artwork",
                    data=artwork_svg(artwork),
                    file_name=(
                        f"{artwork.get('title', 'artwork').replace(' ', '_')}.html"
                    ),
                    mime="text/html",
                    key=f"download_art_{artwork.get('id')}",
                    use_container_width=True,
                )
                if st.button(
                    "Remove from Gallery",
                    key=f"remove_art_{artwork.get('id')}",
                    use_container_width=True,
                ):
                    state["artworks"] = [
                        item
                        for item in state["artworks"]
                        if item.get("id") != artwork.get("id")
                    ]
                    if featured:
                        state["featured_artwork_id"] = (
                            state["artworks"][-1]["id"]
                            if state["artworks"]
                            else ""
                        )
                    st.rerun()
