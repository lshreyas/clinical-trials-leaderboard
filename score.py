"""
Impact scoring for clinical trials.

Score = DALYs (k) × efficacy_ceiling × breakthrough_premium × phase_weight

This gives an estimate of best-case annual life-years saved if the treatment
works fully and reaches all eligible patients, weighted by maturity (phase).

If efficacy_ceiling / breakthrough_premium aren't populated yet (pre-enrichment),
we fall back to heuristics based on intervention type.
"""

import pandas as pd
import numpy as np
from daly_data import get_dalys_for_condition


def normalize(series: pd.Series) -> pd.Series:
    mn, mx = series.min(), series.max()
    if mx == mn:
        return pd.Series(np.ones(len(series)), index=series.index)
    return 0.01 + 0.99 * (series - mn) / (mx - mn)


def fallback_efficacy_ceiling(intervention_types: str) -> float:
    """Heuristic estimate when Claude enrichment hasn't run yet."""
    t = intervention_types.lower()
    if "genetic" in t or "gene therapy" in t:
        return 0.7
    if "cell therapy" in t or "biological" in t:
        return 0.5
    if "drug" in t:
        return 0.3
    return 0.2


def fallback_breakthrough_premium(intervention_types: str) -> float:
    """Heuristic estimate when Claude enrichment hasn't run yet."""
    t = intervention_types.lower()
    if "genetic" in t or "gene therapy" in t:
        return 1.5
    return 1.0


def score_trials(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # 1. Disease burden lookup (only if not already present)
    if "dalys" not in df.columns or df["dalys"].isna().any():
        df["dalys"] = df["conditions"].apply(get_dalys_for_condition)

    # 2. Efficacy ceiling — from enrichment, or heuristic fallback
    if "efficacy_ceiling" not in df.columns:
        df["efficacy_ceiling"] = df["intervention_types"].apply(fallback_efficacy_ceiling)
    else:
        df["efficacy_ceiling"] = df["efficacy_ceiling"].fillna(
            df["intervention_types"].apply(fallback_efficacy_ceiling)
        )

    # 3. Breakthrough premium — from enrichment, or heuristic
    if "breakthrough_premium" not in df.columns:
        df["breakthrough_premium"] = df["intervention_types"].apply(fallback_breakthrough_premium)
    else:
        df["breakthrough_premium"] = df["breakthrough_premium"].fillna(
            df["intervention_types"].apply(fallback_breakthrough_premium)
        )

    # 4. Raw impact score = expected life-years saved × phase weight
    df["impact_raw"] = (
        df["dalys"] * 1000
        * df["efficacy_ceiling"]
        * df["breakthrough_premium"]
        * df["phase_weight"]
    )

    # 5. Normalize to 0–100 for the legacy "impact_score" field
    df["impact_score"] = (normalize(df["impact_raw"]) * 100).round(1)

    # 6. Rank
    df["rank"] = df["impact_score"].rank(ascending=False, method="min").astype(int)
    df = df.sort_values("rank").reset_index(drop=True)

    # 7. Legacy field used elsewhere
    if "unmet_need" not in df.columns:
        df["unmet_need"] = df["breakthrough_premium"]

    return df
