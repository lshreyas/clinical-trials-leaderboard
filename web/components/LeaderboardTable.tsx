"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { Trial, Phase } from "@/lib/types";
import { PhaseBadge } from "./PhaseBadge";
import { ScoreBar } from "./ScoreBar";

type SortKey = "rank" | "enrollment" | "dalys";

const ALL_PHASES: Phase[] = ["PHASE1", "PHASE2", "PHASE3", "PHASE4"];

export function LeaderboardTable({ trials }: { trials: Trial[] }) {
  const [search, setSearch] = useState("");
  const [phases, setPhases] = useState<Set<Phase>>(new Set(["PHASE2", "PHASE3"]));
  const [minEnrollment, setMinEnrollment] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);

  function togglePhase(phase: Phase) {
    setPhases((prev) => {
      const next = new Set(prev);
      next.has(phase) ? next.delete(phase) : next.add(phase);
      return next;
    });
  }

  function setSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(key === "rank"); }
  }

  const filtered = useMemo(() => {
    let rows = trials.filter((t) => {
      if (phases.size > 0 && !phases.has(t.phase as Phase)) return false;
      if (t.enrollment < minEnrollment) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.conditions.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortAsc ? diff : -diff;
    });
    return rows;
  }, [trials, phases, minEnrollment, search, sortKey, sortAsc]);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortAsc
      ? <ChevronUp className="w-3 h-3 text-blue-500" />
      : <ChevronDown className="w-3 h-3 text-blue-500" />;
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search trials or conditions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>

        <div className="flex gap-1">
          {ALL_PHASES.map((p) => (
            <button
              key={p}
              onClick={() => togglePhase(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                phases.has(p)
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {p.replace("PHASE", "Ph ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Min enrollment</span>
          <input
            type="number"
            min={0}
            step={50}
            value={minEnrollment}
            onChange={(e) => setMinEnrollment(Number(e.target.value))}
            className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <span className="text-sm text-slate-400 ml-auto">
          {filtered.length} of {trials.length} trials
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 w-16"
                onClick={() => setSort("rank")}
              >
                <span className="flex items-center gap-1">Rank <SortIcon col="rank" /></span>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Trial
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Phase
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700"
                onClick={() => setSort("enrollment")}
              >
                <span className="flex items-center gap-1">Enrollment <SortIcon col="enrollment" /></span>
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700"
                onClick={() => setSort("dalys")}
              >
                <span className="flex items-center gap-1">DALYs (k) <SortIcon col="dalys" /></span>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide min-w-[160px]">
                Impact Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((trial) => (
              <tr key={trial.nct_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-400 font-medium tabular-nums">
                  #{trial.rank}
                </td>
                <td className="px-4 py-3 max-w-sm">
                  <Link
                    href={`/trial/${trial.nct_id}`}
                    className="font-medium text-slate-900 hover:text-blue-600 transition-colors line-clamp-2"
                  >
                    {trial.title}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{trial.conditions}</p>
                </td>
                <td className="px-4 py-3">
                  <PhaseBadge phase={trial.phase} />
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-600">
                  {trial.enrollment.toLocaleString()}
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-600">
                  {(trial.dalys / 1000).toFixed(0)}k
                </td>
                <td className="px-4 py-3">
                  <ScoreBar score={trial.impact_score} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  No trials match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
