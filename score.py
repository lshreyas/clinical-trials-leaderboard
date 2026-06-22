"""
Impact scoring for clinical trials.

Composite score = DALYs × enrollment × phase_weight × unmet_need_factor

Each component is normalized 0–1 before multiplication so no single
dimension dominates purely by scale.
"""

import pandas as pd
import numpy as np
from daly_data import CONDITION_DALYS, get_dalys_for_condition


def normalize(series: pd.Series) -> pd.Series:
    """Min-max normalize to [0.01, 1] (avoid zeros killing the product)."""
    mn, mx = series.min(), series.max()
    if mx == mn:
        return pd.Series(np.ones(len(series)), index=series.index)
    return 0.01 + 0.99 * (series - mn) / (mx - mn)


def unmet_need_factor(intervention_types: str) -> float:
    """
    Rough proxy for unmet need based on intervention type.
    Gene therapy / cell therapy targeting rare/serious diseases → higher unmet need.
    This is intentionally simple — can be enriched with FDA orphan drug data later.
    """
    t = intervention_types.lower()
    if any(x in t for x in ["genetic", "gene therapy", "cell therapy", "biological"]):
        return 1.5
    if "drug" in t:
        return 1.0
    return 0.8


def score_trials(df: pd.DataFrame) -> pd.DataFrame:
    """Add impact score columns to the trials DataFrame."""
    df = df.copy()

    # 1. DALY enrichment — look up global disease burden for each condition
    df["dalys"] = df["conditions"].apply(get_dalys_for_condition)

    # 2. Unmet need factor per trial
    df["unmet_need"] = df["intervention_types"].apply(unmet_need_factor)

    # 3. Normalize continuous components
    df["norm_dalys"] = normalize(df["dalys"])
    df["norm_enrollment"] = normalize(df["enrollment"].clip(lower=1))

    # 4. Composite impact score (geometric mean style — all factors matter)
    df["impact_score"] = (
        df["norm_dalys"]
        * df["norm_enrollment"]
        * df["phase_weight"]
        * df["unmet_need"]
    )

    # 5. Normalize final score to 0–100 for readability
    df["impact_score"] = (normalize(df["impact_score"]) * 100).round(1)

    # 6. Rank
    df["rank"] = df["impact_score"].rank(ascending=False, method="min").astype(int)
    df = df.sort_values("rank")

    return df
