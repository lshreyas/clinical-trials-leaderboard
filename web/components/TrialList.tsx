"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Trial, Phase, lifeYearsAtStake, formatLifeYears } from "@/lib/types";

const ALL_PHASES: Phase[] = ["PHASE1", "PHASE2", "PHASE3", "PHASE4"];

function categoryOf(t: string): { label: string; color: string } {
  const types = (t || "").toUpperCase();
  if (types.includes("GENETIC")) return { label: "GENE", color: "text-emerald-600" };
  if (types.includes("BIOLOGICAL")) return { label: "BIO ", color: "text-blue-600" };
  if (types.includes("DRUG")) return { label: "DRUG", color: "text-amber-600" };
  if (types.includes("DEVICE")) return { label: "DEV ", color: "text-violet-600" };
  return { label: "OTHR", color: "text-slate-500" };
}

function Spark4({ trial }: { trial: Trial }) {
  // 4 dimensions of score: DALYs (normalized), efficacy, breakthrough, phase
  // Heights derived from real values, scaled 0-14px
  const dalysNorm = Math.min(1, (trial.dalys ?? 0) / 100_000);
  const efficacy = trial.efficacy_ceiling ?? 0.3;
  const breakthrough = ((trial.breakthrough_premium ?? 1) - 0.5) / 1.5;
  const phaseW = trial.phase_weight ?? 0.1;
  const vals = [dalysNorm, efficacy, breakthrough, phaseW];
  return (
    <span className="spark4">
      {vals.map((v, i) => (
        <span key={i} className="spark4-bar" style={{ height: `${Math.max(2, v * 14)}px` }} />
      ))}
    </span>
  );
}

function ImpactBar10({ pct }: { pct: number }) {
  const lit = Math.max(1, Math.min(10, Math.round(pct / 10)));
  return (
    <span className="bar10">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className={`bar10-cell ${i < lit ? "on green" : ""}`} />
      ))}
    </span>
  );
}

export function TrialList({ trials }: { trials: Trial[] }) {
  const [phases, setPhases] = useState<Set<Phase>>(new Set(["PHASE2", "PHASE3"]));
  const [search, setSearch] = useState("");
  const [minEnrollment, setMinEnrollment] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  function togglePhase(p: Phase) {
    setPhases((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return trials.filter((t) => {
      if (phases.size > 0 && !phases.has(t.phase as Phase)) return false;
      if (t.enrollment < minEnrollment) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.conditions.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [trials, phases, search, minEnrollment]);

  const topLY = useMemo(
    () => Math.max(1, ...filtered.map(lifeYearsAtStake)),
    [filtered]
  );

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      {/* Command-line style filter bar */}
      <div className="border border-rule bg-white px-3 py-2 mb-4 text-[11px] flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-accent font-semibold hidden md:inline">{">"}</span>

        {/* Phases */}
        <span className="flex items-center gap-1">
          <span className="label">phase</span>
          {ALL_PHASES.map((p) => (
            <button
              key={p}
              onClick={() => togglePhase(p)}
              className={`px-1.5 py-0.5 ${
                phases.has(p)
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {p.replace("PHASE", "ph")}
            </button>
          ))}
        </span>

        {/* Enrollment — hide on mobile to save space */}
        <span className="hidden md:flex items-center gap-1">
          <span className="label">enrollment≥</span>
          <input
            type="number"
            min={0}
            step={50}
            value={minEnrollment}
            onChange={(e) => setMinEnrollment(Number(e.target.value))}
            className="w-16 px-1 py-0.5 border border-rule bg-white focus:outline-none focus:border-accent text-ink"
          />
        </span>

        {/* Search — takes the full remaining row on mobile */}
        <span className="flex items-center gap-1 flex-1 min-w-[180px] order-last md:order-none w-full md:w-auto">
          <span className="label">search</span>
          <input
            type="text"
            placeholder="condition or trial…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-1.5 py-0.5 border border-rule md:border-0 bg-white focus:outline-none focus:border-accent text-ink placeholder:text-ink-faint"
          />
        </span>

        <span className="text-ink-muted ml-auto whitespace-nowrap">
          <span className="text-ink font-semibold">{filtered.length}</span>
          /{trials.length}
        </span>
      </div>

      {/* ── Desktop: dense table ─────────────────────────────────── */}
      <div className="border border-rule bg-white hidden md:block">
        <div className="grid grid-cols-[3rem_4rem_1fr_4rem_4rem_7rem_4rem] gap-3 px-3 py-2 border-b border-ink bg-paper">
          <span className="label">#</span>
          <span className="label">type</span>
          <span className="label">trial / condition</span>
          <span className="label">phase</span>
          <span className="label" title="DALYs / Efficacy / Breakthrough / Phase">
            score
          </span>
          <span className="label">impact</span>
          <span className="label text-right">life-yrs</span>
        </div>

        {filtered.map((t, i) => {
          const ly = lifeYearsAtStake(t);
          const pct = (ly / topLY) * 100;
          const cat = categoryOf(t.intervention_types);
          const condition = (t.conditions.split(";")[0] || "").trim();
          const isExpanded = expanded === t.nct_id;

          return (
            <div
              key={t.nct_id}
              className="border-b border-rule-soft last:border-b-0"
            >
              <Link
                href={`/trial/${t.nct_id}`}
                onMouseEnter={() => setExpanded(t.nct_id)}
                onMouseLeave={() => setExpanded(null)}
                className="row grid grid-cols-[3rem_4rem_1fr_4rem_4rem_7rem_4rem] gap-3 px-3 py-2 items-center text-[12px] hover:bg-row-hover cursor-pointer"
              >
                <span className="text-ink-faint numeral tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`font-bold ${cat.color}`}>{cat.label}</span>
                <span className="truncate">
                  <span className="text-ink">{condition}</span>
                  <span className="text-ink-faint ml-2">
                    · {(t.tagline ?? t.title).slice(0, 80)}
                  </span>
                </span>
                <span className="text-ink-muted">{t.phase.replace("PHASE", "ph ")}</span>
                <span><Spark4 trial={t} /></span>
                <span><ImpactBar10 pct={pct} /></span>
                <span className="text-right font-semibold numeral tabular-nums text-accent">
                  {formatLifeYears(ly)}
                </span>
              </Link>

              {isExpanded && t.tagline && (
                <div
                  onMouseEnter={() => setExpanded(t.nct_id)}
                  onMouseLeave={() => setExpanded(null)}
                  className="px-3 pb-3 pt-1 bg-row-hover border-l-2 border-accent"
                >
                  <p className="text-[11px] text-ink-muted leading-relaxed pl-[7rem]">
                    {t.tagline}
                    {t.sponsor && (
                      <span className="text-ink-faint">
                        {" "}— {t.sponsor} · {t.enrollment.toLocaleString()} participants
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-3 py-12 text-center text-ink-muted text-sm">
            no_match — adjust filters
          </div>
        )}
      </div>

      {/* ── Mobile: stacked cards ────────────────────────────────── */}
      <div className="md:hidden border border-rule bg-white divide-y divide-rule-soft">
        {filtered.map((t, i) => {
          const ly = lifeYearsAtStake(t);
          const pct = (ly / topLY) * 100;
          const cat = categoryOf(t.intervention_types);
          const condition = (t.conditions.split(";")[0] || "").trim();

          return (
            <Link
              key={t.nct_id}
              href={`/trial/${t.nct_id}`}
              className="row block p-3 active:bg-row-hover"
            >
              {/* Top meta row */}
              <div className="flex items-center gap-2 text-[10px] mb-2">
                <span className="text-ink-faint numeral tabular-nums">
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <span className={`font-bold ${cat.color}`}>{cat.label}</span>
                <span className="text-ink-muted uppercase">
                  {t.phase.replace("PHASE", "ph ")}
                </span>
                <span className="ml-auto text-right">
                  <span className="font-semibold text-accent numeral tabular-nums text-sm">
                    {formatLifeYears(ly)}
                  </span>
                  <span className="text-ink-faint"> life-yrs</span>
                </span>
              </div>

              {/* Condition + tagline */}
              <p className="text-[13px] text-ink leading-snug mb-2">
                <span className="font-semibold">{condition}</span>
                {t.tagline && (
                  <span className="text-ink-muted"> · {t.tagline}</span>
                )}
              </p>

              {/* Impact bar */}
              <div className="flex items-center gap-2">
                <ImpactBar10 pct={pct} />
                <span className="text-[10px] text-ink-faint">
                  {pct.toFixed(0)}% of top
                </span>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-3 py-12 text-center text-ink-muted text-sm">
            no_match — adjust filters
          </div>
        )}
      </div>

      {/* Footer hint */}
      <p className="text-[10px] text-ink-faint mt-3 px-1">
        ▸ hover row to preview · ▸ click to open trial details · ▸ score components:
        <span className="font-bold text-ink"> DALYs</span> /
        <span className="font-bold text-ink"> Efficacy</span> /
        <span className="font-bold text-ink"> Breakthrough</span> /
        <span className="font-bold text-ink"> Phase</span>
      </p>
    </section>
  );
}
