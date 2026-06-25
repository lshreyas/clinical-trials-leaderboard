# Analysis lab notebook

Numbered notebooks document the iterations of the impact-score model. Each notebook is self-contained, runnable against `data/trials_scored.json`, and ends with a findings + implications section.

| # | Notebook | Purpose | Status |
|---|---|---|---|
| 01 | `01_score_audit.ipynb` | Baseline audit of the v1 model before any redesign | Complete |
| 02 | _planned_ | Re-audit after formula fixes + Claude recalibration | Pending |

## Running

```bash
cd "/Users/shreyas/Google Drive/Projects/clinical_trials"
source .venv/bin/activate
jupyter notebook analysis/
```

Or, to re-execute a notebook in place:

```bash
jupyter nbconvert --to notebook --execute --inplace analysis/01_score_audit.ipynb
```

## Conventions

- Each notebook starts with title, date, purpose.
- Code cells run top-to-bottom without prior state.
- Final cell is always a markdown summary of findings + implications.
- Plots use the site's color palette: emerald `#059669`, blue `#2563eb`, amber `#f59e0b`, violet `#8b5cf6`.
- When changing the score model, start a new numbered notebook so the diff is preserved.
