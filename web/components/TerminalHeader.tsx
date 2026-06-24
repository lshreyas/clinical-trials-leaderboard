import { Trial, lifeYearsAtStake, formatLifeYears } from "@/lib/types";

interface Props {
  trials: Trial[];
}

function categoryOf(t: string): "GENE" | "BIO" | "DRUG" | "DEV" | "OTHER" {
  const types = t.toUpperCase();
  if (types.includes("GENETIC")) return "GENE";
  if (types.includes("BIOLOGICAL")) return "BIO";
  if (types.includes("DRUG")) return "DRUG";
  if (types.includes("DEVICE")) return "DEV";
  return "OTHER";
}

const CAT_COLOR: Record<string, string> = {
  GENE: "#059669",
  BIO: "#2563eb",
  DRUG: "#f59e0b",
  DEV: "#8b5cf6",
  OTHER: "#64748b",
};

export function TerminalHeader({ trials }: Props) {
  const totalLY = trials.reduce((s, t) => s + lifeYearsAtStake(t), 0);
  const phase3 = trials.filter((t) => t.phase === "PHASE3").length;
  const enriched = trials.filter((t) => typeof t.tagline === "string" && t.tagline.length > 0).length;

  // Distribution by intervention category
  const counts: Record<string, number> = { GENE: 0, BIO: 0, DRUG: 0, DEV: 0, OTHER: 0 };
  for (const t of trials) counts[categoryOf(t.intervention_types || "")]++;
  const total = trials.length;

  const today = new Date();
  const timestamp = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

  return (
    <header className="border-b-2 border-ink">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-baseline justify-between gap-3 text-[11px]">
        <p className="font-semibold uppercase tracking-wider">
          <span className="text-accent">◆</span> TRIAL_IMPACT_ATLAS{" "}
          <span className="text-ink-muted">· v1.0</span>
        </p>
        <p className="text-ink-muted">
          last_refresh: <span className="text-ink">{timestamp}</span> ·
          trials: <span className="text-ink">{total}</span> · ttl:{" "}
          <span className="text-ink">7d</span>
        </p>
      </div>

      {/* Stats grid */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {[
            { l: "TRIALS_TRACKED", v: total.toLocaleString(), d: "from ClinicalTrials.gov" },
            { l: "LIFE-YEARS", v: formatLifeYears(totalLY), d: "annual ceiling, top 500" },
            { l: "PHASE_3", v: phase3.toString(), d: "≈late stage" },
            { l: "ENRICHED", v: enriched.toString(), d: "Claude-scored" },
          ].map((s) => (
            <div key={s.l} className="border border-rule p-3 bg-white">
              <p className="label">{s.l}</p>
              <p className="text-2xl font-bold numeral mt-1">{s.v}</p>
              <p className="text-[10px] text-ink-faint mt-0.5">{s.d}</p>
            </div>
          ))}
        </div>

        {/* Distribution treemap */}
        <div className="mt-5">
          <p className="label mb-2">DISTRIBUTION_BY_INTERVENTION</p>
          <div className="flex h-7 border border-rule overflow-hidden bg-white">
            {(["GENE", "BIO", "DRUG", "DEV", "OTHER"] as const).map((cat) => {
              const pct = (counts[cat] / total) * 100;
              if (pct < 1) return null;
              return (
                <div
                  key={cat}
                  className="flex items-center px-2 text-[10px] font-semibold text-white"
                  style={{ width: `${pct}%`, backgroundColor: CAT_COLOR[cat] }}
                  title={`${cat} ${counts[cat]} (${pct.toFixed(0)}%)`}
                >
                  {pct > 8 && `${cat} ${pct.toFixed(0)}%`}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
