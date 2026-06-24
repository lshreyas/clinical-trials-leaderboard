# Trial Impact Atlas

> A ranked atlas of ongoing clinical trials, scored by best-case life-years saved if the treatment works fully.

**Live site:** https://www.lakhtak.io/clinical-trials-leaderboard/

Most of the world cannot tell which of the ~500,000 trials on ClinicalTrials.gov actually matter. This project makes the stakes legible: one ranking, one metric (`life-years at stake`), one place. Built so a researcher and a curious citizen both walk away knowing the same thing — *here is where humanity's next leap might come from.*

---

## Methodology

For every ongoing trial, we estimate four things and multiply them:

| Dimension | What it measures | Source |
|---|---|---|
| **`disease_burden`** | Global DALYs (disability-adjusted life-years) lost annually to the condition | IHME Global Burden of Disease 2021 |
| **`efficacy_ceiling`** | If the treatment works perfectly, what fraction of that burden could it remove? | Claude API analysis of trial protocol |
| **`breakthrough_premium`** | How much better than today's standard of care? | Claude API analysis of intervention type + unmet need |
| **`phase_weight`** | Closer to approval, higher weight | Trial metadata |

### Calibration

**`efficacy_ceiling`** — what fraction of the disease burden could be averted if the treatment works fully:

- `0.9` — Curative (gene therapy correcting the root cause)
- `0.6` — Disease-modifying (halts progression)
- `0.3` — Symptomatic (manages symptoms only)
- `0.1` — Incremental improvement over an existing therapy

**`breakthrough_premium`** — multiplier reflecting comparison to current standard of care:

- `2.0×` — No existing treatment
- `1.5×` — Existing treatments are inadequate
- `1.0×` — Standard of care is decent
- `0.6×` — Multiple good treatment options already exist

**`phase_weight`** — proximity to real-world impact:

- `1.0` — Phase 4 (post-approval)
- `0.8` — Phase 3
- `0.4` — Phase 2
- `0.1` — Phase 1

### The output

```
impact_raw = disease_burden_k × efficacy_ceiling × breakthrough_premium × phase_weight × 1000
```

Expressed as **annual life-years at stake** — "2.4M life-years" means: if this trial works as hoped and reaches every patient who needs it, that's how much healthy human life would be saved each year.

### Important caveats

- **Not a prediction.** We don't claim to know which trials will succeed. We measure what's on the table, not the odds of getting there.
- **Not investment advice.** A high score means high potential impact, not that a sponsor's stock will go up.
- **Not comprehensive.** This release covers a sample of Phase 2/3 trials; the top 100 are enriched with Claude-generated taglines and efficacy estimates. The remainder use heuristic fallbacks based on intervention type.

---

## Architecture

```
clinical_trials/
├── fetch_trials.py       Pulls Phase 2/3 trials from clinicaltrials.gov/api/v2
├── enrich.py             Calls Claude API to estimate efficacy + breakthrough per trial
├── daly_data.py          IHME GBD 2021 DALY lookup with keyword fallback
├── score.py              Composite impact scoring
├── pipeline.py           Orchestrates fetch → enrich → score → JSON
├── data/
│   └── trials_scored.json   Output of the pipeline; consumed by the frontend
└── web/                  Next.js 16 static site (deployed to GitHub Pages)
    ├── app/
    │   ├── page.tsx          Atlas (ranked leaderboard)
    │   ├── about/page.tsx    Manifesto / methodology long-form
    │   ├── lab/page.tsx      Identity comparison page
    │   └── trial/[nct_id]/page.tsx  Per-trial deep dive
    ├── components/
    │   ├── TerminalHeader.tsx  Top strip + stats + treemap
    │   └── TrialList.tsx       Filter bar + dense table (desktop) / cards (mobile)
    └── lib/
        ├── data.ts       Server-only data loader
        └── types.ts      Trial type + life-years calculation
```

### Tech stack

- **Backend pipeline:** Python 3.13, `pandas`, `anthropic` SDK (async with retry/backoff)
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, TypeScript
- **Hosting:** GitHub Pages (static export) on a custom domain
- **Data flow:** Pipeline runs locally/weekly → writes `data/trials_scored.json` → commits to repo → GitHub Actions builds Next.js static site → deploys

---

## Running locally

### Backend pipeline

```bash
cd clinical_trials
uv venv && source .venv/bin/activate
uv pip install -r requirements.txt

# Set your Anthropic API key for enrichment
export ANTHROPIC_API_KEY="sk-ant-..."

# Fetch trials, enrich top 100, save to data/trials_scored.json
python pipeline.py --max-trials 500 --enrich-top 100
```

### Frontend

```bash
cd web
npm install
npm run dev
# Open http://localhost:3000
```

### Static build for deployment

```bash
cd web
GITHUB_PAGES=true npm run build
# Output in web/out/
```

---

## Roadmap

- [ ] **Scale to all Phase 2/3 trials** (~10K). Switch enrichment to Haiku 4.5 (~$20) and virtualize the table.
- [ ] **Weekly cron refresh** via GitHub Actions to keep data fresh.
- [ ] **Score history** — track how trials climb the ranking over time, surface "movers" of the week.
- [ ] **Open the methodology** for critique. The efficacy/breakthrough calibrations are first-pass estimates; collaboration welcome.

---

## License

MIT.

## Contact

Questions, corrections, ideas? Open an issue or contact via the email on my GitHub profile.
