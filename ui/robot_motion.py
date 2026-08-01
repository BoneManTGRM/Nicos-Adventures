"""Visual motion corrections for the Streamlit mecha renderer."""

from __future__ import annotations

import streamlit as st

ROBOT_MOTION_CSS = r"""
<style>
/*
Keep the waving arm above the robot's waist for the entire gesture.
The original negative shoulder rotation swept the hand across the hip.
A positive shoulder rotation lifts the left arm beside the head.
*/
.mecha-art-shell.pose-wave .arm-left {
  animation: mecha-wave-high .9s cubic-bezier(.45,0,.25,1) 4 !important;
  transform-box: view-box;
  transform-origin: 188px 276px !important;
}

@keyframes mecha-wave-high {
  0%, 100% {
    transform: rotate(96deg) translate(-4px,-10px);
  }
  35% {
    transform: rotate(124deg) translate(-10px,-16px);
  }
  68% {
    transform: rotate(84deg) translate(-2px,-8px);
  }
}
</style>
"""


def apply_robot_motion() -> None:
    """Install motion overrides after the main mecha-art stylesheet."""
    st.markdown(ROBOT_MOTION_CSS, unsafe_allow_html=True)
