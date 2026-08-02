from ui.layout_polish import LAYOUT_POLISH_CSS


def test_layout_polish_standardizes_page_and_columns() -> None:
    assert "--nw-page:1180px" in LAYOUT_POLISH_CSS
    assert '[data-testid="stHorizontalBlock"]{align-items:stretch' in LAYOUT_POLISH_CSS
    assert '[data-testid="column"]{min-width:0' in LAYOUT_POLISH_CSS
    assert '[data-testid="stVerticalBlockBorderWrapper"]{height:100%}' in LAYOUT_POLISH_CSS


def test_layout_polish_standardizes_controls_and_stages() -> None:
    assert ".stButton>button,.stDownloadButton>button" in LAYOUT_POLISH_CSS
    assert ".monster-art-v2,.pet-art-v2,.mecha-art-card" in LAYOUT_POLISH_CSS
    assert '[data-testid="stMetric"]{height:100%' in LAYOUT_POLISH_CSS
    assert '[data-testid="stForm"]' in LAYOUT_POLISH_CSS


def test_layout_polish_has_tablet_and_phone_breakpoints() -> None:
    assert "@media(max-width:900px)" in LAYOUT_POLISH_CSS
    assert "@media(max-width:640px)" in LAYOUT_POLISH_CSS
    assert "flex:1 1 100%!important" in LAYOUT_POLISH_CSS
