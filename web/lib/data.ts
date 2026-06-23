import "server-only";
import { Trial } from "./types";
import path from "path";
import fs from "fs";

export async function getTrials(): Promise<Trial[]> {
  const dataPath = path.join(process.cwd(), "..", "data", "trials_scored.json");
  if (!fs.existsSync(dataPath)) {
    return SAMPLE_TRIALS;
  }
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
}

export async function getTrial(nctId: string): Promise<Trial | null> {
  const trials = await getTrials();
  return trials.find((t) => t.nct_id === nctId) ?? null;
}


// Sample data for development before the pipeline runs
export const SAMPLE_TRIALS: Trial[] = [
  {
    nct_id: "NCT04649541",
    title: "Gene Therapy for Sickle Cell Disease Using Lentiviral Vector",
    status: "RECRUITING",
    phase: "PHASE3",
    phase_weight: 0.8,
    enrollment: 60,
    conditions: "Sickle Cell Disease",
    intervention_types: "GENETIC",
    intervention_names: "LentiGlobin BB305",
    sponsor: "bluebird bio",
    start_date: "2021-01",
    completion_date: "2026-12",
    dalys: 6000,
    unmet_need: 1.5,
    impact_score: 91.2,
    rank: 1,
    efficacy_ceiling: 0.9,
    efficacy_ceiling_label: "Curative",
    breakthrough_premium: 2.0,
    breakthrough_label: "No existing curative treatment",
    summary: "A Phase 3 trial testing a one-time gene therapy that inserts a functional copy of the beta-globin gene into a patient's own stem cells. If successful, this could effectively cure sickle cell disease — eliminating the need for lifelong transfusions or bone marrow transplants.",
    score_rationale: "High score driven by curative potential (efficacy ceiling 90%) combined with a 2x breakthrough premium — there is currently no widely available cure. Disease burden is moderate but individual impact per patient is enormous.",
  },
  {
    nct_id: "NCT04257461",
    title: "Lecanemab (BAN2401) in Early Alzheimer's Disease",
    status: "ACTIVE_NOT_RECRUITING",
    phase: "PHASE3",
    phase_weight: 0.8,
    enrollment: 1795,
    conditions: "Alzheimer's Disease",
    intervention_types: "BIOLOGICAL",
    intervention_names: "Lecanemab",
    sponsor: "Eisai Inc.",
    start_date: "2019-03",
    completion_date: "2024-05",
    dalys: 28000,
    unmet_need: 1.5,
    impact_score: 87.4,
    rank: 2,
    efficacy_ceiling: 0.4,
    efficacy_ceiling_label: "Disease-modifying",
    breakthrough_premium: 1.5,
    breakthrough_label: "Existing treatments only manage symptoms",
    summary: "A large Phase 3 trial of lecanemab, an antibody that clears amyloid plaques from the brain. The drug has since received FDA approval. This trial established the first evidence that targeting amyloid can slow cognitive decline in early Alzheimer's — a major shift in a field that had seen decades of failures.",
    score_rationale: "Extremely high disease burden (28M DALYs globally) combined with disease-modifying potential. Efficacy ceiling is moderate (40%) — it slows but doesn't stop progression. Breakthrough premium 1.5x as existing drugs only treat symptoms.",
  },
  {
    nct_id: "NCT03530748",
    title: "CAR-T Cell Therapy in Relapsed/Refractory Large B-Cell Lymphoma",
    status: "RECRUITING",
    phase: "PHASE3",
    phase_weight: 0.8,
    enrollment: 350,
    conditions: "Large B-Cell Lymphoma",
    intervention_types: "BIOLOGICAL",
    intervention_names: "Axicabtagene ciloleucel",
    sponsor: "Kite Pharma",
    start_date: "2018-06",
    completion_date: "2025-12",
    dalys: 10000,
    unmet_need: 1.5,
    impact_score: 79.1,
    rank: 3,
    efficacy_ceiling: 0.7,
    efficacy_ceiling_label: "Potentially curative",
    breakthrough_premium: 1.5,
    breakthrough_label: "Prior treatments have limited efficacy in relapsed disease",
    summary: "Tests CAR-T cell therapy as a second-line treatment — earlier than current standard. CAR-T reprograms a patient's own immune cells to hunt and destroy cancer. Moving it to second-line could cure patients who would otherwise face a difficult transplant journey.",
    score_rationale: "High efficacy ceiling in responders (70%), earlier use increases the patient pool, and prior treatment options at this stage are limited.",
  },
  {
    nct_id: "NCT04280783",
    title: "Semaglutide 2.4mg for Cardiovascular Risk Reduction in Obesity",
    status: "ACTIVE_NOT_RECRUITING",
    phase: "PHASE3",
    phase_weight: 0.8,
    enrollment: 17604,
    conditions: "Obesity; Cardiovascular Disease",
    intervention_types: "DRUG",
    intervention_names: "Semaglutide",
    sponsor: "Novo Nordisk",
    start_date: "2020-10",
    completion_date: "2025-06",
    dalys: 24000,
    unmet_need: 1.0,
    impact_score: 84.7,
    rank: 4,
    efficacy_ceiling: 0.3,
    efficacy_ceiling_label: "Symptomatic / risk-reducing",
    breakthrough_premium: 1.0,
    breakthrough_label: "Existing weight-loss interventions available",
    summary: "A massive 17,000-patient trial testing whether semaglutide (Wegovy) reduces major cardiovascular events beyond just weight loss. This trial helped establish that GLP-1 drugs can cut heart attacks and strokes — expanding their use case far beyond diabetes management.",
    score_rationale: "Enormous enrollment (17,604) pushes the score up significantly. The efficacy ceiling is moderate (weight loss reduces but doesn't eliminate cardiovascular risk), but the sheer population reach makes the absolute impact substantial.",
  },
  {
    nct_id: "NCT05116475",
    title: "mRNA Vaccine Against Tuberculosis in High-Burden Settings",
    status: "RECRUITING",
    phase: "PHASE2",
    phase_weight: 0.4,
    enrollment: 3600,
    conditions: "Tuberculosis",
    intervention_types: "BIOLOGICAL",
    intervention_names: "mRNA-1608",
    sponsor: "Moderna",
    start_date: "2022-09",
    completion_date: "2027-03",
    dalys: 43000,
    unmet_need: 1.5,
    impact_score: 76.3,
    rank: 5,
    efficacy_ceiling: 0.6,
    efficacy_ceiling_label: "Preventive / disease-modifying",
    breakthrough_premium: 1.5,
    breakthrough_label: "BCG vaccine has limited efficacy in adults",
    summary: "An mRNA vaccine candidate for tuberculosis — applying the same platform used in COVID-19 vaccines to one of the world's leading infectious killers. BCG (the existing TB vaccine) protects infants but has poor efficacy in adults. An effective adult vaccine could transform global TB control.",
    score_rationale: "TB has one of the highest global disease burdens (43M DALYs). The mRNA platform has high theoretical efficacy ceiling if it works. Phase 2 phase weight (0.4) pulls the score down vs. Phase 3 trials — significant uncertainty remains.",
  },
];
