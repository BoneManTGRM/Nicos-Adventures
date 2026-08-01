"""High-detail visual overrides for the existing robot renderer."""

import streamlit as st

MECHA_CSS = r"""
<style>
/* Mecha Art 2: preserves all saved robot data while replacing the toy-box silhouette. */
.robot-stage {
  min-height: 520px;
  background:
    radial-gradient(circle at 50% 44%, rgba(96,165,250,.24), transparent 31%),
    linear-gradient(rgba(57,73,117,.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(57,73,117,.09) 1px, transparent 1px),
    linear-gradient(180deg,#eef8ff 0%,#dbeafe 58%,#c7d7ef 100%);
  background-size:auto,34px 34px,34px 34px,auto;
  border:4px solid #7184a9;
  box-shadow:inset 0 0 60px rgba(30,64,175,.14),0 18px 36px rgba(30,41,59,.16);
  perspective:1000px;
}
.robot-stage:after {
  content:'';
  position:absolute;
  width:310px;height:90px;bottom:40px;
  border:3px solid rgba(59,130,246,.25);
  border-radius:50%;
  background:radial-gradient(ellipse,rgba(56,189,248,.24),transparent 68%);
  box-shadow:0 0 35px rgba(56,189,248,.28),inset 0 0 25px rgba(255,255,255,.65);
}
.robot-wrap {
  filter:drop-shadow(0 22px 12px rgba(15,23,42,.25));
  transform-style:preserve-3d;
}
.robot-top-accessories { width:210px; min-height:65px; }
.robot-hat,.robot-antenna,.robot-ears {
  filter:drop-shadow(0 4px 2px rgba(15,23,42,.35));
  z-index:12;
}
.robot-head {
  width:152px;height:112px;
  border:6px solid #17233d;
  clip-path:polygon(15% 0,85% 0,100% 22%,94% 82%,75% 100%,25% 100%,6% 82%,0 22%);
  border-radius:20px !important;
  position:relative;
  box-shadow:
    inset 0 10px 8px rgba(255,255,255,.32),
    inset 0 -18px 12px rgba(15,23,42,.22),
    0 6px 0 #0f172a,
    0 0 22px rgba(56,189,248,.22) !important;
}
.robot-head:before {
  content:'';position:absolute;left:13px;right:13px;top:10px;height:18px;
  clip-path:polygon(8% 0,92% 0,100% 100%,0 100%);
  background:linear-gradient(180deg,rgba(255,255,255,.75),rgba(255,255,255,.08));
  border-bottom:2px solid rgba(15,23,42,.3);
}
.robot-head:after {
  content:'';position:absolute;left:50%;bottom:-25px;transform:translateX(-50%);
  width:54px;height:29px;
  background:linear-gradient(90deg,#17233d 0 16%,#64748b 17% 42%,#17233d 43% 57%,#64748b 58% 83%,#17233d 84%);
  clip-path:polygon(12% 0,88% 0,100% 100%,0 100%);
  z-index:-1;
}
.robot-eyes {
  min-width:83px;
  border:3px solid #070d1c;
  clip-path:polygon(8% 0,92% 0,100% 50%,92% 100%,8% 100%,0 50%);
  background:linear-gradient(180deg,#071326,#172554);
  font-size:1.15rem;
  text-shadow:0 0 8px currentColor,0 0 16px currentColor;
}
.robot-mouth-custom {
  min-width:58px;border:2px solid rgba(15,23,42,.7);border-radius:3px;
  background:repeating-linear-gradient(90deg,#1e293b 0 4px,#64748b 5px 7px);
  color:#f8fafc;font-size:.82rem;line-height:14px;
}
.robot-body-row { margin-top:22px; position:relative; }
.robot-body-shell:before,.robot-body-shell:after {
  content:'';position:absolute;top:5px;width:54px;height:45px;z-index:6;
  background:linear-gradient(145deg,#f8fafc 0 18%,#64748b 19% 25%,#26334f 26% 100%);
  border:4px solid #17233d;
  box-shadow:inset 0 6px 6px rgba(255,255,255,.32),0 6px 8px rgba(15,23,42,.25);
}
.robot-body-shell:before { left:-42px;clip-path:polygon(0 20%,72% 0,100% 28%,82% 100%,12% 82%); }
.robot-body-shell:after { right:-42px;clip-path:polygon(28% 0,100% 20%,88% 82%,18% 100%,0 28%); }
.robot-shoulders { top:-7px;font-size:1.7rem;z-index:9;filter:drop-shadow(0 3px 1px rgba(0,0,0,.35)); }
.robot-arm {
  width:96px;height:136px;font-size:1.45rem;
  display:flex;align-items:center;justify-content:center;
  position:relative;color:#17233d;
  filter:none;
}
.robot-arm:before {
  content:'';position:absolute;top:24px;left:29px;width:38px;height:78px;
  background:linear-gradient(90deg,#26334f 0 15%,#94a3b8 16% 33%,#334155 34% 66%,#94a3b8 67% 84%,#26334f 85%);
  border:4px solid #17233d;border-radius:12px 12px 18px 18px;
  box-shadow:inset 0 8px 6px rgba(255,255,255,.28),0 5px 5px rgba(15,23,42,.25);
  z-index:-1;
}
.robot-arm:after {
  content:'';position:absolute;bottom:4px;left:25px;width:46px;height:36px;
  background:linear-gradient(180deg,#64748b,#1e293b);
  border:4px solid #17233d;
  clip-path:polygon(10% 0,90% 0,100% 65%,78% 100%,22% 100%,0 65%);
  z-index:-1;
}
.robot-body {
  width:178px;height:158px;
  border:6px solid #17233d;
  clip-path:polygon(13% 0,87% 0,100% 19%,94% 82%,77% 100%,23% 100%,6% 82%,0 19%);
  border-radius:18px !important;
  grid-template-rows:1fr 42px;
  box-shadow:
    inset 0 13px 9px rgba(255,255,255,.32),
    inset 0 -20px 14px rgba(15,23,42,.23),
    0 8px 0 #0f172a !important;
  overflow:visible;
}
.robot-body:before {
  content:'';position:absolute;left:18px;right:18px;top:13px;height:48px;
  border:3px solid rgba(15,23,42,.55);
  clip-path:polygon(8% 0,92% 0,100% 100%,0 100%);
  background:linear-gradient(135deg,rgba(255,255,255,.25),rgba(15,23,42,.12));
}
.robot-body:after {
  content:'';position:absolute;left:50%;bottom:-51px;transform:translateX(-50%);
  width:82px;height:52px;
  background:linear-gradient(90deg,#17233d 0 14%,#64748b 15% 34%,#26334f 35% 65%,#64748b 66% 85%,#17233d 86%);
  border:4px solid #0f172a;
  clip-path:polygon(15% 0,85% 0,100% 100%,0 100%);
  z-index:-1;
}
.robot-core-mark { font-size:1.7rem;z-index:2; }
.robot-power {
  width:64px;height:64px;border:5px solid #101a31;
  background:radial-gradient(circle,#fff 0 18%,#67e8f9 19% 38%,#0e7490 39% 55%,#17233d 56%);
  box-shadow:0 0 13px #67e8f9,inset 0 0 12px #fff;
  z-index:3;
}
.robot-chest { z-index:3;font-size:1.65rem; }
.robot-backpack {
  left:-50px;top:11px;font-size:3.3rem;
  filter:drop-shadow(0 7px 3px rgba(15,23,42,.38));
}
.robot-base {
  margin-top:42px;min-height:72px;width:155px;font-size:1.75rem;
  display:flex;align-items:flex-end;justify-content:center;position:relative;
  filter:drop-shadow(0 5px 3px rgba(15,23,42,.32));
}
.robot-base:before,.robot-base:after {
  content:'';position:absolute;top:0;width:53px;height:72px;
  background:linear-gradient(90deg,#17233d 0 13%,#64748b 14% 30%,#334155 31% 69%,#64748b 70% 86%,#17233d 87%);
  border:4px solid #0f172a;
  clip-path:polygon(17% 0,83% 0,100% 82%,82% 100%,18% 100%,0 82%);
  z-index:-1;
}
.robot-base:before { left:16px;transform:rotate(2deg); }
.robot-base:after { right:16px;transform:rotate(-2deg); }
.robot-label {
  margin-top:10px;padding:.4rem 1.1rem;
  background:linear-gradient(180deg,#334155,#111827);
  border:2px solid #94a3b8;box-shadow:0 4px 0 #020617;
  letter-spacing:.05em;text-transform:uppercase;
}
.robot-companion { top:58px;right:7px;font-size:3.5rem; }
.robot-profile-strip {
  background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(226,232,240,.94));
  border:2px solid #64748b;box-shadow:0 5px 10px rgba(15,23,42,.16);
}
/* Pose detail: arms and legs participate rather than moving the whole sticker. */
.anim-wave .robot-arm:first-child { animation:mecha-wave .72s ease-in-out 4; }
.anim-walk .robot-arm:first-child,.anim-walk .robot-base:after { animation:limb-forward .5s ease-in-out 5 alternate; }
.anim-walk .robot-arm:last-child,.anim-walk .robot-base:before { animation:limb-back .5s ease-in-out 5 alternate; }
.anim-fly .robot-backpack { animation:thruster-glow .35s ease-in-out 7 alternate; }
.anim-charge .robot-body { animation:armor-charge .55s ease-in-out 5 alternate; }
@keyframes mecha-wave { 50% { transform:translateY(-36px) rotate(-62deg); } }
@keyframes limb-forward { to { transform:rotate(13deg) translateY(-4px); } }
@keyframes limb-back { to { transform:rotate(-13deg) translateY(4px); } }
@keyframes thruster-glow { to { filter:drop-shadow(0 18px 10px #38bdf8) drop-shadow(0 28px 16px #f97316);transform:translateY(-7px); } }
@keyframes armor-charge { to { filter:brightness(1.2);box-shadow:inset 0 0 25px white,0 0 34px #22d3ee !important; } }
@media (max-width:700px) {
  .robot-stage { min-height:500px; }
  .robot-wrap { transform:scale(.72); }
  .robot-display { min-width:300px;min-height:440px; }
}
</style>
"""


def apply_mecha_art() -> None:
    st.markdown(MECHA_CSS, unsafe_allow_html=True)
