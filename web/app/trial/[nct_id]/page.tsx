import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrials, getTrial } from "@/lib/data";
import { PhaseBadge } from "@/components/PhaseBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { ArrowLeft, ExternalLink, Users, Calendar, Building2 } from "lucide-react";

export async function generateStaticParams() {
  const trials = await getTrials();
  return trials.map((t) => ({ nct_id: t.nct_id }));
}

export default async function TrialPage({ params }: { params: Promise<{ nct_id: string }> }) {
  const { nct_id } = await params;
  const trial = await getTrial(nct_id);
  if (!trial) notFound();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to leaderboard
        </Link>

        {/* Title block */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <PhaseBadge phase={trial.phase} />
                <span className="text-sm text-slate-400">#{trial.rank} overall</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-snug mb-2">{trial.title}</h1>
              <p className="text-slate-500 text-sm">{trial.conditions}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-400 mb-1">Impact score</p>
              <p className="text-3xl font-bold text-emerald-600">{trial.impact_score.toFixed(1)}</p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400" />
              {trial.sponsor}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="w-4 h-4 text-slate-400" />
              {trial.enrollment.toLocaleString()} participants
            </div>
            {trial.start_date && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                {trial.start_date}
                {trial.completion_date && ` → ${trial.completion_date}`}
              </div>
            )}
            <a
              href={`https://clinicaltrials.gov/study/${trial.nct_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 ml-auto"
            >
              {trial.nct_id} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Left: summary + rationale */}
          <div className="col-span-3 space-y-6">
            {trial.summary && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  What this trial is testing
                </h2>
                <p className="text-slate-700 leading-relaxed">{trial.summary}</p>
              </div>
            )}

            {trial.score_rationale && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Why it scored this way
                </h2>
                <p className="text-slate-700 leading-relaxed">{trial.score_rationale}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Intervention
              </h2>
              <p className="text-slate-700">{trial.intervention_names || "—"}</p>
              <p className="text-sm text-slate-400 mt-1">{trial.intervention_types}</p>
            </div>
          </div>

          {/* Right: score breakdown */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Score breakdown
              </h2>
              <ScoreBreakdown trial={trial} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
