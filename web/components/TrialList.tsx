"use client";

import { useState, useMemo, CSSProperties } from "react";
import Link from "next/link";
import { Trial, Phase, lifeYearsAtStake, formatLifeYears } from "@/lib/types";
import { PHASE_LABELS } from "@/lib/constants";
import { useReveal } from "@/lib/useReveal";

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

interface EntryProps {
  trial: Trial;
  index: number;
  maxStake: number;
}

function HeroEntry({ trial, index, maxStake }: EntryProps) {
  const { ref, visible } = useReveal<HTMLLIElement>();
  const stake = lifeYearsAtStake(trial);
  const category = categoryFromInterventionType(trial.intervention_types);
  const condition = trial.conditions.split(";")[0].trim();
  const widthPct = Math.max(8, (stake / maxStake) * 100);
  const barStyle = { "--bar-width": `${widthPct}%` } as CSSProperties;

  return (
    <li
      ref={ref}
      className={`reveal entry ${visible ? "reveal-visible" : ""}`}
    >
      <Link href={`/trial/${trial.nct_id}`} className="block py-16">
        <p className="font-serif text-6xl font-light text-ink-muted numeral mb-8">
          {String(index + 1).padStart(2, "0")}.
        </p>

        <p className="tagline font-serif text-4xl md:text-5xl leading-[1.1] font-light text-ink mb-10 max-w-2xl">
          {trial.tagline ?? trial.title}
        </p>

        <p className="smallcaps text-ink-muted mb-6">
          {category} · {condition}
        </p>

        <div className="bar-track hero-bar mb-4" style={barStyle}>
          <div className="bar-fill" />
        </div>

        <div className="flex items-baseline justify-between">
          <p className="smallcaps text-ink-muted">
            <span className="text-accent numeral font-semibold text-base normal-case tracking-normal">
              {formatLifeYears(stake)}
            </span>
            <span className="ml-2">life-years at stake</span>
            <span className="mx-2 text-ink-muted/40">·</span>
            <span>{PHASE_LABELS[trial.phase]}</span>
          </p>
          <p className="smallcaps text-ink-muted/70">
            Read <span className="arrow">→</span>
          </p>
        </div>

        <div className="hover-reveal smallcaps text-ink-muted/80">
          {trial.sponsor} · {trial.enrollment.toLocaleString()} participants
        </div>
      </Link>
    </li>
  );
}

function StandardEntry({ trial, index, maxStake }: EntryProps) {
  const { ref, visible } = useReveal<HTMLLIElement>();
  const stake = lifeYearsAtStake(trial);
  const category = categoryFromInterventionType(trial.intervention_types);
  const condition = trial.conditions.split(";")[0].trim();
  const widthPct = Math.max(4, (stake / maxStake) * 100);
  const barStyle = { "--bar-width": `${widthPct}%` } as CSSProperties;

  return (
    <li
      ref={ref}
      className={`reveal entry ${visible ? "reveal-visible" : ""}`}
    >
      <Link href={`/trial/${trial.nct_id}`} className="block py-7">
        <div className="grid grid-cols-[3rem_1fr] gap-x-6">
          <span className="font-serif text-xl font-light text-ink-muted numeral pt-1">
            {String(index + 1).padStart(2, "0")}.
          </span>

          <div>
            <p className="smallcaps text-ink-muted mb-2">
              {category} · {condition}
            </p>

            <p className="tagline font-serif text-xl leading-snug text-ink mb-4">
              {trial.tagline ?? trial.title}
            </p>

            <div className="bar-track mb-3" style={barStyle}>
              <div className="bar-fill" />
            </div>

            <div className="flex items-baseline justify-between">
              <p className="smallcaps text-ink-muted">
                <span className="text-accent numeral font-semibold normal-case tracking-normal">
                  {formatLifeYears(stake)}
                </span>
                <span className="ml-1.5">life-years</span>
                <span className="mx-2 text-ink-muted/40">·</span>
                <span>{PHASE_LABELS[trial.phase]}</span>
              </p>
              <p className="smallcaps text-ink-muted/70">
                <span className="arrow">→</span>
              </p>
            </div>

            <div className="hover-reveal smallcaps text-ink-muted/80">
              {trial.sponsor} · {trial.enrollment.toLocaleString()} participants
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
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

  const maxStake = useMemo(
    () => Math.max(1, ...filtered.map(lifeYearsAtStake)),
    [filtered]
  );

  const heroes = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <section className="max-w-3xl mx-auto px-8 py-16">
      <div className="flex items-baseline justify-between mb-12">
        <h2 className="smallcaps text-ink-muted">The Leaderboard</h2>
        <span className="smallcaps text-ink-muted numeral">
          {filtered.length} of {trials.length}
        </span>
      </div>

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

      {/* Hero entries */}
      {heroes.length > 0 && (
        <ol className="divide-y divide-rule">
          {heroes.map((trial, i) => (
            <HeroEntry key={trial.nct_id} trial={trial} index={i} maxStake={maxStake} />
          ))}
        </ol>
      )}

      {/* Separator between heroes and standard list */}
      {rest.length > 0 && (
        <div className="my-12 flex items-center gap-4">
          <hr className="rule flex-1" />
          <span className="smallcaps text-ink-muted">The Rest</span>
          <hr className="rule flex-1" />
        </div>
      )}

      {/* Standard entries */}
      {rest.length > 0 && (
        <ol className="divide-y divide-rule">
          {rest.map((trial, i) => (
            <StandardEntry
              key={trial.nct_id}
              trial={trial}
              index={i + heroes.length}
              maxStake={maxStake}
            />
          ))}
        </ol>
      )}

      {filtered.length === 0 && (
        <p className="text-center py-16 text-ink-muted font-serif italic">
          No trials match these filters.
        </p>
      )}
    </section>
  );
}
