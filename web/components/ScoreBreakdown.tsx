import { Trial } from "@/lib/types";

function Row({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {detail && <p className="text-xs text-slate-500 mt-0.5">{detail}</p>}
      </div>
      <span className="text-sm font-semibold text-slate-900 shrink-0">{value}</span>
    </div>
  );
}

export function ScoreBreakdown({ trial }: { trial: Trial }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-0">
      <Row
        label="Disease burden"
        value={`${(trial.dalys / 1000).toFixed(0)}k DALYs/yr`}
        detail="Global years of healthy life lost annually to this condition"
      />
      <Row
        label="Efficacy ceiling"
        value={trial.efficacy_ceiling_label ?? "—"}
        detail={
          trial.efficacy_ceiling
            ? `${Math.round(trial.efficacy_ceiling * 100)}% of DALYs could be averted if treatment works`
            : "Not yet estimated"
        }
      />
      <Row
        label="Breakthrough premium"
        value={trial.breakthrough_label ?? "—"}
        detail={
          trial.breakthrough_premium
            ? `${trial.breakthrough_premium}× multiplier vs. current standard of care`
            : "Not yet estimated"
        }
      />
      <Row
        label="Trial phase"
        value={trial.phase.replace("_", " ")}
        detail={`Phase weight: ${trial.phase_weight} (higher = closer to approval)`}
      />
      <Row
        label="Enrollment"
        value={trial.enrollment.toLocaleString()}
        detail="Planned number of participants"
      />
      <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-900">Impact score</span>
        <span className="text-lg font-bold text-emerald-600">{trial.impact_score.toFixed(1)}</span>
      </div>
    </div>
  );
}
