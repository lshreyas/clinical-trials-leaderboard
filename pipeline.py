"""
Run the full data pipeline: fetch → score → save as JSON.
Usage: python pipeline.py [--max-trials N]
"""

import argparse
import json
import os
import sys
from datetime import datetime

from fetch_trials import fetch_trials
from score import score_trials
from enrich import enrich_dataframe


def run(max_trials: int = 1000, enrich_top: int = 100):
    print(f"[{datetime.now():%H:%M:%S}] Fetching up to {max_trials} trials…")
    df = fetch_trials(max_trials=max_trials)
    print(f"[{datetime.now():%H:%M:%S}] Fetched {len(df)} trials. Scoring (pass 1)…")

    df = score_trials(df)
    print(f"[{datetime.now():%H:%M:%S}] Initial scoring complete. Top 5 by raw score:")
    print(df[["rank", "title", "impact_score"]].head().to_string(index=False))

    if enrich_top > 0:
        # Merge in any prior enrichment so we don't re-spend API credits
        prior_path = "data/trials_scored.json"
        if os.path.exists(prior_path):
            with open(prior_path) as f:
                prior = json.load(f)
            prior_by_id = {p["nct_id"]: p for p in prior}
            enrich_cols = [
                "tagline", "summary", "efficacy_ceiling", "efficacy_ceiling_label",
                "breakthrough_premium", "breakthrough_label", "score_rationale",
            ]
            for col in enrich_cols:
                df[col] = df.apply(
                    lambda row: prior_by_id.get(row["nct_id"], {}).get(col),
                    axis=1,
                )
            already = df["tagline"].notna().sum()
            print(f"[{datetime.now():%H:%M:%S}] Merged {already} pre-existing enrichments")

        print(f"\n[{datetime.now():%H:%M:%S}] Enriching top {enrich_top} via Claude…")
        df = df.sort_values("rank").reset_index(drop=True)
        df = enrich_dataframe(df, max_enrich=enrich_top)
        print(f"[{datetime.now():%H:%M:%S}] Re-scoring with enriched data…")
        df = score_trials(df)

    os.makedirs("data", exist_ok=True)
    out_path = "data/trials_scored.json"
    # Replace NaN with None so the output is valid JSON (NaN is not)
    df_clean = df.where(df.notna(), None)
    records = df_clean.to_dict(orient="records")
    with open(out_path, "w") as f:
        json.dump(records, f, indent=2, default=str, allow_nan=False)

    print(f"[{datetime.now():%H:%M:%S}] Saved {len(records)} trials to {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-trials", type=int, default=1000)
    parser.add_argument("--enrich-top", type=int, default=100,
                        help="Number of top trials to enrich with Claude (0 to skip)")
    args = parser.parse_args()
    run(max_trials=args.max_trials, enrich_top=args.enrich_top)
