"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Trial, Phase, lifeYearsAtStake, formatLifeYears } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/constants";

const ALL_PHASES: Phase[] = ["PHASE1", "PHASE2", "PHASE3", "PHASE4"];

function categoryFromInterventionType(t: string): string {
  const types = t.toUpperCase();
  if (types.includes("GENETIC")) return "Gene Therapy";
  if (types.includes("BIOLOGICAL")) return "Biologic";
  if (types.includes("DRUG")) return "Drug";
  if (types.includes("DEVICE")) return "Device";
  if (types.includes("PROCEDURE")) return "Procedure";
  return "Intervention";
}

export function TrialList({ trials }: { trials: Trial[] }) {
  const [phases, setPhases] = useState<Set<Phase>>(new Set(["PHASE2", "PHASE3"]));
  const [search, setSearch] = useState("");

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
      if (search) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.conditions.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [trials, phases, search]);

  return (
    <section className="max-w-3xl mx-auto px-8 py-16">
      {/* Section header */}
      <div className="flex items-baseline justify-between mb-12">
        <h2 className="smallcaps text-ink-muted">The Leaderboard</h2>
        <span className="smallcaps text-ink-muted numeral">
          {filtered.length} of {trials.length}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-16 pb-6 border-b border-rule">
        <input
          type="text"
          placeholder="Search by condition or trial…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-transparent border-0 border-b border-rule pb-1.5 text-sm font-sans text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors"
        />
        <div className="flex items-center gap-1 smallcaps text-ink-muted">
          <span className="mr-2">Phase</span>
          {ALL_PHASES.map((p) => (
            <button
              key={p}
              onClick={() => togglePhase(p)}
              className={`px-2 py-1 transition-colors ${
                phases.has(p)
                  ? "text-ink border-b border-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {p.replace("PHASE", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Trial entries */}
      <ol className="space-y-16">
        {filtered.map((trial, i) => {
          const stake = lifeYearsAtStake(trial);
          const category = categoryFromInterventionType(trial.intervention_types);
          const condition = trial.conditions.split(";")[0].trim();

          return (
            <li key={trial.nct_id} className="group">
              <Link href={`/trial/${trial.nct_id}`} className="block">
                <div className="flex items-baseline gap-6 mb-3">
                  <span className="font-serif text-3xl font-light text-ink-muted numeral shrink-0 w-12">
                    {String(i + 1).padStart(2, "0")}.
                  </span>
                  <p className="smallcaps text-ink-muted">
                    {category} · {condition}
                  </p>
                </div>

                <p className="font-serif text-2xl leading-snug text-ink ml-[72px] mb-5 group-hover:text-accent transition-colors duration-300">
                  {trial.tagline ?? trial.title}
                </p>

                <div className="ml-[72px] flex items-center gap-6">
                  <hr className="rule flex-1 max-w-[3rem]" />
                  <p className="smallcaps text-ink-muted">
                    <span className="text-accent numeral font-semibold">
                      {formatLifeYears(stake)}
                    </span>
                    {" "}life-years at stake · {PHASE_LABELS[trial.phase]}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}

        {filtered.length === 0 && (
          <li className="text-center py-16 text-ink-muted font-serif italic">
            No trials match these filters.
          </li>
        )}
      </ol>
    </section>
  );
}
