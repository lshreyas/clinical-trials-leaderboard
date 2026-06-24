# Project State & Handoff

> Snapshot taken 2026-06-24. Read this first if you're resuming after a break.

## Where things stand

The site is **live and working** at https://www.lakhtak.io/clinical-trials-leaderboard/.

Last session ended just after pushing readability fixes (sentence-case labels, mobile card layout, stacked trial-detail bars). About to discuss **how to improve the impact score** but didn't start.

## What's built

### Data pipeline (Python)
- `fetch_trials.py` — pulls Phase 2/3 trials from ClinicalTrials.gov API v2
- `enrich.py` — calls Claude Sonnet 4.6 to generate tagline, summary, efficacy_ceiling, breakthrough_premium, score_rationale per trial. Async, 4-way parallel, 5-attempt exponential backoff on 429s. Skips already-enriched trials.
- `daly_data.py` — IHME GBD 2021 DALY lookup table (~60 conditions) with keyword-match fallback
- `score.py` — composite scoring; uses enriched fields if present, falls back to intervention-type heuristics
- `pipeline.py` — orchestrates fetch → score → enrich → re-score → save. Merges prior enrichments before calling Claude so we don't re-spend credits. Cleans NaN to None before JSON dump.

### Frontend (Next.js 16, static export)
- `web/app/page.tsx` — atlas (home)
- `web/app/about/page.tsx` — manifesto / methodology
- `web/app/lab/page.tsx` — identity comparison page (5 visual directions mocked side-by-side; user picked **Data Terminal**)
- `web/app/trial/[nct_id]/page.tsx` — per-trial deep dive
- `web/components/TerminalHeader.tsx` — top strip, stats grid, distribution treemap + legend
- `web/components/TrialList.tsx` — filter bar + desktop dense table + mobile stacked cards (md breakpoint switch)
- `web/components/identities/*` — the 5 lab mocks (Editorial, Brutalist, Cinematic, DataViz, Storytelling)
- `web/lib/data.ts` — server-only data loader (reads `../data/trials_scored.json`)
- `web/lib/types.ts` — `lifeYearsAtStake()` and `formatLifeYears()` live here
- `web/lib/constants.ts` — phase labels + colors

### Deployment
- GitHub repo: https://github.com/lshreyas/clinical-trials-leaderboard
- Custom domain: `www.lakhtak.io/clinical-trials-leaderboard/`
- Pages source: GitHub Actions workflow build_type
- Workflow: `.github/workflows/deploy.yml` (builds with `GITHUB_PAGES=true`, deploys to Pages on push to master)
- HTTPS cert approved, but `https_enforced` not yet toggled — minor TODO

### Data
- `data/trials_scored.json` is **committed** to git (public ClinicalTrials.gov data anyway). 500 trials, top 100 enriched.

## Current scope of data

- **500 trials** fetched
- **Top 100 enriched** with Claude Sonnet 4.6 (taglines, summary, efficacy_ceiling, breakthrough_premium, score_rationale)
- The remaining 400 use heuristic fallbacks for efficacy/breakthrough based on intervention type; their displayed title is the technical ClinicalTrials.gov title

## Environment

- Python 3.13 in `.venv` at project root (created with `uv venv`)
- `uv` is the package manager
- Bash profile has `ANTHROPIC_API_KEY` (Tier 1 — 50 RPM, 8K output TPM)
- Local dev server runs on `:3000`. Start with `cd web && npm run dev`
- Static build: `cd web && GITHUB_PAGES=true npm run build`

## How to refresh the data

```bash
cd "/Users/shreyas/Google Drive/Projects/clinical_trials"
source ~/.bash_profile && source .venv/bin/activate
python pipeline.py --max-trials 500 --enrich-top 100
git add -A && git commit -m "Refresh data" && git push
```

The push triggers GitHub Actions which rebuilds and deploys (~1 min).

## Important gotchas (learned the hard way)

- **`fields` parameter on ClinicalTrials.gov API v2 doesn't work the same as v1.** Just don't use it — fetch everything and parse what you need.
- **`PHASE2_PHASE3` is not a valid phase filter value in API v2.** Use individual phases joined with `|`.
- **Phase filtering uses `query.term=AREA[Phase]PHASE2 OR AREA[Phase]PHASE3`, not `filter.phase=...`.**
- **`pandas.DataFrame.to_dict()` returns NaN for missing values, which is not valid JSON.** Use `df.where(df.notna(), None)` + `json.dump(..., allow_nan=False)`.
- **Server components can't import code that uses `fs`** unless tagged with `import "server-only"`. We split phase labels into `lib/constants.ts` (client-safe) and data loaders into `lib/data.ts` (server-only).
- **Next.js dynamic routes with `output: "export"` need `generateStaticParams`.** Already in place.
- `params` is now `Promise<{...}>` in Next.js 16 — needs `await`.

## Visual identity

User picked **Data Terminal** from the `/lab` showcase. Key style markers:
- JetBrains Mono throughout (variable: `--font-mono`)
- Space Grotesk for narrative display (`--font-display`)
- Newsreader serif only used for one pull-quote on the about page
- Background: `#fafafa` (paper)
- Ink: `#0f172a`
- Accent: emerald `#059669`
- Category colors: GENE=emerald, BIO=blue, DRUG=amber, DEV=violet, OTHER=slate
- Labels are sentence-case with very low letter-spacing (NOT all-caps with underscores — user explicitly rejected that)

## The conversation we were about to have

User said "let's discuss the impact score" before this state file got written. Open questions / friction:

- **The number is hard to feel.** "2.4M life-years" lacks anchor for most readers.
- **The ceiling assumption is invisible.** Current score assumes "works perfectly AND reaches every patient" — a huge hidden "if".
- **Efficacy ceiling is a coarse 7-step function** (Curative=90%, Disease-modifying=60%, Symptomatic=30%, Incremental=10%, etc.). Could be more granular.
- **Breakthrough premium is calibrated 0.6–2.0 by Claude per trial.** Reasonable but unaudited.
- **No probability of success in the score.** Phase is just a weight; it's not really an expected value. Historical trial success rates by phase + therapeutic area are well-studied (BIO, ASCO).

Possible directions:
1. Show **two numbers** — best-case ("if it works") and expected ("× P(success)")
2. Add a **comparative anchor** ("2.4M life-years ≈ erasing all U.S. road deaths for a decade")
3. Make the **ceiling assumption visible** as a sentence under each number
4. **Audit calibration** by spot-checking known landmark trials (Lecanemab, sickle cell gene therapy)
5. **Open the methodology** for public critique — invite physicians/economists to push back

User didn't pick a direction yet.

## Other TODOs (paused)

- Scale to all ongoing Phase 2/3 trials (~10K) with Haiku 4.5 enrichment (~$20–60). User asked, decided to defer.
- Add weekly cron via GitHub Actions to auto-refresh data
- Score history (track movement over time, surface "movers")
- Virtualized scrolling for the table if/when we go beyond ~2K rows
- Toggle `https_enforced=true` on the Pages config

## File-level git history reference

Recent commits (most recent first):
1. `25fbce4` — Improve readability: sentence-case labels, mobile cards, fix bar layout
2. `aebd739` — Add scrutable intro and About page
3. `6159de4` — Redesign as Data Terminal
4. `96c3380` — Deploy to GitHub Pages
5. `bb930f4` — Add Claude-powered enrichment
6. `1a7762c` — Add dynamism: hero entries, magnitude bars, scroll reveals, one-pager
7. `ddaa8f7` — Redesign frontend with editorial / magazine aesthetic
8. `b615bcb` — Add Next.js frontend and data pipeline
9. `d2a7a65` — Initial commit

## Decision log (from memory — not exhaustive)

- **Streamlit → Next.js.** User said Streamlit "won't cut it" once they saw it.
- **Editorial → Data Terminal.** Editorial felt "dry"; user picked Data Terminal from /lab.
- **Score normalization.** Originally a 0–100 normalized score within the batch. Changed to absolute "life-years at stake" because the 0–100 number was "unscrutable".
- **Top 100 enrichment cap.** User has Anthropic Tier 1 limits ($5 credit). Sonnet enrichment costs ~$1 per 100 trials. Future: switch to Haiku for full enrichment.
- **Data committed to repo.** It's public ClinicalTrials.gov data. Simpler than runtime fetching.

## Quick orientation if you're new

1. Read `ONE_PAGER.md` — Satya-style executive summary of what this is and why
2. Read `README.md` — methodology + architecture + how to run
3. Read `CLAUDE.md` — project context for AI assistants
4. Open https://www.lakhtak.io/clinical-trials-leaderboard/ — see the actual site
5. Open the dev server (`cd web && npm run dev`) and `/lab` to see the identity comparison
