import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrials, getTrial } from "@/lib/data";
import { lifeYearsAtStake, formatLifeYears } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/constants";

export async function generateStaticParams() {
  const trials = await getTrials();
  return trials.map((t) => ({ nct_id: t.nct_id }));
}

function categoryFromInterventionType(t: string): string {
  const types = t.toUpperCase();
  if (types.includes("GENETIC")) return "Gene Therapy";
  if (types.includes("BIOLOGICAL")) return "Biologic";
  if (types.includes("DRUG")) return "Drug";
  if (types.includes("DEVICE")) return "Device";
  if (types.includes("PROCEDURE")) return "Procedure";
  return "Intervention";
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="py-4 border-b border-rule last:border-0">
      <p className="smallcaps text-ink-muted mb-1.5">{label}</p>
      <p className="font-serif text-lg text-ink leading-tight">{value}</p>
      {sub && <p className="text-sm text-ink-muted mt-1 font-sans">{sub}</p>}
    </div>
  );
}

export default async function TrialPage({ params }: { params: Promise<{ nct_id: string }> }) {
  const { nct_id } = await params;
  const trial = await getTrial(nct_id);
  if (!trial) notFound();

  const stake = lifeYearsAtStake(trial);
  const category = categoryFromInterventionType(trial.intervention_types);
  const condition = trial.conditions.split(";")[0].trim();

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-8 py-16">
        {/* Back link */}
        <Link
          href="/"
          className="smallcaps text-ink-muted hover:text-ink transition-colors inline-block mb-16"
        >
          ← Back to the atlas
        </Link>

        {/* Article header */}
        <header className="mb-12">
          <p className="smallcaps text-ink-muted mb-6">
            №{String(trial.rank).padStart(2, "0")} · {category} · {condition}
          </p>

          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] font-light text-ink mb-8">
            {trial.tagline ?? trial.title}
          </h1>

          <hr className="rule w-24 my-8" />

          <div className="flex items-baseline gap-3">
            <p className="font-serif text-5xl font-light text-accent numeral">
              {formatLifeYears(stake)}
            </p>
            <p className="smallcaps text-ink-muted">
              life-years at stake annually
            </p>
          </div>
        </header>

        {/* Lede */}
        {trial.summary && (
          <div className="mb-16">
            <p className="font-serif text-xl leading-relaxed text-ink drop-cap first-letter:text-accent">
              {trial.summary}
            </p>
          </div>
        )}

        {/* Why it scored this way */}
        {trial.score_rationale && (
          <div className="mb-16">
            <p className="smallcaps text-ink-muted mb-4">Why this ranks where it does</p>
            <p className="font-serif text-lg leading-relaxed text-ink">
              {trial.score_rationale}
            </p>
          </div>
        )}

        <hr className="rule my-12" />

        {/* The numbers section */}
        <section className="grid grid-cols-2 gap-x-12 gap-y-0 mb-12">
          <StatRow
            label="Trial phase"
            value={PHASE_LABELS[trial.phase]}
            sub={`Phase weight ${trial.phase_weight} — higher is closer to approval`}
          />
          <StatRow
            label="Enrollment"
            value={trial.enrollment.toLocaleString()}
            sub="Planned participants"
          />
          <StatRow
            label="Disease burden"
            value={`${(trial.dalys / 1000).toFixed(0)} million DALYs/yr`}
            sub="Global years of healthy life lost annually"
          />
          <StatRow
            label="Efficacy ceiling"
            value={trial.efficacy_ceiling_label ?? "—"}
            sub={
              trial.efficacy_ceiling
                ? `Up to ${Math.round(trial.efficacy_ceiling * 100)}% of disease burden could be averted`
                : "Not yet estimated"
            }
          />
          <StatRow
            label="Standard of care"
            value={trial.breakthrough_label ?? "—"}
            sub={
              trial.breakthrough_premium
                ? `${trial.breakthrough_premium}× breakthrough multiplier`
                : undefined
            }
          />
          <StatRow
            label="Sponsor"
            value={trial.sponsor}
            sub={
              trial.start_date
                ? `${trial.start_date}${trial.completion_date ? ` → ${trial.completion_date}` : ""}`
                : undefined
            }
          />
        </section>

        <hr className="rule my-12" />

        {/* External link */}
        <div className="text-center">
          <a
            href={`https://clinicaltrials.gov/study/${trial.nct_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="smallcaps text-ink-muted hover:text-accent transition-colors"
          >
            Read the full protocol on ClinicalTrials.gov →
          </a>
          <p className="smallcaps text-ink-muted/60 mt-2 numeral">{trial.nct_id}</p>
        </div>
      </div>
    </main>
  );
}
