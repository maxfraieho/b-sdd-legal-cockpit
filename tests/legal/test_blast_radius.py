"""
Test Suite for Legal Blast Radius Engine (tests/legal/test_blast_radius.py).
Validates Pure Stdlib Invariant L-02, Invariant L-03 (Bona Fide Shield),
Invariant L-04 (Adult Victim Protection), Swiss Criminal Limitation (Art. 97 CP),
Corroboration Matrix dynamic recalculation, and 10-day appeal deadline (Art. 393 CPP).
"""

from datetime import datetime, timezone
import json
import pytest

from src.legal.blast_radius import (
    calculate_blast_radius,
    SeverityLevel,
    ImpactType,
    BlastRadiusReport,
)


class TestBlastRadiusEngine:
    """Test suite validating all facets of the pure stdlib legal blast radius engine."""

    def test_pure_stdlib_invariant_l02(self):
        """Verifies that blast_radius module does not import external pip packages (Invariant L-02)."""
        import src.legal.blast_radius as br_mod
        
        # Verify no external libraries in module namespace
        forbidden = ["kuzu", "numpy", "pandas", "networkx", "scipy", "requests"]
        for pkg in forbidden:
            assert pkg not in br_mod.__dict__, f"Invariant L-02 Violation: {pkg} found in blast_radius namespace"

    def test_prescription_calculation_art_97_cp(self):
        """
        Validates Swiss Criminal Code statutory limitation periods:
          - 15 years for crimes carrying > 3 yrs prison (Art. 146, 157 CP, 118 LEI).
          - 10 years for crimes carrying <= 3 yrs prison (Art. 138, 180, 181, 123 CP).
          - 3 years for contraventions (Art. 126 CP Voies de fait).
        """
        ref_date = f"{2026}-09-24"
        event_date = f"{2024}-03-16"

        report = calculate_blast_radius(
            entity_id="EVENT-TV-CALIBRATION",
            delta={"t_v": event_date},
            reference_date=ref_date
        )

        assert len(report.prescription_analysis) > 0
        presc_map = {p.statute_id: p for p in report.prescription_analysis}

        # 15-year statute: Art. 146 CP Escroquerie
        assert "STAT-146-CP" in presc_map
        p146 = presc_map["STAT-146-CP"]
        assert p146.statutory_limit_years == 15
        assert p146.is_expired is False
        assert "Prescription légale: 15 ans" in p146.limitation_note
        assert p146.prescription_date == f"{2024 + 15}-03-16"
        assert p146.risk_level == "SAFE"

        # 10-year statute: Art. 180 CP Menaces
        assert "STAT-180-CP" in presc_map
        p180 = presc_map["STAT-180-CP"]
        assert p180.statutory_limit_years == 10
        assert p180.is_expired is False
        assert "Prescription légale: 10 ans" in p180.limitation_note
        assert p180.prescription_date == f"{2024 + 10}-03-16"
        assert p180.risk_level == "SAFE"

        # 3-year statute: Art. 126 CP Voies de fait
        assert "STAT-126-CP" in presc_map
        p126 = presc_map["STAT-126-CP"]
        assert p126.statutory_limit_years == 3
        assert p126.is_expired is False
        assert "Prescription légale: 3 ans" in p126.limitation_note
        assert p126.prescription_date == f"{2024 + 3}-03-16"
        assert p126.risk_level in ("ELEVATED", "CRITICAL")

        # Expired test case (historical date)
        expired_report = calculate_blast_radius(
            entity_id="EVENT-OLD",
            delta={"t_v": f"{2010}-01-01"},
            reference_date=ref_date
        )
        exp_map = {p.statute_id: p for p in expired_report.prescription_analysis}
        assert exp_map["STAT-180-CP"].is_expired is True
        assert exp_map["STAT-180-CP"].risk_level == "EXPIRED"

    def test_corroboration_matrix_dynamic_recalculation(self):
        """
        Validates dynamic recalculation of Corroboration Matrix scores (ALLEG-01 .. ALLEG-04):
          - Score drops upon evidence exclusion.
          - Score rises upon newly corroborated elements.
        """
        # Baseline report
        base_report = calculate_blast_radius(
            entity_id="ALLEG-01",
            delta={}
        )
        assert base_report.corroboration_matrix["ALLEG-01"].recalculated_score == 1.0
        assert base_report.corroboration_matrix["ALLEG-02"].recalculated_score == 0.8

        # Evidence exclusion simulation
        excl_report = calculate_blast_radius(
            entity_id="DRAWER-TR-32",
            delta={"allegation_id": "ALLEG-01", "admissibility": "EXCLUDED"}
        )
        a1 = excl_report.corroboration_matrix["ALLEG-01"]
        assert a1.delta_score < 0.0
        assert a1.recalculated_score < 1.0

        # Positive corroboration boost simulation on ALLEG-02
        boost_report = calculate_blast_radius(
            entity_id="DRAWER-TR-01",
            delta={"allegation_id": "ALLEG-02", "weight_delta": 0.15}
        )
        a2 = boost_report.corroboration_matrix["ALLEG-02"]
        assert a2.delta_score == 0.15
        assert a2.recalculated_score == 0.95
        assert a2.status == "ACCUSATION_PLEINEMENT_CORROBOREE"

    def test_appeal_deadline_art_393_cpp(self):
        """
        Validates manual deadline entry under Art. 393 / 396 CPP (T4: no automatic computation).
        """
        # Case 1: Manual entry unverified
        rep_unverified = calculate_blast_radius(
            entity_id="PROC-ORDONNANCE",
            delta={
                "procedural_action": "recours_393",
                "deadline_at": "October 2026",
                "legal_basis": "Art. 396 al. 1 CPP",
                "verified_by_lawyer": 0,
                "entered_by": "operator"
            }
        )
        app1 = rep_unverified.manual_deadline
        assert app1 is not None
        assert app1.display_label == "manual entry — not computed"
        assert app1.verified_by_lawyer == 0
        assert app1.origin == "manual"
        assert "manual entry — not computed" in rep_unverified.summary

        # Case 2: Manual entry verified by lawyer
        rep_verified = calculate_blast_radius(
            entity_id="PROC-ORDONNANCE",
            delta={
                "procedural_action": "recours_393",
                "deadline_at": "October 2026",
                "legal_basis": "Art. 396 al. 1 CPP",
                "verified_by_lawyer": 1,
                "entered_by": "lawyer_counsel"
            }
        )
        app2 = rep_verified.manual_deadline
        assert app2 is not None
        assert app2.verified_by_lawyer == 1
        assert app2.display_label == "manual entry — not computed"

    def test_invariant_l03_bona_fide_shield(self):
        """
        Validates Invariant L-03: Adriano Milli is protected against accusatory drift.
        """
        drift_delta = {"role": "prevenu", "criminal_liability": True}
        report = calculate_blast_radius(
            entity_id="ACT-ADRIANO-MILLI",
            delta=drift_delta
        )

        assert len(report.invariant_violations) > 0
        assert any("L-03" in v for v in report.invariant_violations)
        assert report.overall_severity == SeverityLevel.CRITICAL

    def test_invariant_l04_adult_victim_protection(self):
        """
        Validates Invariant L-04: PARTY-L04 is an adult victim.
        Attempted drift to prévenu or insertion of Art. 219 CP triggers critical breach.
        """
        # Test drift to prévenu
        rep1 = calculate_blast_radius(
            entity_id="ACT-ARSEN-KOVALENKO",
            delta={"role": "prevenu"}
        )
        assert len(rep1.invariant_violations) > 0
        assert any("L-04" in v for v in rep1.invariant_violations)
        assert rep1.overall_severity == SeverityLevel.CRITICAL

        # Test attempted insertion of Art. 219 CP
        rep2 = calculate_blast_radius(
            entity_id="ACT-ARSEN-KOVALENKO",
            delta={"statute": "219-CP"}
        )
        assert len(rep2.invariant_violations) > 0
        assert any("219" in v for v in rep2.invariant_violations)

    def test_spatial_graph_propagation_bfs(self):
        """
        Validates spatial BFS propagation from Room outwards to Statutes, Actors, Halls, and Wings.
        """
        report = calculate_blast_radius(
            entity_id="ROOM-180-181-CP",
            delta={"statute_recalibrated": True}
        )

        assert report.total_nodes_affected > 0
        all_ids = {i.node_id for i in report.direct_impacts + report.indirect_impacts}

        # Direct distance 1 should contain linked statutes and actors
        direct_ids = {i.node_id for i in report.direct_impacts}
        assert "STAT-180-CP" in direct_ids or "ACT-LIUBOV-SUVOROVA" in direct_ids

        # Serialization to JSON
        json_output = report.to_json()
        assert isinstance(json_output, str)
        parsed = json.loads(json_output)
        assert parsed["entity_id"] == "ROOM-180-181-CP"
        assert parsed["total_nodes_affected"] == report.total_nodes_affected

    def test_guard_no_countdown_or_timedelta(self):
        """
        Guard test (B-SDD v1.3 T1):
        - Fails if setInterval appears in LegalInspector.tsx, ProceduralWorkflowView.tsx, AdvocateActionCenter.tsx
        - Fails if timedelta or days_left appears in src/legal/blast_radius.py
        """
        from pathlib import Path

        root = Path(__file__).resolve().parent.parent.parent

        # 1. UI components static check
        ui_components = [
            root / "b-sdd-legal-ui" / "src" / "components" / "LegalInspector.tsx",
            root / "b-sdd-legal-ui" / "src" / "components" / "ProceduralWorkflowView.tsx",
            root / "b-sdd-legal-ui" / "src" / "components" / "AdvocateActionCenter.tsx",
        ]
        for comp_path in ui_components:
            if comp_path.exists():
                content = comp_path.read_text(encoding="utf-8")
                assert "setInterval" not in content, f"Forbidden setInterval found in {comp_path}"

        # 2. blast_radius.py static check
        br_path = root / "src" / "legal" / "blast_radius.py"
        assert br_path.exists(), "src/legal/blast_radius.py must exist"
        br_content = br_path.read_text(encoding="utf-8")
        assert "timedelta" not in br_content, "Forbidden timedelta found in src/legal/blast_radius.py"
        assert "days_left" not in br_content, "Forbidden days_left found in src/legal/blast_radius.py"

