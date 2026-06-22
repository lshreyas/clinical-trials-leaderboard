"""
Fetch ongoing Phase 2/3 clinical trials from ClinicalTrials.gov API v2.
"""

import requests
import pandas as pd
import time
from typing import Optional

BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

PHASE_WEIGHT = {
    "EARLY_PHASE1": 0.05,
    "PHASE1": 0.1,
    "PHASE2": 0.4,
    "PHASE3": 0.8,
    "PHASE4": 1.0,
    "NA": 0.05,
}


def fetch_trials(
    max_trials: int = 1000,
    phases: list[str] = ("PHASE2", "PHASE3"),
    status: str = "RECRUITING|ACTIVE_NOT_RECRUITING",
) -> pd.DataFrame:
    """Fetch trials from ClinicalTrials.gov and return a flat DataFrame."""
    records = []
    next_page_token = None

    while len(records) < max_trials:
        phase_query = " OR ".join(f"AREA[Phase]{p}" for p in phases)
        params = {
            "format": "json",
            "pageSize": min(100, max_trials - len(records)),
            "filter.overallStatus": status,
            "query.term": phase_query,
        }
        if next_page_token:
            params["pageToken"] = next_page_token

        resp = requests.get(BASE_URL, params=params, timeout=30)
        if not resp.ok:
            print(f"API error body: {resp.text}")
        resp.raise_for_status()
        data = resp.json()

        studies = data.get("studies", [])
        if not studies:
            break

        for study in studies:
            proto = study.get("protocolSection", {})
            id_module = proto.get("identificationModule", {})
            status_module = proto.get("statusModule", {})
            design_module = proto.get("designModule", {})
            conditions_module = proto.get("conditionsModule", {})
            interventions_module = proto.get("armsInterventionsModule", {})
            sponsor_module = proto.get("sponsorCollaboratorsModule", {})

            phase_list = design_module.get("phases", [])
            phase = phase_list[0] if phase_list else "NA"

            interventions = interventions_module.get("interventions", [])
            intervention_types = list({i.get("type", "") for i in interventions})
            intervention_names = [i.get("name", "") for i in interventions[:3]]

            records.append({
                "nct_id": id_module.get("nctId", ""),
                "title": id_module.get("briefTitle", ""),
                "status": status_module.get("overallStatus", ""),
                "phase": phase,
                "phase_weight": PHASE_WEIGHT.get(phase, 0.1),
                "enrollment": design_module.get("enrollmentInfo", {}).get("count", 0) or 0,
                "conditions": "; ".join(conditions_module.get("conditions", [])),
                "intervention_types": "; ".join(intervention_types),
                "intervention_names": "; ".join(intervention_names),
                "sponsor": sponsor_module.get("leadSponsor", {}).get("name", ""),
                "start_date": status_module.get("startDateStruct", {}).get("date", ""),
                "completion_date": status_module.get("primaryCompletionDateStruct", {}).get("date", ""),
            })

        next_page_token = data.get("nextPageToken")
        if not next_page_token:
            break

        time.sleep(0.2)  # be polite to the API

    df = pd.DataFrame(records)
    df["enrollment"] = pd.to_numeric(df["enrollment"], errors="coerce").fillna(0).astype(int)
    return df


if __name__ == "__main__":
    df = fetch_trials(max_trials=500)
    print(f"Fetched {len(df)} trials")
    df.to_csv("data/trials_raw.csv", index=False)
    print("Saved to data/trials_raw.csv")
