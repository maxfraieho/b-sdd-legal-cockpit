"""
Test Suite for Swiss Claim Chart & Restitution Engine (tests/legal/test_claim_chart.py).
Validates Restitution Claims ($15'000 USD, 850 CHF, CO 41/47/49, Art. 263 CPP),
Invariant L-03 (Bona Fide Shield), Invariant L-04 (Adult Victim Protection),
and Invariant L-05 (64-char SHA-256 evidence bindings).
"""

import json
from pathlib import Path
import pytest

from src.legal.claim_chart import (
    SwissClaimChartManager,
    CorroborationStatus,
    AdmissibilityTier,
    CivilRestitutionClaim,
)
from src.legal.actors import ProceduralStatus


class TestSwissClaimChartRestitution:
    """Test suite validating Swiss claim chart calculations, civil claims, and norm invariants."""

    def test_restitution_amounts_and_breakdown(self):
        """
        Validates claim chart financial restitution figures:
          - $15'000 USD asset restitution (Art. 138/146 CP): CHF 13'500.
          - 850 CHF direct property damage for broken glasses (Art. 144 CP).
          - 15'000 CHF moral damages for Arsen Kovalenko (Art. 47 & 49 CO).
          - 10'000 CHF moral damages for Volodymyr Kovalenko (Art. 49 CO).
          - 7'500 CHF direct complementary damages (Art. 41 CO).
          - Total: CHF 46'850.00.
          - Sequestration request under Art. 263 CPP: CHF 46'000.00.
        """
        manager = SwissClaimChartManager()
        summary = manager.generate_restitution_summary()

        curr = summary["currency_totals"]
        assert curr["total_usd_restitution"] == 15000.0
        assert curr["total_chf_claims"] == 46850.0
        assert curr["total_sequestration_requested_art_263_cpp_chf"] == 46000.0

        item = summary["itemized_breakdown_chf"]
        assert item["restitution_15k_usd_chf"] == 13500.0
        assert item["material_damage_glasses_chf"] == 850.0
        assert item["tort_moral_arsen_chf"] == 15000.0
        assert item["tort_moral_volodymyr_chf"] == 10000.0
        assert item["direct_damages_compl_chf"] == 7500.0

        # Validate interest rates and dates
        c_arsen = manager.civil_claims["CIV-TORT-MORAL-ARSEN"]
        assert c_arsen.interest_rate == 0.05
        assert c_arsen.interest_start_date == "2024-07-20"
        assert c_arsen.sequestration_target_art_263_cpp is True

    def test_invariant_l04_adult_standing(self):
        """
        Validates Invariant L-04: Arsen Kovalenko is strictly an adult victim (05.11.1999).
        Zero references to minor offenses or Art. 219 CP exist in the claims.
        """
        manager = SwissClaimChartManager()
        arsen = manager.matrix.get_actor("ACT-ARSEN-KOVALENKO")
        assert arsen.birth_date == "05.11.1999"
        assert arsen.procedural_status == ProceduralStatus.VICTIME_PARTIE_PLAIGNANTE

        # Verify no 219 in any claim or element description
        json_dump = manager.export_to_json()
        assert "219" not in json_dump, "Invariant L-04 Violation: Literal '219' found in claim chart model"

    def test_invariant_l03_bona_fide_shield(self):
        """Validates Invariant L-03: Adriano Milli has bona_fide_protection = True."""
        manager = SwissClaimChartManager()
        milli = manager.matrix.get_actor("ACT-ADRIANO-MILLI")
        assert milli.bona_fide_protection is True
        assert milli.procedural_status == ProceduralStatus.TIERS_DE_BONNE_FOI

    def test_sha256_bindings_on_all_citations(self):
        """Validates that all evidence citations carry authentic 64-char SHA-256 hashes (Invariant L-05)."""
        manager = SwissClaimChartManager()

        # Check criminal charge elements
        for cid, chart in manager.charts.items():
            for elem in chart.elements:
                for cit in elem.citations:
                    assert len(cit.sha256_hash) == 64, f"Invalid SHA-256 length in {cit.evidence_id}"
                    assert all(c in "0123456789abcdefABCDEF" for c in cit.sha256_hash)

        # Check civil claims
        for clid, claim in manager.civil_claims.items():
            for sha in claim.corroborating_evidence_sha256:
                assert len(sha) == 64, f"Invalid SHA-256 in civil claim {clid}"

    def test_json_and_markdown_exports(self):
        """Validates JSON and Markdown export functionality."""
        manager = SwissClaimChartManager()

        # Markdown report
        md = manager.generate_markdown_report()
        assert "TABLEAU SYNOPTIQUE DES CHEFS D'ACCUSATION" in md
        assert "CHF 46,850.00" in md
        assert "CHF 46,000.00" in md
        assert "Séquestre Art. 263 CPP" in md
        assert "Art. 180 CP" in md
        assert "Art. 146 CP" in md

        # JSON export
        json_str = manager.export_to_json()
        parsed = json.loads(json_str)
        assert "restitution_summary" in parsed
        assert "criminal_charges" in parsed
        assert parsed["restitution_summary"]["currency_totals"]["total_chf_claims"] == 46850.0
        assert parsed["restitution_summary"]["currency_totals"]["total_sequestration_requested_art_263_cpp_chf"] == 46000.0
