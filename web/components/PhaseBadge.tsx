import { PHASE_COLORS, PHASE_LABELS } from "@/lib/constants";

export function PhaseBadge({ phase }: { phase: string }) {
  const color = PHASE_COLORS[phase] ?? "bg-slate-300 text-slate-700";
  const label = PHASE_LABELS[phase] ?? phase;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
