# The Frontier of Human Health
### A leaderboard for the clinical trials that matter most

---

## The opportunity

Roughly half a million clinical trials are registered on ClinicalTrials.gov. Most of the world cannot tell which of them matter. Funders, researchers, journalists, and curious citizens face the same wall: an undifferentiated list, no way to compare a curative gene therapy for sickle cell against the fifth me-too statin, no way to see what's actually at stake.

The result is a misallocation of attention. The most consequential trials get lost next to the most numerous. Public understanding of medical progress lags reality by years.

We can fix that. Not by predicting which trials will succeed — no one can — but by making the **stakes legible**.

## What we're building

A ranked, weekly-refreshed atlas of active clinical trials, sorted by **best-case life-years saved if the treatment works fully**. One number, one ranking, one place — built so a serious researcher and a curious teenager both walk away knowing the same thing: *here is where humanity's next leap might come from.*

## The approach

For every ongoing trial, we estimate:

- **Disease burden** — global DALYs lost annually to the condition (IHME GBD)
- **Efficacy ceiling** — if it works perfectly, how much of that burden could it eliminate? (curative → 80–100%, disease-modifying → 30–60%, symptomatic → 10–30%)
- **Breakthrough premium** — how much better than today's standard of care? (no existing treatment → 2x, incremental → 0.6x)
- **Trial phase** — closer to approval, higher weight

Multiply, normalize, rank. Express the result as **annual life-years at stake** — a unit anyone can feel.

## Why this works

- **Honest about the ceiling, not the probability.** We don't pretend to predict trial outcomes. We measure *what's on the table*. A reader who sees "5.4 million life-years at stake" knows what would be lost — or gained — if this works.
- **Comparable across disease areas.** A common metric collapses oncology vs. neurology vs. infectious disease into one axis: human flourishing.
- **Penalizes me-too drugs.** The breakthrough premium ensures that the fourth therapy for a well-treated condition scores far below the first therapy for an untreated one — even if the disease is bigger.
- **Built to be read, not just queried.** Each trial earns a one-line story, a magazine-style deep dive, and a number. The interface itself is the argument.

## Where this goes

1. **Now** — local prototype, sample data, editorial design. Proves the score and the storytelling work.
2. **Next** — full pipeline against live ClinicalTrials.gov data, LLM enrichment for taglines and efficacy estimates, public hosting.
3. **Then** — track score changes over time (which trials are climbing?), notify when top trials reach key milestones, open the methodology for critique and contribution.

## The bet

If a single ranked page can shift even a fraction of public, philanthropic, or regulatory attention toward the trials with the most leverage, the impact compounds well beyond what any individual trial could deliver. The technology to build this exists today. What's been missing is the will to name what matters.

We're naming it.
