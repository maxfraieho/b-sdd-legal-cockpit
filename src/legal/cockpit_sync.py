"""
Cockpit DTO Synchronizer (src/legal/cockpit_sync.py).
Generates structured JSON slices for the Web Cockpit (b-sdd-legal-ui):
  - admissibility_matrix.json: 61-record ATF 146 IV 9 status & SHA-256 seals.
  - claim_chart_summary.json: Restitution claims, penal articles & Art. 263 CPP sequestration targets.

Pure Python Standard Library (Invariant L-02).
"""

import json
import os
from pathlib import Path
import sys
from typing import Dict, Any

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.legal.admissibility import AdmissibilityEngine
from src.legal.claim_chart import SwissClaimChartManager
from src.legal.transcript_ingest import parse_61_transcripts

UI_SRC_DATA = PROJECT_ROOT / "b-sdd-legal-ui" / "src" / "data"
UI_PUBLIC_DATA = PROJECT_ROOT / "b-sdd-legal-ui" / "public" / "data"


def sync_cockpit_dtos() -> Dict[str, Any]:
    """
    Evaluates admissibility for all 61 evidence transcripts, compiles the complete
    civil restitution claim chart, and writes JSON DTOs to b-sdd-legal-ui.
    """
    os.makedirs(UI_SRC_DATA, exist_ok=True)
    os.makedirs(UI_PUBLIC_DATA, exist_ok=True)

    # 1. Generate Admissibility Matrix for 61 transcripts
    engine = AdmissibilityEngine()
    transcripts = parse_61_transcripts()
    admissibility_data = engine.evaluate_batch(transcripts)
    planar_drakon = engine.generate_planar_drakon_tree()

    admissibility_payload = {
        "metadata": {
            "title": "Matrice de Recevabilité Probatoire (ATF 146 IV 9 & ATF 147 IV 9)",
            "procedure": "PE24.014624-SBA",
            "canton": "Vaud",
            "total_items": admissibility_data["total_evaluated"],
            "admissible_count": admissibility_data["admissible_atf_146_iv_9"],
            "admissibility_rate": admissibility_data["admissibility_rate"],
        },
        "drakon_schema": planar_drakon,
        "records": admissibility_data["evaluations"]
    }

    # 2. Generate Claim Chart and Restitution Summary
    manager = SwissClaimChartManager()
    restitution_summary = manager.generate_restitution_summary()
    charge_charts = {k: v.to_dict() for k, v in manager.charts.items()}

    claim_chart_payload = {
        "metadata": {
            "title": "Portefeuille de Réparation du Dommage et Conclusions Civiles",
            "authority": "Ministère public du canton de Vaud",
            "procedure": "PE24.014624-SBA",
            "currency_primary": "CHF",
            "currency_secondary": "USD",
        },
        "restitution_summary": restitution_summary,
        "criminal_charges": charge_charts,
    }

    # Write payloads to both src/data and public/data for frontend import & fetch
    files_written = []
    for target_dir in (UI_SRC_DATA, UI_PUBLIC_DATA):
        adm_path = target_dir / "admissibility_matrix.json"
        with open(adm_path, "w", encoding="utf-8") as f:
            json.dump(admissibility_payload, f, indent=2, ensure_ascii=False)
        files_written.append(str(adm_path))

        cc_path = target_dir / "claim_chart_summary.json"
        with open(cc_path, "w", encoding="utf-8") as f:
            json.dump(claim_chart_payload, f, indent=2, ensure_ascii=False)
        files_written.append(str(cc_path))

    return {
        "status": "SUCCESS",
        "transcripts_evaluated": len(transcripts),
        "admissibility_rate": admissibility_data["admissibility_rate"],
        "total_claims_chf": restitution_summary["currency_totals"]["total_chf_claims"],
        "total_sequestration_chf": restitution_summary["currency_totals"]["total_sequestration_requested_art_263_cpp_chf"],
        "files_written": files_written
    }


if __name__ == "__main__":
    res = sync_cockpit_dtos()
    print(json.dumps(res, indent=2, ensure_ascii=False))
