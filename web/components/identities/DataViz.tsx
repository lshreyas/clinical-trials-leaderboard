import { Trial, lifeYearsAtStake, formatLifeYears } from "@/lib/types";

function MiniSpark({ values, color = "#22c55e" }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  const width = 60;
  const height = 18;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (v / max) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="inline-block align-middle">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function ImpactBar({ pct, color = "#0f172a" }: { pct: number; color?: string }) {
  return (
    <div className="inline-flex gap-0.5 align-middle">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-3"
          style={{ background: i < pct / 10 ? color : "#e2e8f0" }}
        />
      ))}
    </div>
  );
}

export function DataViz({ trials }: { trials: Trial[] }) {
  const totalLY = trials.reduce((s, t) => s + lifeYearsAtStake(t), 0);
  const top = trials[0];
  const topLY = lifeYearsAtStake(top);
  const top5 = trials.slice(0, 5);

  return (
    <div
      className="bg-[#fafafa] text-[#0f172a] p-10"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {/* Terminal-style header */}
      <div className="flex items-baseline justify-between pb-3 border-b-2 border-[#0f172a] mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide">
          ◆ TRIAL_IMPACT_ATLAS · v1.0
        </p>
        <p className="text-xs text-slate-500">
          last_refresh: 2026.06.23 · trials: 500 · ttl: 7d
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { l: "TRIALS", v: "500", d: "+12 this wk" },
          { l: "LIFE-YEARS", v: formatLifeYears(totalLY), d: "annual ceiling" },
          { l: "PHASE 3", v: trials.filter(t => t.phase === "PHASE3").length.toString(), d: "≈late stage" },
          { l: "ENRICHED", v: "100", d: "Claude-scored" },
        ].map((s) => (
          <div key={s.l} className="border border-slate-300 p-3 bg-white">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.l}</p>
            <p className="text-2xl font-bold mt-1">{s.v}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{s.d}</p>
          </div>
        ))}
      </div>

      {/* Distribution treemap */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          DISTRIBUTION_BY_INTERVENTION
        </p>
        <div className="flex h-8 border border-slate-300 overflow-hidden">
          <div className="bg-emerald-600 text-white text-xs flex items-center px-2" style={{ width: "32%" }}>GENE 32%</div>
          <div className="bg-blue-600 text-white text-xs flex items-center px-2" style={{ width: "28%" }}>BIO 28%</div>
          <div className="bg-amber-500 text-white text-xs flex items-center px-2" style={{ width: "20%" }}>DRUG 20%</div>
          <div className="bg-purple-600 text-white text-xs flex items-center px-2" style={{ width: "12%" }}>DEV 12%</div>
          <div className="bg-slate-500 text-white text-xs flex items-center px-2" style={{ width: "8%" }}>OTHER</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-300">
        <div className="grid grid-cols-[3rem_1fr_5rem_5rem_6rem_4rem] gap-3 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200 bg-slate-50">
          <span>#</span>
          <span>trial</span>
          <span>phase</span>
          <span>spark</span>
          <span>impact</span>
          <span className="text-right">life-yrs</span>
        </div>
        {top5.map((t, i) => {
          const ly = lifeYearsAtStake(t);
          const score = (ly / topLY) * 100;
          return (
            <div
              key={t.nct_id}
              className="grid grid-cols-[3rem_1fr_5rem_5rem_6rem_4rem] gap-3 px-3 py-2.5 text-xs border-b border-slate-100 items-center"
            >
              <span className="font-semibold text-slate-400">{String(i + 1).padStart(2, "0")}</span>
              <span className="truncate">
                {(t.conditions.split(";")[0]?.trim() || "—").slice(0, 30)}
                <span className="text-slate-400 ml-2">· {(t.intervention_types || "").split(";")[0]?.slice(0, 8)}</span>
              </span>
              <span className="text-slate-600">{t.phase.replace("PHASE", "Ph ")}</span>
              <span>
                <MiniSpark values={[3, 5, 4, 7, 6, 8, 9]} color="#10b981" />
              </span>
              <span>
                <ImpactBar pct={score} />
              </span>
              <span className="text-right font-semibold tabular-nums">
                {formatLifeYears(ly)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400 mt-3">
        ▸ click row to expand · ▸ shift+click to compare · ▸ k: command bar
      </p>
    </div>
  );
}
