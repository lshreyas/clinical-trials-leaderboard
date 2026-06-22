"""
Clinical Trials Impact Leaderboard — Streamlit app.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os

from fetch_trials import fetch_trials
from score import score_trials

st.set_page_config(
    page_title="Clinical Trials Impact Leaderboard",
    page_icon="🔬",
    layout="wide",
)

# ── Data loading ─────────────────────────────────────────────────────────────

CACHE_PATH = "data/trials_scored.csv"


@st.cache_data(ttl=3600, show_spinner="Fetching trials from ClinicalTrials.gov…")
def load_data(max_trials: int = 1000) -> pd.DataFrame:
    os.makedirs("data", exist_ok=True)
    if os.path.exists(CACHE_PATH):
        df = pd.read_csv(CACHE_PATH)
    else:
        df = fetch_trials(max_trials=max_trials)
        df = score_trials(df)
        df.to_csv(CACHE_PATH, index=False)
    return df


# ── Sidebar controls ─────────────────────────────────────────────────────────

with st.sidebar:
    st.title("Filters")

    phases = st.multiselect(
        "Trial phase",
        ["PHASE1", "PHASE2", "PHASE3", "PHASE4"],
        default=["PHASE2", "PHASE3"],
    )

    min_enrollment = st.slider("Min enrollment", 0, 5000, 50, step=50)
    top_n = st.slider("Show top N trials", 10, 200, 50, step=10)

    show_only_types = st.multiselect(
        "Intervention type",
        ["DRUG", "BIOLOGICAL", "GENETIC", "PROCEDURE", "DEVICE", "OTHER"],
        default=[],
        help="Leave empty to show all types",
    )

    refresh = st.button("Refresh data from API")
    if refresh and os.path.exists(CACHE_PATH):
        os.remove(CACHE_PATH)
        st.cache_data.clear()
        st.rerun()

# ── Load & filter ─────────────────────────────────────────────────────────────

df = load_data()

mask = (
    df["phase"].isin(phases)
    & (df["enrollment"] >= min_enrollment)
)
if show_only_types:
    type_mask = df["intervention_types"].str.upper().apply(
        lambda x: any(t in str(x) for t in show_only_types)
    )
    mask = mask & type_mask

filtered = df[mask].head(top_n).reset_index(drop=True)

# ── Header ────────────────────────────────────────────────────────────────────

st.title("Clinical Trials Impact Leaderboard")
st.caption(
    "Ranks ongoing trials by potential impact on humanity. "
    "Score = disease burden (DALYs) × enrollment × phase maturity × unmet need."
)

col1, col2, col3, col4 = st.columns(4)
col1.metric("Trials shown", len(filtered))
col2.metric("Total in dataset", len(df))
col3.metric("Avg enrollment", f"{filtered['enrollment'].mean():,.0f}")
col4.metric("Highest DALY condition", df.loc[df["dalys"].idxmax(), "conditions"][:40])

st.divider()

# ── Top chart ─────────────────────────────────────────────────────────────────

st.subheader(f"Top {min(top_n, len(filtered))} trials by impact score")

chart_df = filtered.head(30).copy()
chart_df["short_title"] = chart_df["title"].str[:60] + "…"

fig = px.bar(
    chart_df,
    x="impact_score",
    y="short_title",
    orientation="h",
    color="phase",
    hover_data=["nct_id", "conditions", "enrollment", "dalys", "sponsor"],
    labels={"impact_score": "Impact Score (0–100)", "short_title": ""},
    color_discrete_map={
        "PHASE2": "#60a5fa",
        "PHASE3": "#34d399",
        "PHASE2_PHASE3": "#a78bfa",
        "PHASE4": "#f59e0b",
    },
    height=max(400, len(chart_df) * 22),
)
fig.update_layout(yaxis={"categoryorder": "total ascending"}, margin={"l": 10})
st.plotly_chart(fig, use_container_width=True)

# ── Scatter: DALYs vs Enrollment ──────────────────────────────────────────────

st.subheader("Disease burden vs. enrollment")
st.caption("Bubble size = impact score. Trials in the top-right are highest priority.")

scatter_df = filtered.copy()
scatter_df["short_title"] = scatter_df["title"].str[:50]

fig2 = px.scatter(
    scatter_df,
    x="enrollment",
    y="dalys",
    size="impact_score",
    color="phase",
    hover_name="short_title",
    hover_data=["nct_id", "conditions", "sponsor"],
    labels={
        "enrollment": "Trial Enrollment",
        "dalys": "Global DALYs (thousands/year)",
    },
    log_x=True,
    log_y=True,
    size_max=40,
    color_discrete_map={
        "PHASE2": "#60a5fa",
        "PHASE3": "#34d399",
        "PHASE2_PHASE3": "#a78bfa",
        "PHASE4": "#f59e0b",
    },
    height=500,
)
st.plotly_chart(fig2, use_container_width=True)

# ── Full leaderboard table ────────────────────────────────────────────────────

st.subheader("Full leaderboard")

display_cols = {
    "rank": "Rank",
    "impact_score": "Score",
    "title": "Trial",
    "phase": "Phase",
    "conditions": "Condition(s)",
    "enrollment": "Enrollment",
    "dalys": "DALYs (k)",
    "sponsor": "Sponsor",
    "nct_id": "NCT ID",
}

table_df = filtered[list(display_cols.keys())].rename(columns=display_cols).copy()
table_df["DALYs (k)"] = table_df["DALYs (k)"].apply(lambda x: f"{x:,.0f}")
table_df["Enrollment"] = table_df["Enrollment"].apply(lambda x: f"{x:,}")

# Make NCT ID a clickable link
table_df["NCT ID"] = table_df["NCT ID"].apply(
    lambda x: f"[{x}](https://clinicaltrials.gov/study/{x})"
)

st.dataframe(
    table_df,
    use_container_width=True,
    hide_index=True,
    column_config={
        "NCT ID": st.column_config.LinkColumn("NCT ID"),
        "Score": st.column_config.ProgressColumn("Score", min_value=0, max_value=100),
        "Trial": st.column_config.TextColumn("Trial", width="large"),
    },
)

# ── Methodology ───────────────────────────────────────────────────────────────

with st.expander("How the score is calculated"):
    st.markdown("""
    **Impact Score** is a normalized composite (0–100) of four dimensions:

    | Dimension | Source | Weight |
    |---|---|---|
    | Disease burden | IHME GBD 2021 DALYs by condition | ~25% |
    | Population reach | Trial enrollment count | ~25% |
    | Phase maturity | Phase 2 → 3 → 4 multiplier | ~25% |
    | Unmet need | Intervention type proxy (gene/cell therapy > drug > other) | ~25% |

    **Formula:** `score = norm(DALYs) × norm(enrollment) × phase_weight × unmet_need`

    Each factor is min-max normalized to [0.01, 1] before multiplication so no single
    dimension dominates by scale. The product is then rescaled to 0–100.

    **Limitations:**
    - DALYs are looked up by condition name matching — complex or rare conditions may not match
    - Unmet need is a rough proxy; ideally we'd compare against existing approved therapies
    - Enrollment reflects planned size, not necessarily real-world reach
    - Trials targeting rare diseases may score lower on DALYs despite high individual impact
    """)
