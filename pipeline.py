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


def run(max_trials: int = 1000):
    print(f"[{datetime.now():%H:%M:%S}] Fetching up to {max_trials} trials…")
    df = fetch_trials(max_trials=max_trials)
    print(f"[{datetime.now():%H:%M:%S}] Fetched {len(df)} trials. Scoring…")

    df = score_trials(df)
    print(f"[{datetime.now():%H:%M:%S}] Scored. Top 5:")
    print(df[["rank", "title", "impact_score"]].head().to_string(index=False))

    os.makedirs("data", exist_ok=True)
    out_path = "data/trials_scored.json"
    records = df.to_dict(orient="records")
    with open(out_path, "w") as f:
        json.dump(records, f, indent=2, default=str)

    print(f"[{datetime.now():%H:%M:%S}] Saved {len(records)} trials to {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-trials", type=int, default=1000)
    args = parser.parse_args()
    run(max_trials=args.max_trials)
