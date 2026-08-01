"""Shared visual theme."""

import streamlit as st

CSS = r"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;600;700;800&display=swap');

:root {
  --ink: #1f2440;
  --purple: #6c4cf1;
  --purple-dark: #4a2fc1;
  --cream: #fff9ee;
  --mint: #dff8ec;
  --sun: #ffd968;
  --pink: #ffdced;
  --blue: #dff2ff;
}

html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: var(--ink); }
h1, h2, h3 { font-family: 'Fredoka', sans-serif !important; letter-spacing: -0.02em; }
.block-container { max-width: 1120px; padding-top: 1.8rem; padding-bottom: 4rem; }

.hero {
  padding: 1.6rem 1.7rem;
  border-radius: 28px;
  background: linear-gradient(135deg, #6c4cf1 0%, #8f6cff 50%, #ec77bc 100%);
  color: white;
  box-shadow: 0 18px 45px rgba(76, 52, 165, .20);
  margin-bottom: 1.2rem;
  position: relative;
  overflow: hidden;
}
.hero:after { content: '✦'; position: absolute; right: 28px; top: 10px; font-size: 76px; opacity: .17; }
.hero h1 { margin: 0; font-size: clamp(2.1rem, 5vw, 3.7rem); }
.hero p { margin: .35rem 0 0; font-size: 1.08rem; max-width: 680px; }

.activity-card, .info-card, .memory-card {
  background: white;
  border: 2px solid rgba(108, 76, 241, .11);
  border-radius: 22px;
  padding: 1rem 1.1rem;
  min-height: 150px;
  box-shadow: 0 10px 28px rgba(52, 42, 105, .08);
}
.activity-card .big-icon { font-size: 2.4rem; }
.activity-card h3 { margin: .2rem 0 .35rem; }
.activity-card p { margin: 0; color: #5d627b; }
.memory-card { min-height: auto; margin-bottom: .7rem; border-left: 7px solid #8f6cff; }

.speech {
  background: white;
  border: 3px solid #2b2f55;
  border-radius: 18px;
  padding: .75rem .85rem;
  box-shadow: 4px 5px 0 #2b2f55;
  font-weight: 800;
  margin-bottom: .7rem;
}

.robot-stage {
  min-height: 350px;
  border-radius: 28px;
  background: radial-gradient(circle at 50% 15%, #ffffff 0%, #e8f7ff 52%, #d6e8ff 100%);
  border: 3px solid #c9dcff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.robot-stage:before { content: ''; position: absolute; bottom: 38px; width: 76%; height: 20px; border-radius: 50%; background: rgba(35, 48, 90, .12); filter: blur(2px); }
.robot-wrap { display: flex; flex-direction: column; align-items: center; transform-origin: center bottom; position: relative; z-index: 2; }
.robot-hat { height: 42px; font-size: 2rem; line-height: 1; }
.robot-head { width: 130px; height: 98px; border: 5px solid #232947; border-radius: 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 -10px 0 rgba(0,0,0,.08); }
.robot-eyes { background: #17203c; color: #bffbff; border-radius: 17px; padding: .28rem .65rem; font-family: monospace; letter-spacing: .22rem; font-weight: 900; white-space: nowrap; }
.robot-mouth { width: 38px; height: 8px; border-radius: 8px; background: #17203c; margin-top: 12px; }
.robot-body-row { display: flex; align-items: center; }
.robot-arm { font-size: 1.7rem; width: 82px; text-align: center; }
.robot-body-shell { position: relative; }
.robot-backpack { position: absolute; z-index: -1; font-size: 2.6rem; left: -28px; top: 26px; filter: drop-shadow(0 3px 2px rgba(0,0,0,.15)); }
.robot-body { width: 150px; height: 122px; border: 5px solid #232947; border-radius: 25px; display: flex; align-items: center; justify-content: center; gap: .5rem; box-shadow: inset 0 -12px 0 rgba(0,0,0,.08); }
.robot-core-mark { font-size: 1.5rem; filter: drop-shadow(0 2px 1px rgba(255,255,255,.4)); }
.robot-power { width: 52px; height: 52px; border-radius: 50%; background: white; border: 4px solid #232947; display: grid; place-items: center; font-size: 1.55rem; }
.robot-base { font-size: 1.65rem; font-weight: 900; margin-top: 5px; min-height: 35px; }
.robot-label { margin-top: .5rem; background: #232947; color: white; padding: .28rem .75rem; border-radius: 999px; font-weight: 900; }

.anim-wave .robot-arm:first-child { animation: wave 1s ease-in-out 3; transform-origin: right center; }
.anim-blink .robot-eyes { animation: blink 1s step-end 3; }
.anim-spin { animation: spin 1.1s ease-in-out 2; }
.anim-walk { animation: walk 2.6s ease-in-out 1; }
.anim-fly { animation: fly 2s ease-in-out 1; }
.anim-dance { animation: dance .55s ease-in-out 5; }
.anim-flash .robot-power { animation: flash .45s ease-in-out 7; }
.anim-bounce { animation: bounce .6s ease-in-out 5; }
.anim-moonwalk { animation: moonwalk 2.8s ease-in-out 1; }
.anim-celebrate { animation: celebrate .7s ease-in-out 4; }
.anim-charge .robot-power { animation: charge .65s ease-in-out 5; }
@keyframes wave { 50% { transform: rotate(-55deg); } }
@keyframes blink { 50% { transform: scaleY(.08); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes walk { 0% { transform: translateX(-210px); } 50% { transform: translateX(0) rotate(3deg); } 100% { transform: translateX(210px); } }
@keyframes fly { 0%,100% { transform: translateY(0); } 45% { transform: translateY(-95px) rotate(8deg); } }
@keyframes dance { 25% { transform: rotate(-10deg) translateY(-8px); } 75% { transform: rotate(10deg) translateY(-8px); } }
@keyframes flash { 50% { background: #fff176; box-shadow: 0 0 35px 18px #fff176; transform: scale(1.14); } }
@keyframes bounce { 50% { transform: translateY(-52px) scaleX(.96); } }
@keyframes moonwalk { 0% { transform: translateX(170px); } 45% { transform: translateX(0) rotate(-4deg); } 100% { transform: translateX(-170px); } }
@keyframes celebrate { 25% { transform: translateY(-24px) rotate(-7deg); } 75% { transform: translateY(-24px) rotate(7deg); } }
@keyframes charge { 50% { background: #9fffd0; box-shadow: 0 0 28px 14px #9fffd0; transform: scale(1.2); } }

.sidekick-mini { background: linear-gradient(160deg, #fff, #eef7ff); border: 2px solid #cfe0ff; border-radius: 20px; padding: .8rem; text-align: center; margin-bottom: .8rem; }
.sidekick-face { width: 72px; height: 58px; margin: 0 auto .5rem; border: 4px solid #252b4b; border-radius: 17px; display: grid; place-items: center; font-family: monospace; font-weight: 900; }
.badge-chip { display: inline-block; background: #fff4bd; border: 2px solid #edc94b; border-radius: 999px; padding: .3rem .65rem; margin: .2rem; font-weight: 900; }
.locked { opacity: .65; filter: grayscale(.35); }

.stButton > button, .stDownloadButton > button {
  border-radius: 14px !important;
  border: 2px solid #4a2fc1 !important;
  font-weight: 800 !important;
  min-height: 44px;
}
.stButton > button[kind="primary"] { box-shadow: 0 5px 0 #342193; }
[data-testid="stSidebar"] { background: linear-gradient(180deg, #f1ebff 0%, #fff9ee 100%); }

@media (max-width: 700px) {
  .block-container { padding-left: .75rem; padding-right: .75rem; }
  .hero { padding: 1.25rem; border-radius: 22px; }
  .robot-stage { min-height: 330px; }
  .robot-wrap { transform: scale(.88); }
}
</style>
"""


def apply_theme() -> None:
    st.markdown(CSS, unsafe_allow_html=True)
