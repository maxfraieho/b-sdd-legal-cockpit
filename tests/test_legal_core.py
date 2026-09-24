"""
Unit and Invariant Tests for B-SDD Legal Core Models.
Validates:
- ADR-002: Pure Python Standard Library in src/legal/.
- Invariant L-01: Bitemporal Legal Consistency & WORM reconciliation.
- Invariant L-03: Actor Matrix & Bona Fide Protection (Jean-Paul VERNON).
- Invariant L-04: Timeline Calibration & Conflict Detection.
"""
import ast
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.legal.actors import (
    ProceduralStatus,
    RelationType,
    ActorEntity,
    ActorRelation,
    ActorMatrix,
    BENCHMARK_ACTORS,
    create_swiss_benchmark_matrix,
)
from src.legal.timeline_calibrator import (
    BitemporalFactEvent,
    TimelineCalibrator,
    create_swiss_benchmark_timeline,
)


class TestLegalCore(unittest.TestCase):
    def test_pure_stdlib_in_src_legal(self):
        """Invariant L-02 & ADR-002: src/legal/ must use 100% Python standard library."""
        legal_dir = ROOT / "src" / "legal"
        stdlib_modules = set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else {
            "os", "sys", "re", "json", "time", "sqlite3", "hashlib", "pathlib", "typing",
            "subprocess", "logging", "datetime", "uuid", "argparse", "unittest", "shutil",
            "tempfile", "functools", "itertools", "collections", "abc", "contextlib", "dataclasses", "enum", "math"
        }
        internal_pkgs = {"src"}

        for py_file in legal_dir.rglob("*.py"):
            with open(py_file, "r", encoding="utf-8") as f:
                tree = ast.parse(f.read(), filename=str(py_file))

            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        root_mod = alias.name.split(".")[0]
                        self.assertTrue(
                            root_mod in stdlib_modules or root_mod in internal_pkgs,
                            f"External dependency '{alias.name}' in {py_file.name}",
                        )
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        root_mod = node.module.split(".")[0]
                        self.assertTrue(
                            root_mod in stdlib_modules or root_mod in internal_pkgs,
                            f"External from-import '{node.module}' in {py_file.name}",
                        )

    def test_actor_matrix_and_bona_fide_protection(self):
        """Invariant L-03: Jean-Paul VERNON carries active bona fide protection flag."""
        matrix = create_swiss_benchmark_matrix()

        # Check existence and status
        third_party = matrix.get_actor("ACT-BONA-FIDE-THIRD-PARTY")
        self.assertIsNotNone(third_party)
        self.assertEqual(third_party.name, "Jean-Paul VERNON")
        self.assertEqual(third_party.procedural_status, ProceduralStatus.TIERS_DE_BONNE_FOI)
        self.assertTrue(third_party.bona_fide_protection)

        # Check protected query
        protected = matrix.get_protected_bona_fide_actors()
        self.assertEqual(len(protected), 1)
        self.assertEqual(protected[0].actor_id, "ACT-BONA-FIDE-THIRD-PARTY")

        # Check relations
        relations = matrix.get_relations_for_actor("ACT-BONA-FIDE-THIRD-PARTY")
        self.assertGreaterEqual(len(relations), 1)
        self.assertEqual(relations[0].relation_type, RelationType.ASSISTANCE)

        # Serialization roundtrip
        d = matrix.to_dict()
        restored = ActorMatrix.from_dict(d)
        self.assertTrue(restored.get_actor("ACT-BONA-FIDE-THIRD-PARTY").bona_fide_protection)

    def test_sanitized_procedural_statuses_sprint_002(self):
        """SPRINT_002: Verify sanitized roles, non-prevenu Alexandre, and absence of unauthorized actors."""
        matrix = create_swiss_benchmark_matrix()

        # 1. Alexandre DUBOIS must be VICTIME_PARTIE_PLAIGNANTE, strictly NOT prévenu
        minor_victim = matrix.get_actor("ACT-VICTIM-MINOR")
        self.assertIsNotNone(minor_victim)
        self.assertEqual(minor_victim.procedural_status, ProceduralStatus.VICTIME_PARTIE_PLAIGNANTE)
        self.assertNotEqual(minor_victim.procedural_status.value, "prevenu")
        self.assertTrue(minor_victim.material_dependency)

        # 2. Marc MOREAU: PARTIE_PLAIGNANTE_CIVIL with $15'000 USD claim
        civil_claimant = matrix.get_actor("ACT-CLAIMANT-CIVIL")
        self.assertIsNotNone(civil_claimant)
        self.assertEqual(civil_claimant.procedural_status, ProceduralStatus.PARTIE_PLAIGNANTE_CIVIL)
        self.assertTrue(any("15'000" in claim or "15000" in claim for claim in civil_claimant.financial_claims))

        # 3. Laurent VOGEL: PREVENUE_AUTEUR_PRINCIPAL
        accused_principal = matrix.get_actor("ACT-ACCUSED-PRINCIPAL")
        self.assertIsNotNone(accused_principal)
        self.assertEqual(accused_principal.procedural_status, ProceduralStatus.PREVENUE_AUTEUR_PRINCIPAL)

        # 4. Claire VOGEL: PREVENUE_COMPLICE
        accused_complice = matrix.get_actor("ACT-ACCUSED-COMPLICE")
        self.assertIsNotNone(accused_complice)
        self.assertEqual(accused_complice.procedural_status, ProceduralStatus.PREVENUE_COMPLICE)

        # 5. Sophie MOREAU: AUTEUR_SOUS_EMPRISE
        auteur_coerced = matrix.get_actor("ACT-AUTEUR-UNDER-INFLUENCE")
        self.assertIsNotNone(auteur_coerced)
        self.assertEqual(auteur_coerced.procedural_status, ProceduralStatus.AUTEUR_SOUS_EMPRISE)

        # 6. Jean-Paul VERNON: TIERS_DE_BONNE_FOI with bona_fide_protection = True
        third_party = matrix.get_actor("ACT-BONA-FIDE-THIRD-PARTY")
        self.assertIsNotNone(third_party)
        self.assertEqual(third_party.procedural_status, ProceduralStatus.TIERS_DE_BONNE_FOI)
        self.assertTrue(third_party.bona_fide_protection)

        # 7. Absence of unauthorized third party anywhere in matrix
        self.assertNotIn("ACT-UNAUTHORIZED-PARTY", matrix.actors)

    def test_timeline_calibrator_worm_reconciliation(self):
        """Invariant L-01 & L-04: reconcile_fact performs WORM supersession without physical deletes."""
        calibrator = TimelineCalibrator()

        # Register initial uncalibrated event
        initial_fact = BitemporalFactEvent(
            fact_id="FACT-101",
            label="Initial reported altercation",
            t_v="2024-04-02T12:00:00Z",  # Inaccurate preliminary timecode
            t_t="2024-04-03T10:00:00Z",
            source_evidence_hashes=["abc123hash"],
            actor_ids=["ACT-AUTEUR-UNDER-INFLUENCE", "ACT-VICTIM-MINOR"],
            conflict_flag=True,
        )
        calibrator.register_fact(initial_fact)

        active_before = calibrator.list_active_facts()
        self.assertEqual(len(active_before), 1)
        self.assertEqual(active_before[0].fact_id, "FACT-101")
        self.assertEqual(active_before[0].t_v, "2024-04-02T12:00:00Z")

        # Reconcile fact based on EXIF/forensic audio evidence
        calibrated = calibrator.reconcile_fact(
            fact_id="FACT-101",
            calibrated_tv="2024-04-02T18:45:00Z",  # Calibrated actual time
            rationale="Calibrated via audio file metadata and child testimony",
            evidence_hashes=["abc123hash", "exif999hash"],
            conflict_flag=False,
        )

        self.assertEqual(calibrated.fact_id, "FACT-101_v2")
        self.assertEqual(calibrated.supersedes, "FACT-101")
        self.assertEqual(calibrated.t_v, "2024-04-02T18:45:00Z")
        self.assertEqual(calibrated.status, "active")
        self.assertFalse(calibrated.conflict_flag)

        # Old fact must still exist in ledger with superseded status (WORM invariant)
        old = [f for f in calibrator._facts if f.fact_id == "FACT-101"][0]
        self.assertEqual(old.status, "superseded")
        self.assertEqual(old.superseded_by, "FACT-101_v2")
        self.assertIsNotNone(old.valid_to)

        # Active listing only returns calibrated version
        active_after = calibrator.list_active_facts()
        self.assertEqual(len(active_after), 1)
        self.assertEqual(active_after[0].fact_id, "FACT-101_v2")
        self.assertEqual(active_after[0].t_v, "2024-04-02T18:45:00Z")

    def test_conflict_detection_in_benchmark_timeline(self):
        """Invariant L-04: Conflict detection highlights divergent testimonies."""
        calibrator = create_swiss_benchmark_timeline()
        conflicts = calibrator.detect_conflicts()

        self.assertGreaterEqual(len(conflicts), 1)
        # Check asset appropriation conflict
        asset_conflict = [c for c in conflicts if c["fact_id"] == "FACT-001-ASSET-APPROPRIATION"][0]
        self.assertEqual(asset_conflict["type"], "FLAGGED_CONFLICT")
        self.assertEqual(len(asset_conflict["actors"]), 3)


if __name__ == "__main__":
    unittest.main()
