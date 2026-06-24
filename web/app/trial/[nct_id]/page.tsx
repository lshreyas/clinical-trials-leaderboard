import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrials, getTrial } from "@/lib/data";
import { lifeYearsAtStake, formatLifeYears } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/constants";

export async function generateStaticParams() {
  const trials = await getTrials();
  return trials.map((t) => ({ nct_id: t.nct_id }));
}

function categoryOf(t: string): { label: string; color: string } {
  const types = (t || "").toUpperCase();
  if (types.includes("GENETIC")) return { label: "GENE_THERAPY", color: "text-emerald-600" };
  if (types.includes("BIOLOGICAL")) return { label: "BIOLOGIC", color: "text-blue-600" };
  if (types.includes("DRUG")) return { label: "SMALL_MOLECULE", color: "text-amber-600" };
  if (types.includes("DEVICE")) return { label: "DEVICE", color: "text-violet-600" };
  return { label: "OTHER", color: "text-slate-500" };
}

function Component({ label, value, max, pct, color = "bg-ink" }: {
  label: string;
  value: string;
  max?: string;
  pct: number;
  color?: string;
}) {
  return (
    <div className="py-3 text-[12px]">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-ink font-medium">{label}</span>
        <span className="text-ink font-semibold tabular-nums numeral text-right shrink-0">
          {value}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-rule-soft overflow-hidden">
          <div
            className={`h-full ${color}`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <span className="text-[10px] text-ink-faint w-8 text-right tabular-nums shrink-0">
          {pct.toFixed(0)}%
        </span>
      </div>
      {max && <p className="text-[10px] text-ink-faint mt-1.5">{max}</p>}
    </div>
  );
}

export default async function TrialPage({ params }: { params: Promise<{ nct_id: string }> }) {
  const { nct_id } = await params;
  const trial = await getTrial(nct_id);
  if (!trial) notFound();

  const ly = lifeYearsAtStake(trial);
  const cat = categoryOf(trial.intervention_types);

  const dalysNorm = Math.min(100, (trial.dalys ?? 0) / 1000);
  const efficacyPct = (trial.efficacy_ceiling ?? 0.3) * 100;
  const breakthroughPct = ((trial.breakthrough_premium ?? 1) / 2) * 100;
  const phasePct = (trial.phase_weight ?? 0.1) * 100;

  return (
    <main className="min-h-screen bg-paper">
      {/* Sticky terminal header */}
      <header className="border-b-2 border-ink bg-white">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-baseline justify-between gap-3 text-[11px]">
          <Link href="/" className="font-semibold uppercase tracking-wider hover:text-accent">
            <span className="text-accent">◆</span> TRIAL_IMPACT_ATLAS <span className="text-ink-muted">/ trial_view</span>
          </Link>
          <Link href="/" className="text-ink-muted hover:text-ink">
            ← back_to_atlas
          </Link>
        </div>
      </header>

      <article className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Identity strip */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-baseline border-b border-rule pb-3 mb-6 text-[11px]">
          <span className="label-bright">Rank</span>
          <span className="text-ink numeral font-bold">#{String(trial.rank).padStart(3, "0")}</span>
          <span className="text-ink-muted">{trial.nct_id}</span>
        </div>

        {/* Headline */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-[11px]">
            <span className={`font-bold ${cat.color}`}>{cat.label}</span>
            <span className="text-ink-faint">·</span>
            <span className="text-ink-muted">{trial.conditions.split(";")[0].trim()}</span>
            <span className="text-ink-faint">·</span>
            <span className="text-ink-muted">{PHASE_LABELS[trial.phase]?.toUpperCase()}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold leading-tight text-ink mb-6" style={{ fontFamily: "var(--font-display)" }}>
            {trial.tagline ?? trial.title}
          </h1>

          <div className="flex items-baseline gap-3 flex-wrap">
            <p className="text-4xl md:text-5xl font-bold text-accent numeral tabular-nums">
              {formatLifeYears(ly)}
            </p>
            <p className="label">
              life-years at stake · annually
            </p>
          </div>
        </div>

        {/* Two-column body — score panel comes first on mobile so it's visible above the fold */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_20rem] gap-6 md:gap-8 items-start">
          {/* Left: narrative */}
          <div className="space-y-6">
            {trial.summary && (
              <section>
                <p className="label mb-2">
                  <span className="text-accent">{">"}</span> Summary
                </p>
                <p className="text-[14px] leading-relaxed text-ink" style={{ fontFamily: "var(--font-display)" }}>
                  {trial.summary}
                </p>
              </section>
            )}

            {trial.score_rationale && (
              <section>
                <p className="label mb-2">
                  <span className="text-accent">{">"}</span> Score rationale
                </p>
                <p className="text-[13px] leading-relaxed text-ink" style={{ fontFamily: "var(--font-display)" }}>
                  {trial.score_rationale}
                </p>
              </section>
            )}

            <section>
              <p className="label mb-2">
                <span className="text-accent">{">"}</span> Metadata
              </p>
              <div className="border border-rule bg-white">
                <table className="w-full text-[12px]">
                  <tbody>
                    {[
                      ["sponsor", trial.sponsor],
                      ["intervention", trial.intervention_names || "—"],
                      ["enrollment", trial.enrollment.toLocaleString()],
                      ["status", trial.status?.toLowerCase().replace(/_/g, " ")],
                      ["start_date", trial.start_date || "—"],
                      ["completion_date", trial.completion_date || "—"],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-rule-soft last:border-0">
                        <td className="px-3 py-2 text-ink-muted w-40">{k}</td>
                        <td className="px-3 py-2 text-ink">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="label">
              <a
                href={`https://clinicaltrials.gov/study/${trial.nct_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                ▸ open full protocol on clinicaltrials.gov ↗
              </a>
            </p>
          </div>

          {/* Right (or top on mobile): score breakdown */}
          <aside className="order-first md:order-none border border-rule bg-white p-4 md:sticky md:top-4">
            <p className="label-bright mb-3">Score breakdown</p>

            <Component
              label="Disease burden"
              value={`${(trial.dalys / 1000).toFixed(1)}M`}
              max="global DALYs / year"
              pct={dalysNorm}
              color="bg-emerald-600"
            />
            <hr className="rule-soft" />
            <Component
              label="Efficacy ceiling"
              value={trial.efficacy_ceiling_label ?? "—"}
              max={trial.efficacy_ceiling ? `${Math.round(efficacyPct)}% of burden` : undefined}
              pct={efficacyPct}
              color="bg-blue-600"
            />
            <hr className="rule-soft" />
            <Component
              label="Breakthrough premium"
              value={`${trial.breakthrough_premium ?? "—"}×`}
              max={trial.breakthrough_label ?? undefined}
              pct={breakthroughPct}
              color="bg-amber-500"
            />
            <hr className="rule-soft" />
            <Component
              label="Phase weight"
              value={trial.phase_weight?.toString() ?? "—"}
              max="proximity to approval"
              pct={phasePct}
              color="bg-violet-600"
            />

            <hr className="rule my-3" />

            <div className="flex items-baseline justify-between">
              <span className="label-bright">Impact score</span>
              <span className="text-2xl font-bold text-accent numeral tabular-nums">
                {trial.impact_score?.toFixed(1)}
              </span>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
