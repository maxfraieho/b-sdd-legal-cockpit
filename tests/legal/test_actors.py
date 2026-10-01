"""
Unit tests for Legal Actor Matrix & Procedural Status Calibration (Sprint 003).
Validates:
- Arsen KOVALENKO: adult victim (born 05.11.1999, 26 ans, majeur capable), VICTIME_PARTIE_PLAIGNANTE.
- Zero accusatory drift towards prévenu (Invariant L-04).
- Adriano MILLI: absolute bona fide third party immunity shield (Invariant L-03).
- Requalification of Liubov SUVOROVA (auteur principal) and Hanna SUVOROVA (complice).
- Zero mentions of infractions against minors (Art. 219 CP removed).
- Bitemporal supersession record generation (Invariant L-01).
- Pure standard library compliance (Invariant L-02).
"""
import ast
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.legal.actors import (
    ProceduralStatus,
    RelationType,
    ActorEntity,
    ActorRelation,
    ActorMatrix,
    BENCHMARK_ACTORS,
    create_swiss_benchmark_matrix,
    calibrate_arsen_age_supersession,
)


class TestLegalActorsCalibration(unittest.TestCase):
    def setUp(self):
        self.matrix = create_swiss_benchmark_matrix()

    def test_pure_stdlib_in_actors(self):
        """Invariant L-02 / ADR-002: actors.py must use 100% Python standard library."""
        actors_file = ROOT / "src" / "legal" / "actors.py"
        stdlib_modules = set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else {
            "os", "sys", "re", "json", "time", "sqlite3", "hashlib", "pathlib", "typing",
            "subprocess", "logging", "datetime", "uuid", "argparse", "unittest", "dataclasses", "enum"
        }
        internal_pkgs = {"src"}

        with open(actors_file, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=str(actors_file))

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    root_mod = alias.name.split(".")[0]
                    self.assertTrue(
                        root_mod in stdlib_modules or root_mod in internal_pkgs,
                        f"External dependency '{alias.name}' detected in {actors_file.name}",
                    )
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    root_mod = node.module.split(".")[0]
                    self.assertTrue(
                        root_mod in stdlib_modules or root_mod in internal_pkgs,
                        f"External from-import '{node.module}' detected in {actors_file.name}",
                    )

    def test_arsen_kovalenko_adult_victim_calibration(self):
        """Deliverable A: Arsen KOVALENKO must be calibrated as an adult victim (26 years)."""
        arsen = self.matrix.get_actor("ACT-ARSEN-KOVALENKO")
        self.assertIsNotNone(arsen)
        self.assertEqual(arsen.actor_id, "ACT-ARSEN-KOVALENKO")
        self.assertEqual(arsen.name, "Arsen KOVALENKO")

        # Demographics & capacity
        self.assertEqual(arsen.birth_date, "05.11.1999")
        self.assertIn("Majeur capable", arsen.legal_capacity)

        # Procedural status (Invariant L-04)
        self.assertEqual(arsen.procedural_status, ProceduralStatus.VICTIME_PARTIE_PLAIGNANTE)
        self.assertNotIn("prevenu", arsen.status.lower())
        self.assertNotIn("prévenu", arsen.status.lower())
        self.assertNotIn("prevenu", arsen.notes.lower())

        # No mentions of minor child in active record
        self.assertNotIn("minor child", arsen.notes.lower())
        self.assertNotIn("enfant mineur", arsen.notes.lower())
        self.assertNotIn("2012", arsen.notes.lower())
        self.assertIn("1999", arsen.notes)
        self.assertIn("26 ans", arsen.notes)

    def test_adriano_milli_immunity_shield_invariant_l03(self):
        """Invariant L-03: Adriano MILLI has absolute immunity as bona fide third party."""
        milli = self.matrix.get_actor("ACT-ADRIANO-MILLI")
        self.assertIsNotNone(milli)
        self.assertEqual(milli.procedural_status, ProceduralStatus.TIERS_DE_BONNE_FOI)
        self.assertTrue(milli.bona_fide_protection)

        protected = self.matrix.get_protected_bona_fide_actors()
        self.assertTrue(any(a.actor_id == "ACT-ADRIANO-MILLI" for a in protected))

    def test_suspects_requalification_and_no_minor_infractions(self):
        """Deliverable A: Requalify Liubov and Hanna Suvorova with zero Art. 219 CP mentions."""
        liubov = self.matrix.get_actor("ACT-LIUBOV-SUVOROVA")
        self.assertIsNotNone(liubov)
        self.assertEqual(liubov.procedural_status, ProceduralStatus.PREVENUE_AUTEUR_PRINCIPAL)

        # Statutory coverage
        for statute in ["123", "126", "138", "144", "146", "157", "180", "181", "186"]:
            self.assertIn(statute, liubov.notes)
        for civil_art in ["41", "47", "49"]:
            self.assertIn(civil_art, liubov.notes)

        # Zero mentions of Art. 219 CP
        self.assertNotIn("219", liubov.notes)

        hanna = self.matrix.get_actor("ACT-HANNA-SUVOROVA")
        self.assertIsNotNone(hanna)
        self.assertEqual(hanna.procedural_status, ProceduralStatus.PREVENUE_COMPLICE)
        for statute in ["123", "126", "144", "180", "181", "186"]:
            self.assertIn(statute, hanna.notes)
        self.assertNotIn("219", hanna.notes)

    def test_bitemporal_supersession_recording(self):
        """Invariant L-01: Arsen age calibration must append a supersession record to WORM log."""
        with tempfile.NamedTemporaryFile(suffix=".jsonl", delete=False) as tmp:
            tmp_path = Path(tmp.name)

        try:
            record = calibrate_arsen_age_supersession(worm_log_path=tmp_path)
            self.assertEqual(record["event_type"], "BITEMPORAL_SUPERSEDED_CALIBRATION")
            self.assertEqual(record["actor_id"], "ACT-ARSEN-KOVALENKO")
            self.assertIsNotNone(record["prior_record"]["valid_to"])
            self.assertEqual(record["active_record"]["birth_date"], "05.11.1999")
            self.assertEqual(record["active_record"]["age"], 26)

            # Check file was written
            with open(tmp_path, "r", encoding="utf-8") as f:
                content = f.read()
            self.assertIn("05.11.1999", content)
            self.assertIn("BITEMPORAL_SUPERSEDED_CALIBRATION", content)
        finally:
            if tmp_path.exists():
                tmp_path.unlink()


if __name__ == "__main__":
    unittest.main()
