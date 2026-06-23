import { getTrials } from "@/lib/data";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { FlaskConical } from "lucide-react";

export default async function Home() {
  const trials = await getTrials();

  const avgScore = (trials.reduce((s, t) => s + t.impact_score, 0) / trials.length).toFixed(1);
  const phase3Count = trials.filter((t) => t.phase === "PHASE3").length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Clinical Trials Impact Leaderboard</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            Ranks ongoing clinical trials by their potential to improve human health. Score = best-case
            DALYs averted × breakthrough premium vs. current standard of care.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Trials tracked", value: trials.length.toLocaleString() },
            { label: "Phase 3 trials", value: phase3Count.toLocaleString() },
            { label: "Avg impact score", value: avgScore },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 px-5 py-4">
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <LeaderboardTable trials={trials} />

        <p className="mt-6 text-xs text-slate-400 text-center">
          Data from{" "}
          <a href="https://clinicaltrials.gov" className="underline hover:text-slate-600" target="_blank">
            ClinicalTrials.gov
          </a>{" "}
          · Disease burden from IHME GBD 2021 · Scores updated weekly
        </p>
      </div>
    </main>
  );
}
