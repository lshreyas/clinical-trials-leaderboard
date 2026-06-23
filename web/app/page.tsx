import { getTrials } from "@/lib/data";
import { TrialList } from "@/components/TrialList";
import { lifeYearsAtStake, formatLifeYears } from "@/lib/types";

export default async function Home() {
  const trials = await getTrials();
  const totalLifeYears = trials.reduce((s, t) => s + lifeYearsAtStake(t), 0);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-24 pb-16">
        <p className="smallcaps text-ink-muted mb-8">An Atlas · Vol. 1 · Updated Weekly</p>

        <h1 className="font-serif text-6xl md:text-7xl leading-[0.95] tracking-tight font-light text-ink">
          The Frontier of
          <br />
          <span className="italic font-normal">Human Health.</span>
        </h1>

        <hr className="rule my-10 w-24" />

        <p className="font-serif text-2xl leading-snug text-ink max-w-2xl">
          <span className="numeral">{trials.length}</span> clinical trials are running
          right now that could change everything.
        </p>

        <p className="font-serif text-2xl leading-snug text-ink-muted max-w-2xl mt-3">
          We rank them by what's at stake — measured in years of healthy human life.
        </p>

        <div className="mt-12 flex items-baseline gap-6">
          <div>
            <p className="font-serif text-5xl font-light numeral text-accent">
              {formatLifeYears(totalLifeYears)}
            </p>
            <p className="smallcaps text-ink-muted mt-2">
              Life-years at stake, annually
            </p>
          </div>
        </div>
      </section>

      <hr className="rule max-w-3xl mx-auto" />

      {/* The list */}
      <TrialList trials={trials} />

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-8 py-16 mt-16 border-t border-rule">
        <p className="smallcaps text-ink-muted mb-4">Methodology</p>
        <p className="font-serif text-lg text-ink-muted leading-relaxed">
          Each trial is scored by best-case life-years saved if the treatment works
          fully and reaches all eligible patients, weighted by how much it improves
          on the current standard of care. Data from{" "}
          <a
            href="https://clinicaltrials.gov"
            className="text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
            target="_blank"
          >
            ClinicalTrials.gov
          </a>{" "}
          and the{" "}
          <a
            href="https://www.healthdata.org/gbd"
            className="text-ink underline decoration-rule underline-offset-4 hover:decoration-ink"
            target="_blank"
          >
            IHME Global Burden of Disease
          </a>{" "}
          project. Updated weekly.
        </p>
      </footer>
    </main>
  );
}
