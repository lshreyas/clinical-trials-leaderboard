"""
Global Burden of Disease (GBD) DALY estimates by condition.

Source: IHME GBD 2021 — global DALYs (thousands), all ages, both sexes.
https://www.healthdata.org/gbd

This is a curated subset of the highest-burden conditions that commonly
appear as targets in clinical trials. Conditions not in this table fall
back to a keyword-matching heuristic.

Units: thousands of DALYs lost per year globally.
"""

import pandas as pd

CONDITION_DALYS: dict[str, float] = {
    # Cardiovascular
    "ischemic heart disease": 182_000,
    "coronary artery disease": 182_000,
    "heart failure": 35_000,
    "atrial fibrillation": 10_500,
    "stroke": 143_000,
    "hypertension": 24_000,
    "peripheral artery disease": 16_000,

    # Cancer (selected)
    "lung cancer": 48_000,
    "non-small cell lung cancer": 45_000,
    "colorectal cancer": 23_000,
    "breast cancer": 19_500,
    "liver cancer": 22_000,
    "pancreatic cancer": 10_200,
    "prostate cancer": 9_000,
    "glioblastoma": 3_500,
    "leukemia": 12_000,
    "lymphoma": 10_000,
    "melanoma": 4_500,
    "ovarian cancer": 5_500,
    "bladder cancer": 5_000,
    "stomach cancer": 16_000,
    "esophageal cancer": 11_000,

    # Neurological / Mental health
    "alzheimer's disease": 28_000,
    "dementia": 35_000,
    "parkinson's disease": 6_000,
    "multiple sclerosis": 2_500,
    "epilepsy": 13_000,
    "depression": 49_000,
    "major depressive disorder": 49_000,
    "anxiety disorder": 28_000,
    "bipolar disorder": 10_000,
    "schizophrenia": 14_000,
    "autism spectrum disorder": 17_000,
    "adhd": 12_000,

    # Infectious disease
    "hiv": 35_000,
    "tuberculosis": 43_000,
    "malaria": 55_000,
    "hepatitis b": 17_000,
    "hepatitis c": 13_000,
    "covid-19": 94_000,
    "influenza": 9_500,
    "pneumonia": 55_000,

    # Metabolic / Endocrine
    "type 2 diabetes": 67_000,
    "diabetes mellitus": 67_000,
    "obesity": 24_000,
    "chronic kidney disease": 35_000,
    "nonalcoholic fatty liver disease": 18_000,
    "nash": 18_000,

    # Musculoskeletal
    "osteoarthritis": 17_000,
    "rheumatoid arthritis": 5_500,
    "low back pain": 64_000,
    "osteoporosis": 5_000,

    # Respiratory
    "copd": 64_000,
    "asthma": 24_000,
    "idiopathic pulmonary fibrosis": 3_500,
    "cystic fibrosis": 1_200,

    # Rare / Genetic
    "sickle cell disease": 6_000,
    "duchenne muscular dystrophy": 900,
    "spinal muscular atrophy": 500,
    "huntington's disease": 400,
    "amyotrophic lateral sclerosis": 1_500,
    "als": 1_500,

    # Eye / Vision
    "macular degeneration": 3_500,
    "glaucoma": 4_000,
    "diabetic retinopathy": 2_500,
}

# Keyword → DALY mapping for fuzzy fallback
_KEYWORD_MAP: dict[str, float] = {
    "cancer": 15_000,
    "tumor": 12_000,
    "carcinoma": 12_000,
    "lymphoma": 10_000,
    "leukemia": 12_000,
    "sarcoma": 5_000,
    "glioma": 3_500,
    "cardiac": 40_000,
    "heart": 40_000,
    "stroke": 143_000,
    "neuro": 10_000,
    "alzheimer": 28_000,
    "parkinson": 6_000,
    "diabetes": 67_000,
    "kidney": 35_000,
    "liver": 18_000,
    "lung": 30_000,
    "pulmonary": 20_000,
    "hiv": 35_000,
    "infection": 20_000,
    "sepsis": 30_000,
    "depression": 49_000,
    "mental": 20_000,
    "pain": 20_000,
    "arthritis": 10_000,
    "immune": 8_000,
    "rare": 2_000,
    "genetic": 2_000,
}

_DEFAULT_DALYS = 5_000  # fallback for unknown conditions


def get_dalys_for_condition(conditions_str: str) -> float:
    """
    Return the highest DALY estimate for any condition in the semicolon-
    separated conditions string. Uses exact match first, then keyword fallback.
    """
    if not conditions_str or pd.isna(conditions_str):
        return _DEFAULT_DALYS

    conditions = [c.strip().lower() for c in str(conditions_str).split(";")]
    best = _DEFAULT_DALYS

    for condition in conditions:
        # Exact match
        if condition in CONDITION_DALYS:
            best = max(best, CONDITION_DALYS[condition])
            continue
        # Substring match against known conditions
        for key, dalys in CONDITION_DALYS.items():
            if key in condition or condition in key:
                best = max(best, dalys)
                break
        else:
            # Keyword fallback
            for keyword, dalys in _KEYWORD_MAP.items():
                if keyword in condition:
                    best = max(best, dalys)
                    break

    return best
