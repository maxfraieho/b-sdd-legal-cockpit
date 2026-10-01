"""
Unit tests for the 5 Foundational Legal Invariants (Sprint 003).
Enforces:
- Invariant L-01: WORM Bitemporal Ledger (docs/utopia_local_worm.jsonl) & Valid Time vs Transaction Time.
- Invariant L-02: Pure Stdlib Core (100% Python standard library across src/legal/ and src/core/).
- Invariant L-03: Bona Fide Immunity Shield (Adriano MILLI bona_fide_protection = True).
- Invariant L-04: Strict Victim Status Protection (Arsen KOVALENKO, non-prevenu).
- Invariant L-05: Cryptographic Evidence Seal (SHA-256 hash integrity).
"""
import ast
import hashlib
import json
import os
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.legal.actors import (
    ProceduralStatus,
    ActorEntity,
    ActorMatrix,
    create_swiss_benchmark_matrix,
)
from src.legal.timeline_calibrator import (
    TimelineCalibrator,
    create_swiss_benchmark_timeline,
)
from src.legal.claim_chart import SwissClaimChartManager
from src.core.compiler import LegalPreflightCompiler


class TestLegalInvariants(unittest.TestCase):
    def setUp(self):
        self.matrix = create_swiss_benchmark_matrix()
        self.timeline = create_swiss_benchmark_timeline()
        self.compiler = LegalPreflightCompiler(actor_matrix=self.matrix, timeline_calibrator=self.timeline)
        self.claim_manager = SwissClaimChartManager(actor_matrix=self.matrix)

    def test_invariant_l01_worm_bitemporal_ledger(self):
        """Invariant L-01: WORM Ledger must record bitemporal mutations and Tv vs Tt separation."""
        worm_file = ROOT / "docs" / "utopia_local_worm.jsonl"
        self.assertTrue(worm_file.exists(), "docs/utopia_local_worm.jsonl must exist")

        lines = [line.strip() for line in worm_file.read_text(encoding="utf-8").splitlines() if line.strip()]
        self.assertGreater(len(lines), 0, "WORM ledger must contain at least one record")

        # Verify JSON format of entries
        found_supersession = False
        for line in lines:
            data = json.loads(line)
            if data.get("event_type") == "BITEMPORAL_SUPERSEDED_CALIBRATION":
                found_supersession = True
                self.assertEqual(data["actor_id"], "ACT-ARSEN-KOVALENKO")
                self.assertIn("valid_to", data["prior_record"])
                self.assertTrue(bool(data["active_record"].get("birth_date")), "birth_date must be recorded")
                self.assertEqual(data["active_record"]["age"], 26)

        self.assertTrue(found_supersession, "BITEMPORAL_SUPERSEDED_CALIBRATION record must be in WORM ledger")

    def test_invariant_l02_pure_stdlib_core(self):
        """Invariant L-02: 100% of modules in src/legal/ and src/core/ must use pure standard library."""
        stdlib_modules = set(sys.stdlib_module_names) if hasattr(sys, "stdlib_module_names") else {
            "os", "sys", "re", "json", "time", "sqlite3", "hashlib", "pathlib", "typing",
            "subprocess", "logging", "datetime", "uuid", "argparse", "unittest", "shutil",
            "tempfile", "functools", "itertools", "collections", "abc", "contextlib", "dataclasses", "enum", "math"
        }
        internal_pkgs = {"src"}

        target_dirs = [ROOT / "src" / "legal", ROOT / "src" / "core"]
        for tdir in target_dirs:
            for py_file in tdir.rglob("*.py"):
                if "__pycache__" in str(py_file):
                    continue
                with open(py_file, "r", encoding="utf-8") as f:
                    tree = ast.parse(f.read(), filename=str(py_file))

                for node in ast.walk(tree):
                    if isinstance(node, ast.Import):
                        for alias in node.names:
                            root_mod = alias.name.split(".")[0]
                            self.assertTrue(
                                root_mod in stdlib_modules or root_mod in internal_pkgs,
                                f"Invariant L-02 violation: External package '{alias.name}' in {py_file.relative_to(ROOT)}"
                            )
                    elif isinstance(node, ast.ImportFrom):
                        if node.module:
                            root_mod = node.module.split(".")[0]
                            self.assertTrue(
                                root_mod in stdlib_modules or root_mod in internal_pkgs,
                                f"Invariant L-02 violation: External package '{node.module}' in {py_file.relative_to(ROOT)}"
                            )

    def test_invariant_l03_bona_fide_shield(self):
        """Invariant L-03 (Interim SpecADR-021): PARTY-L03 raises PROTECTIVE_FLAG(L-03) without lawyer confirmation."""
        milli = self.matrix.get_actor("PARTY-L03")
        self.assertIsNotNone(milli)
        self.assertEqual(milli.procedural_status, ProceduralStatus.TIERS_DE_BONNE_FOI)
        self.assertTrue(milli.bona_fide_protection)

        # Attempting to compile without protection and without confirmation raises PROTECTIVE_FLAG(L-03)
        corrupted_matrix = create_swiss_benchmark_matrix()
        corrupted_milli = corrupted_matrix.get_actor("PARTY-L03")
        corrupted_milli.bona_fide_protection = False
        corrupted_milli.lawyer_confirmed = False
        corrupted_compiler = LegalPreflightCompiler(actor_matrix=corrupted_matrix)
        with self.assertRaises(RuntimeError) as ctx:
            corrupted_compiler.compile()
        self.assertIn("PROTECTIVE_FLAG(L-03)", str(ctx.exception))

        # With explicit lawyer confirmation, the flag stops blocking
        corrupted_milli.lawyer_confirmed = True
        snapshot = corrupted_compiler.compile()
        self.assertIsNotNone(snapshot)

    def test_invariant_l04_adult_victim_standing(self):
        """Invariant L-04 (Interim SpecADR-021): Title Adult Victim Standing. Authority decision status."""
        arsen = self.matrix.get_actor("PARTY-L04")
        self.assertIsNotNone(arsen)
        self.assertEqual(arsen.procedural_status, ProceduralStatus.VICTIME_PARTIE_PLAIGNANTE)
        self.assertEqual(arsen.status_source, "authority_decision")
        self.assertNotIn("prevenu", arsen.status.lower())

        # Accusatory drift conflicting with authority decision must be rejected
        corrupted_matrix = create_swiss_benchmark_matrix()
        corrupted_arsen = corrupted_matrix.get_actor("PARTY-L04")
        corrupted_arsen.status_source = "authority_decision"
        corrupted_arsen.procedural_status = ProceduralStatus.PREVENUE_COMPLICE
        corrupted_compiler = LegalPreflightCompiler(actor_matrix=corrupted_matrix)
        with self.assertRaises(RuntimeError) as ctx:
            corrupted_compiler.compile()
        self.assertIn("Accusatory drift against PARTY-L04 contradicts authority decision", str(ctx.exception))

    def test_invariant_l05_cryptographic_evidence_seal(self):
        """Invariant L-05: All evidence items in claim charts must carry valid SHA-256 hashes."""
        charts = self.claim_manager.list_charges()
        self.assertGreater(len(charts), 0)

        for chart in charts:
            for elem in chart.get("elements", []):
                for cit in elem.get("citations", []):
                    h = cit.get("sha256_hash", "")
                    self.assertEqual(len(h), 64, f"Invalid SHA-256 length for evidence {cit.get('evidence_id')}")
                    # Must be valid hex
                    int(h, 16)

    def test_preflight_compiler_budget_and_speed(self):
        """Pre-Flight Compiler must execute deterministically in < 50 ms and <= 500 words."""
        # Warmup cache
        _ = self.compiler.compile(max_words=500, use_live_db=False)
        snapshot = self.compiler.compile(max_words=500, use_live_db=False)
        self.assertLess(snapshot.execution_ms, 50.0, f"Execution too slow: {snapshot.execution_ms} ms (SLA: < 50 ms)")
        self.assertLessEqual(snapshot.word_count, 500, f"Word budget exceeded: {snapshot.word_count} words")
        self.assertIn("PARTY-L04", snapshot.summary_text)
        self.assertIn("PARTY-L03", snapshot.summary_text)
        self.assertIn("PROTECTIVE_FLAG(L-03)", snapshot.summary_text)

    def test_zero_destructive_operations_policy(self):
        """T5: Verifies that no automatic data destruction or shredding routines exist in core modules."""
        target_dirs = [ROOT / "src" / "legal", ROOT / "src" / "core"]
        for tdir in target_dirs:
            for py_file in tdir.rglob("*.py"):
                if "__pycache__" in str(py_file):
                    continue
                content = py_file.read_text(encoding="utf-8")
                self.assertNotIn("wipe_evidence", content, f"Destructive routine found in {py_file}")
                self.assertNotIn("panic_button", content, f"Destructive routine found in {py_file}")
                self.assertNotIn("shred_vault", content, f"Destructive routine found in {py_file}")


if __name__ == "__main__":
    unittest.main()
