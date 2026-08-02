"""Shared layout and alignment polish for every Streamlit destination."""

import streamlit as st

LAYOUT_POLISH_CSS = r"""
<style>
:root{
  --nw-page:1180px;
  --nw-gap:1.05rem;
  --nw-radius:22px;
  --nw-border:rgba(76,64,142,.14);
  --nw-shadow:0 12px 30px rgba(36,42,88,.08);
}
[data-testid="stAppViewContainer"]>.main{background:
radial-gradient(circle at 8% 2%,rgba(196,181,253,.18),transparent 24%),
radial-gradient(circle at 92% 4%,rgba(125,211,252,.17),transparent 25%),#fffdf8}
.block-container{width:100%;max-width:var(--nw-page)!important;padding:1.65rem 1.2rem 5rem!important}
[data-testid="stVerticalBlock"]{gap:.78rem}
[data-testid="stVerticalBlockBorderWrapper"]{height:100%}
[data-testid="stVerticalBlockBorderWrapper"]>[data-testid="stVerticalBlock"]{height:100%;padding:1rem 1.05rem;
border-radius:var(--nw-radius);border-color:var(--nw-border)!important;background:rgba(255,255,255,.86);
box-shadow:var(--nw-shadow);backdrop-filter:blur(5px)}
[data-testid="stHorizontalBlock"]{align-items:stretch;gap:var(--nw-gap)}
[data-testid="column"]{min-width:0;display:flex;flex-direction:column}
[data-testid="column"]>[data-testid="stVerticalBlock"]{flex:1;width:100%}
[data-testid="stForm"]{border:1px solid var(--nw-border);border-radius:var(--nw-radius);padding:1rem 1.1rem 1.15rem;
background:linear-gradient(145deg,#ffffff,#f8f7ff);box-shadow:var(--nw-shadow)}
[data-testid="stForm"] [data-testid="stHorizontalBlock"]{align-items:flex-end}
[data-testid="stMetric"]{height:100%;min-height:104px;border:1px solid var(--nw-border);border-radius:18px;
padding:.8rem .9rem;background:linear-gradient(145deg,#fff,#f6f8ff);box-shadow:0 8px 20px rgba(42,52,100,.06)}
[data-testid="stMetricLabel"]{font-weight:800;color:#535a75}
[data-testid="stMetricValue"]{font-family:'Fredoka',sans-serif}
[data-baseweb="tab-list"]{gap:.35rem;overflow-x:auto;padding:.25rem .15rem .6rem;scrollbar-width:thin}
[data-baseweb="tab"]{height:46px;flex:0 0 auto;border-radius:13px 13px 0 0;padding:0 .9rem;font-weight:800}
[data-testid="stExpander"]{border-radius:18px!important;border-color:var(--nw-border)!important;overflow:hidden;
box-shadow:0 7px 18px rgba(42,52,100,.05)}
[data-testid="stExpander"] summary{min-height:50px;font-weight:800}
.stButton,.stDownloadButton{width:100%;margin-top:auto}
.stButton>button,.stDownloadButton>button{width:100%;min-height:46px;display:flex;align-items:center;justify-content:center;
line-height:1.15;padding:.65rem .85rem!important}
.stSelectbox,.stTextInput,.stTextArea,.stRadio,.stMultiSelect,.stNumberInput{width:100%}
[data-baseweb="select"]>div,[data-baseweb="input"]{min-height:44px;border-radius:13px!important}
.stTextArea textarea{border-radius:15px!important}
.hero{min-height:154px;display:flex;flex-direction:column;justify-content:center;margin:0 0 1.05rem!important}
.hero p{max-width:760px;line-height:1.5}
.activity-card,.info-card,.memory-card,.decoration-card{height:100%;display:flex;flex-direction:column}
.activity-card p,.info-card p,.decoration-card p{flex:1}
.monster-art,.monster-art-v2,.pet-art-v2,.mecha-art-card,.robot-home-scene,.artwork-card{width:100%;margin-inline:auto}
.monster-art-v2,.pet-art-v2,.mecha-art-card{max-width:760px}
.monster-nameplate,.pet-profile,.mecha-profile{box-sizing:border-box}
[data-testid="stImage"] img{border-radius:18px;object-fit:cover}
[data-testid="stAlert"]{border-radius:16px;padding:.85rem 1rem}
hr{margin:1.3rem 0!important;border-color:rgba(76,64,142,.12)!important}
h2{margin-top:1.45rem!important;margin-bottom:.65rem!important}
h3{margin-top:.8rem!important;margin-bottom:.45rem!important}
p{line-height:1.5}
[data-testid="stSidebar"] [data-testid="stVerticalBlock"]{gap:.65rem}
[data-testid="stSidebar"] .speech{margin-bottom:.45rem}
@media(min-width:901px){
  [data-testid="stHorizontalBlock"]>[data-testid="column"] .monster-art-v2,
  [data-testid="stHorizontalBlock"]>[data-testid="column"] .pet-art-v2,
  [data-testid="stHorizontalBlock"]>[data-testid="column"] .mecha-art-card{height:100%}
}
@media(max-width:900px){
  .block-container{padding:1.15rem .85rem 4rem!important}
  [data-testid="stHorizontalBlock"]{gap:.75rem;flex-wrap:wrap}
  [data-testid="stHorizontalBlock"]>[data-testid="column"]{min-width:min(100%,280px);flex:1 1 46%!important;width:auto!important}
  .hero{min-height:132px;padding:1.25rem 1.3rem!important}
}
@media(max-width:640px){
  :root{--nw-gap:.65rem;--nw-radius:18px}
  .block-container{padding:.8rem .62rem 3.5rem!important}
  [data-testid="stHorizontalBlock"]{display:flex;flex-direction:column;gap:.62rem}
  [data-testid="stHorizontalBlock"]>[data-testid="column"]{width:100%!important;min-width:100%;flex:1 1 100%!important}
  [data-testid="stVerticalBlockBorderWrapper"]>[data-testid="stVerticalBlock"]{padding:.82rem .85rem}
  [data-testid="stForm"]{padding:.82rem .85rem 1rem}
  [data-testid="stMetric"]{min-height:88px;padding:.65rem .75rem}
  .hero{min-height:120px;border-radius:19px!important;margin-bottom:.75rem!important}
  .hero h1{font-size:clamp(1.85rem,10vw,2.65rem)!important;line-height:1.03}
  .hero p{font-size:.96rem!important}
  [data-baseweb="tab"]{height:43px;padding:0 .72rem;font-size:.86rem}
  .stButton>button,.stDownloadButton>button{min-height:48px}
  h2{font-size:1.45rem!important;margin-top:1.15rem!important}
}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>
"""


def apply_layout_polish() -> None:
    st.markdown(LAYOUT_POLISH_CSS, unsafe_allow_html=True)
