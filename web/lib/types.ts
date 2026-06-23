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
  score_rationale?: string;
}

export interface Filters {
  phases: Phase[];
  minEnrollment: number;
  search: string;
}
