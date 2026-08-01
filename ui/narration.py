"""Private browser-based narration controls for Streamlit pages."""

from __future__ import annotations

import html
import json
from typing import Any

import streamlit as st
import streamlit.components.v1 as components


def narration_language(profile: dict[str, Any], override: str | None = None) -> str:
    value = override or str(profile.get("preferences", {}).get("language", "English"))
    return {
        "English": "en-US",
        "Spanish": "es-MX",
        "Both": "en-US",
        "Bilingual": "en-US",
    }.get(value, "en-US")


def narration_button(
    profile: dict[str, Any],
    text: str,
    *,
    label: str = "🔊 Read Aloud",
    language: str | None = None,
    key: str = "narration",
) -> None:
    """Render a local speech-synthesis button without sending text to a service."""
    if not profile.get("preferences", {}).get("narration", True):
        return
    clean_text = str(text).strip()[:8_000]
    if not clean_text:
        return
    state = profile.get("world4", {})
    rate = max(0.6, min(float(state.get("narration_rate", 1.0)), 1.5))
    pitch = max(0.6, min(float(state.get("narration_pitch", 1.0)), 1.5))
    lang = narration_language(profile, language)
    element_id = "speak-" + "".join(
        character for character in key if character.isalnum()
    )[:40]
    text_json = json.dumps(clean_text, ensure_ascii=False)
    lang_json = json.dumps(lang)
    label_html = html.escape(label)
    components.html(
        f"""
        <button id="{element_id}" style="width:100%;padding:.7rem 1rem;border:0;
        border-radius:12px;background:#25345f;color:white;font-weight:800;cursor:pointer">
          {label_html}
        </button>
        <script>
        const button = document.getElementById({json.dumps(element_id)});
        button.addEventListener('click', () => {{
          window.speechSynthesis.cancel();
          const speech = new SpeechSynthesisUtterance({text_json});
          speech.lang = {lang_json};
          speech.rate = {rate};
          speech.pitch = {pitch};
          window.speechSynthesis.speak(speech);
        }});
        </script>
        """,
        height=52,
    )
