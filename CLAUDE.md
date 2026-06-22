# Clinical Trials Impact Leaderboard

## Why this exists

Most people have no way to answer the question: "Which clinical trials running right now matter most for humanity?" ClinicalTrials.gov lists ~500,000 studies — an undifferentiated wall of data. Even experts struggle to compare across disease areas, phases, and intervention types.

This project makes that landscape legible. It surfaces the trials with the highest potential to change human health outcomes and gives anyone — researcher, funder, curious person — a way to understand what's at stake and where the most important bets are being made.

## Who it's for

1. **Personal research tool first** — a way to track and understand which trials to pay attention to
2. **Eventually public-facing** — to help non-experts understand which trials matter most
3. **Resource allocation** — help funders, researchers, and institutions prioritize attention and funding

## What "impact on humanity" means here

The score is not just disease prevalence. It's an estimate of:

**Best-case DALYs averted × Breakthrough premium**

- **Best-case DALYs averted**: If this treatment works perfectly and reaches all eligible patients, how many years of healthy life would be saved globally? This is a ceiling estimate, not an expectation.
- **Breakthrough premium**: How much better is this treatment vs. the current standard of care? A fourth-line therapy for a disease with three existing options scores low even if the disease burden is massive. A curative gene therapy for a disease with no treatment scores high.

The distinction matters because DALYs alone conflate "a disease that's common" with "a trial that could change outcomes." The breakthrough premium captures whether this specific trial could genuinely move the needle.

### Scoring dimensions

| Dimension | What it measures | Source |
|---|---|---|
| Disease burden | Global DALYs lost per year to this condition | IHME GBD 2021 |
| Efficacy ceiling | What fraction of DALYs could be eliminated if treatment works perfectly? (curative → high, symptomatic → low) | Claude API analysis of trial protocol |
| Breakthrough premium | How much better vs. current standard of care? | Claude API analysis of comparator arms + unmet need |
| Phase weight | Probability-adjusted by phase (Phase 3 > Phase 2 > Phase 1) | Trial metadata |

### Efficacy ceiling heuristic
- Curative / gene therapy targeting root cause: **80–100%**
- Disease-modifying (slows or halts progression): **30–60%**
- Symptomatic (manages symptoms, doesn't change course): **10–30%**
- Incremental improvement over existing therapy: **5–15%**

### Breakthrough premium heuristic
- No existing standard of care: **2x**
- Existing treatments are poor or have major limitations: **1.5x**
- Existing treatments are adequate: **1x**
- Already multiple good treatments: **0.6x**

## Architecture

### Data pipeline (Python)
- `fetch_trials.py` — pulls ongoing Phase 2/3 trials from ClinicalTrials.gov API v2
- `enrich.py` — uses Claude API to analyze each trial and estimate efficacy ceiling + breakthrough premium
- `daly_data.py` — IHME GBD 2021 DALY lookup table with keyword fallback
- `score.py` — computes composite impact score
- `pipeline.py` — orchestrates full refresh; output saved to `data/trials_scored.json`

Data is refreshed weekly (manually or via cron). Filters and sorting happen client-side against the cached JSON — no API call needed on interaction.

### Frontend (Next.js + React)
- Leaderboard view: ranked list with filters, sorting, and score breakdown
- Deep dive view: per-trial page with full protocol summary, score explanation, and link to ClinicalTrials.gov
- Score breakdown tooltip: shows exactly why a trial scored the way it did (which dimensions contributed most)

### Key data sources
- **ClinicalTrials.gov API v2**: `https://clinicaltrials.gov/api/v2/studies`
- **IHME GBD 2021**: Global disease burden by condition (embedded in `daly_data.py`)
- **Claude API**: Trial protocol enrichment (efficacy ceiling, breakthrough premium, plain-language summary)

## What this is not

- Not a prediction of which trials will succeed
- Not investment advice
- Not a replacement for reading the actual trial protocol
- Not comprehensive — it covers trials where condition mapping succeeds; rare/novel conditions may be underrepresented

## Open questions

- How to handle trials targeting multiple conditions (pick highest burden? sum?)
- Whether to weight by enrollment (larger trial = more confident estimate) or treat all trials equally
- How to surface trials for rare diseases that have very high individual impact but low global DALYs
