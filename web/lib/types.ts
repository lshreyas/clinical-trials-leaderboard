export type Phase = "PHASE1" | "PHASE2" | "PHASE3" | "PHASE4" | "EARLY_PHASE1" | "NA";

export interface Trial {
  nct_id: string;
  title: string;
  status: string;
  phase: Phase;
  phase_weight: number;
  enrollment: number;
  conditions: string;
  intervention_types: string;
  intervention_names: string;
  sponsor: string;
  start_date: string;
  completion_date: string;
  dalys: number;
  unmet_need: number;
  impact_score: number;
  rank: number;
  // Claude-enriched fields (optional until pipeline runs enrichment)
  efficacy_ceiling?: number;
  efficacy_ceiling_label?: string;
  breakthrough_premium?: number;
  breakthrough_label?: string;
  summary?: string;
  tagline?: string;
  score_rationale?: string;
}

// Best-case life-years that could be saved annually if treatment works
// fully and reaches all eligible patients globally.
export function lifeYearsAtStake(t: Trial): number {
  const efficacy = t.efficacy_ceiling ?? 0.3;
  const breakthrough = t.breakthrough_premium ?? 1;
  return t.dalys * 1000 * efficacy * (breakthrough / 2);
}

export function formatLifeYears(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

export interface Filters {
  phases: Phase[];
  minEnrollment: number;
  search: string;
}
