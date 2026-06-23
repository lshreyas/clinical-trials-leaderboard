"""
Enrich trial records with Claude-generated tagline, summary, efficacy ceiling,
and breakthrough premium. Run after fetch_trials, before final scoring.

Requires: ANTHROPIC_API_KEY in environment.
"""

import os
import json
import asyncio
import time
import random
from typing import Any

import pandas as pd
from anthropic import AsyncAnthropic
from anthropic import APIStatusError

MODEL = "claude-sonnet-4-6"
CONCURRENCY = 4  # parallel requests (lower to stay under Tier 1 rate limits)
MAX_RETRIES = 5

SYSTEM_PROMPT = """You are a medical research analyst. For each clinical trial, you will produce a structured assessment of its potential impact if the treatment works as hoped.

You must respond with valid JSON only. No prose before or after.

Schema:
{
  "tagline": "A single sentence (15-25 words) written for a smart non-specialist. Captures what's distinctive about this trial and what's at stake. Magazine-quality prose, not technical jargon.",
  "summary": "A 2-3 sentence paragraph explaining what's being tested, the mechanism, and why it matters. Plain English.",
  "efficacy_ceiling": 0.0-1.0,
  "efficacy_ceiling_label": "Curative" | "Potentially curative" | "Disease-modifying" | "Symptomatic" | "Preventive" | "Risk-reducing" | "Incremental",
  "breakthrough_premium": 0.5-2.0,
  "breakthrough_label": "Short phrase (5-12 words) describing the comparison to current standard of care",
  "score_rationale": "1-2 sentences explaining why this trial scored where it did. Reference the specific factors."
}

Calibration:
- efficacy_ceiling: 0.9 for true cures (gene therapy correcting root cause); 0.6 for disease-modifying that halts progression; 0.3 for symptomatic management; 0.1 for incremental improvements
- breakthrough_premium: 2.0 if no existing treatment; 1.5 if existing treatments are inadequate; 1.0 if standard of care is decent; 0.6 if multiple good options already exist"""


def build_user_prompt(trial: dict) -> str:
    return f"""Trial title: {trial['title']}
Condition(s): {trial['conditions']}
Phase: {trial['phase']}
Intervention type: {trial['intervention_types']}
Intervention name(s): {trial['intervention_names']}
Sponsor: {trial['sponsor']}
Enrollment: {trial['enrollment']}

Produce the JSON assessment."""


def is_already_enriched(trial: dict) -> bool:
    tagline = trial.get("tagline")
    label = trial.get("efficacy_ceiling_label")
    return (
        isinstance(tagline, str) and tagline.strip() != ""
        and isinstance(label, str) and label.strip() != ""
    )


async def enrich_one(
    client: AsyncAnthropic, trial: dict, sem: asyncio.Semaphore
) -> dict:
    async with sem:
        for attempt in range(MAX_RETRIES):
            try:
                resp = await client.messages.create(
                    model=MODEL,
                    max_tokens=600,
                    system=SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": build_user_prompt(trial)}],
                )
                text = resp.content[0].text.strip()
                if text.startswith("```"):
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                    text = text.strip()
                data = json.loads(text)
                return {**trial, **data}
            except APIStatusError as e:
                if e.status_code == 429 and attempt < MAX_RETRIES - 1:
                    wait = (2 ** attempt) + random.uniform(0, 1)
                    await asyncio.sleep(wait)
                    continue
                print(f"  ⚠ {trial['nct_id']}: {e.status_code} after {attempt+1} tries")
                return trial
            except Exception as e:
                print(f"  ⚠ {trial['nct_id']}: {e}")
                return trial
        return trial


async def enrich_all(trials: list[dict], max_enrich: int | None = None) -> list[dict]:
    if max_enrich:
        to_consider = trials[:max_enrich]
        skipped = trials[max_enrich:]
    else:
        to_consider = trials
        skipped = []

    # Don't re-enrich trials that already have enrichment
    to_enrich = [t for t in to_consider if not is_already_enriched(t)]
    already_enriched = [t for t in to_consider if is_already_enriched(t)]

    if not to_enrich:
        print(f"All {len(already_enriched)} already enriched — nothing to do.")
        return to_consider + skipped

    print(
        f"Enriching {len(to_enrich)} trials "
        f"({len(already_enriched)} already enriched) with {CONCURRENCY}-way parallelism…"
    )

    client = AsyncAnthropic()
    sem = asyncio.Semaphore(CONCURRENCY)
    start = time.time()

    tasks = [enrich_one(client, t, sem) for t in to_enrich]
    results = []
    for i, coro in enumerate(asyncio.as_completed(tasks)):
        result = await coro
        results.append(result)
        if (i + 1) % 10 == 0 or i == len(tasks) - 1:
            elapsed = time.time() - start
            done = sum(1 for r in results if is_already_enriched(r))
            print(f"  {i+1}/{len(tasks)} processed, {done} successful in {elapsed:.0f}s")

    # Restore original order
    by_id = {t["nct_id"]: t for t in results + already_enriched}
    ordered = [by_id[t["nct_id"]] for t in to_consider]
    return ordered + skipped


def enrich_dataframe(df: pd.DataFrame, max_enrich: int | None = None) -> pd.DataFrame:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("⚠ ANTHROPIC_API_KEY not set — skipping enrichment")
        return df

    records = df.to_dict(orient="records")
    enriched = asyncio.run(enrich_all(records, max_enrich=max_enrich))
    return pd.DataFrame(enriched)
