import { getTrials } from "@/lib/data";
import { TrialList } from "@/components/TrialList";
import { Hero } from "@/components/Hero";
import { lifeYearsAtStake } from "@/lib/types";

export default async function Home() {
  const trials = await getTrials();
  const totalLifeYears = trials.reduce((s, t) => s + lifeYearsAtStake(t), 0);

  return (
    <main className="min-h-screen">
      <Hero trialCount={trials.length} totalLifeYears={totalLifeYears} />

      <hr className="rule max-w-3xl mx-auto" />

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
