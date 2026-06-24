import Link from "next/link";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <p className="label mb-3">
        <span className="text-accent">{">"}</span> {id}
      </p>
      <h2
        className="text-2xl font-bold text-ink mb-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div
        className="text-ink leading-relaxed space-y-4 text-[15px]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {children}
      </div>
    </section>
  );
}

export default function About() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Terminal header */}
      <header className="border-b-2 border-ink bg-white">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-baseline justify-between gap-3 text-[11px]">
          <Link href="/" className="font-semibold uppercase tracking-wider hover:text-accent">
            <span className="text-accent">◆</span> TRIAL_IMPACT_ATLAS{" "}
            <span className="text-ink-muted">/ about</span>
          </Link>
          <nav className="flex items-baseline gap-4 text-ink-muted">
            <Link href="/about" className="text-ink">about</Link>
            <Link href="/" className="hover:text-ink">atlas</Link>
          </nav>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <p className="label mb-3">manifesto · v1.0</p>
        <h1
          className="text-4xl md:text-5xl font-bold text-ink leading-tight mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The Frontier of Human Health
        </h1>
        <p
          className="text-xl text-ink-muted leading-snug mb-12"
          style={{ fontFamily: "var(--font-display)" }}
        >
          A ranked atlas of the clinical trials that could most change humanity.
        </p>

        <hr className="rule mb-12" />

        <Section id="01_the_problem" title="The opportunity">
          <p>
            Roughly half a million clinical trials are registered on ClinicalTrials.gov. Most
            of the world cannot tell which of them matter. Funders, researchers, journalists,
            and curious citizens face the same wall: an undifferentiated list, no way to
            compare a curative gene therapy for sickle cell against the fifth me-too statin,
            no way to see what's actually at stake.
          </p>
          <p>
            The result is a misallocation of attention. The most consequential trials get
            lost next to the most numerous. Public understanding of medical progress lags
            reality by years.
          </p>
          <p>
            We can fix that. Not by predicting which trials will succeed — no one can — but
            by making the <span className="font-semibold">stakes legible</span>.
          </p>
        </Section>

        <Section id="02_what_this_is" title="What you're looking at">
          <p>
            A weekly-refreshed atlas of active clinical trials, ranked by{" "}
            <span className="font-semibold">best-case life-years saved if the treatment works fully</span>.
            One number, one ranking, one place.
          </p>
          <p>
            Each row on the atlas is a trial. The bar on the right shows its impact relative
            to the others in view. The category tag (GENE, BIO, DRUG, DEV) tells you the type
            of intervention. The 4 little bars next to it visualize the four dimensions of
            the score: disease burden, efficacy ceiling, breakthrough premium, and phase
            maturity.
          </p>
        </Section>

        <Section id="03_methodology" title="How the score works">
          <p className="mb-4">For every trial we estimate four things, then multiply them:</p>

          <div className="border border-rule bg-white p-4 my-6">
            <table className="w-full text-[12px] font-mono">
              <tbody>
                <tr className="border-b border-rule-soft">
                  <td className="py-2 pr-4 text-ink-muted w-44">disease_burden</td>
                  <td className="py-2 text-ink">
                    global DALYs lost annually to the condition{" "}
                    <span className="text-ink-faint">(IHME GBD 2021)</span>
                  </td>
                </tr>
                <tr className="border-b border-rule-soft">
                  <td className="py-2 pr-4 text-ink-muted">efficacy_ceiling</td>
                  <td className="py-2 text-ink">
                    if it works perfectly, how much of the burden could it remove?{" "}
                    <span className="text-ink-faint">curative → 90% · disease-modifying → 60% · symptomatic → 30%</span>
                  </td>
                </tr>
                <tr className="border-b border-rule-soft">
                  <td className="py-2 pr-4 text-ink-muted">breakthrough_premium</td>
                  <td className="py-2 text-ink">
                    how much better than today's standard of care?{" "}
                    <span className="text-ink-faint">no treatment exists → 2× · me-too drug → 0.6×</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-ink-muted">phase_weight</td>
                  <td className="py-2 text-ink">
                    closer to approval, higher weight{" "}
                    <span className="text-ink-faint">phase 3 = 0.8 · phase 2 = 0.4 · phase 1 = 0.1</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            The result is expressed as <span className="font-semibold">annual life-years at
            stake</span> — a unit anyone can feel. "2.4M life-years" means: if this single
            trial works as hoped and reaches every patient who needs it, that's how much
            healthy human life would be saved each year.
          </p>
        </Section>

        <Section id="04_what_its_not" title="What this is not">
          <p>
            <span className="font-semibold">Not a prediction.</span> We don't claim to know
            which trials will succeed. We measure what's on the table, not the odds of
            getting there.
          </p>
          <p>
            <span className="font-semibold">Not investment advice.</span> A high score means
            high potential impact, not that the sponsor's stock will go up.
          </p>
          <p>
            <span className="font-semibold">Not comprehensive.</span> We cover ongoing Phase
            2 and Phase 3 trials where condition-to-burden mapping succeeds. Rare diseases
            and novel categories may be underrepresented.
          </p>
        </Section>

        <Section id="05_sources" title="Sources & technology">
          <p>
            Trial data: <span className="font-mono text-[13px]">clinicaltrials.gov/api/v2</span>,
            refreshed weekly. Disease burden: IHME Global Burden of Disease 2021.
            Enrichment (tagline, summary, efficacy estimate, breakthrough comparison):
            generated by Claude (Anthropic) from each trial's title and protocol metadata.
          </p>
          <p>
            Open source.{" "}
            <a
              href="https://github.com/lshreyas/clinical-trials-leaderboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              View on GitHub ↗
            </a>
          </p>
        </Section>

        <hr className="rule my-12" />

        <p
          className="text-lg text-ink-muted italic leading-relaxed"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          If a single ranked page can shift even a fraction of public, philanthropic, or
          regulatory attention toward the trials with the most leverage, the impact
          compounds well beyond what any individual trial could deliver.
        </p>

        <p className="label mt-12 text-center">
          <Link href="/" className="text-accent hover:underline">
            ▸ open the atlas
          </Link>
        </p>
      </article>
    </main>
  );
}
